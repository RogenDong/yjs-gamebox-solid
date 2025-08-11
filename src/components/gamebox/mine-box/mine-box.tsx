import { createEventListener } from "@solid-primitives/event-listener";
import { type Accessor, createContext, createMemo, createSignal, For, type Setter, useContext } from "solid-js";
import { Portal } from "solid-js/web";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import { Chat } from "../../chat/chat";
import { MineBoxCell } from "./cell";
import { GameStatus } from "./game-status";
import { BombIcon, CursorIcon } from "./icons";
import type { Player } from "./metadata";
import { PlayersList, usePlayer } from "./players";

export interface GameRoom {
  gameOver: boolean;
}

export interface Cell {
  x: number;
  y: number;
}

export interface AwarenessState {
  player: Player;
  cursor?: AwarenessCursor;
}

export interface AwarenessCursor {
  vector: [number, number];
}

export interface MineBoxContextProps {
  width: number;
  height: number;
  mineCount: number;
  isGameOver: Accessor<boolean>;
  setGameOver: Setter<boolean>;
  isVictory: Accessor<boolean>;
  setVictory: Setter<boolean>;
  cells: Accessor<Cell[]>;
  setCells: Setter<Cell[]>;
  mines: Accessor<boolean[]>;
  setMines: Setter<boolean[]>;
  opens: Accessor<number[]>;
  setOpens: Setter<number[]>;
  /** 周围雷数 */
  aroundMines: Accessor<number[]>;
  setAroundMines: Setter<number[]>;
  /** 标记 */
  flags: Accessor<number[]>;
  setFlags: Setter<number[]>;
  openCell(cell: Cell): void;
  flagCell(cell: Cell): void;
  openAround(cell: Cell): void;
  isOpen(cell: Cell): boolean;
  isFlag(cell: Cell): boolean;
}

export const MineBoxContext = createContext<MineBoxContextProps>();

export function useMineBoxContext() {
  const context = useContext(MineBoxContext);
  if (!context) {
    throw new Error("useMineBoxContext must be used within a MineBoxContext.Provider");
  }
  return context;
}

export interface MineBoxProps {
  /** 房间id */
  roomId: string;
  /**
   * 难度: 1-3 1-简单 2-中等 3-困难
   * 自定义难度: [9, 9, 9] [宽, 高, 雷数]
   */
  difficulty: number | [number, number, number];
}

export function MineBox(props: MineBoxProps) {
  // 当前玩家信息
  const player = usePlayer();
  const doc = new Y.Doc();
  /** 初始化房间 */
  const websocketProvider = new WebsocketProvider(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`, `room/${props.roomId}`, doc);
  const yCells = doc.getArray<Cell>("cells");
  const yMines = doc.getArray<boolean>("mines");
  const yOpens = doc.getArray<number>("opens");
  const yAroundMines = doc.getArray<number>("aroundMines");
  const yFlags = doc.getArray<number>("flags");
  const yGlobal = doc.getMap<GameRoom>("global");
  const width = 18;
  const height = 14;
  const mineCount = 30;
  // 游戏结束
  const [isGameOver, setGameOver] = createSignal(false);
  // 游戏胜利
  const [isVictory, setVictory] = createSignal(false);
  // 格子
  const [cells, setCells] = createSignal<Cell[]>([]);
  // 雷
  const [mines, setMines] = createSignal<boolean[]>([]);
  // 是否打开
  const [opens, setOpens] = createSignal<number[]>([]);
  // 周围雷数
  const [aroundMines, setAroundMines] = createSignal<number[]>([]);
  // 标记
  const [flags, setFlags] = createSignal<number[]>([]);
  // 玩家列表
  const [players, setPlayers] = createSignal<Player[]>([]);
  // 意识状态(用户+光标位置)
  const [awarenessStates, setAwarenessStates] = createSignal<AwarenessState[]>([]);
  /** 游戏容器 */
  let gameBoxDiv: HTMLDivElement;

  const flagCount = createMemo<number>(() => {
    console.log(flags().filter((flag) => flag));
    return flags().filter((flag) => flag).length;
  });

  const awareness = websocketProvider.awareness;
  awareness.on("change", () => {
    const states: AwarenessState[] = [];
    awareness.getStates().forEach((state, clientId) => {
      if (!state.player) {
        return;
      }
      states.push(state as AwarenessState);
    });
    setAwarenessStates(states);
    setPlayers(states.map((state) => state.player));
  });

  createEventListener(window, "mousemove", (event) => {
    awareness.setLocalStateField("player", player());
    // 共享鼠标与容器原点的向量
    const vx = event.pageX - gameBoxDiv.offsetLeft;
    const vy = event.pageY - gameBoxDiv.offsetTop;
    awareness.setLocalStateField("cursor", {
      vector: [vx, vy],
    } as AwarenessCursor);
  });
  /** 绑定容器 */
  function refCellsDiv(element: HTMLDivElement) {
    gameBoxDiv = element;
    // createEventListener(cellsCrateDiv, "resize", event => {});
  }
  /** 将鼠标与容器原点的向量转换为实际坐标 */
  function setCursorByVector(vec: number[]): number[] {
    // 没有向量值，将鼠标放特别远
    if (vec.length !== 2) return [10240, 10240];
    const ox = gameBoxDiv.offsetLeft;
    const oy = gameBoxDiv.offsetTop;
    const [vx, vy] = vec;
    return [vx + ox, vy + oy];
  }

  yCells.observe((yarrayEvent) => {
    setCells(yCells.toArray());
  });
  yMines.observe((yarrayEvent) => {
    setMines(yMines.toArray());
  });
  yOpens.observe((yarrayEvent) => {
    console.log("yarrayEvent.target === yOpens", yarrayEvent.target === yOpens);
    console.log(yarrayEvent.changes.delta);
    setOpens(yOpens.toArray());
    setVictory(checkVictory());
  });
  yAroundMines.observe((yarrayEvent) => {
    setAroundMines(yAroundMines.toArray());
  });
  yFlags.observe((yarrayEvent) => {
    setFlags(yFlags.toArray());
  });
  yGlobal.observe((event) => {
    const gameRoom = yGlobal.get("status");
    if (gameRoom) {
      setGameOver(gameRoom.gameOver);
    }
  });
  function initGrids() {
    const cells: Cell[] = [];
    const mines: boolean[] = [...Array(mineCount).fill(true), ...Array(width * height - mineCount).fill(false)];
    const aroundMines: number[] = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        cells.push({ x, y });
      }
    }
    /** 随机打乱雷的位置 */
    for (const [index, isMine] of mines.entries()) {
      swap(mines, index, Math.floor(Math.random() * mines.length));
    }

    let firstEmptyArea: Cell | null = null;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let count = 0;
        for (let y1 = y - 1; y1 <= y + 1; y1++) {
          if (y1 < 0 || y1 >= height) continue;
          for (let x1 = x - 1; x1 <= x + 1; x1++) {
            if (x1 < 0 || x1 >= width) continue;
            if (mines[y1 * width + x1]) {
              count++;
            }
          }
        }
        aroundMines[y * width + x] = count;
        if (firstEmptyArea === null && count < 1) {
          console.log(`first empty area at (${x},${y})`);
          firstEmptyArea = { x, y };
        }
      }
    }
    yCells.push(cells);
    yMines.push(mines);
    yAroundMines.push(aroundMines);

    if (firstEmptyArea !== null) {
      openCell(firstEmptyArea);
    }
  }

  /** 打开格子 */
  function openCell(cell: Cell) {
    const index = cell.y * width + cell.x;
    const isMine = mines()[cell.y * width + cell.x];
    const aroundMine = aroundMines()[cell.y * width + cell.x];
    if (isVictory() || isGameOver() || isOpen(cell) || isFlag(cell)) {
      return;
    }
    // 开雷 1. 游戏结束
    if (isMine) {
      yGlobal.set("status", { gameOver: true });
      yOpens.push([index]);
      return;
    }
    // 记录要打开的格子
    if (aroundMine === 0) {
      // 如果周围没有雷, 自动打开周围空白的格子
      const aroundEmpty = calcAroundEmpty(cell);
      yOpens.push([index, ...aroundEmpty]);
    } else {
      yOpens.push([index]);
    }
  }

  /**
   * 计算周围空白的格子, 返回格子的索引. 返回的格子是空白的格子(不返回已打开的格子、雷、标记的格子)， 也不包括自己
   */
  function calcAroundEmpty(cell: Cell, result: number[] = []) {
    for (let y = cell.y - 1; y <= cell.y + 1; y++) {
      if (y < 0 || y >= height) continue;
      for (let x = cell.x - 1; x <= cell.x + 1; x++) {
        if (x < 0 || x >= width) continue;
        const c = { x, y };
        // 如果是已打开的格子、雷、标记的格子, 则跳过
        if (isOpen(c) || isFlag(c) || mines()[toIndex(c)] || result.indexOf(toIndex(c)) !== -1) {
          continue;
        }
        result.push(toIndex(c));
        const aroundMine = aroundMines()[toIndex(c)];
        if (aroundMine === 0) {
          calcAroundEmpty(c, result);
        }
      }
    }

    return result;
  }

  /** 标记雷 */
  function flagCell(cell: Cell) {
    const index = cell.y * width + cell.x;
    if (isVictory() || isGameOver() || isOpen(cell)) {
      return;
    }
    if (isFlag(cell)) {
      yFlags.delete(yFlags.toArray().indexOf(index), 1);
    } else {
      yFlags.push([index]);
    }
  }

  function openAround(cell: Cell) {
    if (isVictory() || isGameOver() || isFlag(cell)) {
      return;
    }
    // 周围被标记的格子数
    let flagCount = 0;
    for (let y = cell.y - 1; y <= cell.y + 1; y++) {
      for (let x = cell.x - 1; x <= cell.x + 1; x++) {
        if (isFlag({ x, y })) {
          flagCount++;
        }
      }
    }
    console.log(`flagCount = ${flagCount}`);
    // 如果周围格子的标记数等于周围雷数, 自动打开周围格子
    if (flagCount === aroundMines()[cell.y * width + cell.x]) {
      for (let y = cell.y - 1; y <= cell.y + 1; y++) {
        if (y < 0 || y >= height) continue;
        for (let x = cell.x - 1; x <= cell.x + 1; x++) {
          if (x < 0 || x >= width) continue;
          if (!isOpen({ x, y }) && !isFlag({ x, y })) {
            openCell({ x, y });
          }
        }
      }
    }
  }

  /** 是否胜利 */
  function checkVictory() {
    const cells = yCells.toArray();
    if (cells.length === 0) {
      return false;
    }
    for (const cell of cells) {
      if (!isOpen(cell) && !mines()[toIndex(cell)]) {
        return false;
      }
    }
    return true;
  }

  function restart() {
    yCells.delete(0, yCells.length);
    yMines.delete(0, yMines.length);
    yOpens.delete(0, yOpens.length);
    yAroundMines.delete(0, yAroundMines.length);
    yFlags.delete(0, yFlags.length);
    yGlobal.set("status", { gameOver: false });
    initGrids();
  }

  /** 交换数组元素 */
  function swap(arr: unknown[], i: number, j: number) {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }

  /** 根据坐标转换为索引 */
  function toIndex(cell: Cell) {
    return cell.y * width + cell.x;
  }

  /** 是否打开 */
  function isOpen(cell: Cell) {
    return opens().indexOf(toIndex(cell)) !== -1;
  }

  /** 是否标记 */
  function isFlag(cell: Cell) {
    return flags().indexOf(toIndex(cell)) !== -1;
  }

  return (
    <MineBoxContext.Provider
      value={{
        width,
        height,
        mineCount,
        isGameOver,
        setGameOver,
        cells,
        setCells,
        mines,
        setMines,
        opens,
        setOpens,
        openCell,
        aroundMines,
        setAroundMines,
        flags,
        setFlags,
        flagCell,
        openAround,
        isOpen,
        isFlag,
        isVictory,
        setVictory,
      }}
    >
      <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div class="flex gap-8">
          <div ref={refCellsDiv} class="relative bg-gray-800 p-8 rounded-lg shadow-2xl border border-gray-700">
            <MineBoxHeader />
            <GameStatus mineCount={mineCount} flagCount={flagCount()} isGameOver={isGameOver()} isVictory={isVictory()} onRestart={restart} />
            <div class="relative flex flex-wrap " style={{ width: `${width * 40}px` }}>
              <For each={cells()}>
                {(cell) => {
                  return <MineBoxCell cell={cell} />;
                }}
              </For>
            </div>
          </div>

          <div class="space-y-4 flex flex-col">
            <PlayersList players={players()} currentPlayerId={player().id} />
            <Chat doc={doc} messageKey="messages" />
          </div>
        </div>
        <Portal>
          <div class="absolute top-0 right-0 bottom-0 left-0 overflow-hidden pointer-events-none">
            <For each={awarenessStates()}>
              {(state) => {
                const [x, y] = setCursorByVector(state.cursor?.vector || []);
                return (
                  <div class="absolute" style={{ top: `${y}px`, left: `${x}px`, "font-size": "14px" }}>
                    <CursorIcon style={{ color: state.player?.color }} />
                    <span class="rounded-sm py-0.5 px-1" style={{ background: state.player?.color, color: "#fff" }}>
                      {state.player?.username}
                    </span>
                  </div>
                );
              }}
            </For>
          </div>
        </Portal>
      </div>
    </MineBoxContext.Provider>
  );
}

export function MineBoxHeader() {
  return (
    <div class="text-center mb-8">
      <div class="flex items-center justify-center gap-3 mb-2">
        <BombIcon class="w-8 h-8 text-red-500" />
        <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500 animate-pulse">扫雷</h1>
        <BombIcon class="w-8 h-8 text-red-500" />
      </div>
      <p class="text-cyan-400 mt-2 text-sm">简单模式 - 16x16 区域</p>
    </div>
  );
}

export default MineBox;

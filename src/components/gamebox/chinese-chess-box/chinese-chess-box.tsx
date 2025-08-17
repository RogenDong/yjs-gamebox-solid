import { type Accessor, createContext, createSignal, type Setter, useContext } from "solid-js";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import { Button } from "~/components/ui/button";
import { ChessBoard } from "./chess-board";
import type { ChessPieceData, PieceType } from "./types";
// 棋子类型定义
export type PieceColor = "red" | "black";

export interface Position {
  x: number;
  y: number;
}

export interface ChessGameState {
  board: (ChessPieceData | null)[][];
  currentPlayer: "r" | "b";
  selectedPiece: { position: Position; piece: ChessPieceData } | null;
  gameStatus: "playing" | "red-win" | "black-win" | "draw";
}

export interface IChineseChessContext {
  yChessPieceMap: Y.Map<ChessPieceData>;
  /** 棋子数据 */
  chessPieces: Accessor<ChessPieceData[]>;

  gameState: Accessor<ChessGameState>;
  setGameState: Setter<ChessGameState>;
  draggedPiece: Accessor<{ position: Position; piece: ChessPieceData } | null>;
  setDraggedPiece: Setter<{ position: Position; piece: ChessPieceData } | null>;
  selectPiece: (position: Position) => void;
  movePiece: (from: Position, to: Position) => void;
  canMoveTo: (from: Position, to: Position) => boolean;
}

export const ChineseChessContext = createContext<IChineseChessContext>();

export function useChineseChessContext() {
  const context = useContext(ChineseChessContext);
  if (!context) {
    throw new Error("useChineseChessContext must be used within a ChineseChessContext.Provider");
  }
  return context;
}

// 初始化棋盘
function initializeBoard(): (ChessPieceData | null)[][] {
  const board: (ChessPieceData | null)[][] = Array(10)
    .fill(null)
    .map(() => Array(9).fill(null));

  // 黑方棋子 (上方)
  const blackPieces: [PieceType, number, number][] = [
    ["车", 0, 0],
    ["马", 0, 1],
    ["相", 0, 2],
    ["士", 0, 3],
    ["帅", 0, 4],
    ["士", 0, 5],
    ["相", 0, 6],
    ["马", 0, 7],
    ["车", 0, 8],
    ["炮", 2, 1],
    ["炮", 2, 7],
    ["兵", 3, 0],
    ["兵", 3, 2],
    ["兵", 3, 4],
    ["兵", 3, 6],
    ["兵", 3, 8],
  ];

  // 红方棋子 (下方)
  const redPieces: [PieceType, number, number][] = [
    ["车", 9, 0],
    ["马", 9, 1],
    ["相", 9, 2],
    ["士", 9, 3],
    ["帅", 9, 4],
    ["士", 9, 5],
    ["相", 9, 6],
    ["马", 9, 7],
    ["车", 9, 8],
    ["炮", 7, 1],
    ["炮", 7, 7],
    ["兵", 6, 0],
    ["兵", 6, 2],
    ["兵", 6, 4],
    ["兵", 6, 6],
    ["兵", 6, 8],
  ];

  // 放置黑方棋子
  blackPieces.forEach(([type, y, x], index) => {
    board[y][x] = {
      side: "b",
      type,
    };
  });

  // 放置红方棋子
  redPieces.forEach(([type, y, x], index) => {
    board[y][x] = {
      side: "r",
      type,
    };
  });

  return board;
}

// 游戏状态显示组件
function GameStatus() {
  const { gameState } = useChineseChessContext();

  return (
    <div class="bg-gray-800 text-white p-6 rounded-xl shadow-xl border border-gray-700">
      <h2 class="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent">中国象棋</h2>
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-gray-300">当前玩家:</span>
          <span class={`font-bold px-3 py-1 rounded ${gameState().currentPlayer === "r" ? "bg-red-600 text-white" : "bg-gray-700 text-white"}`}>
            {gameState().currentPlayer === "r" ? "红方" : "黑方"}
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-300">游戏状态:</span>
          <span class="font-bold text-green-400">
            {gameState().gameStatus === "playing"
              ? "进行中"
              : gameState().gameStatus === "red-win"
                ? "红方胜利"
                : gameState().gameStatus === "black-win"
                  ? "黑方胜利"
                  : "平局"}
          </span>
        </div>
      </div>
    </div>
  );
}

export interface ChineseChessBoxProps {
  roomId: string;
}

export default function ChineseChessBox(props: ChineseChessBoxProps) {
  const doc = new Y.Doc();
  /** 初始化房间 */
  const websocketProvider = new WebsocketProvider(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`, `room/${props.roomId}`, doc);
  const yChessPieceMap = doc.getMap<ChessPieceData>("chessPieces");

  const [chessPieces, setChessPieces] = createSignal<ChessPieceData[]>([]);
  const [gameState, setGameState] = createSignal<ChessGameState>({
    board: initializeBoard(),
    currentPlayer: "r",
    gameStatus: "playing",
    selectedPiece: null,
  });
  websocketProvider.on("status", (status) => {
    console.log("WebSocket status:", status);
  });

  const [draggedPiece, setDraggedPiece] = createSignal<{ position: Position; piece: ChessPieceData } | null>(null);

  /** 开始游戏：初始游戏状态 */
  function startGame() {
    // 红方棋子 (上方)
    yChessPieceMap.set("r-车-0-0", { position: { x: 0, y: 0 }, side: "r", type: "车" });
    yChessPieceMap.set("r-马-0-1", { position: { x: 1, y: 0 }, side: "r", type: "马" });
    yChessPieceMap.set("r-相-0-2", { position: { x: 2, y: 0 }, side: "r", type: "相" });
    yChessPieceMap.set("r-士-0-3", { position: { x: 3, y: 0 }, side: "r", type: "士" });
    yChessPieceMap.set("r-帅-0-4", { position: { x: 4, y: 0 }, side: "r", type: "帅" });
    yChessPieceMap.set("r-士-0-5", { position: { x: 5, y: 0 }, side: "r", type: "士" });
    yChessPieceMap.set("r-相-0-6", { position: { x: 6, y: 0 }, side: "r", type: "相" });
    yChessPieceMap.set("r-马-0-7", { position: { x: 7, y: 0 }, side: "r", type: "马" });
    yChessPieceMap.set("r-车-0-8", { position: { x: 8, y: 0 }, side: "r", type: "车" });
    yChessPieceMap.set("r-炮-2-1", { position: { x: 1, y: 2 }, side: "r", type: "炮" });
    yChessPieceMap.set("r-炮-2-7", { position: { x: 7, y: 2 }, side: "r", type: "炮" });
    yChessPieceMap.set("r-兵-3-0", { position: { x: 0, y: 3 }, side: "r", type: "兵" });
    yChessPieceMap.set("r-兵-3-2", { position: { x: 2, y: 3 }, side: "r", type: "兵" });
    yChessPieceMap.set("r-兵-3-4", { position: { x: 4, y: 3 }, side: "r", type: "兵" });
    yChessPieceMap.set("r-兵-3-6", { position: { x: 6, y: 3 }, side: "r", type: "兵" });
    yChessPieceMap.set("r-兵-3-8", { position: { x: 8, y: 3 }, side: "r", type: "兵" });
    // 黑方棋子 (下方)
    yChessPieceMap.set("b-车-9-0", { position: { x: 0, y: 9 }, side: "b", type: "车" });
    yChessPieceMap.set("b-马-9-1", { position: { x: 1, y: 9 }, side: "b", type: "马" });
    yChessPieceMap.set("b-相-9-2", { position: { x: 2, y: 9 }, side: "b", type: "相" });
    yChessPieceMap.set("b-士-9-3", { position: { x: 3, y: 9 }, side: "b", type: "士" });
    yChessPieceMap.set("b-帅-9-4", { position: { x: 4, y: 9 }, side: "b", type: "帅" });
    yChessPieceMap.set("b-士-9-5", { position: { x: 5, y: 9 }, side: "b", type: "士" });
    yChessPieceMap.set("b-相-9-6", { position: { x: 6, y: 9 }, side: "b", type: "相" });
    yChessPieceMap.set("b-马-9-7", { position: { x: 7, y: 9 }, side: "b", type: "马" });
    yChessPieceMap.set("b-车-9-8", { position: { x: 8, y: 9 }, side: "b", type: "车" });
    yChessPieceMap.set("b-炮-7-1", { position: { x: 1, y: 7 }, side: "b", type: "炮" });
    yChessPieceMap.set("b-炮-7-7", { position: { x: 7, y: 7 }, side: "b", type: "炮" });
    yChessPieceMap.set("b-兵-6-0", { position: { x: 0, y: 6 }, side: "b", type: "兵" });
    yChessPieceMap.set("b-兵-6-2", { position: { x: 2, y: 6 }, side: "b", type: "兵" });
    yChessPieceMap.set("b-兵-6-4", { position: { x: 4, y: 6 }, side: "b", type: "兵" });
    yChessPieceMap.set("b-兵-6-6", { position: { x: 6, y: 6 }, side: "b", type: "兵" });
    yChessPieceMap.set("b-兵-6-8", { position: { x: 8, y: 6 }, side: "b", type: "兵" });
  }

  const selectPiece = (position: Position) => {
    const piece = gameState().board[position.y][position.x];
    if (!piece) return;

    setGameState((prev) => ({
      ...prev,
      selectedPiece: { piece, position },
    }));
  };

  const movePiece = (from: Position, to: Position) => {
    const currentState = gameState();
    const piece = currentState.board[from.y][from.x];

    if (!piece || piece.side !== currentState.currentPlayer) return;

    const targetPiece = currentState.board[to.y][to.x];

    // 如果目标位置有自己的棋子，取消移动
    if (targetPiece && targetPiece.side === piece.side) {
      return;
    }

    // 创建新的棋盘状态
    const newBoard = currentState.board.map((row) => [...row]);
    newBoard[from.y][from.x] = null;
    newBoard[to.y][to.x] = piece;

    setGameState({
      ...currentState,
      board: newBoard,
      currentPlayer: currentState.currentPlayer === "r" ? "b" : "r",
      selectedPiece: null,
    });
  };

  const canMoveTo = (from: Position, to: Position): boolean => {
    // 简化版本 - 不实现复杂的走棋规则
    return true;
  };

  function clear() {
    yChessPieceMap.clear();
  }

  yChessPieceMap.observe(() => {
    setChessPieces(Array.from(yChessPieceMap.values()));
    console.log("Chess pieces updated:", Array.from(yChessPieceMap.values()));
  });

  return (
    <ChineseChessContext.Provider
      value={{
        canMoveTo,
        chessPieces,
        draggedPiece,
        gameState,
        movePiece,
        selectPiece,
        setDraggedPiece,
        setGameState,
        yChessPieceMap,
      }}
    >
      <div class="min-h-screen from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div class="flex flex-col lg:flex-row items-center gap-8">
          <div class="flex flex-col">
            <Button onClick={startGame}>开始游戏</Button>
            <Button onClick={clear}>清空</Button>
          </div>
          <ChessBoard />
          <GameStatus />
        </div>
      </div>
    </ChineseChessContext.Provider>
  );
}

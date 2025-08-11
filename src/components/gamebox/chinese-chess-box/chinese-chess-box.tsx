import { type Accessor, createContext, createSignal, For, type Setter, useContext } from "solid-js";
import { ChessPiece } from "./chess-piece";
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

export interface ChineseChessContextProps {
  gameState: Accessor<ChessGameState>;
  setGameState: Setter<ChessGameState>;
  draggedPiece: Accessor<{ position: Position; piece: ChessPieceData } | null>;
  setDraggedPiece: Setter<{ position: Position; piece: ChessPieceData } | null>;
  selectPiece: (position: Position) => void;
  movePiece: (from: Position, to: Position) => void;
  canMoveTo: (from: Position, to: Position) => boolean;
}

export const ChineseChessContext = createContext<ChineseChessContextProps>();

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
      type,
      side: "b",
    };
  });

  // 放置红方棋子
  redPieces.forEach(([type, y, x], index) => {
    board[y][x] = {
      type,
      side: "r",
    };
  });

  return board;
}

// 棋盘组件
function ChessBoard() {
  const { gameState, draggedPiece, setDraggedPiece, movePiece, selectPiece } = useChineseChessContext();

  const handleDragStart = (e: DragEvent, position: Position, piece: ChessPieceData) => {
    setDraggedPiece({ position, piece });
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
  };

  const handleDrop = (e: DragEvent, position: Position) => {
    e.preventDefault();
    const dragged = draggedPiece();
    if (dragged) {
      movePiece(dragged.position, position);
      setDraggedPiece(null);
    }
  };

  return (
    <div class="relative bg-gradient-to-br from-amber-100 to-amber-200 p-6 rounded-xl shadow-2xl border-4 border-amber-800">
      <div class="grid grid-cols-9 gap-0 border-2 border-amber-900 bg-amber-50">
        <For each={Array.from({ length: 90 }, (_, i) => ({ x: i % 9, y: Math.floor(i / 9) }))}>
          {(position) => {
            const piece = gameState().board[position.y][position.x];
            const isRiverBoundary = position.y === 4 || position.y === 5;

            return (
              <div
                class={`relative w-16 h-16 border border-amber-800/30 flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-amber-200/50 ${
                  isRiverBoundary ? "border-b-4 border-b-blue-600" : ""
                }`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, position)}
                onClick={() => selectPiece(position)}
              >
                {piece && <ChessPiece piece={piece} position={position} onDragStart={(e) => handleDragStart(e, position, piece)} />}

                {/* 楚河汉界标识 */}
                {position.y === 4 && position.x === 1 && <div class="absolute -bottom-8 text-blue-700 font-bold text-lg">楚河</div>}
                {position.y === 5 && position.x === 7 && <div class="absolute -top-2 text-blue-700 font-bold text-lg">汉界</div>}
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
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
            {gameState().gameStatus === "playing" ? "进行中" : gameState().gameStatus === "red-win" ? "红方胜利" : gameState().gameStatus === "black-win" ? "黑方胜利" : "平局"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ChineseChessBox() {
  const [gameState, setGameState] = createSignal<ChessGameState>({
    board: initializeBoard(),
    currentPlayer: "r",
    selectedPiece: null,
    gameStatus: "playing",
  });

  const [draggedPiece, setDraggedPiece] = createSignal<{ position: Position; piece: ChessPieceData } | null>(null);

  const selectPiece = (position: Position) => {
    const piece = gameState().board[position.y][position.x];
    if (!piece) return;

    setGameState((prev) => ({
      ...prev,
      selectedPiece: { position, piece },
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

  return (
    <ChineseChessContext.Provider
      value={{
        gameState,
        setGameState,
        draggedPiece,
        setDraggedPiece,
        selectPiece,
        movePiece,
        canMoveTo,
      }}
    >
      <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div class="flex flex-col lg:flex-row items-center gap-8">
          <ChessBoard />
          <GameStatus />
        </div>
      </div>
    </ChineseChessContext.Provider>
  );
}

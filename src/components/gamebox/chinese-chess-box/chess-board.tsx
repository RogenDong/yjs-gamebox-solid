import { createSignal, For } from "solid-js";
import { ChessPiece } from "./chess-piece";
import { useChineseChessContext } from "./chinese-chess-box";
import type { ChessPieceData, Position } from "./types";

// 棋盘组件
export function ChessBoard() {
  const { chessPieces, gameState, movePiece, selectPiece } = useChineseChessContext();

  const GRID_SIZE = 60;
  const BOARD_WIDTH = 8 * GRID_SIZE + 40;
  const BOARD_HEIGHT = 9 * GRID_SIZE + 40;

  const [isDragging, setIsDragging] = createSignal(false);
  const [draggedPiece, setDraggedPiece] = createSignal<{ piece: ChessPieceData; startPos: Position; offset: { x: number; y: number } } | null>(null);
  const [dragPosition, setDragPosition] = createSignal({ x: 0, y: 0 });

  const handleMouseDown = (e: MouseEvent, piece: ChessPieceData) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = {
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
    };
    console.log(offset);

    setDraggedPiece({ offset, piece, startPos: piece.position });
    setIsDragging(true);
    setDragPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging() || !draggedPiece()) return;

    console.log("Dragging piece:", { x: e.clientX, y: e.clientY });
    setDragPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging() || !draggedPiece()) return;

    const boardElement = document.querySelector(".chess-board") as HTMLElement;
    if (!boardElement) return;

    const rect = boardElement.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left - 20) / GRID_SIZE);
    const y = Math.round((e.clientY - rect.top - 20) / GRID_SIZE);

    if (x >= 0 && x <= 8 && y >= 0 && y <= 9) {
      const newPosition = { x, y };
      const dragged = draggedPiece()!;
      movePiece(dragged.startPos, newPosition);
    }

    setIsDragging(false);
    setDraggedPiece(null);
  };

  const getSnapPosition = (clientX: number, clientY: number) => {
    const boardElement = document.querySelector(".chess-board") as HTMLElement;
    if (!boardElement) return null;

    const rect = boardElement.getBoundingClientRect();
    const relativeX = clientX - rect.left - 20;
    const relativeY = clientY - rect.top - 20;

    const gridX = Math.round(relativeX / GRID_SIZE);
    const gridY = Math.round(relativeY / GRID_SIZE);

    const snapThreshold = 20;
    const snapX = gridX * GRID_SIZE;
    const snapY = gridY * GRID_SIZE;

    if (Math.abs(relativeX - snapX) < snapThreshold && Math.abs(relativeY - snapY) < snapThreshold) {
      return { x: snapX + 20, y: snapY + 20 };
    }

    return null;
  };

  return (
    <div
      class="relative bg-card from-amber-100 to-amber-200 p-6 rounded-xl shadow-2xl border-4 border-amber-800"
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div
        class="relative chess-board"
        style={{
          height: `${BOARD_HEIGHT}px`,
          padding: "20px",
          width: `${BOARD_WIDTH}px`,
        }}
      >
        {/* 绘制棋盘网格线 */}
        <svg class="absolute inset-0" height={BOARD_HEIGHT} style="pointer-events: none;" width={BOARD_WIDTH}>
          {/* 横线 */}
          {Array.from({ length: 10 }).map((_, y) => (
            <line stroke="#8B4513" stroke-width="2" x1="20" x2={20 + 8 * GRID_SIZE} y1={20 + y * GRID_SIZE} y2={20 + y * GRID_SIZE} />
          ))}

          {/* 竖线 */}
          {Array.from({ length: 9 }).map((_, x) => (
            <>
              {/* 上半部分竖线 (0-4行) */}
              <line stroke="#8B4513" stroke-width="2" x1={20 + x * GRID_SIZE} x2={20 + x * GRID_SIZE} y1="20" y2={20 + 4 * GRID_SIZE} />
              {/* 下半部分竖线 (5-9行) */}
              <line stroke="#8B4513" stroke-width="2" x1={20 + x * GRID_SIZE} x2={20 + x * GRID_SIZE} y1={20 + 5 * GRID_SIZE} y2={20 + 9 * GRID_SIZE} />
            </>
          ))}

          {/* 九宫格对角线 - 上方 */}
          <line stroke="#8B4513" stroke-width="2" x1={20 + 3 * GRID_SIZE} x2={20 + 5 * GRID_SIZE} y1="20" y2={20 + 2 * GRID_SIZE} />
          <line stroke="#8B4513" stroke-width="2" x1={20 + 5 * GRID_SIZE} x2={20 + 3 * GRID_SIZE} y1="20" y2={20 + 2 * GRID_SIZE} />

          {/* 九宫格对角线 - 下方 */}
          <line stroke="#8B4513" stroke-width="2" x1={20 + 3 * GRID_SIZE} x2={20 + 5 * GRID_SIZE} y1={20 + 7 * GRID_SIZE} y2={20 + 9 * GRID_SIZE} />
          <line stroke="#8B4513" stroke-width="2" x1={20 + 5 * GRID_SIZE} x2={20 + 3 * GRID_SIZE} y1={20 + 7 * GRID_SIZE} y2={20 + 9 * GRID_SIZE} />

          {/* 河界标识 */}
          <text fill="#8B4513" font-size="16" font-weight="bold" text-anchor="middle" x={20 + 1 * GRID_SIZE} y={20 + 4.7 * GRID_SIZE}>
            楚河
          </text>
          <text fill="#8B4513" font-size="16" font-weight="bold" text-anchor="middle" x={20 + 7 * GRID_SIZE} y={20 + 4.7 * GRID_SIZE}>
            汉界
          </text>
        </svg>

        <For each={chessPieces()}>
          {(piece) => {
            const dragged = draggedPiece();
            const isCurrentlyDragged = dragged?.piece === piece;

            return <ChessPiece dragPosition={dragPosition()} isDragging={isCurrentlyDragged} onMouseDown={(e) => handleMouseDown(e, piece)} piece={piece} />;
          }}
        </For>
      </div>
    </div>
  );
}

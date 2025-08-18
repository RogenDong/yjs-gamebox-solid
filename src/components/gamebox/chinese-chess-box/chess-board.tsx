import { createEventListener } from "@solid-primitives/event-listener";
import { createSignal, For, Show } from "solid-js";
import { ChessPiece } from "./chess-piece";
import { useChineseChessContext } from "./chinese-chess-context";
import { BOARD_HEIGHT, BOARD_WIDTH, GRID_SIZE } from "./constant";
import type { ChessPieceData, Position } from "./types";

// 棋盘组件
export function ChessBoard() {
  const { yChessPieceMap, chessPieces, movePiece, selectionPiece } = useChineseChessContext();

  const [isDragging, setIsDragging] = createSignal(false);
  const [dragPosition, setDragPosition] = createSignal({ x: 0, y: 0 });
  const [gameBoxDiv, setGameBoxDiv] = createSignal<HTMLDivElement>();

  const handleMouseDown = (e: MouseEvent, piece: ChessPieceData) => {
    e.preventDefault();
    const boxEl = gameBoxDiv();
    if (!boxEl) return;
    const offset = {
      x: e.pageX - boxEl.offsetLeft - GRID_SIZE / 2,
      y: e.pageY - boxEl.offsetTop - GRID_SIZE / 2,
    };

    selectionPiece.set(piece);
    setIsDragging(true);
    setDragPosition(offset);
  };

  createEventListener(window, "mousemove", (event) => {
    const piece = selectionPiece.get();
    if (!isDragging() || !piece) return;
    const el = gameBoxDiv();
    if (el) {
      const vx = event.pageX - el.offsetLeft - GRID_SIZE / 2;
      const vy = event.pageY - el.offsetTop - GRID_SIZE / 2;
      setDragPosition({ x: vx, y: vy });
    }
  });

  createEventListener(window, "mouseup", (event) => {
    const piece = selectionPiece.get();
    if (!isDragging() || !piece) return;

    const boardElement = document.querySelector(".chess-board") as HTMLElement;
    if (!boardElement) return;

    const rect = boardElement.getBoundingClientRect();
    const x = Math.round((event.clientX - rect.left - 20) / GRID_SIZE);
    const y = Math.round((event.clientY - rect.top - 20) / GRID_SIZE);

    if (x >= 0 && x <= 8 && y >= 0 && y <= 9) {
      const newPosition = { x, y };
      movePiece(piece.position, newPosition);
    }

    setIsDragging(false);
  });

  return (
    <div class="bg-card from-amber-100 to-amber-200 p-6 rounded-xl shadow-2xl border-4 border-amber-800">
      <div
        class="relative chess-board"
        ref={setGameBoxDiv}
        style={{
          height: `${BOARD_HEIGHT}px`,
          width: `${BOARD_WIDTH}px`,
        }}
      >
        {/* 绘制棋盘网格线 */}
        <svg class="absolute inset-0" height={BOARD_HEIGHT} style="pointer-events: none;" width={BOARD_WIDTH}>
          {/* 横线 */}
          {Array.from({ length: 10 }).map((_, y) => (
            <line stroke="#8B4513" stroke-width="2" x1="32" x2={32 + 8 * GRID_SIZE} y1={32 + y * GRID_SIZE} y2={32 + y * GRID_SIZE} />
          ))}

          {/* 竖线 */}
          {Array.from({ length: 9 }).map((_, x) => (
            <>
              {/* 上半部分竖线 (0-4行) */}
              <line stroke="#8B4513" stroke-width="2" x1={32 + x * GRID_SIZE} x2={32 + x * GRID_SIZE} y1="32" y2={32 + 4 * GRID_SIZE} />
              {/* 下半部分竖线 (5-9行) */}
              <line stroke="#8B4513" stroke-width="2" x1={32 + x * GRID_SIZE} x2={32 + x * GRID_SIZE} y1={32 + 5 * GRID_SIZE} y2={32 + 9 * GRID_SIZE} />
            </>
          ))}

          {/* 九宫格对角线 - 上方 */}
          <line stroke="#8B4513" stroke-width="2" x1={32 + 3 * GRID_SIZE} x2={32 + 5 * GRID_SIZE} y1="32" y2={32 + 2 * GRID_SIZE} />
          <line stroke="#8B4513" stroke-width="2" x1={32 + 5 * GRID_SIZE} x2={32 + 3 * GRID_SIZE} y1="32" y2={32 + 2 * GRID_SIZE} />

          {/* 九宫格对角线 - 下方 */}
          <line stroke="#8B4513" stroke-width="2" x1={32 + 3 * GRID_SIZE} x2={32 + 5 * GRID_SIZE} y1={32 + 7 * GRID_SIZE} y2={32 + 9 * GRID_SIZE} />
          <line stroke="#8B4513" stroke-width="2" x1={32 + 5 * GRID_SIZE} x2={32 + 3 * GRID_SIZE} y1={32 + 7 * GRID_SIZE} y2={32 + 9 * GRID_SIZE} />

          {/* 河界标识 */}
          <text fill="#8B4513" font-size="16" font-weight="bold" text-anchor="middle" x={32 + 1 * GRID_SIZE} y={32 + 4.7 * GRID_SIZE}>
            楚河
          </text>
          <text fill="#8B4513" font-size="16" font-weight="bold" text-anchor="middle" x={32 + 7 * GRID_SIZE} y={32 + 4.7 * GRID_SIZE}>
            汉界
          </text>
        </svg>
        <For each={chessPieces.get()}>
          {(piece) => {
            function isCurrentlyDragged() {
              return selectionPiece.get()?.position.x === piece.position.x && selectionPiece.get()?.position.y === piece.position.y;
            }

            return <ChessPiece dragPosition={dragPosition()} isDragging={isCurrentlyDragged()} onMouseDown={(e) => handleMouseDown(e, piece)} piece={piece} />;
          }}
        </For>
        <Show when={isDragging() && selectionPiece.get()}>
          <ChessDragPlaceholder dragPosition={dragPosition()} />
        </Show>
      </div>
    </div>
  );
}

/** 拖拽占位, 在占位上显示圆圈 */
export function ChessDragPlaceholder(props: { dragPosition: Position }) {
  function getLeft() {
    const x = Math.round(props.dragPosition.x / GRID_SIZE);
    return x * GRID_SIZE + 32;
  }

  function getTop() {
    const y = Math.round(props.dragPosition.y / GRID_SIZE);
    return y * GRID_SIZE + 32;
  }
  return (
    <div
      class="absolute w-2 h-2 rounded-full bg-red-500/50 pointer-events-none"
      style={{
        left: `${getLeft()}px`,
        top: `${getTop()}px`,
      }}
    />
  );
}

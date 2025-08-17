import { cn } from "~/libs/cn";
import type { ChessPieceData } from "./types";

export interface ChessPieceProps {
  piece: ChessPieceData;
  isDragging?: boolean;
  dragPosition?: { x: number; y: number };
  onMouseDown: (e: MouseEvent) => void;
}
/**
 * 棋子组件
 */
export function ChessPiece(props: ChessPieceProps) {
  const GRID_SIZE = 60;

  function getLeft() {
    const left = 20 + props.piece.position.x * GRID_SIZE - 32;
    return props.isDragging && props.dragPosition ? props.dragPosition.x : left;
  }

  function getTop() {
    const top = 20 + props.piece.position.y * GRID_SIZE - 32;
    return props.isDragging && props.dragPosition ? props.dragPosition.y : top;
  }

  return (
    <div
      class={cn(
        "absolute w-16 h-16 rounded-full shadow-sm border flex items-center justify-center bg-white/95 cursor-move select-none",
        props.isDragging ? "z-50 scale-110 shadow-lg transition-none" : "transition-all duration-200 hover:scale-110",
      )}
      onMouseDown={props.onMouseDown}
      style={{
        left: `${getLeft()}px`,
        top: `${getTop()}px`,
        transform: props.isDragging ? "none" : undefined,
      }}
    >
      <div class={cn("absolute inset-[3px] rounded-full", props.piece.side === "r" ? "border border-red-300" : "border border-stone-300")} />
      <span aria-hidden class={cn("font-bold text-[min(5vw,28px)] leading-none", props.piece.side === "r" ? "text-red-600" : "text-stone-900")}>
        {formatPieceChar(props.piece)} {props.isDragging ? "拖动中" : "?"}
      </span>
      <span class="sr-only">
        {props.piece.side === "r" ? "红" : "黑"} {formatPieceChar(props.piece)}
      </span>
    </div>
  );
}

/** 格式化棋子字符 */
export function formatPieceChar(piece: ChessPieceData) {
  if (piece.side === "r") {
    switch (piece.type) {
      case "车":
        return "车";
      case "马":
        return "马";
      case "相":
        return "相";
      case "士":
        return "士";
      case "帅":
        return "帅";
      case "炮":
        return "炮";
      case "兵":
        return "兵";
    }
  } else {
    switch (piece.type) {
      case "车":
        return "車";
      case "马":
        return "馬";
      case "相":
        return "象";
      case "士":
        return "仕";
      case "帅":
        return "將";
      case "炮":
        return "砲";
      case "兵":
        return "卒";
    }
  }
}

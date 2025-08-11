import { cn } from "~/libs/cn";
import type { ChessPieceData, Position } from "./types";

// 棋子组件
export function ChessPiece(props: { piece: ChessPieceData; position: Position; onDragStart: (e: DragEvent) => void }) {
  return (
    <div
      class={`w-16 h-16 rounded-full shadow-sm border flex items-center justify-center shadow-sm bg-white/95 transition-all duration-200 hover:scale-110`}
      draggable={true}
      onDragStart={props.onDragStart}
    >
      <div class={cn("absolute inset-[3px] rounded-full", props.piece.side === "r" ? "border border-red-300" : "border border-stone-300")} />
      <span class={cn("font-bold text-[min(5vw,28px)] leading-none", props.piece.side === "r" ? "text-red-600" : "text-stone-900")} aria-hidden>
        {formatPieceChar(props.piece)}
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

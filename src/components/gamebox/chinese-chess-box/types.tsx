export type PieceType = "车" | "马" | "相" | "士" | "帅" | "炮" | "兵";

export interface ChessPieceData {
  type: PieceType;
  side: "r" | "b";
}
/** 棋盘位置 */
export interface Position {
  x: number;
  y: number;
}

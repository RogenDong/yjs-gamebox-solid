export type PieceType = "车" | "马" | "相" | "士" | "帅" | "炮" | "兵";

/**
 * 棋子数据
 *
 * 中国象棋为双人对战游戏
 * 本项目定义红、黑两方。数据定义为红（r）黑（b）。
 * 棋盘拥有(0,0) - (9,10)坐标范围区域。
 * 红方在上，黑方在下。左上角坐标为(0,0)、右下角坐标为(9,10)
 */
export interface ChessPieceData {
  /** 棋子ID */
  id: string;
  /** 棋子类型 */
  type: PieceType;
  /** 棋子所属方 */
  side: "r" | "b";
  /** 棋子位置 */
  position: Position;
}

/** 棋盘位置 */
export interface Position {
  x: number;
  y: number;
}

export interface ChessGameState {
  currentPlayer: "r" | "b";
  gameStatus: "playing" | "red-win" | "black-win" | "draw";
}

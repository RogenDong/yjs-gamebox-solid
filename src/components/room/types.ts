/** 游戏类型 */
export enum GameType {
  Mine = "扫雷",
  // Chess = "象棋",
  // Go = "围棋",
}

/** 房间 */
export interface GameRoom {
  /** 房间id */
  id: string;
  /** 房间名称 */
  name: string;
  /** 房间密码 */
  password: string;
  /** 创建人 */
  creator: string;
  /** 创建日期 */
  created_at: number;
  /** 游戏类型 */
  game_type: GameType;
}

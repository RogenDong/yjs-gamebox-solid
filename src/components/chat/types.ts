import type { Player } from "../player/types";

export interface MessageData {
  /** id */
  id: string;
  /** 发送人 */
  sender: Player;
  /** 内容 */
  content: string;
  /** 发送时间 */
  timestamp: number;
}

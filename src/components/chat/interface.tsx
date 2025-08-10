import type { Player } from "../gamebox/mine-box/metadata";

export enum MessageTypeEnum {
  Text = "text",
}

export interface Message {
  id: string;
  type: MessageTypeEnum.Text;
  sender: Player;
  content: string;
  timestamp: string;
  // metadata?: {
  //   fileName?: string;
  //   fileSize?: number;
  //   fileType?: string;
  //   thumbnailUrl?: string;
  //   duration?: number;
  //   linkTitle?: string;
  //   linkDescription?: string;
  //   linkImage?: string;
  // };
}

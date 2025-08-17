import type { ChessPieceData, Position } from "./types";

/**
 * 兵卒的可达范围
 *
 * 兵卒只能走垂直或水平方向；
 * 不能后退；
 * 过河前不能转向；
 *
 * @param origin 当前棋子
 * @returns 可移动范围
 */
export function bingReach(origin: ChessPieceData, _: ChessPieceData[][]): Position[] {
  const op = origin.position;
  // 黑
  if (origin.side === "b") {
    if (op.y < 5) return [{ x: op.x, y: op.y + 1 }];
    return [
      { x: op.x, y: op.y + 1 },
      { x: op.x + 1, y: op.y },
      { x: op.x - 1, y: op.y },
    ];
  }
  // 红
  if (op.y > 4) return [{ x: op.x, y: op.y - 1 }];
  return [
    { x: op.x, y: op.y - 1 },
    { x: op.x + 1, y: op.y },
    { x: op.x - 1, y: op.y },
  ];
}

/**
 * 炮的可达范围
 *
 * 炮只能走垂直或水平方向；
 * 吃子时必须越过1个棋子；
 * 最多可以越过1个棋子；
 * 普通移动不能越过棋子；
 *
 * @param origin 当前棋子
 * @param board 棋盘
 * @returns 可移动范围
 */
export function paoReach(origin: ChessPieceData, board: ChessPieceData[][]): Position[] {
  const op = origin.position;
  const reach = [];

  // 水平方向
  let min = 0;
  let max = 9;
  for (let i = op.x - 1; i >= 0; i--) {
    if (!board[op.y][i]) continue;
    if (min === 0) {
      min = i + 1;
      // 边缘至少有2个棋子才可以判断吃子
      if (i < 2) break;
      continue;
    }
    // 别打友军！
    if (board[op.y][i].side !== origin.side) {
      reach.push({ x: i, y: op.y });
      break;
    }
  }
  for (let i = op.x + 1; i < 10; i++) {
    if (!board[op.y][i]) continue;
    if (max === 9) {
      max = i - 1;
      if (i > 7) break;
      continue;
    }
    if (board[op.y][i].side !== origin.side) {
      reach.push({ x: i, y: op.y });
      break;
    }
  }
  // 收集坐标
  for (let i = min; i <= max; i++) {
    if (i === op.x) continue;
    reach.push({ x: i, y: op.y });
  }

  // 垂直方向
  min = 0;
  max = 8;
  for (let i = op.y - 1; i >= 0; i--) {
    if (!board[i][op.x]) continue;
    if (min === 0) {
      min = i + 1;
      // 边缘至少有2个棋子才可以判断吃子
      if (i < 2) break;
      continue;
    }
    // 别打友军！
    if (board[i][op.x].side !== origin.side) {
      reach.push({ x: i, y: op.y });
      break;
    }
  }
  for (let i = op.y + 1; i < 9; i++) {
    if (!board[i][op.x]) continue;
    if (max === 8) {
      max = i - 1;
      if (i > 6) break;
      continue;
    }
    if (board[i][op.x].side !== origin.side) {
      reach.push({ x: i, y: op.y });
      break;
    }
  }

  // 收集坐标
  for (let i = min; i <= max; i++) {
    if (i === op.x) continue;
    reach.push({ x: i, y: op.y });
  }

  return reach;
}

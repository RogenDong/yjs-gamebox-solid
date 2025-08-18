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
export function bingReach(origin: ChessPieceData, board: ChessPieceData[][]): Position[] {
  const op = origin.position;
  const reach = [];
  // 上下
  if (origin.side === "b") {
    if (op.y < 8) {
      const tmp = board[op.y + 1][op.x];
      // 没到底端都可以前进 && 有没有友军挡路
      if (!tmp || tmp.side !== origin.side) reach.push({ x: op.x, y: op.y + 1 });
      // 过河前只能前进1步
      if (op.y < 5) return reach;
    }
  } else if (op.y > 0) {
    const tmp = board[op.y + 1][op.x];
    if (!tmp || tmp.side !== origin.side) reach.push({ x: op.x, y: op.y - 1 });
    if (op.y > 4) return reach;
  }
  // 左右
  if (op.x > 0) {
    const left = board[op.y][op.x - 1];
    if (!left || left.side !== origin.side) reach.push({ x: op.x - 1, y: op.y });
  }
  if (op.x < 9) {
    const right = board[op.y][op.x + 1];
    if (!right || right.side !== origin.side) reach.push({ x: op.x + 1, y: op.y });
  }
  return reach;
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
  const reach: Position[] = [];

  /**
   * @param size x或y的最大值
   * @param center x或y的中点
   * @param piece 函数：如何根据索引获取棋盘上的棋子
   * @param suited 函数：如何根据索引构造 Position
   */
  function find(size: number, center: number, piece: (i: number) => ChessPieceData, suited: (i: number) => Position) {
    for (let i = center - 1; i >= 0; i--) {
      const tmp = piece(i);
      if (!tmp) {
        reach.push(suited(i));
        continue;
      }
      // 遇到阻拦，检查炮击空间，至少需要2单位
      if (i < 2) break;
      // 检查有无炮击对象
      for (i--; i >= 0; i--) {
        const target = piece(i);
        if (target && target.side !== origin.side) {
          reach.push(suited(i));
          break;
        }
      }
    }
    for (let i = center + 1; i <= size; i++) {
      const tmp = piece(i);
      if (!tmp) {
        reach.push(suited(i));
        continue;
      }
      if (i > size - 2) break;
      for (i++; i <= size; i++) {
        const target = piece(i);
        if (target && target.side !== origin.side) {
          reach.push(suited(i));
          break;
        }
      }
    }
  }

  const op = origin.position;
  // 水平方向
  find(
    9,
    op.x,
    (x) => board[op.y][x],
    (x) => ({ x, y: op.y }),
  );

  // 垂直方向
  find(
    8,
    op.x,
    (y) => board[y][op.x],
    (y) => ({ x: op.x, y }),
  );

  return reach;
}

/** 车的可达范围 */
export function cheReach(origin: ChessPieceData, board: ChessPieceData[][]): Position[] {
  const reach: Position[] = [];

  /**
   * @param size x或y的最大值
   * @param center x或y的中点
   * @param piece 函数：如何根据索引获取棋盘上的棋子
   * @param suited 函数：如何根据索引构造 Position
   */
  function find(size: number, center: number, piece: (i: number) => ChessPieceData, suited: (i: number) => Position) {
    for (let i = center - 1; i >= 0; i--) {
      const tmp = piece(i);
      if (!tmp) reach.push(suited(i));
      // 检查有无攻击对象
      else if (tmp.side !== origin.side) {
        reach.push(suited(i));
        break;
      }
    }
    for (let i = center + 1; i <= size; i++) {
      const tmp = piece(i);
      if (!tmp) reach.push(suited(i));
      else if (tmp.side !== origin.side) {
        reach.push(suited(i));
        break;
      }
    }
  }

  const op = origin.position;
  // 水平方向
  find(
    9,
    op.x,
    (i) => board[op.y][i],
    (i) => ({ x: i, y: op.y }),
  );

  // 垂直方向
  find(
    8,
    op.y,
    (y) => board[y][op.x],
    (y) => ({ x: op.x, y }),
  );

  return reach;
}

/** 马的可达范围 */
export function maReach(origin: ChessPieceData, board: ChessPieceData[][]): Position[] {
  const op = origin.position;
  // 阻挡点、落脚点（每个方向各有2点）
  const targets = [
    [
      [op.x, op.y - 1], // 上
      [op.x - 1, op.y - 2],
      [op.x + 1, op.y - 2],
    ],
    [
      [op.x, op.y + 1], // 下
      [op.x - 1, op.y + 2],
      [op.x + 1, op.y + 2],
    ],
    [
      [op.x - 1, op.y], // 左
      [op.x + 2, op.y - 1],
      [op.x + 2, op.y + 1],
    ],
    [
      [op.x + 1, op.y], // 右
      [op.x + 2, op.y + 1],
      [op.x + 2, op.y - 1],
    ],
  ];
  const reach = [];

  // 检查每个点
  for (const [obstacle, a, b] of targets) {
    const [ox, oy] = obstacle;
    // 马脚越界
    if (ox < 0 || ox > 9 || oy < 0 || oy > 8) continue;
    // 憋马脚
    if (board[oy][ox]) continue;

    const [ax, ay] = a;
    const [bx, by] = b;
    // 不越界
    if (!(ax < 0 || ax > 9 || ay < 0 || ay > 8)) {
      const tmp = board[ay][ax];
      // 空位、敌对
      if (!tmp || tmp.side !== origin.side) reach.push({ x: ax, y: ay });
    }
    if (!(bx < 0 || bx > 9 || by < 0 || by > 8)) {
      const tmp = board[by][bx];
      if (!tmp || tmp.side !== origin.side) reach.push({ x: bx, y: by });
    }
  }

  return reach;
}

/** 象的可达范围 */
export function xiangReach(origin: ChessPieceData, board: ChessPieceData[][]): Position[] {
  const op = origin.position;
  // 阻挡点、落脚点
  const targets = [
    [
      [op.x + 1, op.y - 1],
      [op.x + 2, op.y - 2],
    ],
    [
      [op.x + 1, op.y + 1],
      [op.x + 2, op.y + 2],
    ],
    [
      [op.x - 1, op.y + 1],
      [op.x - 2, op.y + 2],
    ],
    [
      [op.x - 1, op.y - 1],
      [op.x - 2, op.y - 2],
    ],
  ];
  const reach = [];

  for (const [obstacle, dest] of targets) {
    const [ox, oy] = obstacle;
    if (board[oy][ox]) continue;

    const [x, y] = dest;
    const tmp = board[y][x];
    if (!tmp || tmp.side !== origin.side) reach.push({ x, y });
  }

  return reach;
}

/** 士 只能在九宫格4角与中心移动 */
const SHI_PRESET_AREA = [
  { x: 3, y: 0 },
  { x: 5, y: 0 },
  { x: 3, y: 2 },
  { x: 5, y: 2 },
];

/** 士的可达范围 */
export function shiReach(origin: ChessPieceData, board: ChessPieceData[][]): Position[] {
  const op = origin.position;
  const reach = [];

  // 棋子在九宫格中心
  if (op.x === 4) {
    for (const tp of SHI_PRESET_AREA) {
      const tmp = board[tp.y][tp.x];
      if (!tmp || tmp.side !== origin.side) {
        if (op.y <= 2) reach.push(tp);
        else reach.push({ x: tp.x, y: tp.y + 7 });
      }
    }
    return reach;
  }

  // 先检查九宫格中心有没有棋子
  const tmp = board[4][op.y <= 2 ? 1 : 8];
  if (tmp && tmp.side === origin.side) return [];

  // 检查棋子在九宫格哪个角
  for (const { x, y } of SHI_PRESET_AREA) {
    if (op.x === x && (op.y === y || op.y === y + 7)) {
      if (op.y <= 2) reach.push({ x: 4, y: 1 });
      else reach.push({ x: 4, y: 7 });
      break;
    }
  }
  return reach;
}

import type { ChessPieceData, Position } from "./types";

/**
 * 查看棋子可达范围
 *
 * @param chess 选中的棋子
 * @param chessSet 棋盘上的所有棋子
 * @returns 可移动的位置和可以吃的子
 */
export function previewChessMove(chess: ChessPieceData, board: ChessPieceData[]): Position[] {
  const op = chess.position;
  if (op.x < 0 || op.x > 8 || op.y < 0 || op.y > 9) return [];
  switch (chess.type) {
    case "兵":
      return bingReach(chess, board);
    case "炮":
      return paoReach(chess, board);
    case "车":
      return cheReach(chess, board);
    case "马":
      return maReach(chess, board);
    case "相":
      return xiangReach(chess, board);
    case "士":
      return shiReach(chess, board);
    case "帅":
      return shuaiReach(chess, board);
  }
}

function exists(arr: ChessPieceData[], x: number, y: number): boolean {
  return arr.some((c) => c.position.x === x && c.position.y === y);
}

function getByPos(arr: ChessPieceData[], x: number, y: number): ChessPieceData | undefined {
  return arr.find((c) => c.position.x === x && c.position.y === y);
}

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
export function bingReach(origin: ChessPieceData, board: ChessPieceData[]): Position[] {
  const op = origin.position;
  const reach: Position[] = [];

  /** 边界检查、阵营检查 */
  function test(x: number, y: number) {
    const tmp = getByPos(board, x, y);
    if (!tmp || tmp.side !== origin.side) reach.push({ x, y });
  }

  // 上下
  if (origin.side === "b") {
    // 没到边界都可以前进
    if (op.y < 9) {
      test(op.x, op.y + 1);
      // 过河前只能前进1步
      if (op.y < 5) return reach;
    }
  } else if (op.y > 0) {
    test(op.x, op.y + 1);
    if (op.y > 4) return reach;
  }

  // 左右
  if (op.x > 0) test(op.x - 1, op.y);
  if (op.x < 8) test(op.x + 1, op.y);

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
export function paoReach(origin: ChessPieceData, board: ChessPieceData[]): Position[] {
  const reach: Position[] = [];

  /**
   * @param size x或y的最大值
   * @param center x或y的中点
   * @param piece 函数：如何根据索引获取棋盘上的棋子
   * @param suited 函数：如何根据索引构造 Position
   */
  function find(size: number, center: number, piece: (i: number) => ChessPieceData | undefined, suited: (i: number) => Position) {
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
    8,
    op.x,
    (x) => getByPos(board, x, op.y),
    (x) => ({ x, y: op.y }),
  );

  // 垂直方向
  find(
    9,
    op.y,
    (y) => getByPos(board, op.x, y),
    (y) => ({ x: op.x, y }),
  );

  return reach;
}

/** 车的可达范围 */
export function cheReach(origin: ChessPieceData, board: ChessPieceData[]): Position[] {
  const reach: Position[] = [];

  /**
   * @param size x或y的最大值
   * @param center x或y的中点
   * @param piece 函数：如何根据索引获取棋盘上的棋子
   * @param suited 函数：如何根据索引构造 Position
   */
  function find(size: number, center: number, piece: (i: number) => ChessPieceData | undefined, suited: (i: number) => Position) {
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
    8,
    op.x,
    (x) => getByPos(board, x, op.y),
    (x) => ({ x: x, y: op.y }),
  );

  // 垂直方向
  find(
    9,
    op.y,
    (y) => getByPos(board, op.x, y),
    (y) => ({ x: op.x, y }),
  );

  return reach;
}

/** 马的可达范围 */
export function maReach(origin: ChessPieceData, board: ChessPieceData[]): Position[] {
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
    if (ox < 0 || ox > 8 || oy < 0 || oy > 9) continue;
    // 憋马脚
    if (exists(board, ox, oy)) continue;

    const [ax, ay] = a;
    const [bx, by] = b;
    // 不越界
    if (!(ax < 0 || ax > 8 || ay < 0 || ay > 9)) {
      const tmp = getByPos(board, ax, ay);
      // 空位、敌对
      if (!tmp || tmp.side !== origin.side) reach.push({ x: ax, y: ay });
    }
    if (!(bx < 0 || bx > 8 || by < 0 || by > 9)) {
      const tmp = getByPos(board, bx, by);
      if (!tmp || tmp.side !== origin.side) reach.push({ x: bx, y: by });
    }
  }

  return reach;
}

/** 象的可达范围 */
export function xiangReach(origin: ChessPieceData, board: ChessPieceData[]): Position[] {
  const { x, y } = origin.position;
  // 阻挡点、落脚点
  const targets = [
    [
      [x + 1, y - 1],
      [x + 2, y - 2],
    ],
    [
      [x + 1, y + 1],
      [x + 2, y + 2],
    ],
    [
      [x - 1, y + 1],
      [x - 2, y + 2],
    ],
    [
      [x - 1, y - 1],
      [x - 2, y - 2],
    ],
  ];
  const reach = [];

  for (const [[ox, oy], [dx, dy]] of targets) {
    if (ox < 0 || ox > 8 || oy < 0 || oy > 9 || dx < 0 || dx > 8 || dy < 0 || dy > 9 || exists(board, ox, oy)) continue;

    const tmp = getByPos(board, dx, dy);
    if (!tmp || tmp.side !== origin.side) reach.push({ x: dx, y: dy });
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
export function shiReach(origin: ChessPieceData, board: ChessPieceData[]): Position[] {
  const op = origin.position;
  const reach = [];

  // 士在九宫格中心
  if (op.x === 4) {
    for (let { x, y } of SHI_PRESET_AREA) {
      if (op.y > 2) y += 7;
      const tmp = getByPos(board, x, y);
      if (!tmp || tmp.side !== origin.side) reach.push({ x, y });
    }
    return reach;
  }

  // 士在九宫格四角，先检查中心有没有棋子
  const cp = { x: 4, y: op.y > 2 ? 8 : 1 };
  const tmp = getByPos(board, cp.x, cp.y);
  if (!tmp || tmp.side !== origin.side) reach.push(cp);
  return reach;
}

/** 将帅的可达范围 */
export function shuaiReach(origin: ChessPieceData, board: ChessPieceData[]): Position[] {
  const op = origin.position;
  const reach: Position[] = [];

  function test(x: number, y: number) {
    const tmp = getByPos(board, x, y);
    if (!tmp || tmp.side !== origin.side) reach.push({ x, y });
  }

  // 上下边界
  if (op.y !== 7 && op.y !== 0) test(op.x, op.y - 1);
  if (op.y !== 2 && op.y !== 9) test(op.x, op.y + 1);

  // 左右边界
  if (op.x > 0) test(op.x - 1, op.y);
  if (op.x < 8) test(op.x + 1, op.y);

  return reach;
}

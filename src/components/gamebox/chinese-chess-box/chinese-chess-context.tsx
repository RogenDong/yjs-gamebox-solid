import { type Accessor, createContext, type Setter, useContext } from "solid-js";
import type * as Y from "yjs";
import type { SignalGetSet } from "~/libs/signal-helper";
import type { ChessGameState, ChessPieceData, Position } from "./types";

export interface IChineseChessContext {
  /** YJS - 棋子数据 */
  yChessPieceMap: Y.Map<ChessPieceData>;
  /** 棋子数据 */
  chessPieces: SignalGetSet<ChessPieceData[]>;
  /** 选中棋子 */
  selectionPiece: SignalGetSet<ChessPieceData | null>;
  gameState: Accessor<ChessGameState>;
  setGameState: Setter<ChessGameState>;
  draggedPiece: Accessor<{ position: Position; piece: ChessPieceData } | null>;
  setDraggedPiece: Setter<{ position: Position; piece: ChessPieceData } | null>;
  movePiece: (from: Position, to: Position) => void;
  canMoveTo: (from: Position, to: Position) => boolean;
}

export const ChineseChessContext = createContext<IChineseChessContext>();

export function useChineseChessContext() {
  const context = useContext(ChineseChessContext);
  if (!context) {
    throw new Error("useChineseChessContext must be used within a ChineseChessContext.Provider");
  }
  return context;
}

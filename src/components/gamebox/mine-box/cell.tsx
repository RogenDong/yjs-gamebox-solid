import { cn } from "~/libs/cn";
import { Cell, useMineBoxContext } from "./mine-box";
import { cva } from "class-variance-authority";
import { Show } from "solid-js";
import { BombIcon, FlagIcon } from "./icons";

export const mineCellVariants = cva(
  "flex items-center justify-center w-10 h-10 bg-gray-900 border-gray-700 hover:border-gray-600 hover:scale-105 font-bold text-xl text-blue-400 outline outline-1 outline-gray-600 shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-200 transform select-none",
  {
    variants: {
      open: {
        true: "bg-gray-900",
        false: "bg-gray-800 hover:bg-gray-700",
      },
      bomb: {
        true: "ring-2 ring-red-500 ring-opacity-50",
      },
      aroundMines: {
        "1": "text-blue-400",
        "2": "text-green-400",
        "3": "text-red-400",
        "4": "text-purple-400",
        "5": "text-yellow-400",
        "6": "text-cyan-400",
        "7": "text-pink-400",
        "8": "text-orange-400",
        "0": "text-gray-400",
      },
    },
    compoundVariants: [
      {
        open: true,
        bomb: true,
        class: "bg-red-900/30",
      },
    ],
    defaultVariants: {},
  },
);
/**
 * 格子
 */
export function MineBoxCell(props: { cell: Cell }) {
  const context = useMineBoxContext();

  function isMine() {
    return context.mines()[props.cell.y * context.width + props.cell.x];
  }

  function aroundMines() {
    return context.aroundMines()[props.cell.y * context.width + props.cell.x]?.toString() as "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "0";
  }

  function handleClick(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    if (context.isGameOver()) {
      return;
    }
    if (context.isFlag(props.cell)) {
      return;
    }
    context.openCell(props.cell);
  }
  function handleContextMenu(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    if (context.isOpen(props.cell)) {
      context.openAround(props.cell);
    } else {
      context.flagCell(props.cell);
    }
  }

  return (
    <div
      class={cn(
        mineCellVariants({
          aroundMines: aroundMines(),
          bomb: context.isOpen(props.cell) && isMine(),
          open: context.isOpen(props.cell),
        }),
      )}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onKeyDown={() => {}}
    >
      <Show when={context.isGameOver()}>
        <Show when={context.isOpen(props.cell) && !isMine()}>{aroundMines()}</Show>
        <Show when={context.isFlag(props.cell) && !isMine()}>
          <FlagIcon />
        </Show>
        <Show when={isMine() && context.isGameOver()}>
          <BombIcon class="animate-pulse" />
        </Show>
      </Show>
      <Show when={!context.isGameOver()}>
        <Show when={context.isOpen(props.cell)}>{aroundMines()}</Show>
        <Show when={context.isFlag(props.cell)}>
          <FlagIcon />
        </Show>
      </Show>
    </div>
  );
}
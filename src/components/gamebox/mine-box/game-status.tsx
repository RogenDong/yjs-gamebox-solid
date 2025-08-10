import { BombIcon, FlagIcon, RefreshIcon } from "./icons";

interface GameStatusProps {
  mineCount: number;
  flagCount: number;
  isGameOver: boolean;
  isVictory: boolean;
  onRestart: () => void;
}

export function GameStatus(props: GameStatusProps) {
  return (
    <div class="mb-6 flex flex-col items-center gap-4">
      <div class="flex items-center gap-8">
        <div class="flex items-center gap-2">
          <BombIcon class="w-5 h-5 text-red-500" />
          <span class="text-gray-300">{props.mineCount - props.flagCount}</span>
        </div>
        <button type="button" onClick={props.onRestart} class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 text-white transition-colors">
          <RefreshIcon class="w-4 h-4" />
          Restart
        </button>
        <div class="flex items-center gap-2">
          <FlagIcon class="w-5 h-5 text-yellow-500" />
          <span class="text-gray-300">{props.flagCount}</span>
        </div>
      </div>

      {(props.isGameOver || props.isVictory) && (
        <div
          class="text-xl font-bold animate-bounce transition-all duration-500"
          classList={{
            "text-green-500": props.isVictory,
            "text-red-500": !props.isVictory,
          }}
        >
          {props.isVictory ? "🎉 Victory! 🎉" : "💥 Game Over! 💥"}
        </div>
      )}
    </div>
  );
}

import { For } from "solid-js";
import xiangqiBg from "~/assets/img_1.png";
import { Chat } from "~/components/chat/chat";
import { GameStatus } from "~/components/gamebox/mine-box/game-status";
import { CursorIcon } from "~/components/gamebox/mine-box/icons";
import { MineBoxCell, MineBoxHeader } from "~/components/gamebox/mine-box/mine-box";
import { PlayersList } from "~/components/gamebox/mine-box/players";

export function GameBox() {
  return (
    <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4" style={{ background: `url(${xiangqiBg})` }}>
      <div class="flex gap-8">
        <div class="relative bg-gray-800 p-8 rounded-lg shadow-2xl border border-gray-700" />
        <div class="space-y-4 flex flex-col" />
      </div>
      {/* 中国象棋棋子Div */}
      <div class="w-24 h-24 rounded-full filter backdrop-filter">车</div>
      <div class="absolute top-0 right-0 bottom-0 left-0 overflow-hidden pointer-events-none" />
    </div>
  );
}

export default GameBox;

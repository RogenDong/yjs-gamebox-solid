import { type Accessor, createSignal, For } from "solid-js";
import { v6 } from "uuid";
import type { Player } from "~/components/player/types";
import { UserIcon } from "./icons";

export const USER_COLORS: Array<{ color: string; light: string }> = [
  { color: "#30bced", light: "#30bced33" },
  { color: "#6eeb83", light: "#6eeb8333" },
  { color: "#ffbc42", light: "#ffbc4233" },
  { color: "#ecd444", light: "#ecd44433" },
  { color: "#ee6352", light: "#ee635233" },
  { color: "#9ac2c9", light: "#9ac2c933" },
  { color: "#8acb88", light: "#8acb8833" },
  { color: "#1be7ff", light: "#1be7ff33" },
];

interface PlayersListProps {
  players: Player[];
  currentPlayerId: string;
}

/** 玩家列表组件 */
export function PlayersList(props: PlayersListProps) {
  console.log(props.players);
  return (
    <div class="bg-gray-800/90 p-4 rounded-lg shadow-xl border border-gray-700 w-64">
      <h2 class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500 mb-4 flex items-center gap-2">
        <UserIcon class="w-5 h-5" />
        Players
      </h2>
      <div class="space-y-2">
        <For each={props.players}>
          {(player) => (
            <div class="flex items-center gap-2 text-gray-300">
              <div class="w-3 h-3 rounded-full" style={{ background: player.color }} />
              <span>
                {player.username}
                {player.id === props.currentPlayerId && " (You)"}
              </span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

const [player, setPlayer] = createSignal<Player>(randomPlayer());

/** 获取本地存储的玩家信息 */
export function usePlayer(): Accessor<Player> {
  const local = localStorage.getItem("player");
  if (!local) {
    savePlayer(player());
  } else {
    setPlayer(JSON.parse(local));
  }
  return player;
}

/** 随机生成玩家信息 */
export function randomPlayer(): Player {
  const color = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)].color;
  const username = `Player${Math.floor(Math.random() * 1000)}`;
  return { id: v6(), username, color };
}

/** 保存玩家信息到本地存储 */
export function savePlayer(player: Player) {
  setPlayer(player);
  localStorage.setItem("player", JSON.stringify(player));
}

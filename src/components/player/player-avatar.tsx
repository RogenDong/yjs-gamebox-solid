import type { Player } from "./types";

export function PlayerAvatar(props: { player: Player }) {
  return (
    <div class="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
      {props.player.avatar ? (
        <img src={props.player.avatar} alt={props.player.username} class="w-full h-full object-cover" />
      ) : (
        <span class="text-xs">{props.player.username.charAt(0)}</span>
      )}
    </div>
  );
}

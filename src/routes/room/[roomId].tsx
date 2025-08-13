import { createEventListener } from "@solid-primitives/event-listener";
import { Title } from "@solidjs/meta";
import { A, type RouteSectionProps, useParams } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { createEffect, createSignal, onCleanup, onMount, Show } from "solid-js";
import sorry from "~/assets/sorry.png";
import { Cursor, CursorFollow, CursorProvider } from "~/components/animate-ui/components/cursor";
import { usePlayer } from "~/components/gamebox/mine-box/players";
import { type GameRoom, GameType } from "~/components/room/types";
import { useYjsRoomMembersContext, useYjsRoomsContext } from "~/providers/yjs-provider/yjs-rooms-provider";

const MineBox = clientOnly(() => import("~/components/gamebox/mine-box/mine-box"));
const ChineseChessBox = clientOnly(() => import("~/components/gamebox/chinese-chess-box/chinese-chess-box"));

export default function Home(props: RouteSectionProps) {
  const params = useParams<{ roomId: string }>();
  const { rooms } = useYjsRoomsContext();
  const { members, joinRoom, leaveRoom } = useYjsRoomMembersContext(params.roomId);
  const [room, setRoom] = createSignal<GameRoom>();
  const player = usePlayer();

  createEffect(() => {
    // 当前房间
    const room = rooms().find((room) => room.id === params.roomId);
    setRoom(room);
  });

  onMount(() => {
    // 加入房间
    joinRoom();
  });

  onCleanup(() => {
    // 离开房间
    leaveRoom();
  });

  createEventListener(window, "beforeunload", () => {
    // 离开房间
    leaveRoom();
  });

  return (
    <CursorProvider>
      <main class="min-h-screen p-6">
        <Title>游戏房间</Title>
        <div class="mx-auto">
          <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-bold">游戏中心</h1>
            <A href="/" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
              房间列表
            </A>
          </div>
          <Show when={room()?.game_type === GameType.Mine}>
            <MineBox roomId={params.roomId} difficulty={1} />
          </Show>
          <Show when={room()?.game_type === GameType.ChineseChess}>
            <ChineseChessBox roomId={params.roomId} />
          </Show>
          <Show when={!room()}>
            <div class="flex flex-col items-center justify-center h-full">
              <img src={sorry} alt="房间不存在" class="w-64 h-64 mb-6" />
              <h2 class="text-2xl font-bold mb-2">哎呀，房间不存在</h2>
              <p class="text-gray-600 mb-6">您要找的房间可能已被删除或不存在</p>
              <A href="/" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                返回首页
              </A>
            </div>
          </Show>
        </div>
      </main>
      <Cursor>
        <svg class="size-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
          <path fill="currentColor" d="M1.8 4.4 7 36.2c.3 1.8 2.6 2.3 3.6.8l3.9-5.7c1.7-2.5 4.5-4.1 7.5-4.3l6.9-.5c1.8-.1 2.5-2.4 1.1-3.5L5 2.5c-1.4-1.1-3.5 0-3.3 1.9Z" />
        </svg>
      </Cursor>
      <CursorFollow>
        <div class="bg-blue-500 text-white px-2 py-1 rounded-lg text-sm shadow-lg">{player().username}</div>
      </CursorFollow>
    </CursorProvider>
  );
}

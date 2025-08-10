import { Title } from "@solidjs/meta";
import { A, type RouteSectionProps, useParams } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import type { GameRoom } from "~/components/room/types";
import { useYjsRoomMembersContext, useYjsRoomsContext } from "~/providers/yjs-provider/yjs-rooms-provider";

const MineBox = clientOnly(() => import("~/components/gamebox/mine-box/mine-box"));

export default function Home(props: RouteSectionProps) {
  const params = useParams<{ roomId: string }>();
  const { rooms } = useYjsRoomsContext();
  const { members, joinRoom, leaveRoom } = useYjsRoomMembersContext(params.roomId);
  const [room, setRoom] = createSignal<GameRoom>();

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

  return (
    <main class="min-h-screen bg-gray-900 text-white p-6">
      <Title>游戏房间</Title>
      <div class="mx-auto">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold">游戏中心</h1>
          <A href="/" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
            房间列表
          </A>
        </div>

        <MineBox roomId={params.roomId} difficulty={1} />
      </div>
    </main>
  );
}

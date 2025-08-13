import { Title } from "@solidjs/meta";
import { createSignal, For } from "solid-js";
import { PlayerAvatar } from "~/components/player/player-avatar";
import CreateRoomModal from "~/components/room/CreateRoomModal";
import { useYjsRoomMembersContext, useYjsRoomsContext } from "~/providers/yjs-provider/yjs-rooms-provider";

/** 游戏房间列表 */
export default function RoomList() {
  const { rooms, createRoom } = useYjsRoomsContext();

  const [isModalOpen, setIsModalOpen] = createSignal(false);

  const handleCreateRoom = () => {
    setIsModalOpen(true);
  };

  return (
    <main class="min-h-screen p-6">
      <Title>游戏房间列表</Title>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">游戏房间列表</h1>
        <button
          type="button"
          onClick={handleCreateRoom}
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 transform hover:scale-105"
        >
          创建房间
        </button>
      </div>

      <CreateRoomModal isOpen={isModalOpen()} onClose={() => setIsModalOpen(false)} onCreate={createRoom} />

      <div class="space-y-4">
        <For each={rooms() || []}>
          {(room) => {
            const { members } = useYjsRoomMembersContext(room.id);
            return (
              <a href={`/room/${room.id}`} class="block bg-card rounded-lg p-4 shadow-lg transition-all duration-300 ease-in-out transform hover:shadow-xl hover:bg-gray-750">
                <div class="flex justify-between items-center mb-3">
                  <h2 class="text-xl font-semibold">{room.name}</h2>
                  <span class="text-sm bg-gray-700 px-2 py-1 rounded">{room.game_type}</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div class="text-sm">
                    <span class="text-gray-400">创建人: </span>
                    <span>{room.creator}</span>
                  </div>
                  <div class="text-sm">
                    <span class="text-gray-400">创建时间: </span>
                    <span>{new Date(room.created_at).toLocaleString()}</span>
                  </div>
                  <div class="text-sm">
                    <span class="text-gray-400">房间ID: </span>
                    <span>{room.id}</span>
                  </div>
                </div>

                <div class="flex justify-between items-center">
                  <div class="text-sm text-gray-400">玩家: {members().length}人</div>
                  <div class="flex space-x-2">
                    <For each={members()}>
                      {(player) => {
                        if (!player) {
                          return null;
                        }
                        return <PlayerAvatar player={player} />;
                      }}
                    </For>
                  </div>
                </div>
              </a>
            );
          }}
        </For>
      </div>

      {rooms().length === 0 && <div class="text-center py-6">暂无房间</div>}
    </main>
  );
}

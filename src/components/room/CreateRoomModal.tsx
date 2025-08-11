import { createEffect, createSignal } from "solid-js";
import { Transition } from "solid-transition-group";
import "./CreateRoomModal.css";
import { type GameRoom, GameType } from "./types";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (room: Pick<GameRoom, "name" | "game_type" | "password">) => void;
}

export default function CreateRoomModal(props: CreateRoomModalProps) {
  const [roomName, setRoomName] = createSignal("");
  const [gameType, setGameType] = createSignal<GameType>(GameType.Mine);
  const [password, setPassword] = createSignal("");

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (roomName()) {
      props.onCreate({
        name: roomName(),
        game_type: gameType(),
        password: password(),
      });
      // 重置表单
      setRoomName("");
      setGameType(GameType.Mine);
      setPassword("");
      props.onClose();
    }
  };

  // 当模态框关闭时重置表单
  createEffect(() => {
    if (!props.isOpen) {
      setRoomName("");
      setGameType(GameType.Mine);
      setPassword("");
    }
  });

  return (
    <Transition name="modal">
      {props.isOpen && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md transform transition-all duration-300 ease-out scale-95 opacity-0 modal-enter-active">
            <h2 class="text-2xl font-bold mb-4 text-white">创建游戏房间</h2>
            <form onSubmit={handleSubmit} autocomplete="off">
              <div class="mb-4">
                <label class="block text-gray-300 mb-2" for="roomName">
                  房间名称
                </label>
                <input
                  name="roomname"
                  class="w-full px-3 py-2 bg-gray-700 text-white rounded"
                  type="text"
                  value={roomName()}
                  onInput={(e) => setRoomName(e.currentTarget.value)}
                  required
                  autocomplete="off"
                  data-lpignore="true"
                  data-form-type="other"
                />
              </div>

              <div class="mb-4">
                <label class="block text-gray-300 mb-2" for="gameType">
                  游戏类型
                </label>
                <select
                  id="gameType"
                  class="w-full px-3 py-2 bg-gray-700 text-white rounded"
                  value={gameType()}
                  onChange={(e) => setGameType(e.currentTarget.value as GameType)}
                  autocomplete="off"
                  data-lpignore="true"
                  data-form-type="other"
                >
                  <option value={GameType.Mine}>{GameType.Mine}</option>
                  <option value={GameType.ChineseChess}>{GameType.ChineseChess}</option>
                  {/* <option value={GameType.Go}>围棋</option>
                  <option value={GameType.Gobang}>五子棋</option>
                  <option value={GameType.DouDizhu}>斗地主</option> */}
                </select>
              </div>

              <div class="mb-6">
                <label class="block text-gray-300 mb-2" for="room_password">
                  房间密码 (可选)
                </label>
                <input
                  name="room_password"
                  class="w-full px-3 py-2 bg-gray-700 text-white rounded"
                  type="password"
                  autocomplete="new-password"
                  value={password()}
                  onInput={(e) => setPassword(e.currentTarget.value)}
                  data-lpignore="true"
                  data-form-type="other"
                />
              </div>

              <div class="flex justify-end space-x-3">
                <button type="button" onClick={props.onClose} class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-300 transform hover:scale-105">
                  取消
                </button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300 transform hover:scale-105">
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Transition>
  );
}

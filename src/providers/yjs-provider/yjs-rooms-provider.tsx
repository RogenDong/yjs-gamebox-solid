import { ReactiveMap } from "@solid-primitives/map";
import { type Accessor, createContext, createEffect, createSignal, type JSX, useContext } from "solid-js";
import { v7 } from "uuid";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import { usePlayer } from "~/components/gamebox/mine-box/players";
import type { Player } from "~/components/player/types";
import type { GameRoom } from "~/components/room/types";

export type YjsRoomsContextType = {
  /** 房间列表 - Yjs文档对象 */
  doc: Y.Doc;
  websocketProvider: WebsocketProvider;
  yRooms: Y.Map<GameRoom>;
  /** 房间成员 - Yjs文档对象 */
  yRoomMembers: Y.Map<Array<Player | undefined>>;
  /** 房间列表 - 响应式数据 */
  rooms: Accessor<GameRoom[]>;
  /** 房间成员 - 响应式数据 */
  roomMembers: ReactiveMap<string, Array<Player | undefined>>;

  /** 创建房间 */
  createRoom: (newRoom: Pick<GameRoom, "name" | "game_type" | "password">) => Promise<void>;
};

export type YjsRoomMembersContextType = {
  members: Accessor<Array<Player | undefined>>;

  /** 加入房间 */
  joinRoom: () => void;
  /** 离开房间 */
  leaveRoom: () => void;
  /** 占座, 当位置空闲时, 玩家占据该位置 */
  seat: (index: number) => void;
};

export const YjsRoomsContext = createContext<YjsRoomsContextType>();

export function YjsRoomsProvider(props: { children: JSX.Element }) {
  const player = usePlayer();
  const doc = new Y.Doc();
  /** 初始化Yjs */
  const websocketProvider = new WebsocketProvider(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`, `rooms`, doc);
  const yRooms = doc.getMap<GameRoom>("rooms");

  /** 房间成员 - Yjs文档对象 */
  const yRoomMembers = doc.getMap<Array<Player | undefined>>("roomMembers");

  /** 房间列表 - 响应式数据 */
  const [rooms, setRooms] = createSignal<GameRoom[]>([]);
  /** 房间成员 - 响应式数据 */
  const roomMembers = new ReactiveMap<string, Array<Player | undefined>>();

  /** 同步房间列表变化 */
  yRooms.observe(() => {
    setRooms(Array.from(yRooms.values()));
  });

  /* 同步房间成员变化 */
  yRoomMembers.observe((event) => {
    event.changes.keys.forEach((change, key) => {
      console.log("???", change, yRoomMembers.get(key));
      if (change.action === "add") {
        roomMembers.set(key, [...(yRoomMembers.get(key) || [])]);
      } else if (change.action === "update") {
        roomMembers.set(key, [...(yRoomMembers.get(key) || [])]);
      } else if (change.action === "delete") {
        roomMembers.delete(key);
      }
    });
  });

  /** 创建房间 */
  const createRoom = async (newRoom: Pick<GameRoom, "name" | "game_type" | "password">) => {
    const room_id = v7().slice(24, 36);
    yRooms.set(room_id, {
      ...newRoom,
      id: room_id,
      created_at: Date.now(),
      creator: player().username,
    });
    yRoomMembers.set(room_id, []);
  };
  return <YjsRoomsContext.Provider value={{ doc, websocketProvider, yRooms, yRoomMembers, rooms, roomMembers, createRoom }}>{props.children}</YjsRoomsContext.Provider>;
}

export function useYjsRoomsContext() {
  const context = useContext(YjsRoomsContext);
  if (!context) {
    throw new Error("useYjsRooms must be used within a YjsRoomsProvider");
  }
  return context;
}

/** 房间成员上下文 */
export function useYjsRoomMembersContext(roomId: string): YjsRoomMembersContextType {
  const { yRoomMembers, roomMembers } = useYjsRoomsContext();
  const player = usePlayer();
  const [members, setMembers] = createSignal<Array<Player | undefined>>([]);

  createEffect(() => {
    setMembers(roomMembers.get(roomId) || []);
  });

  function joinRoom() {
    const index = members().findIndex((member) => member?.id === player().id);
    if (index === -1) {
      yRoomMembers.set(roomId, [...members(), player()]);
    }
  }

  function leaveRoom() {
    yRoomMembers.set(roomId, yRoomMembers.get(roomId)?.filter((member) => member?.id !== player().id) || []);
  }

  function seat(index: number) {}

  return {
    members,
    joinRoom,
    leaveRoom,
    seat,
  };
}

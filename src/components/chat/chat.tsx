import { createSignal, For } from "solid-js";
import { v6 } from "uuid";
import type { Doc } from "yjs";
import { usePlayer } from "../gamebox/mine-box/players";
import { ChatInput } from "./chat-input";
import { ChatMessage } from "./chat-message";
import type { Message } from "./interface";

export interface ChatProps {
  doc: Doc;
  messageKey: string;
}

export function Chat(props: ChatProps) {
  // const [messages, setMessages] = useState<Message[]>(initialMessages);
  const yMessage = props.doc.getMap<Message>(props.messageKey);
  const [messages, setMessage] = createSignal(Array.from(yMessage.values()));

  yMessage.observe((event) => setMessage(Array.from(yMessage.values()).sort((a, b) => a.id.localeCompare(b.id))));

  const handleSendMessage = (newMessage: Omit<Message, "id" | "timestamp" | "sender">) => {
    console.log(newMessage);
    //   const message: Message = {
    //     ...newMessage,
    //     id: (messages.length + 1).toString(),
    //     timestamp: new Date(),
    //   };
    //   setMessages((prev) => [...prev, message]);
    const message: Message = {
      ...newMessage,
      id: v6(),
      timestamp: new Date().toJSON(),
      sender: usePlayer()(),
    };
    yMessage.set(message.id, message);
  };

  return (
    <div class="flex-1 bg-gray-800/90 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
      <div class="flex flex-col h-full bg-gray-900">
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <For each={messages()}>{(message) => <ChatMessage message={message} />}</For>
        </div>
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}

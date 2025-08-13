import { SendIcon } from "lucide-solid";
import { createSignal, For } from "solid-js";
import { v7 } from "uuid";
import type { Doc } from "yjs";
import { cn } from "~/libs/cn";
import { ChatMarkdown, ChatMessage, ChatMessageContent, ChatMessageList, ChatRoot } from "../chat-primitive";
import { usePlayer } from "../gamebox/mine-box/players";
import { ScrollToBottom, StickToBottom } from "../stick-to-bottom";
import type { MessageData } from "./types";
export interface ChatProps {
  class?: string;
  doc: Doc;
  messageKey: string;
}

export function Chat(props: ChatProps) {
  const yMessage = props.doc.getMap<MessageData>(props.messageKey);
  const player = usePlayer();
  const [text, setText] = createSignal("");
  const [messages, setMessage] = createSignal(Array.from(yMessage.values()).sort(sortMessages));

  yMessage.observe(() => setMessage(Array.from(yMessage.values()).sort(sortMessages)));

  function sortMessages(a: MessageData, b: MessageData) {
    return a.id.localeCompare(b.id);
  }

  function isRight(message: MessageData) {
    return message.sender.id === player().id;
  }

  const handleSendMessage = () => {
    const message: MessageData = {
      id: v7(),
      timestamp: Date.now(),
      sender: usePlayer()(),
      content: text(),
    };
    yMessage.set(message.id, message);
    setText("");
  };
  return (
    <ChatRoot class={cn(props.class, "flex flex-col bg-card p-2.5 w-64 rounded-lg")}>
      <StickToBottom class="flex-1 relative">
        <StickToBottom.Content>
          <ChatMessageList>
            <For each={messages()}>
              {(message, index) => {
                return (
                  <ChatMessage
                    class={cn("flex mb-4 duration-300 animate-in fade-in-0 zoom-in-75 origin-bottom-right", {
                      "justify-end": isRight(message),
                    })}
                  >
                    <ChatMessageContent
                      class={cn("flex prose prose-sm max-w-[80%] rounded-lg px-4 py-2", {
                        "bg-primary text-primary-foreground": isRight(message),
                        "bg-muted": !isRight(message),
                      })}
                    >
                      <ChatMarkdown>{message.content}</ChatMarkdown>
                    </ChatMessageContent>
                  </ChatMessage>
                );
              }}
            </For>
          </ChatMessageList>
        </StickToBottom.Content>
        <ScrollToBottom />
      </StickToBottom>
      <div class="flex w-full justify-center items-center h-10 rounded-3xl p-1 border border-input bg-transparent text-base shadow-sm disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
        <input
          class="flex flex-1 rounded-md border-0 bg-transparent px-2 py-0 text-base resize-none ring-0 placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          value={text()}
          onInput={(e) => setText(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-[color,box-shadow] focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 w-8 rounded-full"
          onClick={handleSendMessage}
        >
          <SendIcon class="shrink-0 w-6 h-6" />
        </button>
      </div>
      {/* <ChatInput onSendMessage={handleSendMessage} /> */}
      {/* <ChatPrimitive.Input /> */}
    </ChatRoot>
  );
}

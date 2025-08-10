import { Image as ImageIcon, Link, Music, Paperclip, Send, Smile, Video } from "lucide-solid";
import { createSignal } from "solid-js";
// import type { Message, MessageType } from "../../types/chat";
import { type Message, MessageTypeEnum } from "./interface";

interface ChatInputProps {
  onSendMessage: (message: Omit<Message, "id" | "timestamp" | "sender">) => void;
}

export function ChatInput(props: ChatInputProps) {
  const [text, setText] = createSignal("");
  const [fileInputRef, setFileInputRef] = createSignal<HTMLInputElement>();

  const handleSend = () => {
    if (!text().trim()) return;

    props.onSendMessage({
      type: MessageTypeEnum.Text,
      content: text(),
    });
    setText("");
  };

  const handleFileUpload = (type: MessageTypeEnum) => {
    const fileInput = fileInputRef();
    if (fileInput) {
      fileInput.accept = getAcceptTypes(type);
      fileInput.click();
    }
  };

  // const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //
  //   // Mock file upload - in real app would upload to server
  //   const fileType = getMessageType(file.type);
  //   const fileUrl = URL.createObjectURL(file);
  //
  //   onSendMessage({
  //     type: fileType,
  //     content: fileUrl,
  //     sender: mockCurrentUser,
  //     metadata: {
  //       fileName: file.name,
  //       fileSize: file.size,
  //       fileType: file.type,
  //     },
  //   });
  // };

  return (
    <div class="p-4 border-t border-gray-700 bg-gray-800">
      <div class="flex items-center gap-2">
        <input
          type="text"
          value={text()}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          class="flex-1 bg-gray-700 text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button type="button" class="p-2 hover:bg-gray-700 rounded-lg transition-colors">
          <ImageIcon class="w-5 h-5 text-gray-400" />
        </button>

        <button type="button" class="p-2 hover:bg-gray-700 rounded-lg transition-colors">
          <Smile class="w-5 h-5 text-gray-400" />
        </button>

        <button type="button" class="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">
          <Send class="w-5 h-5 text-white" />
        </button>
      </div>

      <input type="file" ref={fileInputRef} class="hidden" />
    </div>
  );
}

// Utility functions
const getAcceptTypes = (type: MessageTypeEnum): string => {
  switch (type) {
    case "image":
      return "image/*";
    case "music":
      return "audio/*";
    case "video":
      return "video/*";
    case "file":
      return "*/*";
    default:
      return "";
  }
};

const getMessageType = (mimeType: string): MessageTypeEnum => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("audio/")) return "music";
  if (mimeType.startsWith("video/")) return "video";
  return "file";
};

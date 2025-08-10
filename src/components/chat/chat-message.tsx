// import React from 'react';
import { FileText, Image as ImageIcon, Link2, Music, Video } from "lucide-solid";
import type { Message } from "./interface";
import avUrl from "./微信图片_20241020161226.jpg";
interface ChatMessageProps {
  message: Message;
}

export function ChatMessage(props: ChatMessageProps) {
  const renderContent = () => {
    const message = props.message;
    switch (message.type) {
      case "text":
        return <p class="text-gray-200">{message.content}</p>;
      // case 'image':
      //   return (
      //     <div class="relative max-w-sm">
      //       <img
      //         src={message.content}
      //         alt="Shared image"
      //         class="rounded-lg max-h-64 object-cover"
      //       />
      //     </div>
      //   );
      // case 'file':
      //   return (
      //     <div class="flex items-center gap-3 bg-gray-700/50 p-3 rounded-lg">
      //       <FileText class="w-6 h-6 text-blue-400" />
      //       <div>
      //         <p class="text-sm text-gray-200">{message.metadata?.fileName}</p>
      //         <p class="text-xs text-gray-400">{message.metadata?.fileSize} bytes</p>
      //       </div>
      //     </div>
      //   );
      // case 'emoji':
      //   return <span class="text-4xl">{message.content}</span>;
      // case 'music':
      //   return (
      //     <div class="flex items-center gap-3 bg-gray-700/50 p-3 rounded-lg">
      //       <Music class="w-6 h-6 text-green-400" />
      //       <div>
      //         <p class="text-sm text-gray-200">{message.content}</p>
      //         <p class="text-xs text-gray-400">{message.metadata?.duration}s</p>
      //       </div>
      //     </div>
      //   );
      // case 'video':
      //   return (
      //     <div class="relative max-w-sm">
      //       <div class="aspect-video bg-gray-800 rounded-lg overflow-hidden">
      //         <video
      //           src={message.content}
      //           poster={message.metadata?.thumbnailUrl}
      //           controls
      //           class="w-full h-full object-cover"
      //         />
      //       </div>
      //     </div>
      //   );
      // case 'link':
      //   return (
      //     <div class="flex gap-3 bg-gray-700/50 p-3 rounded-lg max-w-sm">
      //       {message.metadata?.linkImage && (
      //         <img
      //           src={message.metadata.linkImage}
      //           alt=""
      //           class="w-16 h-16 object-cover rounded"
      //         />
      //       )}
      //       <div>
      //         <p class="text-sm font-medium text-blue-400 flex items-center gap-2">
      //           <Link2 class="w-4 h-4" />
      //           {message.metadata?.linkTitle}
      //         </p>
      //         <p class="text-xs text-gray-400">{message.metadata?.linkDescription}</p>
      //         <a
      //           href={message.content}
      //           target="_blank"
      //           rel="noopener noreferrer"
      //           class="text-xs text-gray-500 hover:text-gray-400"
      //         >
      //           {message.content}
      //         </a>
      //       </div>
      //     </div>
      //   );
    }
  };

  function formatTime(time: string) {
    const date = new Date(time);
    return date.toLocaleTimeString();
  }

  return (
    <div class="flex gap-3 p-4 hover:bg-gray-800/50 transition-colors">
      <img src={avUrl} alt={props.message.sender.username} class="w-10 h-10 rounded-full" />
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="font-medium text-gray-200">{props.message.sender.username}</span>
          <span class="text-xs text-gray-500">{formatTime(props.message.timestamp)}</span>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}

// 人性的光辉

import type { JSX } from "solid-js";

export interface ChatMessageListProps {
  class?: string;
  children: JSX.Element;
}

export function ChatMessageList(props: ChatMessageListProps) {
  return <div class={props.class}>{props.children}</div>;
}

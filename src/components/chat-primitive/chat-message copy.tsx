import type { JSX } from "solid-js";

export interface ChatMessageProps {
  class?: string;
  children?: JSX.Element;
}

export function ChatMessage(props: ChatMessageProps) {
  return <div class={props.class}>{props.children}</div>;
}

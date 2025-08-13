import type { JSX } from "solid-js";

export interface ChatRootProps {
  class?: string;
  children?: JSX.Element;
}

export function ChatRoot(props: ChatRootProps) {
  return <div class={props.class}>{props.children}</div>;
}

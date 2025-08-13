import { SolidMarkdown, type SolidMarkdownOptions } from "solid-markdown";

export interface ChatMarkdownProps extends Partial<SolidMarkdownOptions> {}

export function ChatMarkdown(props: ChatMarkdownProps) {
  return <SolidMarkdown {...props} />;
}

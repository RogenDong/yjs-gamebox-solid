import { ArrowDown } from "lucide-solid";
import { Show } from "solid-js";
import { useStickToBottomContext } from "./stick-to-bottom-context";

interface ScrollToBottomProps {
  class?: string;
}

/**
 * 显示一个"滚动到底部"按钮，当用户不在聊天底部时出现
 */
export function ScrollToBottom(props: ScrollToBottomProps) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  return (
    <Show when={!isAtBottom()}>
      <button
        class={`absolute bottom-6 right-4 p-2 rounded-full bg-primary text-primary-foreground shadow-md transition-opacity cursor-pointer ${props.class || ""}`}
        onClick={() => scrollToBottom()}
        title="滚动到底部"
        type="button"
        attr:scroll-to-bottom={""}
      >
        <ArrowDown class="w-5 h-5" />
      </button>
    </Show>
  );
}

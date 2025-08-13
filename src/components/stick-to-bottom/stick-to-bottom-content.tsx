import type { JSX } from "solid-js";
import { useStickToBottomContext } from "./stick-to-bottom-context";

export interface StickToBottomContentProps {
  class?: string;
  style?: JSX.CSSProperties;
  children?: JSX.Element;
}

export function StickToBottomContent(props: StickToBottomContentProps) {
  const context = useStickToBottomContext();
  return (
    <div class="h-full w-full overflow-y-auto scroll-smooth scrollbar-hide" ref={context.setScrollRef} attr:stick-to-bottom-scroll-content={""}>
      <div class={props.class} style={props.style} ref={context.setContentRef} attr:stick-to-bottom-content={""}>
        {props.children}
      </div>
    </div>
  );
}

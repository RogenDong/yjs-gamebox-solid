import type { JSX } from "solid-js";
import { StickToBottomContext } from "./stick-to-bottom-context";
import { useStickToBottom } from "./use-stick-to-bottom";

export interface StickToBottomRootProps extends JSX.CustomAttributes<HTMLDivElement> {
  children?: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
  instance?: StickToBottomContext;
}

/**
 * 使用该组件内容区将像粘在底部一样。内容高度增长时，滚动条会自动滚动到底部。
 */
export function StickToBottomRoot(props: StickToBottomRootProps) {
  const instance = useStickToBottom();
  return (
    <StickToBottomContext.Provider value={props.instance || instance}>
      <div ref={props.ref} class={props.class} style={props.style} classList={props.classList} attr:stick-to-bottom={""}>
        {props.children}
      </div>
    </StickToBottomContext.Provider>
  );
}

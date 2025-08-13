import { StickToBottomRoot } from "./stick-to-bottom";
import { StickToBottomContent as Content } from "./stick-to-bottom-content";

export const StickToBottom = Object.assign(StickToBottomRoot, {
  Content,
});

export * from "./scroll-to-bottom";
export * from "./stick-to-bottom";
export * from "./stick-to-bottom-content";
export * from "./stick-to-bottom-context";
export * from "./use-stick-to-bottom";

import { type Accessor, type Setter, createContext, useContext } from "solid-js";

export interface StickToBottomContext {
  isAtBottom: Accessor<boolean>;
  scrollToBottom: (scrollOptions?: { behavior?: "auto" | "smooth"; preserveScrollPosition?: boolean }) => Promise<boolean>;
  scrollRef: Accessor<HTMLElement | undefined>;
  contentRef: Accessor<HTMLElement | undefined>;
  setScrollRef: Setter<HTMLElement | undefined>;
  setContentRef: Setter<HTMLElement | undefined>;
}

export const StickToBottomContext = createContext<StickToBottomContext>();

export function useStickToBottomContext() {
  const context = useContext(StickToBottomContext);
  if (!context) {
    throw new Error("useStickToBottomContext must be used within the context");
  }
  return context;
}

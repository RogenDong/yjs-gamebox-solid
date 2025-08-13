import { createEventListener } from "@solid-primitives/event-listener";
import { createResizeObserver } from "@solid-primitives/resize-observer";
import { createEffect, createSignal, onMount } from "solid-js";
import type { StickToBottomContext } from "./stick-to-bottom-context";

/**
 *
 */
export function useStickToBottom(): StickToBottomContext {
  // 是否从底部锁定状态跳脱
  const [escapedFromLock, setEscapedFromLock] = createSignal(false);
  // 是否在底部
  const [isAtBottom, setIsAtBottom] = createSignal(true);
  // 是否在底部附近
  const [isNearBy, _setIsNearBy] = createSignal(false);
  // 大小变化偏差值
  const [resizeDifference, setResizeDifference] = createSignal(0);
  // 滚动元素
  const [scrollRef, setScrollRef] = createSignal<HTMLElement>();
  // 内容元素
  const [contentRef, setContentRef] = createSignal<HTMLElement>();

  createEventListener(scrollRef, "scroll", handleScroll, { passive: true });
  createEventListener(scrollRef, "wheel", handleWheel, { passive: true });

  let previousHeight: number | undefined;
  createResizeObserver(contentRef, (_rect, _element, entry) => {
    const { height } = entry.contentRect;
    const difference = height - (previousHeight ?? height);
    setResizeDifference(difference);
    console.log("resize", difference);
    previousHeight = height;
    if (!escapedFromLock()) {
      scrollToBottom();
    }
    /**
     * Reset the resize difference after the scroll event
     * has fired. Requires a rAF to wait for the scroll event,
     * and a setTimeout to wait for the other timeout we have in
     * resizeObserver in case the scroll event happens after the
     * resize event.
     */
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (resizeDifference() === difference) {
          setResizeDifference(0);
        }
      }, 1);
    });
  });

  onMount(() => {
    const _el = scrollRef();
    const _content = contentRef();
    scrollToBottom();
  });

  createEffect(() => {
    if (!scrollRef()) {
      return;
    }
  });

  function _getScrollTop() {
    return scrollRef()?.scrollTop ?? 0;
  }

  function setScrollToTop(num: number) {
    const el = scrollRef();
    if (el) {
      el.scrollTop = num;
    }
  }

  function _stopScroll() {
    setEscapedFromLock(true);
    setIsAtBottom(false);
  }

  /**
   * 处理滚动事件
   */
  let lastScrollTop = 0;
  function handleScroll(event: Event) {
    const el = scrollRef();
    if (!el) {
      return;
    }
    if (event.target !== el) {
      return;
    }
    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight;

    const isScrollingDown = scrollTop > lastScrollTop;
    const isScrollingUp = scrollTop < lastScrollTop;
    const isNearBottom = scrollTop + el.clientHeight > scrollHeight - 70;
    // console.log("isNearBottom", isNearBottom);
    // if (isScrollingDown) {
    //   console.log("isScrollingDown");
    // } else if (isScrollingUp) {
    //   console.log("isScrollingUp");
    // } else {
    //   console.log("isScrollingUnknown");
    // }

    /**
     * 滚动事件可能出现在 ResizeObserver 事件之前，
     * 因此，为了正确忽略 resize 事件，我们使用timeout
     *
     * @see https://github.com/WICG/resize-observer/issues/25#issuecomment-248757228
     */
    setTimeout(() => {
      /**
       * 当存在 resize 差异时，请忽略 resize 事件.
       */
      if (resizeDifference()) {
        return;
      }

      if (isScrollingUp) {
        setEscapedFromLock(true);
        setIsAtBottom(false);
      }
      if (isScrollingDown) {
        setEscapedFromLock(false);
      }
      if (!escapedFromLock() && isNearBottom) {
        setIsAtBottom(true);
      }
    });
    lastScrollTop = scrollTop;
  }

  function handleWheel(_event: WheelEvent) {
    // console.log("wheel", event);
  }

  async function scrollToBottom(scrollOptions: { behavior?: "auto" | "smooth"; preserveScrollPosition?: boolean } = {}) {
    // console.count("scrollToBottom");
    const el = scrollRef();
    if (!el) {
      return false;
    }
    if (!scrollOptions.preserveScrollPosition) {
      setIsAtBottom(true);
    }
    setScrollToTop(el.scrollHeight - el.clientHeight);
    return true;
  }

  function _print() {
    console.log({ escapedFromLock: escapedFromLock(), isAtBottom: isAtBottom(), isNearBy: isNearBy() });
  }

  return {
    isAtBottom,
    scrollRef,
    contentRef,
    setScrollRef,
    setContentRef,
    scrollToBottom,
  };
}

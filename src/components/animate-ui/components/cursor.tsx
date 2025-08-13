import { animate, motionValue } from "motion";
import { type Accessor, createContext, createEffect, createSignal, type JSX, onCleanup, type Setter, Show, useContext } from "solid-js";
import { Motion, Presence } from "solid-motionone";

import { cn } from "~/libs/cn";

type CursorContextType = {
  cursorPos: Accessor<{ x: number; y: number }>;
  isActive: Accessor<boolean>;
  containerRef: Accessor<HTMLDivElement | null>;
  setCursorRef: Setter<HTMLDivElement | null>;
  cursorRef: Accessor<HTMLDivElement | null>;
};

const CursorContext = createContext<CursorContextType | undefined>(undefined);

const useCursor = (): CursorContextType => {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error("useCursor must be used within a CursorProvider");
  }
  return context;
};

type CursorProviderProps = JSX.HTMLAttributes<HTMLDivElement> & {
  children: JSX.Element;
};

function CursorProvider(props: CursorProviderProps) {
  const [cursorPos, setCursorPos] = createSignal({ x: 0, y: 0 });
  const [isActive, setIsActive] = createSignal(false);
  let containerRef: HTMLDivElement | undefined;
  const [cursorRef, setCursorRef] = createSignal<HTMLDivElement | null>(null);

  createEffect(() => {
    if (!containerRef) return;

    const parent = containerRef.parentElement;
    if (!parent) return;

    if (getComputedStyle(parent).position === "static") {
      parent.style.position = "relative";
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setIsActive(true);
    };
    const handleMouseLeave = () => setIsActive(false);

    parent.addEventListener("mousemove", handleMouseMove);
    parent.addEventListener("mouseleave", handleMouseLeave);

    onCleanup(() => {
      parent.removeEventListener("mousemove", handleMouseMove);
      parent.removeEventListener("mouseleave", handleMouseLeave);
    });
  });

  const contextValue = () => ({
    cursorPos: cursorPos,
    isActive: isActive,
    containerRef: () => containerRef || null,
    cursorRef,
    setCursorRef,
  });

  return (
    <CursorContext.Provider value={contextValue()}>
      <div ref={containerRef} data-slot="cursor-provider" {...props}>
        {props.children}
      </div>
    </CursorContext.Provider>
  );
}

type CursorProps = JSX.HTMLAttributes<HTMLDivElement> & {
  children: JSX.Element;
};

function Cursor(props: CursorProps) {
  const { cursorPos, isActive, containerRef, cursorRef, setCursorRef } = useCursor();

  createEffect(() => {
    const parentElement = containerRef()?.parentElement;

    if (parentElement && isActive()) parentElement.style.cursor = "none";

    onCleanup(() => {
      if (parentElement) parentElement.style.cursor = "default";
    });
  });

  createEffect(() => {
    const cursorElement = cursorRef();
    if (cursorElement) {
      cursorElement.style.top = `${cursorPos().y}px`;
      cursorElement.style.left = `${cursorPos().x}px`;
    }
  });

  return (
    <Presence>
      <Show when={isActive()}>
        <Motion
          ref={setCursorRef}
          data-slot="cursor"
          class={cn("transform-[translate(-50%,-50%)] pointer-events-none z-[9999] absolute", props.class)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          {...props}
        >
          {props.children}
        </Motion>
      </Show>
    </Presence>
  );
}

type Align = "top" | "top-left" | "top-right" | "bottom" | "bottom-left" | "bottom-right" | "left" | "right" | "center";

type CursorFollowProps = JSX.HTMLAttributes<HTMLDivElement> & {
  sideOffset?: number;
  align?: Align;
  children: JSX.Element;
};

function CursorFollow(props: CursorFollowProps) {
  const { sideOffset = 15, align = "bottom-right", children, class: className, style, ...otherProps } = props;

  const { cursorPos, isActive, cursorRef } = useCursor();
  let cursorFollowRef: HTMLDivElement | undefined;

  const calculateOffset = () => {
    const rect = cursorFollowRef?.getBoundingClientRect();
    const width = rect?.width ?? 0;
    const height = rect?.height ?? 0;

    let newOffset: {
      x: number;
      y: number;
    };

    switch (align) {
      case "center":
        newOffset = { x: width / 2, y: height / 2 };
        break;
      case "top":
        newOffset = { x: width / 2, y: height + sideOffset };
        break;
      case "top-left":
        newOffset = { x: width + sideOffset, y: height + sideOffset };
        break;
      case "top-right":
        newOffset = { x: -sideOffset, y: height + sideOffset };
        break;
      case "bottom":
        newOffset = { x: width / 2, y: -sideOffset };
        break;
      case "bottom-left":
        newOffset = { x: width + sideOffset, y: -sideOffset };
        break;
      case "bottom-right":
        newOffset = { x: -sideOffset, y: -sideOffset };
        break;
      case "left":
        newOffset = { x: width + sideOffset, y: height / 2 };
        break;
      case "right":
        newOffset = { x: -sideOffset, y: height / 2 };
        break;
      default:
        newOffset = { x: 0, y: 0 };
    }

    return newOffset;
  };

  const x = motionValue(0);
  const y = motionValue(0);

  x.on("change", (latest) => {
    if (cursorFollowRef) {
      cursorFollowRef.style.left = `${latest}px`;
    }
  });

  y.on("change", (latest) => {
    if (cursorFollowRef) {
      cursorFollowRef.style.top = `${latest}px`;
    }
  });

  createEffect(() => {
    const offset = calculateOffset();
    const cursorRect = cursorRef()?.getBoundingClientRect();
    const cursorWidth = cursorRect?.width ?? 20;
    const cursorHeight = cursorRect?.height ?? 20;

    animate(x, cursorPos().x - offset.x + cursorWidth / 2, { type: "spring", stiffness: 500, damping: 50, bounce: 0 });
    animate(y, cursorPos().y - offset.y + cursorHeight / 2, { type: "spring", stiffness: 500, damping: 50, bounce: 0 });
  });

  return (
    <Presence>
      <Show when={true}>
        <Motion
          ref={cursorFollowRef}
          data-slot="cursor-follow"
          class={cn("transform-[translate(-50%,-50%)] pointer-events-none z-[9998] absolute", className)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          {...otherProps}
        >
          {children}
        </Motion>
      </Show>
    </Presence>
  );
}

export { Cursor, CursorFollow, CursorProvider, useCursor, type CursorContextType, type CursorFollowProps, type CursorProps, type CursorProviderProps };

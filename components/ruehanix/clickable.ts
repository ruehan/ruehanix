import type { KeyboardEvent, SyntheticEvent } from "react";
import { isActivateKey } from "@/lib/ruehanix/a11y";

type Handler = (e?: SyntheticEvent) => void;

/** div 등 비표준 요소를 키보드 접근 가능한 버튼으로 만드는 props.
 *  role/tabIndex/aria-label + Enter·Space 활성화. */
export function clickable(onClick: Handler, label?: string) {
  return {
    role: "button" as const,
    tabIndex: 0,
    ...(label ? { "aria-label": label } : {}),
    onClick,
    onKeyDown: (e: KeyboardEvent) => {
      if (isActivateKey(e.key)) {
        e.preventDefault();
        onClick(e);
      }
    },
  };
}

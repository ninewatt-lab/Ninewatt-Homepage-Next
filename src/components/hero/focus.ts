/**
 * 설비 확대 보기 상태 — 칩 버튼 · 3D 설비 클릭으로 열고, 닫기 · Esc · 빈 곳 클릭으로 닫는다.
 * progress 는 카메라 전환 정도(0 개요 → 1 확대)로, Rig 가 매 프레임 갱신하고 칩 · 패널이 읽는다.
 */

import type { ThreeEvent } from "@react-three/fiber";
import { createContext, useContext, type RefObject } from "react";
import type { Focus } from "./DetailPanel";

export type FocusState = {
  focus: Focus | null;
  setFocus: (f: Focus | null) => void;
  progress: RefObject<number>;
};

export const FocusContext = createContext<FocusState | null>(null);
export const useFocus = () => useContext(FocusContext)!;

/** 패널 · 칩 · 링크 위에서 난 포인터 이벤트는 3D 로 넘기지 않는다 (3D 이벤트는 섹션 전체에서 받기 때문) */
export function fromUi(e: { nativeEvent: Event } | Event) {
  const target = ("nativeEvent" in e ? e.nativeEvent.target : e.target) as Element | null;
  return !!target?.closest?.("a, button, [data-hero-ui]");
}

function setCursor(value: string) {
  document.body.style.cursor = value;
}

/** 3D 설비를 눌러 확대 보기를 연다 */
export function useFocusTarget(key: Focus) {
  const { setFocus } = useFocus();
  return {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      if (fromUi(e)) return;
      e.stopPropagation();
      setFocus(key);
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      if (fromUi(e)) return;
      e.stopPropagation();
      setCursor("pointer");
    },
    onPointerOut: () => setCursor(""),
  };
}

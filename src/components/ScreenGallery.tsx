"use client";

import { useRef, useState } from "react";
import Image, { getImageProps } from "next/image";

export interface Screen {
  src: string;
  width: number;
  height: number;
}

/** 제품 화면 스크린샷. 2장 이상이면 썸네일로 전환한다. 첫 화면에 보이면 preload 를 켠다. */
export function ScreenGallery({
  screens,
  alt,
  sizes = "(max-width: 1024px) 100vw, 1024px",
  preload = false,
}: {
  screens: Screen[];
  alt: string;
  sizes?: string;
  preload?: boolean;
}) {
  const [active, setActive] = useState(0);
  const warmed = useRef(false);
  const current = screens[active];

  // 보고 있는 화면이 다 뜨면 나머지 화면도 같은 srcset 으로 미리 받아 둔다 —
  // 썸네일을 누른 뒤에야 받기 시작해 빈 칸이 보이던 것을 없앤다
  const warmOthers = () => {
    if (warmed.current) return;
    warmed.current = true;
    for (const s of screens) {
      if (s.src === current.src) continue;
      const { props } = getImageProps({ src: s.src, width: s.width, height: s.height, sizes, alt: "" });
      const img = new window.Image();
      img.sizes = props.sizes ?? "";
      img.srcset = props.srcSet ?? "";
      img.src = props.src;
    }
  };

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <Image
          key={current.src}
          src={current.src}
          alt={`${alt} ${active + 1}`}
          width={current.width}
          height={current.height}
          sizes={sizes}
          preload={preload && active === 0}
          onLoad={screens.length > 1 ? warmOthers : undefined}
          className="h-auto w-full"
        />
      </div>
      {screens.length > 1 && (
        <div className="mt-3 flex gap-2">
          {screens.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${alt} ${i + 1}`}
              aria-pressed={i === active}
              className={`relative h-14 w-24 overflow-hidden rounded border-2 transition-all ${
                i === active
                  ? "border-primary ring-1 ring-primary/30"
                  : "border-border/50 opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={s.src} alt="" fill sizes="96px" className="object-cover object-top" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

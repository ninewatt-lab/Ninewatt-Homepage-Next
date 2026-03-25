"use client";

import { useState, useCallback, useEffect, createContext, useContext } from "react";
import Image from "next/image";

/** Clickable label that expands an inline image preview below the text (for non-table use). */
export function InlineExpandImage({
  src,
  alt,
  children,
  className,
}: {
  src: string;
  alt: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`group/thumb inline text-left hover:text-primary transition-colors cursor-pointer ${className ?? ""}`}
      >
        {children}
        <ImageIcon className={open ? "rotate-90" : ""} />
      </button>
      {open && (
        <div className="mt-3">
          <Image
            src={src}
            alt={alt}
            width={400}
            height={566}
            className="h-auto max-h-80 w-auto rounded-lg border border-border object-contain shadow-sm"
            unoptimized
          />
        </div>
      )}
    </div>
  );
}

const ExpandableContext = createContext<{ toggle: () => void; open: boolean } | null>(null);

/** Expandable table row — use ExpandableTrigger inside children to toggle image. */
export function ExpandableRow({
  thumbnailUrl,
  imageUrls,
  alt,
  colSpan,
  children,
}: {
  thumbnailUrl?: string;
  imageUrls?: string[];
  alt: string;
  colSpan: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const urls = imageUrls && imageUrls.length > 0 ? imageUrls : thumbnailUrl ? [thumbnailUrl] : [];
  const hasImage = urls.length > 0;

  return (
    <ExpandableContext.Provider value={{ toggle: () => setOpen((v) => !v), open }}>
      <tr className={`border-b border-border ${open ? "border-b-0!" : ""}`}>
        {children}
      </tr>
      {open && hasImage && (
        <tr className="border-b border-border bg-accent/20">
          <td colSpan={colSpan} className="px-3 py-3">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {urls.map((url, i) => (
                <Image
                  key={i}
                  src={url}
                  alt={`${alt} - ${i + 1}/${urls.length}`}
                  width={400}
                  height={566}
                  className="h-auto max-h-80 w-auto shrink-0 rounded-lg border border-border object-contain shadow-sm"
                  unoptimized
                />
              ))}
            </div>
          </td>
        </tr>
      )}
    </ExpandableContext.Provider>
  );
}

/** Clickable trigger for ExpandableRow — renders text + image icon. */
export function ExpandableTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  const ctx = useContext(ExpandableContext);
  if (!ctx) return <span className={className}>{children}</span>;
  return (
    <button
      type="button"
      onClick={ctx.toggle}
      className={`group/thumb inline text-left hover:text-primary transition-colors cursor-pointer ${className ?? ""}`}
    >
      {children}
      <ImageIcon className={ctx.open ? "rotate-90" : ""} />
    </button>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`ml-1 inline-block h-3 w-3 align-middle text-muted group-hover/thumb:text-primary transition-transform duration-200 ${className ?? ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
      />
    </svg>
  );
}

/** Clickable thumbnail that opens a fullscreen lightbox on click. */
export function ThumbnailButton({
  src,
  alt,
  children,
  className,
}: {
  src: string;
  alt: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group/thumb inline text-left hover:text-primary transition-colors cursor-pointer ${className ?? ""}`}
      >
        {children}
        <svg
          className="ml-1 inline-block h-3 w-3 align-middle text-muted group-hover/thumb:text-primary transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
          />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={src}
              alt={alt}
              width={800}
              height={1132}
              className="h-auto max-h-[90vh] w-auto rounded-lg object-contain shadow-2xl"
              unoptimized
            />
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useCallback, useEffect, createContext, useContext } from "react";
import Image from "next/image";

// ─── Accordion Context (one-open-at-a-time per table body) ───

const AccordionContext = createContext<{
  openKey: string | null;
  setOpenKey: (key: string | null) => void;
} | null>(null);

/** Wraps <tbody> and ensures only one row is expanded at a time. */
export function AccordionTableBody({ children }: { children: React.ReactNode }) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  return (
    <AccordionContext.Provider value={{ openKey, setOpenKey }}>
      <tbody>{children}</tbody>
    </AccordionContext.Provider>
  );
}

function useAccordion(key: string) {
  const ctx = useContext(AccordionContext);
  const [localOpen, setLocalOpen] = useState(false);

  if (ctx) {
    return {
      open: ctx.openKey === key,
      toggle: () => ctx.setOpenKey(ctx.openKey === key ? null : key),
    };
  }

  return { open: localOpen, toggle: () => setLocalOpen((v) => !v) };
}

/** Ensures first-open animation works: mounts with 0fr, then switches to 1fr in the next frame. */
function useAnimatedMount(open: boolean) {
  const [mounted, setMounted] = useState(false);
  const [animateOpen, setAnimateOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (!mounted) {
        setMounted(true);
        // Double rAF ensures the 0fr state paints before transitioning to 1fr
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setAnimateOpen(true);
          });
        });
      } else {
        setAnimateOpen(true);
      }
    } else {
      setAnimateOpen(false);
    }
  }, [open, mounted]);

  return { mounted, animateOpen };
}

// ─── Row-level expand context (for trigger icons inside row cells) ───

const ExpandableContext = createContext<{ toggle: () => void; open: boolean } | null>(null);

// ─── InlineExpandImage (non-table, unchanged) ───

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

// ─── LightboxImage (opens image in overlay, no layout shift) ───

export function LightboxImage({
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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group/thumb inline text-left hover:text-primary transition-colors cursor-pointer ${className ?? ""}`}
      >
        {children}
        <ImageIcon className="" />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={src}
              alt={alt}
              width={600}
              height={849}
              className="h-auto max-h-[85vh] w-auto rounded-lg object-contain shadow-xl"
              unoptimized
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-800 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── ExpandableRow (image-based, accordion + animation) ───

export function ExpandableRow({
  accordionKey,
  thumbnailUrl,
  imageUrls,
  alt,
  colSpan,
  children,
  footer,
}: {
  accordionKey: string;
  thumbnailUrl?: string;
  imageUrls?: string[];
  alt: string;
  colSpan: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const { open, toggle } = useAccordion(accordionKey);
  const { mounted, animateOpen } = useAnimatedMount(open);
  const urls = imageUrls && imageUrls.length > 0 ? imageUrls : thumbnailUrl ? [thumbnailUrl] : [];
  const hasContent = urls.length > 0 || footer;

  return (
    <ExpandableContext.Provider value={{ toggle, open }}>
      <tr className={`border-b border-border ${animateOpen ? "border-b-0!" : ""}`}>
        {children}
      </tr>
      {hasContent && mounted && (
        <tr className={animateOpen ? "border-b border-border" : ""}>
          <td colSpan={colSpan} className="p-0!">
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                animateOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                {urls.length > 0 && (
                  <div className="px-3 py-3 flex gap-3 overflow-x-auto scrollbar-hide bg-accent/20">
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
                )}
                {footer && (
                  <div className="px-3 pb-3 pt-1 bg-accent/20">
                    {footer}
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </ExpandableContext.Provider>
  );
}

// ─── ExpandableTrigger (image icon trigger) ───

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

// ─── DetailExpandableRow (text-based, accordion + animation) ───

export function DetailExpandableRow({
  accordionKey,
  colSpan,
  detail,
  children,
}: {
  accordionKey: string;
  colSpan: number;
  detail: React.ReactNode;
  children: React.ReactNode;
}) {
  const { open, toggle } = useAccordion(accordionKey);
  const { mounted, animateOpen } = useAnimatedMount(open);

  return (
    <ExpandableContext.Provider value={{ toggle, open }}>
      <tr
        className={`border-b border-border cursor-pointer hover:bg-secondary/30 transition-colors ${animateOpen ? "border-b-0!" : ""}`}
        onClick={toggle}
      >
        {children}
      </tr>
      {mounted && (
        <tr className={animateOpen ? "border-b border-border" : ""}>
          <td colSpan={colSpan} className="p-0!">
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                animateOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-4 py-5 bg-secondary/20">
                  {detail}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </ExpandableContext.Provider>
  );
}

// ─── DetailTrigger (text wrapper, no icon) ───

export function DetailTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={className}>{children}</span>;
}

// ─── DetailTriggerChevron (standalone chevron for No column) ───

export function DetailTriggerChevron() {
  const ctx = useContext(ExpandableContext);
  if (!ctx) return null;
  return (
    <svg
      className={`w-3.5 h-3.5 shrink-0 text-muted transition-transform duration-200 ${ctx.open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ─── TrademarkGroupCard (unchanged) ───

export function TrademarkGroupCard({
  name,
  items,
}: {
  name: string;
  items: { date: string; number: string; thumbnailUrl?: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group/thumb flex w-full items-center justify-between py-3 text-left cursor-pointer hover:text-primary transition-colors"
      >
        <span className="font-medium">{name}</span>
        <span className="flex items-center gap-2">
          <span className="text-xs text-muted">{items.length}건</span>
          <svg
            className={`h-4 w-4 text-muted transition-transform duration-200 ${open ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
          {items.map((item, i) => (
            <div key={i} className="shrink-0">
              {item.thumbnailUrl && (
                <Image
                  src={item.thumbnailUrl}
                  alt={`${name} - ${item.number}`}
                  width={200}
                  height={283}
                  className="h-auto max-h-56 w-auto rounded-lg border border-border object-contain shadow-sm"
                  unoptimized
                />
              )}
              <div className="mt-2 text-xs text-muted">
                <p>{item.date}</p>
                <p className="tabular-nums">{item.number}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Icons ───

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

// ─── ThumbnailButton (fullscreen lightbox, unchanged) ───

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

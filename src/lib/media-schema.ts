/**
 * 미디어 시트 한 행을 MediaItem으로 읽는 규칙.
 *
 * 서버(src/lib/cms.ts)와 점검 스크립트(scripts/check-media-sheet.mts)가 이 파일을 함께 쓴다.
 * 규칙이 두 곳에 복제되면 "스크립트는 통과했는데 사이트에는 안 나온다"가 생긴다.
 *
 * cms.ts와 달리 값 import가 없어야 한다 — node가 이 파일을 직접 실행할 수 있어야 하고,
 * `@/` 별칭은 node가 해석하지 못한다. 아래 import는 type 전용이라 런타임에 지워진다.
 */
import type { MediaItem } from "@/data/media";

/** 정렬이 문자열 비교라 형식이 어긋나면 순서가 조용히 깨진다. 그래서 행을 버린다. */
const MEDIA_DATE_RE = /^\d{4}\.\d{2}\.\d{2}$/;

const YOUTUBE_ID_RE =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/;

/** 영상은 링크에서 썸네일을 유도할 수 있어 시트에 image 열을 비워둬도 된다. */
export function youtubeThumbnail(link: string): string {
  const id = link.match(YOUTUBE_ID_RE)?.[1];
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";
}

export type MediaRowResult =
  | { ok: true; item: MediaItem }
  | { ok: false; reason: string };

/**
 * 행을 읽고, 못 읽으면 이유를 돌려준다.
 * 이유 문자열은 점검 스크립트가 담당자에게 그대로 보여주므로 사람이 읽을 말로 쓴다.
 */
export function readMediaRow(row: Record<string, string>): MediaRowResult {
  const title = row.title ?? "";
  const link = row.link ?? "";
  const date = row.date ?? "";

  if (!title) return { ok: false, reason: "title(제목)이 비어 있습니다" };
  if (!date) return { ok: false, reason: "date(날짜)가 비어 있습니다" };
  if (!MEDIA_DATE_RE.test(date)) {
    return { ok: false, reason: `date 형식이 2026.08.18 이 아닙니다 (입력값: ${date})` };
  }
  if (!link) return { ok: false, reason: "link(원문 주소)가 비어 있습니다" };
  if (!/^https?:\/\//.test(link)) {
    return { ok: false, reason: `link가 http:// 또는 https:// 로 시작하지 않습니다 (입력값: ${link})` };
  }

  // 편집자가 "영상"이라고 적는 경우가 자연스럽다. 그 외 값은 뉴스로 본다.
  const rawType = row.type?.trim().toLowerCase() ?? "";
  const type = rawType === "video" || rawType === "영상" ? "video" : "article";
  const image = row.image || (type === "video" ? youtubeThumbnail(link) : "");

  return {
    ok: true,
    item: {
      title,
      titleEn: row.title_en || undefined,
      date,
      origin: row.origin || "",
      link,
      image,
      type,
    },
  };
}

/** fromSheet 의 parseRow 규약(유효하지 않으면 null)에 맞춘 얇은 래퍼. */
export function parseMediaRow(row: Record<string, string>): MediaItem | null {
  const result = readMediaRow(row);
  return result.ok ? result.item : null;
}

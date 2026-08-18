/**
 * src/data/media.ts 의 정적 데이터를 시트 서식 CSV로 내보낸다.
 * 시트를 처음 만들 때 한 번 실행해 붙여넣기 위한 스크립트다.
 *
 *   pnpm export:media              # docs/media-seed.csv 로 저장
 *   pnpm export:media <파일경로>   # 다른 곳에 저장
 *
 * stdout이 아니라 파일로 직접 쓴다 — pnpm이 stdout에 배너를 찍어서
 * `pnpm export:media > file` 로 받으면 CSV 앞에 쓰레기 줄이 붙는다.
 *
 * 이후 정본은 시트이며, src/data/media.ts 는 폴백으로만 남는다.
 * 폴백을 갱신하고 싶으면 시트를 CSV로 내려받아 반대 방향으로 옮기면 된다.
 */
import { writeFileSync } from "node:fs";
import { newsArticles, videos, type MediaItem } from "../src/data/media.ts";

const COLUMNS = ["type", "date", "title", "title_en", "origin", "link", "image"] as const;

/** RFC 4180: 쉼표·따옴표·개행이 있으면 감싸고, 내부 따옴표는 두 번 쓴다. */
function escapeCsv(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function toRow(item: MediaItem): string {
  const values: Record<(typeof COLUMNS)[number], string> = {
    type: item.type,
    date: item.date,
    title: item.title,
    title_en: item.titleEn ?? "",
    origin: item.origin,
    link: item.link,
    image: item.image,
  };
  return COLUMNS.map((c) => escapeCsv(values[c])).join(",");
}

const items = [...newsArticles, ...videos].sort((a, b) => b.date.localeCompare(a.date));
const outPath = process.argv[2] ?? "docs/media-seed.csv";

writeFileSync(outPath, [COLUMNS.join(","), ...items.map(toRow)].join("\n") + "\n", "utf8");
console.log(`${items.length}개 항목을 ${outPath} 에 저장했습니다.`);

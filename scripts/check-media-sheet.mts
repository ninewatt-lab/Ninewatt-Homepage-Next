/**
 * 미디어 시트를 서버에 붙이기 전에 점검한다.
 * 서버와 같은 규칙(src/lib/media-schema.ts)을 쓰므로, 여기서 통과하면 사이트에도 그대로 나온다.
 *
 *   node scripts/check-media-sheet.mts '<게시된 CSV 주소>'
 *   node scripts/check-media-sheet.mts            # .env.local 의 MEDIA_SHEET_CSV_URL 사용
 *
 * 문제가 있으면 종료 코드 1.
 */
import { readFileSync } from "node:fs";
import { parseCsvRows } from "../src/lib/sheet.ts";
import { readMediaRow } from "../src/lib/media-schema.ts";
import type { MediaItem } from "../src/data/media.ts";

const REQUIRED_COLUMNS = ["date", "title", "link"];
const KNOWN_COLUMNS = ["type", "date", "title", "title_en", "origin", "link", "image"];

function resolveUrl(): string | undefined {
  if (process.argv[2]) return process.argv[2];
  if (process.env.MEDIA_SHEET_CSV_URL) return process.env.MEDIA_SHEET_CSV_URL;
  for (const file of [".env.local", ".env"]) {
    try {
      const line = readFileSync(file, "utf8")
        .split("\n")
        .find((l) => l.startsWith("MEDIA_SHEET_CSV_URL="));
      const value = line?.slice("MEDIA_SHEET_CSV_URL=".length).trim().replace(/^["']|["']$/g, "");
      if (value) return value;
    } catch {
      // 파일이 없으면 다음 후보로
    }
  }
  return undefined;
}

const url = resolveUrl();
if (!url) {
  console.error("점검할 CSV 주소가 없습니다.");
  console.error("사용법: node scripts/check-media-sheet.mts '<게시된 CSV 주소>'");
  process.exit(1);
}

console.log(`시트 확인 중: ${url}\n`);

let text: string;
try {
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`❌ 시트를 읽지 못했습니다 (HTTP ${res.status} ${res.statusText}).`);
    console.error("   시트가 '웹에 게시' 상태인지, 주소가 output=csv 로 끝나는지 확인하세요.");
    process.exit(1);
  }
  text = await res.text();
} catch (error) {
  console.error("❌ 시트에 접속하지 못했습니다:", error instanceof Error ? error.message : error);
  process.exit(1);
}

if (text.trimStart().startsWith("<")) {
  console.error("❌ CSV가 아니라 HTML이 돌아왔습니다.");
  console.error("   '웹에 게시'가 해제됐거나, 문서 주소를 그대로 넣은 경우입니다.");
  console.error("   파일 > 공유 > 웹에 게시 > 쉼표로 구분된 값(.csv) 로 다시 게시하세요.");
  process.exit(1);
}

const rows = parseCsvRows(text);
if (rows.length === 0) {
  console.error("❌ 데이터 행이 없습니다. 첫 행은 헤더여야 하고, 그 아래에 내용이 있어야 합니다.");
  process.exit(1);
}

// 헤더 점검
const columns = Object.keys(rows[0].record);
const missing = REQUIRED_COLUMNS.filter((c) => !columns.includes(c));
const unknown = columns.filter((c) => !KNOWN_COLUMNS.includes(c));
if (missing.length > 0) {
  console.error(`❌ 필수 열이 없습니다: ${missing.join(", ")}`);
  console.error(`   현재 열: ${columns.join(", ")}`);
  process.exit(1);
}
if (unknown.length > 0) {
  console.log(`⚠️  모르는 열은 무시됩니다: ${unknown.join(", ")}`);
}

// 행 점검 — 시트에서 보이는 행 번호로 알려준다(1행은 헤더)
const problems: string[] = [];
const items: { item: MediaItem; line: number }[] = [];
for (const { line, record } of rows) {
  const result = readMediaRow(record);
  if (result.ok) items.push({ item: result.item, line });
  else problems.push(`  ${line}행: ${result.reason}`);
}

// 서버와 같은 규칙으로 중복을 걷어낸다 — 아래 집계는 사이트에 실제로 나오는 수여야 한다.
const seen = new Map<string, number>();
const duplicates: string[] = [];
const unique: { item: MediaItem; line: number }[] = [];
for (const { item, line } of items) {
  const first = seen.get(item.link);
  if (first !== undefined) {
    duplicates.push(`  ${line}행: ${first}행과 링크가 같습니다 — 위쪽 행만 반영됩니다`);
  } else {
    seen.set(item.link, line);
    unique.push({ item, line });
  }
}

const news = unique.filter((i) => i.item.type === "article");
const videos = unique.filter((i) => i.item.type === "video");
const translated = unique.filter((i) => i.item.titleEn).length;
const noImage = unique.filter((i) => !i.item.image).length;

/**
 * Google Sheets는 셀 맨 앞의 작은따옴표를 "이 셀은 텍스트" 표시로 읽고 값에서 지운다.
 * 국문 보도 제목은 '...' 로 여는 형태가 흔해서, 붙여넣기·가져오기 때 앞따옴표만 조용히 사라진다.
 * 완벽한 판별은 불가능하므로(영문 소유격 등) 오류가 아니라 확인 요청으로만 알린다.
 */
const suspectQuotes = unique.filter(
  ({ item }) => (item.title.match(/'/g)?.length ?? 0) % 2 === 1 && !item.title.startsWith("'")
);

console.log(`데이터 행 ${rows.length}개 중 ${unique.length}개가 사이트에 나옵니다.`);
console.log(`  뉴스 ${news.length}건 / 영상 ${videos.length}건`);
console.log(`  영문 제목(title_en) 있음: ${translated}건 — 없는 ${unique.length - translated}건은 영문·일문·불문 페이지에 국문 제목이 나갑니다.`);
if (noImage > 0) console.log(`  썸네일 없음: ${noImage}건 — 카드에 "이미지 없음"으로 표시됩니다.`);

if (suspectQuotes.length > 0) {
  console.log(`\n⚠️  작은따옴표 짝이 맞지 않는 제목 ${suspectQuotes.length}건 — 앞따옴표가 지워졌을 수 있습니다:`);
  for (const { item, line } of suspectQuotes) console.log(`  ${line}행: ${item.title}`);
  console.log("  맞다면 그대로 두고, 앞따옴표가 빠진 것이면 셀에 작은따옴표를 두 번('') 쳐서 입력하세요.");
}

if (duplicates.length > 0) {
  console.log(`\n⚠️  링크 중복 ${duplicates.length}건:`);
  console.log(duplicates.join("\n"));
}

if (problems.length > 0) {
  console.log(`\n❌ 사이트에 나오지 않는 행 ${problems.length}개:`);
  console.log(problems.join("\n"));
  process.exit(1);
}

console.log("\n✅ 모든 행이 정상입니다.");

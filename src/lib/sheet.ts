/**
 * Google Sheets("파일 → 공유 → 웹에 게시 → CSV")를 콘텐츠 소스로 읽는 얇은 레이어.
 *
 * 왜 시트인가: 넘길 대상이 대부분 "행을 추가/삭제하는 표"라서 스프레드시트가
 * 스키마와 그대로 맞고, EC2(t3.small)에 DB를 얹지 않아도 된다.
 * 컬렉션이 늘거나 이미지 업로드·다국어 편집이 필요해지면 그때
 * docs/cms-integration-guide.md 의 Payload 재통합으로 옮긴다.
 * 그 교체 지점은 src/lib/cms.ts 의 게터 하나뿐이다.
 *
 * 설계 원칙 두 가지:
 *  1) 정적 데이터(src/data/*.ts)를 지우지 않고 폴백으로 남긴다.
 *     시트가 비었거나 통째로 깨지면 마지막으로 배포된 내용이 계속 보인다.
 *  2) 검증은 행 단위다. 한 행의 날짜 형식이 틀렸다고 목록 전체가
 *     폴백으로 떨어지면 안 된다 — 나쁜 행만 버리고 나머지는 살린다.
 */

/**
 * RFC 4180 CSV 파서.
 *
 * 직접 구현한 이유: 보도자료 제목에 쉼표와 따옴표가 흔하다
 * (예: 소셜 정보방송 무알時報(15), '2018 공공데이터 창업경진대회 편, 나인와트 출연).
 * split(",") 로는 이런 행이 조용히 밀려서 깨진다. 반대로 이거 하나 때문에
 * 파서 의존성을 추가하기에는 현재 dependencies가 9개로 슬림하다.
 */
export function parseCsv(text: string): string[][] {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // BOM

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'; // "" → 리터럴 따옴표
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  // 파일이 개행으로 끝나지 않는 경우의 마지막 행
  if (field !== "" || row.length > 0) { row.push(field); rows.push(row); }

  return rows;
}

export interface SheetRow {
  /** 시트에서 실제로 보이는 행 번호(1행은 헤더). 오류 안내가 엉뚱한 줄을 가리키면 안 된다. */
  line: number;
  record: Record<string, string>;
}

/**
 * 첫 행을 헤더로 삼아 `{ 열이름: 값 }` 레코드로 바꾸고, 원래 행 번호를 함께 돌려준다.
 * 헤더는 소문자로 정규화하므로 시트에서 `Title` 이라고 써도 `title` 로 읽힌다.
 * 열 순서가 바뀌어도 안전하고, 새 열을 오른쪽에 추가해도 기존 코드가 깨지지 않는다.
 *
 * 빈 행은 건너뛰되 번호는 소모한다 — 중간에 여백을 둔 시트에서도 행 번호가 맞아야 한다.
 * (따옴표로 감싼 여러 줄 셀은 parseCsv가 한 행으로 합치므로 번호가 밀리지 않는다.)
 */
export function parseCsvRows(text: string): SheetRow[] {
  const rows = parseCsv(text);
  const headerIndex = rows.findIndex((r) => r.some((c) => c.trim() !== ""));
  if (headerIndex === -1) return [];

  const header = rows[headerIndex].map((h) => h.trim().toLowerCase());
  const out: SheetRow[] = [];

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row.some((c) => c.trim() !== "")) continue; // 빈 행
    const record: Record<string, string> = {};
    header.forEach((h, col) => {
      if (h) record[h] = (row[col] ?? "").trim();
    });
    out.push({ line: i + 1, record });
  }

  return out;
}

/** 행 번호가 필요 없는 호출부(서버)를 위한 축약형. */
export function parseCsvRecords(text: string): Record<string, string>[] {
  return parseCsvRows(text).map((r) => r.record);
}

interface FromSheetOptions<T> {
  /** 게시된 CSV URL. 비어 있으면(로컬 개발·미설정) 곧바로 폴백을 쓴다. */
  url: string | undefined;
  /** revalidateTag 대상 태그. /api/revalidate 에서 이 이름으로 즉시 갱신한다. */
  tag: string;
  /** 원격 로드가 실패했을 때 쓸 정적 데이터. */
  fallback: T[];
  /** 행 하나를 도메인 객체로. 유효하지 않으면 null 을 반환해 그 행만 버린다. */
  parseRow: (row: Record<string, string>) => T | null;
  /** ISR 재검증 주기(초). 기본 10분. */
  revalidate?: number;
  /** 응답 대기 상한(ms). 기본 8초. */
  timeoutMs?: number;
}

/** 게시된 시트를 읽어 검증된 항목 배열로 돌려준다. 실패는 전부 폴백으로 흡수한다. */
export async function fromSheet<T>({
  url,
  tag,
  fallback,
  parseRow,
  revalidate = 600,
  timeoutMs = 8000,
}: FromSheetOptions<T>): Promise<T[]> {
  if (!url) return fallback;

  try {
    // 타임아웃이 없으면 시트가 응답을 끄는 동안 페이지 렌더가 함께 멈춘다.
    // 끊기면 아래 catch가 폴백으로 흡수한다.
    const res = await fetch(url, {
      next: { revalidate, tags: [tag] },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

    const records = parseCsvRecords(await res.text());
    const items: T[] = [];
    let dropped = 0;

    for (const record of records) {
      const item = parseRow(record);
      if (item) items.push(item);
      else dropped++;
    }

    if (dropped > 0) {
      console.warn(`[sheet:${tag}] 형식이 맞지 않는 ${dropped}개 행을 제외했습니다.`);
    }
    // 전멸했다면 시트를 잘못 건드린 것이다. 빈 페이지를 내보내느니 정적 데이터를 유지한다.
    if (items.length === 0) {
      console.warn(`[sheet:${tag}] 유효한 행이 없어 정적 데이터로 폴백합니다.`);
      return fallback;
    }

    return items;
  } catch (error) {
    console.error(`[sheet:${tag}] 시트를 읽지 못해 정적 데이터로 폴백합니다:`, error);
    return fallback;
  }
}

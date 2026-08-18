import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/**
 * 시트를 고친 뒤 즉시 반영하고 싶을 때 호출하는 캐시 무효화 엔드포인트.
 * 호출하지 않아도 fromSheet의 revalidate 주기(기본 10분)에 따라 자동 반영된다.
 *
 *   https://ninewatt.com/api/revalidate?tag=media&secret=<REVALIDATE_SECRET>
 *
 * GET을 허용하는 이유: 홍보 담당자가 브라우저 즐겨찾기로 누를 수 있어야
 * "개발자를 거치지 않는다"는 목적이 성립한다. 시크릿이 URL에 노출되지만
 * 이 엔드포인트가 할 수 있는 일은 캐시 무효화뿐이라 위험이 비례한다.
 * (콘텐츠를 바꾸지 못하고, 최악의 경우 시트를 한 번 더 읽는다.)
 *
 * 응답을 캐시하면 두 번째 호출부터 무효화가 일어나지 않는다.
 */
export const dynamic = "force-dynamic";

/** 알려진 태그만 받는다. 임의 문자열을 그대로 넘기면 오타가 조용히 성공한다. */
const ALLOWED_TAGS = new Set(["media"]);

function handle(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    console.error("REVALIDATE_SECRET 환경변수가 설정되지 않았습니다.");
    return NextResponse.json({ error: "서버 설정 오류입니다." }, { status: 503 });
  }

  const url = new URL(request.url);
  const provided = request.headers.get("x-revalidate-secret") ?? url.searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ error: "인증에 실패했습니다." }, { status: 401 });
  }

  const tag = url.searchParams.get("tag") ?? "media";
  if (!ALLOWED_TAGS.has(tag)) {
    return NextResponse.json({ error: `알 수 없는 태그: ${tag}` }, { status: 400 });
  }

  // Next 16의 revalidateTag는 두 번째 인자로 만료 프로파일을 받는다.
  // "max" = 즉시 만료. updateTag는 서버 액션 전용이라 라우트 핸들러에서 던진다.
  revalidateTag(tag, "max");
  return NextResponse.json({ revalidated: tag });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

import { COMPANY_KNOWLEDGE } from "@/lib/chatbot/systemPrompt";
import { ROUTES, SITE_URL, absoluteUrl, localesFor } from "@/lib/seo";
import { routing } from "@/i18n/routing";

/**
 * /llms.txt — AI 답변 엔진용 사이트 요약 (https://llmstxt.org 제안 표준).
 *
 * 챗봇 시스템 프롬프트에 이미 잘 정리된 회사 지식이 있는데, 그건 Anthropic API로만
 * 전송되어 외부 크롤러가 볼 수 없었다. 같은 데이터를 크롤 가능한 형태로 한 번 더 낸다.
 * 출처가 src/data/* 로 동일하므로 내용이 갈라지지 않는다.
 *
 * 노출 범위: COMPANY_KNOWLEDGE(회사 개요 + 구조화 지식)만 내보낸다.
 * SYSTEM_INSTRUCTIONS(챗봇 행동 지침)는 포함하지 않는다.
 * 여기 실리는 사실은 전부 /company, /company/patents 등에 이미 공개된 것이다.
 *
 * 정직한 기대치: 주요 AI 제공사가 이 파일을 읽는다고 공식 확인한 바는 없다.
 * 공수가 작아서 넣는 것이고, 효과의 본체는 본문 구조와 JSON-LD다.
 */

// ROUTES 경로 → 목차에 쓸 한국어 라벨.
// 없는 경로는 목차에서 빠질 뿐 오류가 아니다(ROUTES가 늘어도 깨지지 않는다).
const LABELS: Record<string, string> = {
  "/": "홈",
  "/product": "제품 전체",
  "/product/shared-ess": "공용ESS — 다수 건물이 공유하는 대용량 ESS",
  "/product/peak-ess": "피크저감 ESS — AI 부하 예측 기반 충·방전 최적제어",
  "/product/bems": "BEMS — 건물에너지관리시스템",
  "/product/solar-site": "SolarScope — 태양광 후보지 규제·발전량·수익성 분석",
  "/product/pv-intelligence": "PV REMS — 태양광 AI 모니터링·이상진단",
  "/product/greenplanner": "GreenPlanner — 그린리모델링 시뮬레이션",
  "/product/repark": "RE:park — QR 기반 시설물 관리",
  "/solutions": "솔루션 전체",
  "/solutions/services": "시스템개발 수행 이력",
  "/solutions/cases": "수행사례",
  "/solutions/watti": "Watti — 3D 건물에너지 분석·디지털트윈",
  "/solutions/opti": "Opti — AI 건물에너지 어드바이저",
  "/solutions/save-e": "Save-E — 전력사용량 분석·요금제 최적화",
  "/solutions/rnd": "R&D 수행 이력",
  "/solutions/global": "글로벌 사업 (일본·영국·프랑스·미국)",
  "/company": "회사 소개",
  "/company/history": "연혁",
  "/company/awards": "수상 실적",
  "/company/patents": "특허·인증·상표",
  "/company/papers": "논문·학술발표",
  "/company/media": "언론 보도",
  "/company/career": "채용",
  "/contact": "문의하기",
  "/energy": "나인와트 에너지 — 신재생에너지 O&M",
  "/energy/ess": "ESS 운영 서비스",
  "/energy/solar": "태양광 O&M 서비스",
  "/energy/solar/sites": "보유 발전소 현황",
  "/energy/ppa": "기업 PPA / RE100",
  "/energy/contact": "에너지 O&M 문의",
};

function buildIndex(): string {
  const ko = routing.defaultLocale;
  const lines: string[] = [];

  for (const { path } of ROUTES) {
    const label = LABELS[path];
    if (!label) continue;
    // 번역이 없는 라우트는 한국어 URL만 유효하다
    const locale = localesFor(path).includes(ko) ? ko : localesFor(path)[0];
    lines.push(`- [${label}](${absoluteUrl(locale, path)})`);
  }
  return lines.join("\n");
}

function buildLlmsTxt(): string {
  return [
    "# Ninewatt (나인와트)",
    "",
    "> AI 기반 건물·에너지 데이터 분석 기업. ESS 운영, 태양광 O&M, 건물에너지관리(BEMS),",
    "> 기업 PPA를 제공한다. 2019년 설립, 인천 본사·서울 R&D 센터, 일본·영국·프랑스·미국 진출.",
    "",
    `대표 연락처: ninewatt@ninewatt.com / +82-70-8866-7226`,
    `한국어가 기본 언어이며 영어·일본어·프랑스어 페이지는 ${SITE_URL}/en, /ja, /fr 아래에 있다.`,
    "",
    "## 주요 페이지",
    "",
    buildIndex(),
    "",
    "---",
    "",
    COMPANY_KNOWLEDGE,
    "",
  ].join("\n");
}

export const dynamic = "force-static";

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

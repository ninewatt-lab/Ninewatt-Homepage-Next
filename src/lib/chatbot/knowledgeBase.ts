// Auto-serialized knowledge base for the Ninewatt chatbot.
// Pulls structured records from src/data/* and the Korean i18n messages
// for solutions/services/cases, then renders them as a single markdown
// block that gets concatenated into the cached system prompt.

import { awards } from "@/data/awards";
import { career } from "@/data/career";
import { certifications } from "@/data/certifications";
import { companyInfo } from "@/data/companyInfo";
import { executives } from "@/data/executives";
import { globalBusiness } from "@/data/globalBusiness";
import { history } from "@/data/history";
import { homeStats } from "@/data/homeStats";
import { organization } from "@/data/organization";
import { papers } from "@/data/papers";
import { domesticPatents, internationalPatents } from "@/data/patents";
import { rndProjects } from "@/data/rndProjects";
import { technologyTransfers } from "@/data/technologyTransfers";
import { trademarks } from "@/data/trademarks";
import solutionsKo from "@/messages/ko/solutions.json";

type ServiceProject = {
  client: string;
  period: string;
  title: string;
  detail?: { description?: string; link?: string };
};

type CaseItem = {
  title: string;
  category: string;
  desc: string;
  detail?: { description?: string; link?: string };
};

type CaseStat = { value: string; label: string };

function awardsBlock(): string {
  const sorted = [...awards].sort((a, b) => b.year - a.year || b.id - a.id);
  return sorted
    .map((a) => `- ${a.date} | ${a.name} — ${a.organization} (${a.grade})`)
    .join("\n");
}

function certificationsBlock(): string {
  const achievement = certifications.filter((c) => c.category === "achievement");
  const registration = certifications.filter((c) => c.category === "registration");
  const fmt = (c: { name: string; issuer: string }) => `- ${c.name} — ${c.issuer}`;
  return [
    `### 노력형 (심사·평가·선정)`,
    achievement.map(fmt).join("\n"),
    ``,
    `### 신청형 (요건 충족 시 등록)`,
    registration.map(fmt).join("\n"),
  ].join("\n");
}

function trademarksBlock(): string {
  return trademarks
    .map(
      (t) =>
        `- ${t.name} | ${t.status} | ${t.country} | ${t.date}${
          t.number && t.number !== "-" ? ` | ${t.number}` : ""
        }`,
    )
    .join("\n");
}

function patentsBlock(): string {
  const registered = domesticPatents.filter((p) => p.status === "등록");
  const applied = domesticPatents.filter((p) => p.status === "출원");
  const published = domesticPatents.filter((p) => p.status === "공개");
  const fmt = (p: { date: string; title: string; applicant: string; number: string }) =>
    `- ${p.date} | ${p.title} (${p.applicant})`;
  return [
    `### 국내 등록 (${registered.length}건)`,
    registered.map(fmt).join("\n"),
    ``,
    `### 국내 출원 (${applied.length}건)`,
    applied.map(fmt).join("\n"),
    ``,
    `### 국내 공개 (${published.length}건)`,
    published.map(fmt).join("\n"),
    ``,
    `### 국제 PCT 출원 (${internationalPatents.length}건)`,
    internationalPatents
      .map((p) => `- ${p.date} | ${p.titleEn} (${p.applicant}, ${p.country})`)
      .join("\n"),
  ].join("\n");
}

function papersBlock(): string {
  const fmt = (p: (typeof papers)[number]) => {
    const authors = p.authors.join(", ");
    const status = p.status === "under-review" ? " [under review]" : "";
    return `- ${p.year} | ${p.title} — ${authors}, ${p.journal}${status}`;
  };
  const sci = papers.filter((p) => p.category === "SCI");
  const intl = papers.filter((p) => p.category === "international");
  const dom = papers.filter((p) => p.category === "domestic");
  return [
    `### SCI (${sci.length}건)`,
    sci.map(fmt).join("\n"),
    ``,
    `### 국제학술발표 (${intl.length}건)`,
    intl.map(fmt).join("\n"),
    ``,
    `### 국내학술발표 (${dom.length}건)`,
    dom.map(fmt).join("\n"),
  ].join("\n");
}

function rndBlock(): string {
  return rndProjects
    .map((r) => {
      const head = `- [${r.status}] ${r.period} | ${r.research} — ${r.agency} (주관: ${r.lead})`;
      if (!r.detail) return head;
      const goal = r.detail.goal ? `\n  목표: ${r.detail.goal}` : "";
      const budget = r.detail.budget ? `\n  예산: ${r.detail.budget}` : "";
      const dept = r.detail.department ? `\n  주관부처: ${r.detail.department}` : "";
      return `${head}${dept}${budget}${goal}`;
    })
    .join("\n");
}

function technologyTransfersBlock(): string {
  return technologyTransfers
    .map(
      (t) =>
        `- ${t.transferDate} | ${t.title} (${t.region}, ${t.transferType}) — ${t.institution}`,
    )
    .join("\n");
}

function historyBlock(): string {
  return [...history]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((h) => `- ${h.date} ${h.content}`)
    .join("\n");
}

function executivesBlock(): string {
  return executives.members
    .map((m) => {
      const detail = m.details.map((d) => `  · ${d.item}`).join("\n");
      return `- ${m.role} ${m.name} (${m.team})\n  ${m.description}\n${detail}`;
    })
    .join("\n");
}

function organizationBlock(): string {
  return organization.departments
    .map((d) => `- ${d.name}: ${d.description} — ${d.tags.join(", ")}`)
    .join("\n");
}

function globalBusinessBlock(): string {
  return globalBusiness.countries
    .map(
      (c) =>
        `### ${c.country} (${c.flag})\n${c.items.map((i) => `- ${i.text}`).join("\n")}`,
    )
    .join("\n\n");
}

function homeStatsBlock(): string {
  return homeStats.stats.map((s) => `- ${s.label}: ${s.value}`).join("\n");
}

function careerBlock(): string {
  const values = career.values.map((v) => `- ${v.title}: ${v.desc}`).join("\n");
  const benefitCats = career.benefitCategories
    .map((c) => `- ${c.category}: ${c.items.map((i) => i.title).join(", ")}`)
    .join("\n");
  const steps = career.steps
    .map((s) => `- ${s.step} ${s.title}: ${s.desc}`)
    .join("\n");
  return [
    `### 조직 문화`,
    career.cultureDesc,
    ``,
    `### 인재상`,
    career.talentSubtitle,
    values,
    ``,
    `### 복리후생`,
    benefitCats,
    ``,
    `### 채용 절차`,
    steps,
  ].join("\n");
}

function companyContactBlock(): string {
  return [
    `- 회사명: ${companyInfo.companyName}`,
    `- 본사: ${companyInfo.hqAddress}`,
    `- R&D 센터: ${companyInfo.rndAddress}`,
    `- Tel: ${companyInfo.phone}`,
    `- Email: ${companyInfo.email}`,
    `- LinkedIn: ${companyInfo.socialLinks.find((s) => s.platform === "linkedin")?.url ?? "-"}`,
    `- Instagram: ${companyInfo.socialLinks.find((s) => s.platform === "instagram")?.url ?? "-"}`,
  ].join("\n");
}

function servicesBlock(): string {
  const projects = (
    (solutionsKo as { services?: { projects?: ServiceProject[] } }).services
      ?.projects ?? []
  );
  return projects
    .map((p) => {
      const head = `- ${p.period} | ${p.client} — ${p.title}`;
      if (!p.detail?.description) return head;
      return `${head}\n  ${p.detail.description}${p.detail.link ? ` (${p.detail.link})` : ""}`;
    })
    .join("\n");
}

function casesBlock(): string {
  const items = (
    (solutionsKo as { cases?: { items?: CaseItem[] } }).cases?.items ?? []
  );
  const stats = (
    (solutionsKo as { cases?: { stats?: CaseStat[] } }).cases?.stats ?? []
  );
  const itemsText = items
    .map((c) => {
      const head = `- [${c.category}] ${c.title} — ${c.desc}`;
      if (!c.detail?.description) return head;
      return `${head}\n  ${c.detail.description}${c.detail.link ? ` (${c.detail.link})` : ""}`;
    })
    .join("\n");
  const statsText = stats.map((s) => `- ${s.label}: ${s.value}`).join("\n");
  return `### 주요 수행사례\n${itemsText}\n\n### 사례 통계\n${statsText}`;
}

/**
 * Full structured knowledge base, rendered once at module load.
 * Stable enough to ride in the cached static portion of the system prompt.
 */
export const STRUCTURED_KNOWLEDGE = `
# Ninewatt 구조화 지식 (자동 생성)

이 섹션은 회사 데이터에서 추출한 구체적인 사실 목록입니다. 사용자가 특정 프로젝트, 특허, 수상, 협력기관을 물으면 여기에서 정확한 사실을 인용해 답하세요. 여기에 없는 항목은 모른다고 답하고 ninewatt@ninewatt.com / +82 70-8866-7226 안내.

## 회사 정보 / 연락처
${companyContactBlock()}

## 핵심 지표
${homeStatsBlock()}

## 조직
${organizationBlock()}

## 임원
${executivesBlock()}

## 연혁
${historyBlock()}

## 시스템 개발 수행 이력 (Solutions / Services)
${servicesBlock()}

## 주요 수행사례 (Solutions / Cases)
${casesBlock()}

## R&D 과제
${rndBlock()}

## 글로벌 사업
${globalBusinessBlock()}

## 수상
${awardsBlock()}

## 인증
${certificationsBlock()}

## 특허
${patentsBlock()}

## 기술이전
${technologyTransfersBlock()}

## 상표
${trademarksBlock()}

## 논문
${papersBlock()}

## 채용 / 조직문화
${careerBlock()}
`.trim();

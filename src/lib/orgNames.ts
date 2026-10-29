/* ── 기관·기업명 영문 표기 ──────────────────────────────────────────
   사업 실적·R&D 과제 데이터(src/data, 각 페이지의 trackRecord)는 기관명을
   한국어로만 들고 있다. ko 외 로케일에서는 여기 영문 공식 명칭으로 바꿔 보여 준다.
   사전에 없는 이름은 원문 그대로 둔다 — 새 기관이 데이터에 추가되면 여기도 넣을 것. */

const ORG_NAMES_EN: Record<string, string> = {
  // 부처
  과학기술정보통신부: "Ministry of Science and ICT",
  국토교통부: "Ministry of Land, Infrastructure and Transport",
  기후환경에너지부: "Ministry of Climate, Energy and Environment",
  산업통상자원부: "Ministry of Trade, Industry and Energy",
  중소벤처기업부: "Ministry of SMEs and Startups",

  // 전담·운영기관
  과학기술사업화진흥원: "Commercializations Promotion Agency for R&D Outcomes",
  국토교통과학기술진흥원: "Korea Agency for Infrastructure Technology Advancement",
  국토안전관리원: "Korea Authority of Land & Infrastructure Safety",
  서울디지털재단: "Seoul Digital Foundation",
  서울산업진흥원: "Seoul Business Agency",
  연구개발특구진흥재단: "INNOPOLIS Foundation",
  정보통신산업진흥원: "National IT Industry Promotion Agency",
  중소기업기술정보진흥원: "Korea Technology and Information Promotion Agency for SMEs",
  창업진흥원: "Korea Institute of Startup & Entrepreneurship Development",
  한국데이터산업진흥원: "Korea Data Agency",
  한국산업기술진흥원: "Korea Institute for Advancement of Technology",
  한국에너지공단: "Korea Energy Agency",
  한국에너지기술평가원: "Korea Institute of Energy Technology Evaluation and Planning",
  한국연구재단: "National Research Foundation of Korea",
  한국전기산업진흥회: "Korea Electrical Manufacturers Association",
  한국환경산업기술원: "Korea Environmental Industry & Technology Institute",
  경북테크노파크: "Gyeongbuk Technopark",
  인천테크노파크: "Incheon Technopark",
  인천지식재산센터: "Incheon Intellectual Property Center",

  // 연구기관·대학
  건설기술연구원: "Korea Institute of Civil Engineering and Building Technology",
  한국건설기술연구원: "Korea Institute of Civil Engineering and Building Technology",
  한국에너지기술연구원: "Korea Institute of Energy Research",
  "서울대학교 산학협력단": "Seoul National University R&DB Foundation",

  // 기업
  나인와트: "Ninewatt",
  "LS일렉트릭": "LS ELECTRIC",
  에스큐아이소프트: "SQISoft",
  "장한기술(주)": "Janghan Technology Co., Ltd.",
  "주식회사 블루포인트파트너스": "Bluepoint Partners",
  티팩토리: "T-Factory",
  한국사회투자: "Korea Social Investment",
  한국전력공사: "Korea Electric Power Corporation",
  한전KDN: "KEPCO KDN",
  현대엔지비: "Hyundai NGV",
};

function translateOne(name: string): string {
  // "나인와트(공동)" 처럼 공동 수행 표기가 붙은 경우
  const joint = name.match(/^(.+)\(공동\)$/);
  if (joint) return `${translateOne(joint[1])} (Joint)`;
  return ORG_NAMES_EN[name] ?? name;
}

/** 기관명을 로케일에 맞게 바꾼다. "A / B" 형태의 공동 주관도 각각 옮긴다. */
export function localizeOrg(name: string, locale: string): string {
  if (locale === "ko" || !name) return name;
  return name
    .split(" / ")
    .map((part) => translateOne(part.trim()))
    .join(" / ");
}

export type PaperCategory = "SCI" | "international" | "domestic";

export interface Paper {
  id: number;
  title: string;
  authors: string[];
  journal: string;
  volume?: string;
  issue?: string;
  pages?: string;
  articleNo?: string;
  date: string;
  year: number;
  category: PaperCategory;
  status?: "published" | "under-review";
  doi?: string;
  linkUrl?: string;
}

/** Google Scholar 검색 링크 생성 */
function scholarUrl(title: string): string {
  return `https://scholar.google.com/scholar?q=${encodeURIComponent(title)}`;
}

export const papers: Paper[] = [
  // ── SCI ──
  {
    id: 1,
    title: "Quantifying urban building shading effect for data-driven building energy modeling",
    authors: ["Yi, D. H.", "Choi, S.", "Kim, D. W.", "Yoon, S."],
    journal: "Building and Environment",
    articleNo: "114011",
    date: "2026",
    year: 2026,
    category: "SCI",
    status: "published",
    linkUrl: scholarUrl("Quantifying urban building shading effect for data-driven building energy modeling"),
  },
  {
    id: 2,
    title: "Impact of Topographic and Contextual Simplifications on Urban-Scale Building Shading Assessment",
    authors: ["Yi, D. H.", "Yoon, S.", "Choi, S.", "Yoo, J.", "Kim, D. W."],
    journal: "Urban Climate",
    date: "2026",
    year: 2026,
    category: "SCI",
    status: "under-review",
  },
  {
    id: 3,
    title: "Quantifying Seasonal Energy Drivers in Public Libraries: Category-Level Importance and Main–Interaction Effect Decomposition Using Explainable Machine Learning",
    authors: ["Joo, H.", "Kim, H.", "Yi, D. H.", "Kim, D. W.", "Heo, Y."],
    journal: "Building and Environment",
    date: "2026",
    year: 2026,
    category: "SCI",
    status: "under-review",
  },
  {
    id: 4,
    title: "Intrinsic Degree Hour: A Novel Data-Driven Framework for Profiling Urban Building Energy Use—Case Study in South Korea",
    authors: ["Ahn, K. U.", "Kim, D. W.", "Kim, H. G.", "Yi, D. H.", "Kim, J.", "Lee, D. H."],
    journal: "Energy and Buildings",
    date: "2026",
    year: 2026,
    category: "SCI",
    status: "under-review",
  },
  {
    id: 5,
    title: "DataNet: linking multi-faceted building energy datasets for effective performance analysis at scale",
    authors: ["Kim, H. G.", "Shin, H. R.", "Chu, H. G.", "Kim, D. S.", "Park, S. L.", "Yi, D. H.", "Lim, H. W.", "Yoon, S.", "Kim, E. J.", "Joe, J. W.", "Kim, S. S.", "Ahn, H. U.", "Heo, Y.", "Yang, I. H.", "Kim, D. W."],
    journal: "Energy and Buildings",
    date: "2026",
    year: 2026,
    category: "SCI",
    status: "under-review",
  },

  // ── 국제학술발표 ──
  {
    id: 6,
    title: "Spatial autocorrelation analysis for shading effect of buildings in gyeonggi province using local indicators of spatial association",
    authors: ["Yi, D. H.", "Kim, D. W.", "Yoon, S.", "Choi, S.", "Chu, H. G."],
    journal: "Building Simulation 2025, IBPSA",
    volume: "Vol. 19",
    date: "2025",
    year: 2025,
    category: "international",
    linkUrl: scholarUrl("Spatial autocorrelation analysis for shading effect of buildings in gyeonggi province using local indicators of spatial association"),
  },
  {
    id: 7,
    title: "Toward Deployable UBEM Solutions: Data and Policy-Driven Modeling Strategies in South Korea and France",
    authors: ["Kim, R.", "Jeun, W.", "Yi, D. H."],
    journal: "Building Simulation 2025, IBPSA",
    volume: "Vol. 19",
    date: "2025",
    year: 2025,
    category: "international",
    linkUrl: scholarUrl("Toward Deployable UBEM Solutions Data and Policy-Driven Modeling Strategies in South Korea and France"),
  },
  {
    id: 8,
    title: "A data-driven framework for building energy benchmarking: Time-series decomposition, clustering and change-point regression",
    authors: ["Kim, R.", "Ko, Y. D.", "Kim, Y. R."],
    journal: "Building Simulation 2023, IBPSA",
    volume: "Vol. 18",
    pages: "750-757",
    date: "2023",
    year: 2023,
    category: "international",
    linkUrl: scholarUrl("A data-driven framework for building energy benchmarking Time-series decomposition clustering and change-point regression"),
  },

  // ── 국내학술발표 ──
  {
    id: 9,
    title: "건물형상 및 외피 열특성 입력변수를 사용한 EnergyPlus 대리모델의 고도화 연구",
    authors: ["유성호", "이동혁"],
    journal: "한국건축친환경설비학회 추계학술발표대회 논문집",
    volume: "45",
    issue: "2",
    pages: "578-579",
    date: "2025",
    year: 2025,
    category: "domestic",
    linkUrl: scholarUrl("건물형상 및 외피 열특성 입력변수를 사용한 EnergyPlus 대리모델의 고도화 연구"),
  },
  {
    id: 10,
    title: "건물형상 입력변수 적용 방법에 따른 EnergyPlus 기반 건물에너지 대리모델 성능 비교",
    authors: ["유성호", "이동혁"],
    journal: "대한건축학회 추계학술발표대회 논문집",
    volume: "45",
    issue: "2",
    pages: "578-579",
    date: "2025",
    year: 2025,
    category: "domestic",
    linkUrl: scholarUrl("건물형상 입력변수 적용 방법에 따른 EnergyPlus 기반 건물에너지 대리모델 성능 비교"),
  },
  {
    id: 11,
    title: "그린리모델링 우선 대상 건물의 선별을 위한 에너지 성능 분류 모델 개발",
    authors: ["김랑", "김영록"],
    journal: "대한건축학회 추계학술발표대회 논문집",
    volume: "42",
    issue: "2",
    pages: "371-372",
    date: "2022",
    year: 2022,
    category: "domestic",
    linkUrl: scholarUrl("그린리모델링 우선 대상 건물의 선별을 위한 에너지 성능 분류 모델 개발"),
  },
];

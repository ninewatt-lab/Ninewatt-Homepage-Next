/* ── 사업 실적 사업명 번역 ──────────────────────────────────────────
   각 제품 페이지(watti · save-e · greenplanner · repark)의 trackRecord 는
   사업명을 한국어로만 들고 있다. ko 외 로케일에서는 여기 번역으로 바꿔 보여 준다.
   키는 데이터의 한국어 원문 그대로다 — 데이터 문구를 고치면 여기 키도 같이 고칠 것.
   사전에 없는 이름은 원문 그대로 둔다. */

type Lang = "en" | "fr" | "ja";

const PROJECT_NAMES: Record<string, Record<Lang, string>> = {
  // Watti
  "SW융합 맞춤형 글로벌 지원사업": {
    en: "Customized Global Support Program for SW Convergence",
    fr: "Programme d'accompagnement international sur mesure pour la convergence logicielle",
    ja: "SW融合カスタマイズ型グローバル支援事業",
  },
  "TIPS 해외마케팅 지원사업 — 민관공동 창업자 발굴육성": {
    en: "TIPS Overseas Marketing Support — Public-Private Startup Discovery and Incubation",
    fr: "Soutien au marketing international TIPS — Détection et accompagnement de startups en partenariat public-privé",
    ja: "TIPS海外マーケティング支援事業 — 官民共同 創業者発掘育成",
  },
  "AI기반 에너지 재난대응 플랫폼 개발 (인공지능중심산업융합집적단지조성)": {
    en: "AI-Based Energy Disaster Response Platform (AI-Centered Industrial Convergence Cluster)",
    fr: "Plateforme de réponse aux catastrophes énergétiques basée sur l'IA (Pôle de convergence industrielle centré sur l'IA)",
    ja: "AI基盤エネルギー災害対応プラットフォーム開発（AI中心産業融合集積団地造成）",
  },
  "클라우드 기반 에너지 진단솔루션 SaaS 전환 (핵심산업 클라우드 플래그십)": {
    en: "SaaS Conversion of a Cloud-Based Energy Diagnostic Solution (Core Industry Cloud Flagship)",
    fr: "Conversion en SaaS d'une solution cloud de diagnostic énergétique (Projet phare cloud pour les industries clés)",
    ja: "クラウド基盤エネルギー診断ソリューションのSaaS転換（基幹産業クラウドフラッグシップ）",
  },
  "도시의 탄소감축량과 녹색금융을 융합한 그린리모델링 매칭 서비스": {
    en: "Green Remodeling Matching Service Combining Urban Carbon Reductions with Green Finance",
    fr: "Service de mise en relation pour la rénovation verte associant réductions de carbone urbaines et finance verte",
    ja: "都市の炭素削減量とグリーンファイナンスを融合したグリーンリモデリングマッチングサービス",
  },
  "그린리모델링 효율향상을 위한 디지털진단 모듈화 기술": {
    en: "Modular Digital Diagnostic Technology for More Efficient Green Remodeling",
    fr: "Technologie modulaire de diagnostic numérique pour une rénovation verte plus efficace",
    ja: "グリーンリモデリング効率向上のためのデジタル診断モジュール化技術",
  },
  "그린벤처 프로그램 사업화": {
    en: "Green Venture Program — Commercialization",
    fr: "Programme Green Venture — Commercialisation",
    ja: "グリーンベンチャープログラム事業化",
  },
  "인천서구강소특구 특화성장패키지": {
    en: "Incheon Seo-gu Innopolis Specialized Growth Package",
    fr: "Programme de croissance spécialisé de l'Innopolis d'Incheon Seo-gu",
    ja: "仁川西区強小特区 特化成長パッケージ",
  },
  "서울창업허브 대기업 협력 프로그램 (LS일렉트릭)": {
    en: "Seoul Startup Hub Corporate Partnership Program (LS ELECTRIC)",
    fr: "Programme de partenariat avec les grandes entreprises du Seoul Startup Hub (LS ELECTRIC)",
    ja: "ソウル創業ハブ 大企業協力プログラム（LS ELECTRIC）",
  },
  "건물에너지 소비 데이터 통합관리 기반 구축": {
    en: "Integrated Management Infrastructure for Building Energy Consumption Data",
    fr: "Infrastructure de gestion intégrée des données de consommation énergétique des bâtiments",
    ja: "建物エネルギー消費データ統合管理基盤構築",
  },
  "강남구청 실증 지원사업": {
    en: "Gangnam-gu Office Demonstration Support Program",
    fr: "Programme de soutien à la démonstration de l'arrondissement de Gangnam",
    ja: "江南区庁 実証支援事業",
  },
  "KSC 데이터 기반 건물에너지 성능진단 및 그린리모델링 솔루션": {
    en: "KSC — Data-Driven Building Energy Performance Diagnostics and Green Remodeling Solution",
    fr: "KSC — Diagnostic de performance énergétique des bâtiments et solution de rénovation verte fondés sur les données",
    ja: "KSC データ基盤の建物エネルギー性能診断およびグリーンリモデリングソリューション",
  },
  "서울 스마트도시 솔루션 해외(런던) 실증": {
    en: "Overseas Demonstration of Seoul Smart City Solutions (London)",
    fr: "Démonstration à l'étranger de solutions de ville intelligente de Séoul (Londres)",
    ja: "ソウルスマートシティソリューション海外（ロンドン）実証",
  },
  "스케일업 챌린지랩 (글로벌 진출)": {
    en: "Scale-up Challenge Lab (Global Expansion)",
    fr: "Scale-up Challenge Lab (Expansion internationale)",
    ja: "スケールアップ・チャレンジラボ（グローバル進出）",
  },
  "도시 건물 넷 제로 AI어시스턴트 건물 에너지 분석 기술 및 플랫폼 개발": {
    en: "AI Assistant Building Energy Analysis Technology and Platform for Net-Zero Urban Buildings",
    fr: "Technologie et plateforme d'analyse énergétique des bâtiments par assistant IA pour des bâtiments urbains à zéro émission nette",
    ja: "都市建物ネットゼロに向けたAIアシスタント建物エネルギー分析技術およびプラットフォーム開発",
  },
  "글로벌 기업 협업 프로그램 — ChatGPT 기반 건물 전력사용량 예측 및 ESS 최적 제어": {
    en: "Global Corporate Collaboration Program — ChatGPT-Based Building Power Demand Forecasting and Optimal ESS Control",
    fr: "Programme de collaboration avec des entreprises mondiales — Prévision de la consommation électrique des bâtiments et pilotage optimal de l'ESS basés sur ChatGPT",
    ja: "グローバル企業協業プログラム — ChatGPT基盤の建物電力使用量予測およびESS最適制御",
  },
  "해외실증(PoC) 지원 프로그램": {
    en: "Overseas Proof of Concept (PoC) Support Program",
    fr: "Programme de soutien aux preuves de concept (PoC) à l'étranger",
    ja: "海外実証（PoC）支援プログラム",
  },
  "그린벤처 유망기업 글로벌 진출지원 프로그램": {
    en: "Global Expansion Support Program for Promising Green Ventures",
    fr: "Programme d'accompagnement international pour les entreprises vertes prometteuses",
    ja: "グリーンベンチャー有望企業グローバル進出支援プログラム",
  },

  // Save-E
  "TIPS 민간투자주도형 기술창업지원 — 빅데이터 분석기반 건물에너지 절감 AI 플랫폼": {
    en: "TIPS Private Investment-Led Tech Startup Support — Big Data-Driven AI Platform for Building Energy Savings",
    fr: "TIPS, soutien aux startups technologiques portées par l'investissement privé — Plateforme IA d'économies d'énergie des bâtiments fondée sur l'analyse de big data",
    ja: "TIPS 民間投資主導型技術創業支援 — ビッグデータ分析基盤の建物エネルギー削減AIプラットフォーム",
  },
  "한국전력공사 에너지 스타트업 프로그램 — 에너지 소비패턴 분석 및 절감 AI 플랫폼": {
    en: "KEPCO Energy Startup Program — AI Platform for Energy Consumption Pattern Analysis and Savings",
    fr: "Programme de startups énergétiques de KEPCO — Plateforme IA d'analyse des profils de consommation et d'économies d'énergie",
    ja: "韓国電力公社 エネルギースタートアッププログラム — エネルギー消費パターン分析および削減AIプラットフォーム",
  },
  "한전 에너지분야 사회적경제조직 임팩트투자 — ECC 및 솔루션 개발": {
    en: "KEPCO Impact Investment in Energy Social Economy Organizations — ECC and Solution Development",
    fr: "Investissement à impact de KEPCO dans les organisations de l'économie sociale de l'énergie — Développement de l'ECC et de solutions",
    ja: "韓国電力 エネルギー分野社会的経済組織インパクト投資 — ECCおよびソリューション開発",
  },
  "기업협력군 에너지 동행 사업": {
    en: "Energy Partnership Program for Corporate Cooperation Groups",
    fr: "Programme de partenariat énergétique pour les groupes de coopération d'entreprises",
    ja: "企業協力群エネルギー同行事業",
  },
  // 2022년 데이터만 띄어쓰기가 없다
  "기업협력군 에너지동행 사업": {
    en: "Energy Partnership Program for Corporate Cooperation Groups",
    fr: "Programme de partenariat énergétique pour les groupes de coopération d'entreprises",
    ja: "企業協力群エネルギー同行事業",
  },
  "에너지바우처 연계형 고독사 사전예방 SW개발 (SW융합클러스터 2.0)": {
    en: "Software to Prevent Solitary Deaths, Linked to the Energy Voucher Program (SW Convergence Cluster 2.0)",
    fr: "Logiciel de prévention des décès en situation d'isolement lié aux chèques énergie (SW Convergence Cluster 2.0)",
    ja: "エネルギーバウチャー連携型 孤独死事前予防SW開発（SW融合クラスター2.0）",
  },
  "연구개발 기획 컨설팅 지원사업 — 에너지바우처 연계형 적정 에너지소비 권장서비스": {
    en: "R&D Planning Consulting Support — Energy Voucher-Linked Service Recommending Appropriate Energy Use",
    fr: "Soutien au conseil en planification R&D — Service de recommandation d'une consommation énergétique adaptée, lié aux chèques énergie",
    ja: "研究開発企画コンサルティング支援事業 — エネルギーバウチャー連携型 適正エネルギー消費推奨サービス",
  },
  "경북지역 풍력에너지 클러스터 인재양성사업": {
    en: "Gyeongbuk Wind Energy Cluster Workforce Development Program",
    fr: "Programme de formation de talents pour le pôle éolien du Gyeongbuk",
    ja: "慶北地域風力エネルギークラスター人材育成事業",
  },
  "DATA-STARS 데이터 활용 사업화 — 에너지 투자연계 AI 플랫폼": {
    en: "DATA-STARS Data Commercialization — AI Platform Linked to Energy Investment",
    fr: "DATA-STARS, commercialisation par les données — Plateforme IA liée à l'investissement énergétique",
    ja: "DATA-STARS データ活用事業化 — エネルギー投資連携AIプラットフォーム",
  },
  "공공건축물 에너지소비량 공개 및 성능개선 사업 제도 기술 지원 용역": {
    en: "Technical Support Services for the Public Building Energy Disclosure and Performance Improvement Program",
    fr: "Prestation d'appui technique au dispositif de publication de la consommation énergétique et d'amélioration de la performance des bâtiments publics",
    ja: "公共建築物エネルギー消費量公開および性能改善事業制度 技術支援業務",
  },
  "스마트진단 MVP 3.0 Energy Reporting Service 고도화": {
    en: "Smart Diagnostics MVP 3.0 — Energy Reporting Service Enhancement",
    fr: "Diagnostic intelligent MVP 3.0 — Amélioration de l'Energy Reporting Service",
    ja: "スマート診断 MVP 3.0 Energy Reporting Service 高度化",
  },
  "공공건축물 에너지 소비량 데이터 검증·분석": {
    en: "Verification and Analysis of Public Building Energy Consumption Data",
    fr: "Vérification et analyse des données de consommation énergétique des bâtiments publics",
    ja: "公共建築物エネルギー消費量データの検証・分析",
  },
  "공공건축물 그린리모델링 종합사업지원": {
    en: "Comprehensive Program Support for Public Building Green Remodeling",
    fr: "Accompagnement global du programme de rénovation verte des bâtiments publics",
    ja: "公共建築物グリーンリモデリング総合事業支援",
  },
  "창업도약 패키지 — 도시단위 에너지효율화 솔루션": {
    en: "Startup Leap Package — City-Scale Energy Efficiency Solution",
    fr: "Programme Startup Leap — Solution d'efficacité énergétique à l'échelle urbaine",
    ja: "創業跳躍パッケージ — 都市単位エネルギー効率化ソリューション",
  },

  // GreenPlanner
  "SBA-KITA 영국 스마트시티 PoC": {
    en: "SBA-KITA UK Smart City PoC",
    fr: "PoC ville intelligente au Royaume-Uni (SBA-KITA)",
    ja: "SBA-KITA 英国スマートシティPoC",
  },
  "Smart-X City 인천도시공사 프로그램 (인천스타트업파크)": {
    en: "Smart-X City Incheon Urban Corporation Program (Incheon Startup Park)",
    fr: "Programme Smart-X City avec l'Incheon Urban Corporation (Incheon Startup Park)",
    ja: "Smart-X City 仁川都市公社プログラム（仁川スタートアップパーク）",
  },
  "Smart-X energy LS일렉트릭 프로그램 (인천스타트업파크)": {
    en: "Smart-X Energy LS ELECTRIC Program (Incheon Startup Park)",
    fr: "Programme Smart-X Energy avec LS ELECTRIC (Incheon Startup Park)",
    ja: "Smart-X energy LS ELECTRICプログラム（仁川スタートアップパーク）",
  },

  // Re:Park
  "실증 상용화 프로그램 — 인천 센트럴파크, 해돋이공원 조명시설 관리": {
    en: "Demonstration and Commercialization Program — Lighting Management at Incheon Central Park and Haedoji Park",
    fr: "Programme de démonstration et de commercialisation — Gestion de l'éclairage du Central Park d'Incheon et du parc Haedoji",
    ja: "実証商用化プログラム — 仁川セントラルパーク・ヘドジ公園の照明施設管理",
  },
  "스케일업 팁스 투자연계 — 에너지맵 기반 수요반응형 모듈러 버티포트 기술 개발": {
    en: "Scale-up TIPS Investment Link — Energy Map-Based Demand-Responsive Modular Vertiport Technology",
    fr: "Scale-up TIPS lié à l'investissement — Technologie de vertiport modulaire à effacement de la demande fondée sur une carte énergétique",
    ja: "スケールアップTIPS投資連携 — エネルギーマップ基盤の需要応答型モジュラーバーティポート技術開発",
  },
  "미래 모빌리티 허브의 에너지 효율화 관리를 위한 알고리즘 및 시뮬레이션 개발": {
    en: "Algorithms and Simulation for Energy Efficiency Management of Future Mobility Hubs",
    fr: "Algorithmes et simulation pour la gestion de l'efficacité énergétique des futurs hubs de mobilité",
    ja: "未来モビリティハブのエネルギー効率化管理のためのアルゴリズムおよびシミュレーション開発",
  },
  "2차 기술개발제품 공공기관 실증지원 사업": {
    en: "Public Institution Demonstration Support for Technology Development Products (Round 2)",
    fr: "Soutien à la démonstration de produits technologiques dans les institutions publiques (2e appel)",
    ja: "第2次 技術開発製品 公共機関実証支援事業",
  },
};

/** 실적 사업명을 로케일에 맞게 바꾼다. */
export function localizeProjectName(name: string, locale: string): string {
  if (locale === "ko") return name;
  const lang: Lang = locale === "fr" || locale === "ja" ? locale : "en";
  return PROJECT_NAMES[name]?.[lang] ?? name;
}

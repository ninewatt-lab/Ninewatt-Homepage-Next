/* ── R&D 과제 문구 번역 ──────────────────────────────────────────────
   src/data/rndProjects.ts 는 과제명 · 연구목표 · 연구내용 · 사업구분 · 사업비를
   한국어로만 들고 있다(챗봇 지식 베이스도 같은 데이터를 한국어로 쓴다).
   ko 외 로케일에서는 여기 번역으로 바꿔 보여 준다. 기관명은 orgNames.ts 가 맡는다.
   키는 데이터의 과제명(research) 한국어 원문 그대로다 — 데이터 문구를 고치면
   여기 키도 같이 고칠 것. 사전에 없는 과제·항목은 원문 그대로 둔다. */

type Lang = "en" | "fr" | "ja";

interface RndText {
  research: string;
  goal?: string;
  contents?: string[];
  category?: string;
}

const RND_TEXT: Record<string, Record<Lang, RndText>> = {
  "빅데이터 분석기반 건물에너지 절감 AI플랫폼": {
    en: {
      research: "AI Platform for Building Energy Savings Based on Big Data Analytics",
      goal: "Develop an energy-saving education process combined with energy-saving technology",
      contents: ["Energy savings and service performance improvements", "Development of a commercial AI platform"],
      category: "Startup Growth Technology Development (TIPS, Private Investment-Led Tech Startup Support)",
    },
    fr: {
      research: "Plateforme IA d'économies d'énergie des bâtiments fondée sur l'analyse de big data",
      goal: "Développer un processus de sensibilisation aux économies d'énergie associé à des technologies d'économie d'énergie",
      contents: ["Économies d'énergie et amélioration des performances du service", "Développement d'une plateforme IA commerciale"],
      category: "Développement technologique pour la croissance des startups (TIPS, soutien aux startups technologiques portées par l'investissement privé)",
    },
    ja: {
      research: "ビッグデータ分析基盤の建物エネルギー削減AIプラットフォーム",
      goal: "省エネ技術と組み合わせた省エネ教育プロセスの開発",
      contents: ["省エネおよびサービス性能向上の開発", "商用AIプラットフォームの開発"],
      category: "創業成長技術開発（TIPS、民間投資主導型技術創業支援）",
    },
  },
  "AI기반의 사전예방 및 빠른 복구가 가능한 에너지 재난대응 플랫폼 개발": {
    en: {
      research: "AI-Based Energy Disaster Response Platform for Prevention and Rapid Recovery",
      goal: "Develop AI-based energy disaster response technology for distributed energy systems — covering monitoring, data management, analysis and intelligent recovery — to prevent energy disasters and recover from them quickly",
      contents: [
        "Data processing system technology supporting energy system monitoring and condition measurement",
        "Energy condition analysis and prediction system for accident prevention",
        "Intelligent energy system recovery technology",
      ],
      category: "AI-Centered Industrial Convergence Cluster (R&D)",
    },
    fr: {
      research: "Plateforme IA de réponse aux catastrophes énergétiques pour la prévention et le rétablissement rapide",
      goal: "Développer une technologie de réponse aux catastrophes énergétiques fondée sur l'IA pour les systèmes énergétiques distribués — supervision, gestion et analyse des données, rétablissement intelligent — afin de prévenir les incidents et de rétablir rapidement le service",
      contents: [
        "Système de traitement des données pour la supervision et la mesure de l'état des systèmes énergétiques",
        "Système d'analyse et de prévision de l'état énergétique pour la prévention des incidents",
        "Technologie de rétablissement intelligent des systèmes énergétiques",
      ],
      category: "Pôle de convergence industrielle centré sur l'IA (R&D)",
    },
    ja: {
      research: "AI基盤の事前予防と迅速な復旧が可能なエネルギー災害対応プラットフォーム開発",
      goal: "エネルギー災害の事前予防と迅速な復旧に向け、分散型エネルギーシステムのモニタリング、データ管理、分析、インテリジェント復旧などの技術を含むAI基盤のエネルギー災害対応技術を開発",
      contents: [
        "エネルギーシステムのモニタリングおよび状態測定を支援するデータ処理システム技術",
        "事故予防のためのエネルギー状態分析および予測システム開発",
        "インテリジェントなエネルギーシステム復旧技術開発",
      ],
      category: "AI中心産業融合集積団地造成（R&D）",
    },
  },
  "풍력단지 O&M 기술개발 인재양성 산학협력": {
    en: {
      research: "Industry-Academia Collaboration on Wind Farm O&M Technology and Workforce Development",
      goal: "Research and analyze the latest domestic and international wind energy information and provide it to relevant institutions",
      category: "Energy Workforce Development Program",
    },
    fr: {
      research: "Coopération industrie-université sur les technologies d'exploitation et de maintenance des parcs éoliens et la formation de talents",
      goal: "Collecter et analyser les dernières informations sur l'éolien en Corée et à l'international et les transmettre aux organismes concernés",
      category: "Programme de formation de talents dans l'énergie",
    },
    ja: {
      research: "風力発電団地O&M技術開発 人材育成産学協力",
      goal: "国内外の風力関連の最新情報を調査・分析し、関係機関に提供",
      category: "エネルギー人材育成事業",
    },
  },
  "에너지바우처 연계 관리서비스용 무선통신 열계량 시스템 개발": {
    en: {
      research: "Wireless Heat Metering System for Energy Voucher-Linked Management Services",
      goal: "Develop a Bluetooth 5.0-based wireless remote meter reading system for district heating household heat meters",
      contents: [
        "Data collection and services through a Bluetooth 5.0 mesh-based district heating metering system",
        "Services that make it easier for stakeholders to use energy vouchers efficiently",
        "Services linked to local government data on welfare recipients held by community service centers",
      ],
      category: "SME R&D Capacity Building (R&D)",
    },
    fr: {
      research: "Système de comptage de chaleur sans fil pour des services de gestion liés aux chèques énergie",
      goal: "Développer un système de télérelève sans fil Bluetooth 5.0 pour les compteurs de chaleur des logements raccordés au chauffage urbain",
      contents: [
        "Collecte de données et services via un système de comptage de chaleur pour le chauffage urbain basé sur Bluetooth 5.0 Mesh",
        "Services facilitant l'utilisation efficace des chèques énergie par les parties prenantes",
        "Services connectés aux données des bénéficiaires d'aide sociale détenues par les centres communautaires locaux",
      ],
      category: "Renforcement des capacités R&D des PME (R&D)",
    },
    ja: {
      research: "エネルギーバウチャー連携管理サービス用 無線通信熱計量システム開発",
      goal: "Bluetooth 5.0基盤の地域暖房世帯用熱量計の無線遠隔検針システム開発",
      contents: [
        "Bluetooth 5.0 MESH基盤の地域暖房用熱計量システムによるデータ収集・サービス開発",
        "エネルギーバウチャーの効率的な利用に向けた関係者の利便性向上サービス開発",
        "各住民センターが保有する自治体支援の生活保護対象者情報と連携するサービス開発",
      ],
      category: "中小企業R&D力量強化（R&D）",
    },
  },
  "클라우드 기반 에너지진단 솔루션 개발": {
    en: { research: "Cloud-Based Energy Diagnostic Solution" },
    fr: { research: "Solution cloud de diagnostic énergétique" },
    ja: { research: "クラウド基盤エネルギー診断ソリューション開発" },
  },
  "도시의 탄소감축량과 녹색금융을 융합한 그린리모델링 매칭 서비스": {
    en: {
      research: "Green Remodeling Matching Service Combining Urban Carbon Reductions with Green Finance",
      goal: "Stimulate the green remodeling market by leveraging carbon credits",
      contents: [
        "Streamlining carbon credit acquisition and establishing a carbon finance fund",
        "Diversifying funding sources, including ESG funds",
        "Carbon credit-based green remodeling business in Europe",
        "Platform operation and additional demonstrations",
      ],
      category: "Green New Deal Top 100 Promising Companies",
    },
    fr: {
      research: "Service de mise en relation pour la rénovation verte associant réductions de carbone urbaines et finance verte",
      goal: "Dynamiser le marché de la rénovation verte grâce aux crédits carbone",
      contents: [
        "Optimisation du processus d'obtention des crédits carbone et création d'un fonds de finance carbone",
        "Diversification des financements, notamment par des fonds ESG",
        "Activité de rénovation verte en Europe adossée aux crédits carbone",
        "Exploitation de la plateforme et démonstrations supplémentaires",
      ],
      category: "100 entreprises prometteuses du Green New Deal",
    },
    ja: {
      research: "都市の炭素削減量とグリーンファイナンスを融合したグリーンリモデリングマッチングサービス",
      goal: "炭素排出権の活用によるグリーンリモデリング市場の活性化",
      contents: [
        "炭素排出権確保プロセスの効率化、炭素金融ファンドの組成",
        "ESGファンドなど資金確保の多角化",
        "炭素排出権基盤のグリーンリモデリング欧州事業",
        "プラットフォーム運営および追加実証",
      ],
      category: "グリーンニューディール有望企業100",
    },
  },
  "그린리모델링 대상 건물 선별 및 성능개선을 위한 도시단위 광역진단 기술": {
    en: {
      research: "City-Scale Wide-Area Diagnostic Technology for Selecting and Improving Buildings for Green Remodeling",
      goal: "Build a city-scale wide-area diagnostic platform for green remodeling to achieve carbon neutrality",
      contents: [
        "Framework for collecting, storing and maintaining urban data",
        "Data-driven city-scale wide-area diagnostic model",
        "Policy development to foster a green remodeling ecosystem",
      ],
      category: "Green Venture Program R&D (Green New Deal Top 100 Promising Companies)",
    },
    fr: {
      research: "Technologie de diagnostic à l'échelle urbaine pour sélectionner et améliorer les bâtiments à rénover",
      goal: "Mettre en œuvre une plateforme de diagnostic à l'échelle urbaine pour la rénovation verte au service de la neutralité carbone",
      contents: [
        "Dispositif de collecte, de stockage et de maintenance des données urbaines",
        "Modèle de diagnostic à l'échelle urbaine fondé sur les données",
        "Élaboration de politiques pour développer l'écosystème de la rénovation verte",
      ],
      category: "Programme Green Venture R&D (100 entreprises prometteuses du Green New Deal)",
    },
    ja: {
      research: "グリーンリモデリング対象建物の選別および性能改善のための都市単位広域診断技術",
      goal: "カーボンニュートラル実現のためのグリーンリモデリング都市単位広域診断プラットフォームの実装",
      contents: [
        "都市データの収集・保存・維持管理体系の構築",
        "データ基盤の都市単位広域診断モデルの開発",
        "グリーンリモデリングのエコシステム形成に向けた政策づくり",
      ],
      category: "グリーンベンチャープログラムR&D（グリーンニューディール有望企業100）",
    },
  },
  "그린리모델링 효율향상을 위한 디지털 진단 모듈화 기술": {
    en: {
      research: "Modular Digital Diagnostic Technology for More Efficient Green Remodeling",
      goal: "Develop technology to select buildings for green remodeling that deliver the greatest carbon reductions for the same investment",
      contents: [
        "AI-based digital diagnostics of building energy and forecasting of urban energy consumption",
        "Geospatial map construction and information platform development",
        "Analysis of commercial viability and feasibility",
      ],
      category: "Relay Program for Commercializing Land, Infrastructure and Transport Technology",
    },
    fr: {
      research: "Technologie modulaire de diagnostic numérique pour une rénovation verte plus efficace",
      goal: "Développer une technologie de sélection des bâtiments à rénover offrant la plus forte réduction de carbone pour un même investissement",
      contents: [
        "Diagnostic numérique de l'énergie des bâtiments par IA et prévision de la consommation énergétique urbaine",
        "Cartographie fondée sur les données géospatiales et plateforme d'information",
        "Analyse de la viabilité commerciale et de la faisabilité",
      ],
      category: "Programme relais de commercialisation des technologies du territoire, des infrastructures et des transports",
    },
    ja: {
      research: "グリーンリモデリング効率向上のためのデジタル診断モジュール化技術",
      goal: "同一の投資費用で炭素削減効果が高いグリーンリモデリング対象建物の選定技術を開発",
      contents: [
        "AI基盤の建物エネルギーデジタル診断および都市エネルギー消費量予測",
        "空間情報基盤の地図構築および情報プラットフォーム開発",
        "事業化の妥当性および実現可能性分析",
      ],
      category: "国土交通技術事業化のためのリレー事業",
    },
  },
  "전력 송배전 선로부하를 고려한 공유형 ESS 설치 전 사전 진단 기술개발": {
    en: {
      research: "Pre-Installation Diagnostic Technology for Shared ESS Considering Transmission and Distribution Line Loads",
      category: "2025 Scale-up Technology Commercialization Program",
    },
    fr: {
      research: "Technologie de diagnostic préalable à l'installation d'un ESS partagé tenant compte de la charge des lignes de transport et de distribution",
      category: "Programme de commercialisation technologique Scale-up 2025",
    },
    ja: {
      research: "送配電線路の負荷を考慮した共有型ESS設置前の事前診断技術開発",
      category: "2025年 スケールアップ技術事業化プログラム",
    },
  },
  "AI 기반 도시 단위 건물 에너지 통합 관리 R&D 효율화를 위한 온톨로지 연계 데이터레이크 및 다중 에이전트 기술 개발": {
    en: {
      research: "Ontology-Linked Data Lake and Multi-Agent Technology for More Efficient R&D on AI-Based City-Scale Building Energy Management",
      category: "Innovative Growth Support for R&D Service Companies — Growth Ladder for Contract Research Firms (Innovation Leap)",
    },
    fr: {
      research: "Lac de données relié à une ontologie et technologie multi-agents pour une R&D plus efficace en gestion énergétique intégrée des bâtiments à l'échelle urbaine par IA",
      category: "Soutien à la croissance innovante des sociétés de services R&D — Échelle de croissance pour les sociétés de recherche sous contrat (saut d'innovation)",
    },
    ja: {
      research: "AI基盤の都市単位建物エネルギー統合管理R&D効率化のためのオントロジー連携データレイクおよびマルチエージェント技術開発",
      category: "研究開発サービス企業 革新成長支援_受託研究企業 成長はしご構築（革新跳躍）",
    },
  },
  "경북지역 풍력에너지 클러스터 인재양성사업": {
    en: {
      research: "Gyeongbuk Wind Energy Cluster Workforce Development Program",
      category: "Energy Workforce Development (R&D)",
    },
    fr: {
      research: "Programme de formation de talents pour le pôle éolien du Gyeongbuk",
      category: "Formation de talents dans l'énergie (R&D)",
    },
    ja: {
      research: "慶北地域風力エネルギークラスター人材育成事業",
      category: "エネルギー人材育成（R&D）",
    },
  },
  "에너지맵 기반 수요반응형 모듈러 버티포트 기술 개발": {
    en: {
      research: "Energy Map-Based Demand-Responsive Modular Vertiport Technology",
      goal: "Build a city-scale 3D energy map and develop a solution that identifies optimal vertiport locations based on it",
      contents: [
        "Urban energy and carbon planning",
        "Optimal UAM vertiport siting and operation",
        "Energy demand response design",
      ],
      category: "SME Technology Innovation Development (Scale-up TIPS)",
    },
    fr: {
      research: "Technologie de vertiport modulaire à effacement de la demande fondée sur une carte énergétique",
      goal: "Construire une carte énergétique 3D à l'échelle urbaine et développer une solution qui identifie, à partir de cette carte, les emplacements optimaux des vertiports",
      contents: [
        "Planification énergétique et carbone urbaine",
        "Implantation et exploitation optimales des vertiports UAM",
        "Conception de l'effacement de la demande énergétique",
      ],
      category: "Développement de l'innovation technologique des PME (Scale-up TIPS)",
    },
    ja: {
      research: "エネルギーマップ基盤の需要応答型モジュラーバーティポート技術開発",
      goal: "都市単位で3次元に可視化したエネルギーマップを構築し、それに基づいてバーティポートを設置できる最適な位置を提供するソリューションを開発",
      contents: [
        "都市エネルギー・炭素計画",
        "UAMバーティポートの最適設置・運営",
        "エネルギー需要応答設計",
      ],
      category: "中小企業技術革新開発（スケールアップTIPS）",
    },
  },
  "수열원 변동 대응 대규모 중앙집중형 수열에너지 실증플랜트 기술 개발": {
    en: {
      research: "Large-Scale Centralized Hydrothermal Energy Demonstration Plant Technology Responding to Water Heat Source Fluctuations",
      category: "2024 Environmental Technology Development for the New Climate Regime",
    },
    fr: {
      research: "Technologie de centrale de démonstration d'énergie hydrothermique centralisée à grande échelle, adaptée aux variations de la source de chaleur",
      category: "Développement de technologies environnementales pour le nouveau régime climatique 2024",
    },
    ja: {
      research: "水熱源の変動に対応する大規模中央集中型水熱エネルギー実証プラント技術開発",
      category: "2024年 新気候体制対応 環境技術開発",
    },
  },
  "리튬배터리 제조사업장의 전주기 화재 안전 관리시스템 기술 개발": {
    en: { research: "Full-Lifecycle Fire Safety Management System for Lithium Battery Manufacturing Sites" },
    fr: { research: "Système de gestion de la sécurité incendie sur tout le cycle de vie pour les sites de fabrication de batteries lithium" },
    ja: { research: "リチウムバッテリー製造事業所の全周期火災安全管理システム技術開発" },
  },
  "건물부문 탄소중립 가속화를 위한 건물에너지 소비 데이터 통합관리 기반기술 개발": {
    en: {
      research: "Integrated Management Technology for Building Energy Consumption Data to Accelerate Carbon Neutrality in the Building Sector",
      goal: "Develop integrated management technology for building energy consumption data to lay the groundwork for, and accelerate, carbon neutrality in the building sector by 2050",
      contents: [
        "Linking related data, designing consumption performance indicators and evaluation models, and designing the integrated data management system",
        "Integrating and verifying related data, establishing a consumption performance evaluation methodology, and building the integrated data management system",
        "Building the integrated building energy consumption data management system (I-BED) and laying the foundation for its use",
      ],
      category: "Building Energy Consumption Data Integrated Management Infrastructure",
    },
    fr: {
      research: "Technologie de gestion intégrée des données de consommation énergétique des bâtiments pour accélérer la neutralité carbone du secteur",
      goal: "Développer une technologie de gestion intégrée des données de consommation énergétique des bâtiments afin de préparer et d'accélérer la neutralité carbone du secteur à l'horizon 2050",
      contents: [
        "Interconnexion des données associées, conception d'indicateurs et de modèles d'évaluation de la performance de consommation, conception du système de gestion intégrée des données",
        "Intégration et vérification des données associées, définition de la méthodologie d'évaluation de la performance de consommation, mise en place du système de gestion intégrée des données",
        "Mise en place du système de gestion intégrée des données de consommation énergétique des bâtiments (I-BED) et des conditions de son utilisation",
      ],
      category: "Infrastructure de gestion intégrée des données de consommation énergétique des bâtiments",
    },
    ja: {
      research: "建物部門のカーボンニュートラル加速化に向けた建物エネルギー消費データ統合管理基盤技術開発",
      goal: "建物部門の2050年カーボンニュートラルの基盤構築と履行加速に向けた建物エネルギー消費データ統合管理基盤技術の開発",
      contents: [
        "関連データの連携、消費性能評価指標および評価モデルの設計、データ統合管理システムの設計",
        "関連データの統合および検証、消費性能評価方法論の確立、データ統合管理システムの構築",
        "建物エネルギー消費データ統合管理システム（I-BED）の構築および活用基盤づくり",
      ],
      category: "建物エネルギー消費データ統合管理基盤構築",
    },
  },
  "도시 건물 넷 제로 혁신적 전환 위한 AI어시스턴트 건물 에너지 분석 기술 및 플랫폼 개발": {
    en: {
      research: "AI Assistant Building Energy Analysis Technology and Platform for the Innovative Net-Zero Transition of Urban Buildings",
      goal: "Develop data-driven urban building energy analysis that integrates geospatial information, and an urban building energy information platform with realistic 3D visualization and a practical AI assistant interface",
      contents: [
        "Data mapping and aggregation based on unique building identifiers",
        "Urban building energy assessment based on monthly energy consumption data",
        "Urban building energy analysis system (UBEM platform, AI assistant technology)",
      ],
      category: "Collaborative Hub International R&D Program for Land, Infrastructure and Transport",
    },
    fr: {
      research: "Technologie et plateforme d'analyse énergétique des bâtiments par assistant IA pour une transition innovante des bâtiments urbains vers le zéro émission nette",
      goal: "Développer une analyse fondée sur les données de l'énergie des bâtiments urbains intégrant l'information géospatiale, ainsi qu'une plateforme d'information offrant une visualisation 3D réaliste et une interface pratique avec assistant IA",
      contents: [
        "Mise en correspondance et agrégation des données à partir des identifiants uniques des bâtiments",
        "Évaluation énergétique des bâtiments urbains à partir des données de consommation mensuelles",
        "Système d'analyse énergétique des bâtiments urbains (plateforme UBEM, technologie d'assistant IA)",
      ],
      category: "Programme de R&D internationale en pôles de coopération pour le territoire, les infrastructures et les transports",
    },
    ja: {
      research: "都市建物のネットゼロへの革新的転換に向けたAIアシスタント建物エネルギー分析技術およびプラットフォーム開発",
      goal: "空間情報を統合した都市建物エネルギーのデータ基盤分析技術を実装し、3Dリアリスティック可視化とAIアシスタント機能に基づく実用的なインターフェースを備えた都市建物エネルギー情報提供プラットフォームを開発",
      contents: [
        "建築物固有キー基盤のデータマッピングおよび集計技術開発",
        "月別エネルギー消費データ基盤の都市建物エネルギー評価技術開発",
        "都市建物エネルギー分析システム開発（UBEMプラットフォーム、AIアシスタント技術）",
      ],
      category: "協力拠点型 国土交通国際協力研究開発事業",
    },
  },
  "AI기반 예지보전형 HVAC+Chiller 통합제어 하이브리드 ESS 냉각시스템 개발": {
    en: {
      research: "AI-Based Predictive-Maintenance Hybrid ESS Cooling System with Integrated HVAC and Chiller Control",
      category: "2026 World Class Plus Program (R&D Support for World-Class Companies)",
    },
    fr: {
      research: "Système de refroidissement hybride pour ESS à maintenance prédictive par IA, avec pilotage intégré CVC et groupe froid",
      category: "Programme World Class Plus 2026 (soutien R&D aux entreprises de classe mondiale)",
    },
    ja: {
      research: "AI基盤 予知保全型 HVAC+Chiller統合制御ハイブリッドESS冷却システム開発",
      category: "2026年度 ワールドクラスプラス事業（ワールドクラス企業R&D支援）",
    },
  },
  "배전망·커뮤니티 부하 완화를 위한 공유형 ESS 중심 디지털트윈-양자 최적화 기반 분산 에너지 자원 통합 운영 플랫폼 개발": {
    en: {
      research: "Integrated Distributed Energy Resource Operation Platform Centered on Shared ESS, Using Digital Twin and Quantum Optimization to Ease Distribution Grid and Community Loads",
      category: "2025 Korea–Singapore International Joint Energy R&D (New Projects)",
    },
    fr: {
      research: "Plateforme d'exploitation intégrée des ressources énergétiques distribuées centrée sur un ESS partagé, fondée sur un jumeau numérique et l'optimisation quantique, pour réduire la charge des réseaux de distribution et des communautés",
      category: "R&D énergétique internationale conjointe Corée–Singapour 2025 (nouveaux projets)",
    },
    ja: {
      research: "配電網・コミュニティの負荷緩和のための共有型ESS中心 デジタルツイン-量子最適化基盤 分散型エネルギー資源統合運用プラットフォーム開発",
      category: "2025年 韓国-シンガポール エネルギー国際共同R&D 新規支援",
    },
  },
};

function toLang(locale: string): Lang {
  return locale === "fr" || locale === "ja" ? locale : "en";
}

/** 과제명(한국어 원문)으로 해당 로케일의 문구를 찾는다. ko 이거나 사전에 없으면 undefined. */
export function getRndText(research: string, locale: string): RndText | undefined {
  if (locale === "ko") return undefined;
  return RND_TEXT[research]?.[toLang(locale)];
}

const BUDGET_WORDS: Record<Lang, { total: string; none: string }> = {
  en: { total: "total ", none: "No government funding" },
  fr: { total: "total : ", none: "Aucun financement public" },
  ja: { total: "総額", none: "政府支援金なし" },
};

/** "5억원 (총 5.97억원)" · "3,000만원 (총 3,750만원)" · "정부지원금 없음 (총 1억원)" 형태의 사업비를 옮긴다.
    en/fr 은 백만 원 단위로, ja 는 億/万 단위를 그대로 살린다. */
export function localizeBudget(budget: string, locale: string): string {
  if (locale === "ko" || !budget) return budget;
  const lang = toLang(locale);
  const words = BUDGET_WORDS[lang];
  const millions = new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-US", { maximumFractionDigits: 2 });

  const out = budget
    .replace("정부지원금 없음", words.none)
    .replace("총 ", words.total)
    .replace(/([\d.,]+)(억|만)원/g, (_, num: string, unit: "억" | "만") => {
      if (lang === "ja") return `${num}${unit === "억" ? "億" : "万"}ウォン`;
      const krw = Number(num.replace(/,/g, "")) * (unit === "억" ? 1e8 : 1e4);
      const m = millions.format(krw / 1e6);
      return lang === "fr" ? `${m} millions KRW` : `KRW ${m} million`;
    });
  return lang === "ja" ? out.replace(" (", "（").replace(")", "）") : out;
}

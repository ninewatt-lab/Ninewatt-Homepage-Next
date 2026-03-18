import { getPayload } from "payload";
import config from "@payload-config";
import { awards } from "../data/awards";
import { certifications } from "../data/certifications";
import { history } from "../data/history";
import { domesticPatents, internationalPatents } from "../data/patents";

async function seed() {
  const payload = await getPayload({ config });

  console.log("🌱 Seeding database...");

  // --- Create admin user ---
  console.log("Creating admin user...");
  try {
    await payload.create({
      collection: "users",
      data: {
        email: "admin@ninewatt.com",
        password: "changeme123!",
        role: "admin",
      },
    });
  } catch {
    console.log("Admin user already exists, skipping.");
  }

  // --- Seed Awards ---
  console.log(`Seeding ${awards.length} awards...`);
  for (const award of awards) {
    await payload.create({
      collection: "awards",
      data: {
        name: award.name,
        organization: award.organization,
        grade: award.grade,
        date: award.date,
        year: award.year,
      },
    });
  }

  // --- Seed Certifications ---
  console.log(`Seeding ${certifications.length} certifications...`);
  for (const [i, cert] of certifications.entries()) {
    await payload.create({
      collection: "certifications",
      data: {
        name: cert.name,
        issuer: cert.issuer,
        sortOrder: i,
      },
    });
  }

  // --- Seed History ---
  console.log(`Seeding ${history.length} history items...`);
  for (const item of history) {
    await payload.create({
      collection: "history",
      data: {
        date: item.date,
        content: item.content,
        year: item.year,
      },
    });
  }

  // --- Seed Domestic Patents ---
  console.log(`Seeding ${domesticPatents.length} domestic patents...`);
  for (const patent of domesticPatents) {
    await payload.create({
      collection: "patents",
      data: {
        type: "domestic",
        status: patent.status,
        date: patent.date,
        number: patent.number,
        title: patent.title,
        applicant: patent.applicant,
      },
    });
  }

  // --- Seed International Patents ---
  console.log(`Seeding ${internationalPatents.length} international patents...`);
  for (const patent of internationalPatents) {
    await payload.create({
      collection: "patents",
      data: {
        type: "international",
        status: patent.status,
        date: patent.date,
        number: patent.number,
        title: patent.titleKo,
        applicant: "",
        country: patent.country,
      },
    });
  }

  // --- Seed R&D Projects ---
  console.log("Seeding R&D projects...");
  const rndProjects = [
    {
      agency: "중소기업기술정보진흥원",
      research: "빅데이터분석 기반 에너지절감 AI플랫폼 개발",
      lead: "나인와트",
      period: "21.07~21.12",
      status: "완료" as const,
      detail: {
        goal: "에너지절감 기술과 결합된 에너지절감 교육 프로세스 개발",
        contents: [{ item: "에너지절감 및 서비스 성능 향상개발" }, { item: "상용화 AI 플랫폼 개발" }],
        budget: "5억원 (총 6.25억원)",
        department: "중소벤처기업부",
        category: "창업성장기술개발(일반,R&D)",
      },
    },
    {
      agency: "정보통신산업진흥원",
      research: "AI기반의 사전예방 및 빠른 복구가 가능한 에너지 재난대응 플랫폼 개발",
      lead: "나인와트(공동)",
      period: "21.04~23.12",
      status: "완료" as const,
      detail: {
        goal: "에너지 재난 사전 예방 및 빠른 복구를 위한 분산에너지시스템 적용 모니터링, 데이터관리, 분석, 지능형 복구 등의 기술이 포함되는 인공지능 기반의 에너지 재난 대응 기술 개발",
        contents: [
          { item: "에너지 시스템 모니터링 및 상태 측정 지원 데이터 처리 시스템 기술" },
          { item: "사고 예방을 위한 에너지 상태분석 및 예측 시스템 개발" },
          { item: "지능형 에너지 시스템 복구 기술 개발" },
        ],
        budget: "31.29억원 (총 37.7억원)",
        department: "과학기술정보통신부",
        category: "인공지능중심산업융합집적단지조성(R&D)",
      },
    },
    {
      agency: "경북테크노파크",
      research: "풍력단지 O&M 기술개발 인재양성 산학협력",
      lead: "나인와트(공동)",
      period: "20.07~21.03",
      status: "완료" as const,
      detail: {
        goal: "국내외 풍력관련 최신정보 조사분석을 통한 관련기관에 제공",
        contents: [],
        budget: "19.23억원 (총 39.24억원)",
        department: "산업통상자원부",
        category: "에너지인력양성사업",
      },
    },
    {
      agency: "한국에너지기술연구원",
      research: "에너지바우처 연계 관리서비스용 무선통신 열계량 시스템 개발",
      lead: "나인와트",
      period: "20.01~20.12",
      status: "완료" as const,
      detail: {
        goal: "블루투스 5.0 기반 지역난방 세대용 열량계 무선 원격검침 시스템 개발",
        contents: [
          { item: "블루투스 5.0 MESH 기반 지역난방용 열계량 시스템을 통한 데이터 수집/서비스 개발" },
          { item: "에너지바우처의 효율적 사용을 위한 이해관계자 편의향상 서비스 개발" },
          { item: "각 주민센터에서 보유한 지자체 지원 생활보호대상자 정보와 연계하는 서비스 개발" },
        ],
        budget: "3,000만원 (총 3,750만원)",
        department: "중소벤처기업부",
        category: "중소기업R&D역량제고(R&D)",
      },
    },
    {
      agency: "정보통신산업진흥원",
      research: "클라우드 기반 에너지진단 솔루션 개발",
      lead: "나인와트",
      period: "21.04~21.12",
      status: "완료" as const,
    },
    {
      agency: "중소벤처기업부",
      research: "도시의 탄소감축량과 녹색금융을 융합한 그린리모델링 매칭 서비스",
      lead: "나인와트",
      period: "22.04~25.12",
      status: "완료" as const,
      detail: {
        goal: "탄소배출권 활용을 통한 그린리모델링 시장 활성화",
        contents: [
          { item: "탄소배출권 확보 프로세스 효율화, 탄소금융펀드 조성" },
          { item: "ESG 펀드 등 자금확보 다각화" },
          { item: "탄소배출권 기반 그린리모델링 유럽 사업" },
          { item: "플랫폼 운영 및 추가 실증" },
        ],
        budget: "5억원 (총 6.25억원)",
        department: "중소벤처기업부",
        category: "그린뉴딜유망기업100",
      },
    },
    {
      agency: "중소벤처기업부",
      research: "그린리모델링 대상 건물 선별 및 성능개선을 위한 도시단위 광역진단 기술",
      lead: "나인와트",
      period: "22.04~24.12",
      status: "완료" as const,
      detail: {
        goal: "탄소중립 실현을 위한 그린리모델링 도시단위 광역진단 플랫폼 구현",
        contents: [
          { item: "도시 데이터 수집 저장 유지관리 체계 구축" },
          { item: "데이터 기반의 도시단위 광역 진단 모델 개발" },
          { item: "그린리모델링 생태계 조성을 위한 정책 마련" },
        ],
        budget: "5억원 (총 6.25억원)",
        department: "중소벤처기업부",
        category: "그린뉴딜유망기업100",
      },
    },
    {
      agency: "국토교통과학기술진흥원",
      research: "그린리모델링 효율향상을 위한 디지털 진단 모듈화 기술",
      lead: "나인와트",
      period: "22.04~24.12",
      status: "완료" as const,
      detail: {
        goal: "동일 비용투자 시 탄소감축 효과가 높은 그린리모델링 대상건물 선정 기술 개발",
        contents: [
          { item: "AI기반 건물에너지 디지털진단 및 도시 에너지 소비량 예측" },
          { item: "공간정보 기반 지도 구축 및 정보플랫폼 개발" },
          { item: "사업화 타당성 및 실현가능성 분석" },
        ],
        budget: "3.5억원 (총 4.63억원)",
        department: "국토교통부",
        category: "국토교통기술사업화를위한이어달리기사업",
      },
    },
    {
      agency: "중소기업기술정보진흥원",
      research: "에너지맵 기반 수요반응형 모듈러 버티포트 기술 개발",
      lead: "나인와트",
      period: "23.12~26.12",
      status: "수행중" as const,
      detail: {
        goal: "도시 단위 3차원으로 시각화된 에너지 맵을 구축하고, 에너지 맵에 기반하여 버티포트를 설치 가능한 최적의 위치를 제공하는 솔루션 개발",
        contents: [
          { item: "도시 에너지/탄소 계획" },
          { item: "UAM 버티포트 최적 설치/운영" },
          { item: "에너지 수요반응 설계" },
        ],
        budget: "11.4억원 (총 14.25억원)",
        department: "중소벤처기업부",
        category: "중소기업기술혁신개발(스케일업 TIPS)",
      },
    },
    {
      agency: "한국환경산업기술원",
      research: "수열원 시스템 동절기 효율향상 및 AI 기반 최적 운영 제어 기술 개발",
      lead: "장한기술(주) / 나인와트",
      period: "25.04~29.12",
      status: "수행중" as const,
    },
    {
      agency: "한국연구재단",
      research: "리튬배터리 제조사업장의 전주기 화재 안전 관리시스템 기술 개발",
      lead: "티팩토리 / 나인와트",
      period: "25.06~28.12",
      status: "수행중" as const,
    },
    {
      agency: "국토교통과학기술진흥원",
      research: "건물부분 탄소중립 가속화를 위한 건물에너지 소비 데이터 통합관리 기반기술 개발",
      lead: "건설기술연구원 / 나인와트",
      period: "23.04~26.12",
      status: "수행중" as const,
      detail: {
        goal: "건물부문 2050 탄소중립 기반 구축 및 이행 가속화를 위한 건물에너지 소비 데이터 통합관리 기반기술 개발",
        contents: [
          { item: "유관 데이터 연계, 소비성능 평가지표 및 평가모델 설계, 데이터통합관리시스템 설계" },
          { item: "유관 데이터 통합 및 검증, 소비성능 평가 방법론 정립, 데이터통합관리시스템 구축" },
          { item: "건물에너지 소비데이터 통합관리시스템(I-BED) 구축 및 활용기반 마련" },
        ],
        budget: "152억원 (총 171억원)",
        department: "국토교통부",
        category: "건물에너지소비데이터통합관리기반구축",
      },
    },
    {
      agency: "국토교통과학기술진흥원",
      research: "도시 건물 넷 제로 혁신적 전환 위한 AI어시스턴트 건물 에너지 분석 기술 및 플랫폼 개발",
      lead: "건설기술연구원 / 나인와트",
      period: "24.07~27.03",
      status: "수행중" as const,
      detail: {
        goal: "공간정보를 통합한 도시 건물 에너지의 데이터 기반 분석 기술 구현과 3D realistic 가시화 및 AI 어시스턴트 기능 기반 실용적인 인터페이스를 제공하는 도시 건물 에너지 정보제공 플랫폼 개발",
        contents: [
          { item: "건축물 고유키 기반 데이터 맵핑 및 집계 기술 개발" },
          { item: "월별 에너지 소비 데이터 기반 도시 건물 에너지 평가기술 개발" },
          { item: "도시 건물 에너지 분석 시스템 개발 (UBEM 플랫폼, AI어시스턴트 기술)" },
        ],
        budget: "13.125억원 (총 14.56억원)",
        department: "국토교통부",
        category: "협력거점형 국토교통 국제협력 연구개발사업",
      },
    },
  ];

  for (const project of rndProjects) {
    await payload.create({
      collection: "rnd-projects",
      data: project,
    });
  }

  // --- Seed Globals ---
  console.log("Seeding globals...");

  // CompanyInfo
  await payload.updateGlobal({
    slug: "company-info",
    data: {
      companyName: "Ninewatt",
      tagline: "GX 실현을 이끄는 에너지 기술로,\n지속 가능한 미래를 함께 만들어갑니다.",
      hqAddress: "인천광역시 연수구 컨벤시아대로 204, 104호 인스타2",
      rndAddress: "서울특별시 강남구 강남대로 162길 22 2,4F",
      phone: "070-8866-7226",
      email: "ninewatt@ninewatt.com",
      socialLinks: [
        { platform: "linkedin", url: "https://kr.linkedin.com/company/ninewatt-global" },
        { platform: "instagram", url: "https://www.instagram.com/9ninewatt/" },
      ],
    },
  });

  // HomeStats
  await payload.updateGlobal({
    slug: "home-stats",
    data: {
      stats: [
        { value: "2019", label: "설립" },
        { value: "30+", label: "직원 수" },
        { value: "60+", label: "프로젝트" },
        { value: "96.81%", label: "매출 성장률" },
        { value: "48억", label: "누적 투자" },
        { value: "33건", label: "특허 보유" },
      ],
    },
  });

  // Executives
  await payload.updateGlobal({
    slug: "executives",
    data: {
      members: [
        {
          role: "CEO / 대표이사",
          name: "김영록",
          team: "사업 1부",
          description: "건축학 전공, 에너지절약건물 설계 컨설팅 200회 이상 전문가",
          details: [
            { item: "성균관대학교 u-City공학 석사" },
            { item: "단국대학교 건축공학 학사" },
            { item: "국토교통부장관 표창 등 다수 수상" },
          ],
        },
        {
          role: "CTO / 최고기술책임자",
          name: "박상린",
          team: "사업 2부",
          description: "건축학 전공, 일본 건설업계 1위 AI 연구소 출신, AI 기술 개발 및 제안 업무 담당 시니어 엔지니어",
          details: [
            { item: "성균관대학교 u-City공학 석사" },
            { item: "경희대학교 건축공학 학사" },
            { item: "Deep Learning 베이스 AI 시스템 설계" },
          ],
        },
      ],
    },
  });

  // Organization
  await payload.updateGlobal({
    slug: "organization",
    data: {
      departments: [
        { name: "사업부 1", description: "에너지 컨설팅, 그린리모델링" },
        { name: "사업부 2", description: "해외사업, 플랫폼 사업" },
        { name: "개발부", description: "풀스택 개발, AI 백엔드" },
        { name: "기술연구부", description: "에너지 분석, 빅데이터 연구" },
      ],
    },
  });

  // Career
  await payload.updateGlobal({
    slug: "career",
    data: {
      cultureTitle: "조직 문화",
      cultureDesc: "나인와트는 창의적이고 활동적인 조직 문화를 기반으로 개인과 기업이 함께 성장합니다. 구성원의 도전과 성장을 적극 지원하고, 노력과 성과에 대한 보상을 보장합니다.",
      talentTitle: "인재상",
      talentSubtitle: "자유롭되 책임감을 갖고 함께 성장할 인재를 모집합니다",
      values: [
        { title: "성장 욕구", desc: "목표 달성을 위해 지속적으로 발전하며, 스스로의 성장에 책임을 갖는 인재" },
        { title: "도전", desc: "긍정적인 사고방식을 가지고 새로운 기회에 적극적으로 참여하는 인재" },
        { title: "행동력", desc: "자유로운 문화 속에서 업무를 주도적으로 추진하고 실행하는 인재" },
      ],
      benefitCategories: [
        {
          category: "근무 환경",
          items: [
            { title: "자율 출근제", desc: "오전 8시~10시 중 10분 단위 자유 선택" },
            { title: "자유로운 연차", desc: "사전 승인 불필요, 10일 이상 장기휴가 권장" },
            { title: "근속연수별 연차", desc: "입사년도 월 1일, 차년도 연 15일" },
            { title: "생일자 유급휴가", desc: "연차 소진 없는 생일 휴가 제공" },
          ],
        },
        {
          category: "지원 & 보상",
          items: [
            { title: "식대 지원", desc: "식대 및 간식 제공" },
            { title: "건강검진", desc: "종합 건강검진 지원" },
            { title: "교육·도서 지원", desc: "직무 역량 향상비 및 자기개발 지원" },
            { title: "성과보상제", desc: "성과지표·프로젝트 기여도 연계 보상" },
            { title: "사무용품", desc: "노트북, 모니터 등 업무 장비 제공" },
          ],
        },
      ],
      steps: [
        { step: "01", title: "서류 지원", desc: "이력서 및 포트폴리오 제출" },
        { step: "02", title: "1차·2차 면접", desc: "직무 역량 및 문화 적합성 평가" },
        { step: "03", title: "최종 합격", desc: "처우 협의 및 입사 안내" },
      ],
    },
  });

  // GlobalBusiness
  await payload.updateGlobal({
    slug: "global-business",
    data: {
      countries: [
        {
          country: "일본",
          flag: "JP",
          items: [
            { text: "2024.03 일본 시나넨 홀딩스 주식회사와 업무협약 체결" },
            { text: "2024.06 시나넨 홀딩스, 니이가타현 츠난마치(지자체)와 3주간 업무협약 체결" },
            { text: "2024.12 츠난마치 대상 스마트시티플랫폼 실증 프로젝트 진행" },
            { text: "2024 창업진흥원 해외실증(PoC) 진출사업 수행 완료" },
            { text: "2025.06 일본 PBADAO 주식회사와 업무협약 체결" },
            { text: "2025.07 일본 아즈빌 주식회사와 NDA 체결" },
          ],
        },
        {
          country: "영국",
          flag: "GB",
          items: [
            { text: "Thurrock council - Corringham 지역 대상 PoC 진행" },
            { text: "R&D 한영 국제공동연구과제 수행 중 (AI어시스턴트 건물 에너지 분석 기술 및 플랫폼 개발)" },
          ],
        },
        {
          country: "프랑스",
          flag: "FR",
          items: [
            { text: "2023.03 Toltek (건축업자를 위한 솔루션 개발 스타트업)과 업무협약 체결" },
          ],
        },
        {
          country: "미국",
          flag: "US",
          items: [
            { text: "2024 OpenAI 협업 파트너사 선정" },
            { text: "2025.11 Johnson Controls와 Opti 구독 계약 체결, 수출 실적 발생" },
          ],
        },
      ],
    },
  });

  console.log("✅ Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});

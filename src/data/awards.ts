export interface Award {
  id: number;
  name: string;
  organization: string;
  grade: string;
  date: string;
  year: number;
}

export const awards: Award[] = [
  { id: 1, name: "부동산서비스산업창업경진대회", organization: "국토교통부", grade: "최우수상", date: "2018.09.07", year: 2018 },
  { id: 2, name: "세상을 밝히는 에너지분야 시민창업 경진대회", organization: "한국에너지공단", grade: "대상", date: "2018.09.20", year: 2018 },
  { id: 3, name: "범정부 통합 공공데이터 활용 창업경진대회", organization: "행정안전부", grade: "대통령상", date: "2018.11.12", year: 2018 },
  { id: 4, name: "Welcome to Tips", organization: "인천지방중소벤처기업", grade: "최우수상", date: "2019.04.30", year: 2019 },
  { id: 5, name: "청년창업챌린지", organization: "인천창조경제혁신센터", grade: "최우수상", date: "2019.06.20", year: 2019 },
  { id: 6, name: "2019년 상반기 데모데이", organization: "과학기술정보통신부", grade: "대상", date: "2019.07.29", year: 2019 },
  { id: 7, name: "6회 대한민국 SW융합 해커톤 대회", organization: "과학기술정보통신부", grade: "우수상", date: "2019.09.01", year: 2019 },
  { id: 8, name: "청년 스타트업 어워즈", organization: "청년과 미래", grade: "우수상", date: "2019.09.21", year: 2019 },
  { id: 9, name: "인천 청년창업챌린지", organization: "인천광역시", grade: "대상", date: "2019.10.24", year: 2019 },
  { id: 10, name: "시민과 함께하는 발명아이디어 콘테스트", organization: "인천광역시", grade: "대상", date: "2019.11.06", year: 2019 },
  { id: 11, name: "Incheon Civic Hack-Fair", organization: "인천광역시", grade: "대상", date: "2019.11.16", year: 2019 },
  { id: 12, name: "환경분야 소셜 비즈니스 발굴 공모전", organization: "환경부/SK이노베이션", grade: "우수상", date: "2020.08.11", year: 2020 },
  { id: 13, name: "전력데이터 활용 신서비스 개발 경진대회", organization: "한국전력공사", grade: "우수상", date: "2020.08.20", year: 2020 },
  { id: 14, name: "7회 대한민국 SW융합 해커톤 대회", organization: "과학기술정보통신부", grade: "우수상", date: "2020.12.06", year: 2020 },
  { id: 15, name: "데이터비즈 인포그래픽 공모전", organization: "한국디자인진흥원", grade: "특선", date: "2020.12.09", year: 2020 },
  { id: 16, name: "8회 대한민국 SW융합 해커톤 대회", organization: "과학기술정보통신부, 정보통신산업진흥원", grade: "우수상", date: "2021.10.31", year: 2021 },
  { id: 17, name: "스마트건설 창업 아이디어 공모전", organization: "국토교통부, 한국건설기술연구원", grade: "대상", date: "2021.11.17", year: 2021 },
  { id: 18, name: "DATA-Stars(데이터 활용 사업화 지원)", organization: "과학기술정보통신부, 한국데이터산업진흥원", grade: "최우수상", date: "2021.11.17", year: 2021 },
  { id: 19, name: "제 6회 공간정보 활용 창업 아이디어 공모전", organization: "국토교통부, 한국국토정보공사", grade: "대상(창업기업부문)", date: "2021.12.23", year: 2021 },
  { id: 20, name: "제 4회 스마트시티 창업기업 성과발표대회", organization: "국토교통부", grade: "우수상(장관상)", date: "2022.08.31", year: 2022 },
  { id: 21, name: "공간빅데이터 경진대회", organization: "국토교통부", grade: "장려상", date: "2022.11.03", year: 2022 },
  { id: 22, name: "D.CAMP 11월 디데이 X 글로벌리그", organization: "D.CAMP", grade: "우승", date: "2022.11", year: 2022 },
  { id: 23, name: "ICT기금 지원사업", organization: "한국방송통신전파진흥원", grade: "진흥원 원장상", date: "2022.11.23", year: 2022 },
  { id: 24, name: "대스타 해결사 플랫폼 4차산업분야", organization: "서울창조경제혁신센터", grade: "2위", date: "2022.12.07", year: 2022 },
  { id: 25, name: "인천 라이징 스타", organization: "인천테크노파크", grade: "대상(인천시장상)", date: "2022.12.30", year: 2022 },
  { id: 26, name: "신한오픈이노베이션 7기 우수협업", organization: "신한오픈이노베이션", grade: "우수협업", date: "2023.07", year: 2023 },
  { id: 27, name: "오픈AI 글로벌 기업 협력 프로그램", organization: "OpenAI", grade: "선정", date: "2024.05", year: 2024 },
  { id: 28, name: "경기도 기후테크 컨퍼런스", organization: "경기환경에너지진흥원", grade: "우수상", date: "2025.10.24", year: 2025 },
  { id: 29, name: "CES 2026 Innovation Awards (OPTI)", organization: "CES", grade: "Honoree", date: "2026.01", year: 2026 },
];

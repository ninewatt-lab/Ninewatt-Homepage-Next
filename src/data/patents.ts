export interface Patent {
  id: number;
  status: "등록" | "출원";
  date: string;
  number: string;
  title: string;
  applicant: string;
}

export interface InternationalPatent {
  id: number;
  status: string;
  date: string;
  number: string;
  titleKo: string;
  titleEn: string;
  country: string;
}

export const domesticPatents: Patent[] = [
  { id: 1, status: "등록", date: "2022.12.06", number: "1024763030000", title: "복지관 실내 환경 관리 서버", applicant: "주식회사 나인와트" },
  { id: 2, status: "등록", date: "2021.12.08", number: "1023388910000", title: "전기 자동차 충전 시스템", applicant: "주식회사 나인와트" },
  { id: 3, status: "등록", date: "2021.12.13", number: "1023403720000", title: "전기 자동차 충전 시스템", applicant: "주식회사 나인와트" },
  { id: 4, status: "등록", date: "2022.12.06", number: "1024762990000", title: "복지관 실내 환경 관리 시스템", applicant: "주식회사 나인와트" },
  { id: 5, status: "등록", date: "2023.01.12", number: "1024895630000", title: "음용량 표시 시스템, 방법 및 이를 위한 장치", applicant: "주식회사 나인와트" },
  { id: 6, status: "등록", date: "2025.04.18", number: "1027995770000", title: "주소지의 에너지 사용량에 대한 평가정보를 결정하는 방법 및 서버", applicant: "주식회사 나인와트" },
  { id: 7, status: "등록", date: "2025.05.19", number: "1028115330000", title: "건물 에너지 분석 플랫폼의 정보검색증강기반 자연어 질의 응답 서비스를 제공하는 방법 및 시스템", applicant: "한국건설기술연구원, 주식회사 나인와트" },
  { id: 8, status: "등록", date: "2025.04.18", number: "1027995560000", title: "발전 설비의 발전량을 예측하는 방법", applicant: "주식회사 나인와트" },
  { id: 9, status: "등록", date: "2022.05.30", number: "1024052730000", title: "고령자에게 복지관의 환기 상태 알림을 제공하고, 복지관의 환경을 관리하기 위한 플랫폼", applicant: "주식회사 나인와트" },
  { id: 10, status: "등록", date: "2022.03.07", number: "1023733450000", title: "전기 자동차 충전 시스템", applicant: "주식회사 나인와트" },
  { id: 11, status: "등록", date: "2025.06.13", number: "1028221400000", title: "인공지능 모델 기반 건물의 에너지 사용량 및 절약 방법 추론 솔루션 제공 방법, 장치 및 시스템", applicant: "주식회사 나인와트" },
  { id: 12, status: "등록", date: "2024.09.19", number: "1027088310000", title: "건물 에너지 모델링 자동화 시스템 및 이를 이용한 방법", applicant: "주식회사 나인와트" },
  { id: 13, status: "등록", date: "2024.09.19", number: "1027088340000", title: "에너지 효율화 대상 건물을 선정하는 서버 및 이를 위한 에너지 효율화 대상 건물 선정 방법", applicant: "주식회사 나인와트" },
  { id: 14, status: "등록", date: "2024.06.24", number: "1026791800000", title: "빌딩 에너지 데이터 기반 충전기 설치 장소 결정 방법 및 그 장치", applicant: "주식회사 나인와트" },
  { id: 15, status: "등록", date: "2023.11.13", number: "1026033240000", title: "스마트 미터를 이용한 블루투스 기반의 무선 원격 검침 시스템, 방법 및 이를 위한 장치", applicant: "주식회사 나인와트" },
  { id: 16, status: "출원", date: "2019.12.16", number: "1020190168167", title: "감응형 냉난방 제어시스템의 구동 방법", applicant: "주식회사 나인와트" },
  { id: 17, status: "출원", date: "2024.12.02", number: "1020240176906", title: "건물 쉐이프 모델링 생성 시스템 및 방법", applicant: "주식회사 나인와트" },
  { id: 18, status: "출원", date: "2025.10.29", number: "1020250159223", title: "RAG LLM 기반의 리트로핏 대상물의 에너지 운영 시뮬레이션 장치", applicant: "주식회사 나인와트" },
  { id: 19, status: "출원", date: "2025.12.02", number: "1020250187778", title: "공유형 에너지 저장 시스템의 용량 배분 방법 및 시스템", applicant: "주식회사 나인와트" },
  { id: 20, status: "출원", date: "2025.11.27", number: "1020250183997", title: "공유형 에너지 저장 시스템의 운영 방법 및 시스템", applicant: "주식회사 나인와트" },
  { id: 21, status: "출원", date: "2025.12.05", number: "1020250190997", title: "모빌리티 허브 에너지 운영 장치 및 방법", applicant: "주식회사 나인와트" },
  { id: 22, status: "출원", date: "2025.12.02", number: "1020250187779", title: "전력 시계열 데이터 적응형 청킹 방법 및 장치", applicant: "주식회사 나인와트" },
  { id: 23, status: "출원", date: "2025.12.02", number: "1020250187780", title: "전력 시스템 상황 기반 계층적 LLM 에이전트 라우팅 방법 및 장치", applicant: "주식회사 나인와트" },
];

export const internationalPatents: InternationalPatent[] = [
  { id: 1, status: "출원", date: "2024.10.10", number: "PCT/KR2024/096301", titleKo: "빌딩 에너지 모델링을 위한 자동화 시스템 및 이를 이용하는 방법", titleEn: "Automation System for Building Energy Modeling, and Method Using Same", country: "PCT" },
  { id: 2, status: "출원", date: "2024.10.10", number: "PCT/KR2024/096299", titleKo: "에너지 효율 개선 대상 빌딩을 선택하기 위한 서버 및 방법", titleEn: "Server for Selecting Building Subject to Energy Efficiency Improvement and Method", country: "PCT" },
  { id: 3, status: "출원", date: "2023.11.30", number: "PCT/KR2023/019606", titleKo: "장비 관리 시스템과 이를 이용하는 처리 방법", titleEn: "Equipment Management System and Management Method Using Same", country: "PCT" },
  { id: 4, status: "출원", date: "2023.12.01", number: "PCT/KR2023/019706", titleKo: "주소지의 에너지 사용량 평가정보를 결정하기 위한 서버 및 방법", titleEn: "Method and Server for Determining Evaluation Information on Amount of Energy Use of Place of Address", country: "PCT" },
  { id: 5, status: "출원", date: "2024.01.10", number: "PCT/KR2024/000507", titleKo: "빌딩 에너지 모델링을 위한 자동화 시스템 및 이를 이용하는 방법", titleEn: "Automation System for Building Energy Modeling, and Method Using Same", country: "PCT" },
  { id: 6, status: "출원", date: "2020.10.08", number: "PCT/KR2020/013818", titleKo: "음용량 측정 시스템 및 방법", titleEn: "Drinking Amount Measurement System and Method Using Water Purifier, and Device Therefor", country: "PCT" },
  { id: 7, status: "출원", date: "2019.10.18", number: "PCT/KR2019/013726", titleKo: "전기자동차 충전 시스템", titleEn: "Electric Vehicle Charging System", country: "PCT" },
  { id: 8, status: "출원", date: "2019.09.20", number: "PCT/KR2019/012188", titleKo: "빌딩 에너지 관리 시스템", titleEn: "Building Energy Management System", country: "PCT" },
  { id: 9, status: "출원", date: "2020.11.30", number: "PCT/KR2020/017224", titleKo: "스마트 계량기 기반 블루투스 무선 원격 검침 시스템 및 방법", titleEn: "Bluetooth-Based Wireless Remote Meter Reading System and Method Using Smart Meters", country: "PCT" },
  { id: 10, status: "출원", date: "2020.11.06", number: "PCT/KR2020/015538", titleKo: "음용량 표시 시스템 및 방법", titleEn: "Drinking Amount Display System and Method, and Device Therefor", country: "PCT" },
];

/**
 * 공개 페이지에 노출할 특허 집계.
 *
 * 수치를 하드코딩하면 데이터와 갈라진다. 실제로 홈페이지는 33건,
 * homeStats는 36건으로 서로 달랐다. 여기서 한 번만 계산해 쓰면
 * /company/patents 목록과 항상 일치하고 표시광고 리스크가 없다.
 *
 * getPatents(src/lib/cms.ts)와 같은 기준으로 센다 — visible: false 는 제외.
 */
export function patentCounts() {
  const domestic = domesticPatents.filter((p) => p.visible !== false);
  return {
    /** 목록에 실제 표시되는 총 건수 (국내 + 국제 PCT) */
    total: domestic.length + internationalPatents.length,
    domestic: domestic.length,
    international: internationalPatents.length,
    /** 등록 완료된 국내 특허 */
    registered: domestic.filter((p) => p.status === "등록").length,
  };
}

export interface Patent {
  id: number;
  status: "등록" | "출원" | "공개";
  date: string;
  number: string;
  title: string;
  applicant: string;
  thumbnailUrl?: string;
  pageCount?: number;
  visible?: boolean;
  /**
   * 등록 직후라 Google Patents에 아직 색인되지 않은 특허.
   * 등록 특허는 기본적으로 원문에 직접 링크하는데, 색인 전이면 그 주소가 404다.
   * 이 플래그를 켜면 검색 링크로 대신 보낸다. 색인되면 플래그만 지우면 된다.
   * (확인: https://patents.google.com/patent/KR<등록번호 뒤 4자리 제거>B1/ko 가 200인가)
   */
  googlePatentsPending?: boolean;
}

export interface InternationalPatent {
  id: number;
  status: string;
  date: string;
  number: string;
  titleKo: string;
  titleEn: string;
  country: string;
  applicant: string;
  thumbnailUrl?: string;
}

export const domesticPatents: Patent[] = [
  { id: 1, status: "등록", date: "2022.12.06", number: "1024763030000", title: "복지관 실내 환경 관리 서버", applicant: "주식회사 나인와트", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/patents/thumbnails/%EB%B3%B5%EC%A7%80%EA%B4%80+%EC%8B%A4%EB%82%B4+%ED%99%98%EA%B2%BD+%EA%B4%80%EB%A6%AC+%EC%84%9C%EB%B2%84.jpg" , pageCount: 19 },
  { id: 2, status: "등록", date: "2021.12.08", number: "1023388910000", title: "전기 자동차 충전 시스템", applicant: "주식회사 나인와트", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/patents/thumbnails/%EC%A0%84%EA%B8%B0+%EC%9E%90%EB%8F%99%EC%B0%A8+%EC%B6%A9%EC%A0%84+%EC%8B%9C%EC%8A%A4%ED%85%9C_1.jpg" , pageCount: 20 },
  { id: 3, status: "등록", date: "2021.12.13", number: "1023403720000", title: "전기 자동차 충전 시스템", applicant: "주식회사 나인와트", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/patents/thumbnails/%EC%A0%84%EA%B8%B0+%EC%9E%90%EB%8F%99%EC%B0%A8+%EC%B6%A9%EC%A0%84+%EC%8B%9C%EC%8A%A4%ED%85%9C_2.jpg" , pageCount: 20 },
  { id: 4, status: "등록", date: "2022.12.06", number: "1024762990000", title: "복지관 실내 환경 관리 시스템", applicant: "주식회사 나인와트", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/patents/thumbnails/%EB%B3%B5%EC%A7%80%EA%B4%80+%EC%8B%A4%EB%82%B4+%ED%99%98%EA%B2%BD+%EA%B4%80%EB%A6%AC+%EC%8B%9C%EC%8A%A4%ED%85%9C.jpg" , pageCount: 20 },
  { id: 5, status: "등록", date: "2023.01.12", number: "1024895630000", title: "음용량 표시 시스템, 방법 및 이를 위한 장치", applicant: "주식회사 나인와트", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/patents/thumbnails/%EC%9D%8C%EC%9A%A9%EB%9F%89+%ED%91%9C%EC%8B%9C+%EC%8B%9C%EC%8A%A4%ED%85%9C%2C+%EB%B0%A9%EB%B2%95+%EB%B0%8F+%EC%9D%B4%EB%A5%BC+%EC%9C%84%ED%95%9C+%EC%9E%A5%EC%B9%98.jpg" , pageCount: 33 },
  { id: 6, status: "등록", date: "2025.04.18", number: "1027995770000", title: "주소지의 에너지 사용량에 대한 평가정보를 결정하는 방법 및 서버", applicant: "주식회사 나인와트", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/patents/thumbnails/%EC%A3%BC%EC%86%8C%EC%A7%80%EC%9D%98+%EC%97%90%EB%84%88%EC%A7%80+%EC%82%AC%EC%9A%A9%EB%9F%89%EC%97%90+%EB%8C%80%ED%95%9C+%ED%8F%89%EA%B0%80+%EC%A0%95%EB%B3%B4%EB%A5%BC+%EA%B2%B0%EC%A0%95%ED%95%98%EB%8A%94+%EB%B0%A9%EB%B2%95+%EB%B0%8F+%EC%84%9C%EB%B2%84.jpg" , pageCount: 18 },
  { id: 7, status: "등록", date: "2025.05.19", number: "1028115330000", title: "건물 에너지 분석 플랫폼의 정보검색증강기반 자연어 질의 응답 서비스를 제공하는 방법 및 시스템", applicant: "한국건설기술연구원, 주식회사 나인와트", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/patents/thumbnails/%EA%B1%B4%EB%AC%BC+%EC%97%90%EB%84%88%EC%A7%80+%EB%B6%84%EC%84%9D+%ED%94%8C%EB%9E%AB%ED%8F%BC%EC%9D%98+%EC%A0%95%EB%B3%B4%EA%B2%80%EC%83%89%EC%A6%9D%EA%B0%95+%EA%B8%B0%EB%B0%98+%EC%9E%90%EC%97%B0%EC%96%B4+%EC%A7%88%EC%9D%98%EC%9D%91%EB%8B%B5+%EC%84%9C%EB%B9%84%EC%8A%A4%EB%A5%BC+%EC%A0%9C%EA%B3%B5%ED%95%98%EB%8A%94+%EB%B0%A9%EB%B2%95+%EB%B0%8F+%EC%8B%9C%EC%8A%A4%ED%85%9C.jpg" , pageCount: 23 },
  { id: 8, status: "등록", date: "2025.04.18", number: "1027995560000", title: "발전 설비의 발전량을 예측하는 방법", applicant: "주식회사 나인와트", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/patents/thumbnails/%EB%B0%9C%EC%A0%84+%EC%84%A4%EB%B9%84%EC%9D%98+%EB%B0%9C%EC%A0%84%EB%9F%89%EC%9D%84+%EC%98%88%EC%B8%A1%ED%95%98%EB%8A%94+%EB%B0%A9%EB%B2%95.jpg" , pageCount: 23 },
  { id: 9, status: "등록", date: "2022.05.30", number: "1024052730000", title: "고령자에게 복지관의 환기 상태 알림을 제공하고, 복지관의 환경을 관리하기 위한 플랫폼", applicant: "주식회사 나인와트", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/patents/thumbnails/%EA%B3%A0%EB%A0%B9%EC%9E%90%EC%97%90%EA%B2%8C+%EB%B3%B5%EC%A7%80%EA%B4%80%EC%9D%98+%ED%99%98%EA%B8%B0+%EC%83%81%ED%83%9C+%EC%95%8C%EB%A6%BC%EC%9D%84+%EC%A0%9C%EA%B3%B5%ED%95%98%EA%B3%A0+%EB%B3%B5%EC%A7%80%EA%B4%80%EC%9D%98+%ED%99%98%EA%B2%BD%EC%9D%84+%EA%B4%80%EB%A6%AC%ED%95%98%EA%B8%B0+%EC%9C%84%ED%95%9C+%ED%94%8C%EB%9E%AB%ED%8F%BC.jpg" , pageCount: 21 },
  { id: 10, status: "등록", date: "2022.03.07", number: "1023733450000", title: "전기 자동차 충전 시스템", applicant: "주식회사 나인와트", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/patents/thumbnails/%EC%A0%84%EA%B8%B0+%EC%9E%90%EB%8F%99%EC%B0%A8+%EC%B6%A9%EC%A0%84+%EC%8B%9C%EC%8A%A4%ED%85%9C_3.jpg" , pageCount: 20 },
  { id: 11, status: "등록", date: "2025.06.13", number: "1028221400000", title: "인공지능 모델 기반 건물의 에너지 사용량 및 절약 방법 추론 솔루션 제공 방법, 장치 및 시스템", applicant: "주식회사 나인와트", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/patents/thumbnails/%EC%9D%B8%EA%B3%B5%EC%A7%80%EB%8A%A5+%EB%AA%A8%EB%8D%B8+%EA%B8%B0%EB%B0%98+%EA%B1%B4%EB%AC%BC%EC%9D%98+%EC%97%90%EB%84%88%EC%A7%80+%EC%82%AC%EC%9A%A9%EB%9F%89+%EB%B0%8F+%EC%A0%88%EC%95%BD+%EB%B0%A9%EB%B2%95+%EC%B6%94%EB%A1%A0+%EC%86%94%EB%A3%A8%EC%85%98+%EC%A0%9C%EA%B3%B5+%EB%B0%A9%EB%B2%95+%EC%9E%A5%EC%B9%98+%EB%B0%8F+%EC%8B%9C%EC%8A%A4%ED%85%9C.jpg" , pageCount: 37 },
  { id: 12, status: "등록", date: "2024.09.19", number: "1027088310000", title: "건물 에너지 모델링 자동화 시스템 및 이를 이용한 방법", applicant: "주식회사 나인와트", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/patents/thumbnails/%EA%B1%B4%EB%AC%BC+%EC%97%90%EB%84%88%EC%A7%80+%EB%AA%A8%EB%8D%B8%EB%A7%81+%EC%9E%90%EB%8F%99%ED%99%94+%EC%8B%9C%EC%8A%A4%ED%85%9C+%EB%B0%8F+%EC%9D%B4%EB%A5%BC+%EC%9D%B4%EC%9A%A9%ED%95%9C+%EB%B0%A9%EB%B2%95.jpg" , pageCount: 13 },
  { id: 13, status: "등록", date: "2024.09.19", number: "1027088340000", title: "에너지 효율화 대상 건물을 선정하는 서버 및 이를 위한 에너지 효율화 대상 건물 선정 방법", applicant: "주식회사 나인와트", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/patents/thumbnails/%EC%97%90%EB%84%88%EC%A7%80+%ED%9A%A8%EC%9C%A8%ED%99%94+%EB%8C%80%EC%83%81+%EA%B1%B4%EB%AC%BC%EC%9D%84+%EC%84%A0%EC%A0%95%ED%95%98%EB%8A%94+%EC%84%9C%EB%B2%84+%EB%B0%8F+%EC%9D%B4%EB%A5%BC+%EC%9D%B4%EC%9A%A9%ED%95%9C+%EC%97%90%EB%84%88%EC%A7%80+%ED%9A%A8%EC%9C%A8%ED%99%94+%EB%8C%80%EC%83%81+%EA%B1%B4%EB%AC%BC+%EC%84%A0%EC%A0%95+%EB%B0%A9%EB%B2%95.jpg" , pageCount: 13 },
  { id: 14, status: "등록", date: "2024.06.24", number: "1026791800000", title: "빌딩 에너지 데이터 기반 충전기 설치 장소 결정 방법 및 그 장치", applicant: "주식회사 나인와트", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/patents/thumbnails/%EB%B9%8C%EB%94%A9+%EC%97%90%EB%84%88%EC%A7%80+%EB%8D%B0%EC%9D%B4%ED%84%B0+%EA%B8%B0%EB%B0%98+%EC%B6%A9%EC%A0%84%EA%B8%B0+%EC%84%A4%EC%B9%98+%EC%9E%A5%EC%86%8C+%EA%B2%B0%EC%A0%95+%EB%B0%A9%EB%B2%95+%EB%B0%8F+%EA%B7%B8+%EC%9E%A5%EC%B9%98.jpg" , pageCount: 9 },
  { id: 15, status: "등록", date: "2023.11.13", number: "1026033240000", title: "스마트 미터를 이용한 블루투스 기반의 무선 원격 검침 시스템, 방법 및 이를 위한 장치", applicant: "한국에너지기술연구원, 주식회사 나인와트", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/patents/thumbnails/%EC%8A%A4%EB%A7%88%ED%8A%B8+%EB%AF%B8%ED%84%B0%EB%A5%BC+%EC%9D%B4%EC%9A%A9%ED%95%9C+%EB%B8%94%EB%A3%A8%ED%88%AC%EC%8A%A4+%EA%B8%B0%EB%B0%98%EC%9D%98+%EB%AC%B4%EC%84%A0+%EC%9B%90%EA%B2%A9+%EA%B2%80%EC%B9%A8+%EC%8B%9C%EC%8A%A4%ED%85%9C%2C+%EB%B0%A9%EB%B2%95+%EB%B0%8F+%EC%9D%B4%EB%A5%BC+%EC%9C%84%ED%95%9C+%EC%9E%A5%EC%B9%98.jpg" , pageCount: 15 },
  { id: 16, status: "등록", date: "2026.05.06", number: "1029628470000", title: "감응형 냉난방 제어시스템의 구동 방법", applicant: "주식회사 나인와트", googlePatentsPending: true, thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/patents/thumbnails/%EA%B0%90%EC%9D%91%ED%98%95+%EB%83%89%EB%82%9C%EB%B0%A9+%EC%A0%9C%EC%96%B4+%EC%8B%9C%EC%8A%A4%ED%85%9C%EC%9D%98+%EA%B5%AC%EB%8F%99+%EB%B0%A9%EB%B2%95.jpg" , pageCount: 13 },
  { id: 17, status: "출원", date: "2024.12.02", number: "1020240176906", title: "건물 쉐이프 모델링 생성 시스템 및 방법", applicant: "주식회사 나인와트", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/patents/thumbnails/%EA%B1%B4%EB%AC%BC+%EC%89%90%EC%9D%B4%ED%94%84+%EB%AA%A8%EB%8D%B8%EB%A7%81+%EC%83%9D%EC%84%B1+%EC%8B%9C%EC%8A%A4%ED%85%9C+%EB%B0%8F+%EB%B0%A9%EB%B2%95.jpg" , pageCount: 11 },
  /* 아래 6건은 2025년 하반기 출원으로, 특허청 공개(출원일+18개월) 전이라 웹에 감춘다.
     명세서 전문(49~66p)이 특허청 공개보다 먼저 노출되면 해외 출원 시 신규성 판단에
     영향이 갈 수 있다. 국내 출원 자체는 자기공지 예외로 보호되지만 PCT·개별국은 별개다.
     공개 예정일: 27.04.29 / 27.05.27 / 27.06.02(3건) / 27.06.05.
     그 시점 이후 visible 플래그를 지우면 목록과 patentCounts()에 자동 반영된다.
     최초 비공개 결정: 04e77f6 (2026-03-31) */
  { id: 18, status: "출원", date: "2025.10.29", number: "1020250159223", title: "RAG LLM 기반의 리트로핏 대상물의 에너지 운영 시뮬레이션 장치", applicant: "주식회사 나인와트", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/patents/thumbnails/RAG+LLM+%EA%B8%B0%EB%B0%98%EC%9D%98+%EB%A6%AC%ED%8A%B8%EB%A1%9C%ED%95%8F+%EB%8C%80%EC%83%81%EB%AC%BC%EC%9D%98+%EC%97%90%EB%84%88%EC%A7%80+%EC%9A%B4%EC%98%81+%EC%8B%9C%EB%AE%AC%EB%A0%88%EC%9D%B4%EC%85%98+%EC%9E%A5%EC%B9%98.jpg" , pageCount: 52, visible: false },
  { id: 19, status: "출원", date: "2025.12.02", number: "1020250187778", title: "공유형 에너지 저장 시스템의 용량 배분 방법 및 시스템", applicant: "주식회사 나인와트", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/patents/thumbnails/%EA%B3%B5%EC%9C%A0%ED%98%95+%EC%97%90%EB%84%88%EC%A7%80+%EC%A0%80%EC%9E%A5+%EC%8B%9C%EC%8A%A4%ED%85%9C%EC%9D%98+%EC%9A%A9%EB%9F%89+%EB%B0%B0%EB%B6%84+%EB%B0%A9%EB%B2%95+%EB%B0%8F+%EC%8B%9C%EC%8A%A4%ED%85%9C.jpg" , pageCount: 59, visible: false },
  { id: 20, status: "출원", date: "2025.11.27", number: "1020250183997", title: "공유형 에너지 저장 시스템의 운영 방법 및 시스템", applicant: "주식회사 나인와트", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/patents/thumbnails/%EA%B3%B5%EC%9C%A0%ED%98%95+%EC%97%90%EB%84%88%EC%A7%80+%EC%A0%80%EC%9E%A5+%EC%8B%9C%EC%8A%A4%ED%85%9C%EC%9D%98+%EC%9A%B4%EC%98%81+%EB%B0%A9%EB%B2%95+%EB%B0%8F+%EC%8B%9C%EC%8A%A4%ED%85%9C.jpg" , pageCount: 56, visible: false },
  { id: 21, status: "출원", date: "2025.12.05", number: "1020250190997", title: "모빌리티 허브 에너지 운영 장치 및 방법", applicant: "주식회사 나인와트", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/patents/thumbnails/%EB%AA%A8%EB%B9%8C%EB%A6%AC%ED%8B%B0+%ED%97%88%EB%B8%8C+%EC%97%90%EB%84%88%EC%A7%80+%EC%9A%B4%EC%98%81+%EC%9E%A5%EC%B9%98+%EB%B0%8F+%EB%B0%A9%EB%B2%95.jpg" , pageCount: 66, visible: false },
  { id: 22, status: "출원", date: "2025.12.02", number: "1020250187779", title: "전력 시계열 데이터 적응형 청킹 방법 및 장치", applicant: "주식회사 나인와트", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/patents/thumbnails/%EC%A0%84%EB%A0%A5+%EC%8B%9C%EA%B3%84%EC%97%B4+%EB%8D%B0%EC%9D%B4%ED%84%B0+%EC%A0%81%EC%9D%91%ED%98%95+%EC%B2%AD%ED%82%B9+%EB%B0%A9%EB%B2%95+%EB%B0%8F+%EC%9E%A5%EC%B9%98.jpg" , pageCount: 59, visible: false },
  { id: 23, status: "출원", date: "2025.12.02", number: "1020250187780", title: "전력 시스템 상황 기반 계층적 LLM 에이전트 라우팅 방법 및 장치", applicant: "주식회사 나인와트", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/patents/thumbnails/%EC%A0%84%EB%A0%A5+%EC%8B%9C%EC%8A%A4%ED%85%9C+%EC%83%81%ED%99%A9+%EA%B8%B0%EB%B0%98+%EA%B3%84%EC%B8%B5%EC%A0%81+LLM+%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8+%EB%9D%BC%EC%9A%B0%ED%8C%85+%EB%B0%A9%EB%B2%95+%EB%B0%8F+%EC%9E%A5%EC%B9%98.jpg" , pageCount: 49, visible: false },
  { id: 24, status: "공개", date: "2019.12.13", number: "1020190166870", title: "냉난방 제어 시스템", applicant: "주식회사 나인와트" },
  { id: 25, status: "공개", date: "2023.10.26", number: "1020230144966", title: "시설물 관리 시스템 및 이를 이용한 관리 방법", applicant: "주식회사 나인와트" },
  { id: 26, status: "공개", date: "2023.10.05", number: "1020230132755", title: "건물 에너지 데이터 관리 방법 및 장치", applicant: "주식회사 나인와트" },
  { id: 27, status: "공개", date: "2021.04.07", number: "1020210045425", title: "전력 관리 시스템", applicant: "주식회사 나인와트" },
  { id: 28, status: "공개", date: "2021.04.14", number: "1020210048402", title: "전기 자동차 충전 시스템", applicant: "주식회사 나인와트" },
  { id: 29, status: "공개", date: "2019.11.29", number: "1020190156627", title: "에너지 사용량 표시 시스템", applicant: "주식회사 나인와트" },
  { id: 30, status: "공개", date: "2020.09.23", number: "1020200122767", title: "정수기를 이용한 음용량 측정 시스템, 방법 및 이를 위한 장치", applicant: "주식회사 나인와트" },
  { id: 31, status: "공개", date: "2019.08.29", number: "1020190106579", title: "건물 에너지 관리 시스템", applicant: "주식회사 나인와트" },
  { id: 32, status: "공개", date: "2019.08.29", number: "1020190106576", title: "학교의 내실 정보 및 스케줄 정보에 기반한 전력 관리 시스템", applicant: "주식회사 나인와트" },
];

export const internationalPatents: InternationalPatent[] = [
  { id: 1, status: "출원", date: "2024.10.10", number: "PCT/KR2024/096301", titleKo: "빌딩 에너지 모델링을 위한 자동화 시스템 및 이를 이용하는 방법", titleEn: "Automation System for Building Energy Modeling, and Method Using Same", country: "PCT", applicant: "9WATT CO., LTD." },
  { id: 2, status: "출원", date: "2024.10.10", number: "PCT/KR2024/096299", titleKo: "이를 이용하는 빌딩 따른 에너지 효율 개선을 선택하기 위해 빌딩 따른 에너지 효율 개선과 방법을 선택하기 위한 서버", titleEn: "Server for Selecting Building Subject to Energy Efficiency Improvement and Method for Selecting Building Subject to Energy Efficiency Improvement Using Same", country: "PCT", applicant: "9WATT CO., LTD." },
  { id: 3, status: "출원", date: "2023.11.30", number: "PCT/KR2023/019606", titleKo: "장비 관리 시스템과 이를 이용하는 처리 방법", titleEn: "Equipment Management System and Management Method Using Same", country: "PCT", applicant: "9WATT CO., LTD." },
  { id: 4, status: "출원", date: "2023.12.01", number: "PCT/KR2023/019706", titleKo: "어드레스의 장소의 에너지 이용의 양 위의 평가 정보를 결정하기 위한 서버 및 방법", titleEn: "Method and Server for Determining Evaluation Information on Amount of Energy Use of Place of Address", country: "PCT", applicant: "9WATT CO., LTD." },
  { id: 5, status: "출원", date: "2024.01.10", number: "PCT/KR2024/000507", titleKo: "빌딩 에너지 모델링을 위한 자동화 시스템 및 이를 이용하는 방법", titleEn: "Automation System for Building Energy Modeling, and Method Using Same", country: "PCT", applicant: "9WATT CO., LTD." },
  { id: 6, status: "출원", date: "2020.10.08", number: "PCT/KR2020/013818", titleKo: "물 정제 장치 및 그 장치를 이용한 DRINKING 양 측정 시스템과 방법", titleEn: "Drinking Amount Measurement System and Method Using Water Purifier, and Device Therefor", country: "PCT", applicant: "9WATT CO., LTD." },
  { id: 7, status: "출원", date: "2019.10.18", number: "PCT/KR2019/013726", titleKo: "전기자동차 충전 시스템", titleEn: "Electric Vehicle Charging System", country: "PCT", applicant: "9WATT CO., LTD." },
  { id: 8, status: "출원", date: "2019.09.20", number: "PCT/KR2019/012188", titleKo: "빌딩 에너지 관리 시스템", titleEn: "Building Energy Management System", country: "PCT", applicant: "9WATT CO., LTD." },
  { id: 9, status: "출원", date: "2020.11.30", number: "PCT/KR2020/017224", titleKo: "스마트 계량기 및 그 장치를 이용한 블루투스 기반 무선 원격 미터 판독 시스템과 방법", titleEn: "Bluetooth-Based Wireless Remote Meter Reading System and Method Using Smart Meters, and Device Therefor", country: "PCT", applicant: "9WATT CO., LTD." },
  { id: 10, status: "출원", date: "2020.11.06", number: "PCT/KR2020/015538", titleKo: "DRINKING 양 표시 시스템과 방법 및 그 장치", titleEn: "Drinking Amount Display System and Method, and Device Therefor", country: "PCT", applicant: "9WATT CO., LTD." },
];

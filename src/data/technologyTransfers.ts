export interface PatentDetail {
  applicationNo: string;
  applicationDate: string;
  applicant: string;
  registrationNo: string;
  registrationDate: string;
  legalStatus: string;
  abstract: string;
}

export interface TechnologyTransfer {
  id: number;
  title: string;
  region: string;
  applicationNo: string;
  transferDate: string;
  registrationNo: string;
  transferType: string;
  institution: string;
  period: string;
  detail?: PatentDetail;
}

export const technologyTransfers: TechnologyTransfer[] = [
  {
    id: 1,
    title: "건물 에너지 데이터 검증 및 무결성 확보를 위한 전후처리 기술",
    region: "국내",
    applicationNo: "10-2022-0126960",
    transferDate: "2022.12.01",
    registrationNo: "",
    transferType: "기술이전 및 나인와트 출원인 변경",
    institution: "인천대학교산학협력단",
    period: "",
    detail: {
      applicationNo: "1020220126960",
      applicationDate: "2022.10.05",
      applicant: "인천대학교산학협력단",
      registrationNo: "",
      registrationDate: "",
      legalStatus: "출원",
      abstract: "",
    },
  },
  {
    id: 2,
    title: "지도기반 공간상태정보의 수집 및 가시화방법",
    region: "국내",
    applicationNo: "10-2018-0052360",
    transferDate: "2022.04.18",
    registrationNo: "10-2063552",
    transferType: "통상 실시권 양도",
    institution: "한국건설기술연구원",
    period: "",
    detail: {
      applicationNo: "1020180052360",
      applicationDate: "2018.05.08",
      applicant: "한국건설기술연구원",
      registrationNo: "1020635520000",
      registrationDate: "2020.01.09",
      legalStatus: "등록",
      abstract: "본 발명은 웹브라우저 상에서 건물의 2차원 폴리곤 데이터와 높이 데이터를 활용하여 3차원 모형을 구축하고, 웹상에서 건물 내 거주자 또는 시설물의 지도기반 위치정보를 수집하여 3차원으로 공간 상태 정보를 가시화하는 방법이다. 저비용으로 BIM 기법을 대체하면서 동시 다발적 공간 상태 정보 수집이 가능하다.",
    },
  },
  {
    id: 3,
    title: "제3자의 벤치마킹이 가능한 건축물 지도 플랫폼 시스템 및 이의 운용방법",
    region: "국내",
    applicationNo: "10-2019-0166336",
    transferDate: "2022.04.18",
    registrationNo: "10-2093316",
    transferType: "통상 실시권 아님",
    institution: "한국건설기술연구원",
    period: "",
    detail: {
      applicationNo: "1020190166336",
      applicationDate: "2019.12.13",
      applicant: "한국건설기술연구원",
      registrationNo: "1020933160000",
      registrationDate: "2020.03.25",
      legalStatus: "등록",
      abstract: "전용 어플리케이션을 사용하여 건물의 조사사항을 입력하면 서버로 전송되고, 분석모듈은 건물의 공간정보 별로 저장처리하며, 출력모듈은 건물 지도에 조사사항을 시각화하여 출력하는 시스템이다. 제3자가 자신의 건물과 다른 건물의 조사사항을 비교하는 벤치마킹이 가능하다.",
    },
  },
  {
    id: 4,
    title: "ESS 통합 관리 시스템과, 그 관리방법 및 전력공급 제어 방법",
    region: "국내",
    applicationNo: "10-2017-0070503",
    transferDate: "2024.12.24",
    registrationNo: "10-1910344",
    transferType: "기술사용 계약",
    institution: "한국동서발전",
    period: "",
    detail: {
      applicationNo: "1020170070503",
      applicationDate: "2017.06.07",
      applicant: "한국동서발전(주)",
      registrationNo: "1019103440000",
      registrationDate: "2018.10.23",
      legalStatus: "등록",
      abstract: "ESS 구축비용과 예상 전력요금 절감액을 이용하여 투자비 회수기간 및 배분비율을 결정하고, 회수기간 경과 후 수익금을 재배분하는 ESS 통합 관리 시스템 및 전력공급 제어방법이다.",
    },
  },
  {
    id: 5,
    title: "스마트 네임 플레이트 및 스마트 리드 태그를 이용한 설비안내장치",
    region: "국내",
    applicationNo: "10-2021-0024197",
    transferDate: "2024.12.26",
    registrationNo: "10-2549968",
    transferType: "기술사용 계약",
    institution: "한국중부발전",
    period: "2024.12.26~2027.12.25",
    detail: {
      applicationNo: "1020210024197",
      applicationDate: "2021.02.23",
      applicant: "한국중부발전(주)",
      registrationNo: "1025499680000",
      registrationDate: "2023.06.29",
      legalStatus: "등록",
      abstract: "점검 또는 보수가 요구되는 설비의 위치를 설비조작자에게 정확하게 안내하여 오판을 방지하는 장치이다. 길안내부, 스마트 리드 태그, 스마트 네임 플레이트, 단말기로 구성되어 인적 실수를 제거하고 안전사고를 예방한다.",
    },
  },
];

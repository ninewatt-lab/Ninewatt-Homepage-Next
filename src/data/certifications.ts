export interface Certification {
  id: number;
  name: string;
  issuer: string;
  thumbnailUrl?: string;
  /** "achievement" = 심사·평가·선정을 통해 취득한 인증, "registration" = 요건 충족 시 신청·등록으로 취득 */
  category: "achievement" | "registration";
}

export const certifications: Certification[] = [
  // ── 노력형 (achievement): 심사·평가·경쟁 선정 ──
  { id: 10, name: "GS-소프트웨어품질인증서(에너지맵)", issuer: "한국정보통신기술협회", category: "achievement", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/certifications/thumbnails/GS-%EC%86%8C%ED%94%84%ED%8A%B8%EC%9B%A8%EC%96%B4%ED%92%88%EC%A7%88%EC%9D%B8%EC%A6%9D%EC%84%9C_%EB%82%98%EC%9D%B8%EC%99%80%ED%8A%B8(%EA%B5%AD%EB%AC%B8).jpg" },
  { id: 18, name: "GS-소프트웨어품질인증서(공원시설물 관리시스템)", issuer: "KTR(한국화학융합시험연구원)", category: "achievement", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/certifications/thumbnails/%EA%B3%B5%EC%9B%90%EC%8B%9C%EC%84%A4%EB%AC%BC_%EA%B4%80%EB%A6%AC%EC%8B%9C%EC%8A%A4%ED%85%9C_GS%EC%9D%B8%EC%A6%9D%EC%84%9C.jpg" },
  { id: 19, name: "GS-소프트웨어품질인증서(그린플래너)", issuer: "KTR(한국화학융합시험연구원)", category: "achievement", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/certifications/thumbnails/%EA%B7%B8%EB%A6%B0%ED%94%8C%EB%9E%98%EB%84%88_APP_-_GS%EC%9D%B8%EC%A6%9D%EC%84%9C_(1%EB%93%B1%EA%B8%89).jpg" },
  { id: 20, name: "ISO 27001 정보보호 인증(그린플래너)", issuer: "-", category: "achievement", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/certifications/thumbnails/ISO_%EC%9D%B8%EC%A6%9D%EC%84%9C.jpg" },
  { id: 28, name: "ISO 9001 (품질경영시스템인증서)", issuer: "GIC", category: "achievement", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/certifications/thumbnails/ISO_%EC%9D%B8%EC%A6%9D%EC%84%9C_%EC%82%AC%EB%B3%B8.jpg" },
  { id: 29, name: "ISO 14001 (환경경영시스템인증서)", issuer: "GIC", category: "achievement", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/certifications/thumbnails/ISO_%EC%9D%B8%EC%A6%9D%EC%84%9C_%EC%82%AC%EB%B3%B8.jpg" },
  { id: 13, name: "클라우드 서비스 확인서", issuer: "클라우드서비스품질인증위원회", category: "achievement" },
  { id: 3, name: "벤처기업확인서", issuer: "벤처기업확인기관", category: "achievement" },
  { id: 9, name: "기업부설연구소인증서", issuer: "-", category: "achievement", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/certifications/thumbnails/%EA%B8%B0%EC%97%85%EB%B6%80%EC%84%A4%EC%97%B0%EA%B5%AC%EC%86%8C%EC%9D%B8%EC%A6%9D%EC%84%9C(250926)+1+1.jpg" },
  { id: 22, name: "메인비즈 확인서", issuer: "중소벤처기업부", category: "achievement", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/certifications/thumbnails/%EB%A9%94%EC%9D%B8%EB%B9%84%EC%A6%88+%EC%9D%B8%EC%A6%9D%EC%84%9C(250504)+2.jpg" },
  { id: 23, name: "이노비즈 확인서", issuer: "중소벤처기업부", category: "achievement", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/certifications/thumbnails/%EC%9D%B4%EB%85%B8%EB%B9%84%EC%A6%88+%EC%9D%B8%EC%A6%9D%EC%84%9C(250607)+2.jpg" },
  { id: 30, name: "지식재산경영인증", issuer: "지식재산처", category: "achievement", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/certifications/thumbnails/%EC%A7%80%EC%8B%9D%EC%9E%AC%EC%82%B0+%EA%B2%BD%EC%98%81%EC%9D%B8%EC%A6%9D+(2).jpg" },
  { id: 7, name: "예비사회적기업 지정서", issuer: "고용노동부", category: "achievement" },
  { id: 24, name: "가족친화인증서", issuer: "여성가족부", category: "achievement" },
  { id: 26, name: "근무혁신 우수기업 선정서", issuer: "고용노동부", category: "achievement" },
  { id: 8, name: "퍼스트펭귄형 창업기업 선정서", issuer: "신용보증기금", category: "achievement", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/certifications/thumbnails/10.%ED%8D%BC%EC%8A%A4%ED%8A%B8%ED%8E%AD%EA%B7%84%ED%98%95_%EC%B0%BD%EC%97%85%EA%B8%B0%EC%97%85_%EC%84%A0%EC%A0%95%EC%84%9C_(21.11.29).jpg" },
  { id: 11, name: "그린뉴딜 유망기업 100 선정서", issuer: "중소벤처기업부", category: "achievement", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/certifications/thumbnails/%EA%B7%B8%EB%A6%B0%EB%89%B4%EB%94%9C_%EC%9C%A0%EB%A7%9D%EA%B8%B0%EC%97%85_100_%EC%84%A0%EC%A0%95%EC%84%9C.jpg" },
  { id: 14, name: "KEPCO TRUSTED PARTNER 인증서", issuer: "한국전력공사", category: "achievement", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/certifications/thumbnails/KEPCO_%EC%9D%B8%EC%A6%9D%EC%84%9C.jpg" },
  { id: 17, name: "KEPCO 혁신 에너지 스타트업 인증", issuer: "한국전력공사", category: "achievement", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/certifications/thumbnails/KEPCO_%ED%98%81%EC%8B%A0_%EC%97%90%EB%84%88%EC%A7%80_%EC%8A%A4%ED%83%80%ED%8A%B8%EC%97%85_%EC%9D%B8%EC%A6%9D%EC%84%9C.jpg" },
  { id: 21, name: "인천 혁신기업 100(기업성장센터)", issuer: "ITP 인천테크노파크", category: "achievement", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/certifications/thumbnails/%EC%9D%B8%EC%B2%9C_%ED%98%81%EC%8B%A0%EA%B8%B0%EC%97%85100(%EA%B8%B0%EC%97%85%EC%84%B1%EC%9E%A5%EC%84%BC%ED%84%B0).jpg" },

  // ── 신청형 (registration): 요건 충족 시 신청·등록 ──
  { id: 1, name: "중소기업확인서", issuer: "중소벤처기업부", category: "registration", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/certifications/thumbnails/%EC%A4%91%EC%86%8C%EA%B8%B0%EC%97%85%ED%99%95%EC%9D%B8%EC%84%9C%EC%9E%85%EC%B0%B0%EC%99%B8%EC%9A%A9%EB%8F%84+6.jpg" },
  { id: 2, name: "창업기업확인서", issuer: "중소벤처기업부", category: "registration" },
  { id: 4, name: "소프트웨어사업자 일반 현황 관리 확인서", issuer: "한국소프트웨어산업협회", category: "registration", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/certifications/thumbnails/%EC%86%8C%ED%94%84%ED%8A%B8%EC%9B%A8%EC%96%B4%EC%82%AC%EC%97%85%EC%9E%90_%EC%9D%BC%EB%B0%98_%ED%98%84%ED%99%A9_%EA%B4%80%EB%A6%AC%ED%99%95%EC%9D%B8%EC%84%9C.jpg" },
  { id: 5, name: "그린리모델링 사업자등록증", issuer: "국토안전관리원 그린리모델링 창조센터", category: "registration", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/certifications/thumbnails/%EA%B7%B8%EB%A6%B0%EB%A6%AC%EB%AA%A8%EB%8D%B8%EB%A7%81_%EC%82%AC%EC%97%85%EC%9E%90%EB%93%B1%EB%A1%9D%EC%A6%9D.jpg" },
  { id: 6, name: "연구개발서비스업 신고증", issuer: "과학기술정보통신부", category: "registration", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/certifications/thumbnails/7.%EC%97%B0%EA%B5%AC%EA%B0%9C%EB%B0%9C%EC%84%9C%EB%B9%84%EC%8A%A4%EC%97%85_%EC%8B%A0%EA%B3%A0%EC%A6%9D(21.01.22).jpg" },
  { id: 12, name: "한국연구개발서비스협회 회원증", issuer: "한국연구개발서비스협회", category: "registration", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/certifications/thumbnails/8.%ED%95%9C%EA%B5%AD%EC%97%B0%EA%B5%AC%EA%B0%9C%EB%B0%9C%EC%84%9C%EB%B9%84%EC%8A%A4%ED%98%91%ED%9A%8C%ED%9A%8C%EC%9B%90%EC%A6%9D(21.01.25).jpg" },
  { id: 15, name: "공원시설물 관리시스템 v1.0 저작권등록증", issuer: "한국저작권위원회", category: "registration" },
  { id: 16, name: "무역협회 회원증", issuer: "한국무역협회", category: "registration", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/certifications/thumbnails/%EB%AC%B4%EC%97%AD%ED%98%91%ED%9A%8C_%ED%9A%8C%EC%9B%90%EC%A6%9D_%EB%82%98%EC%9D%B8%EC%99%80%ED%8A%B8.jpg" },
  { id: 25, name: "성과공유기업 확인서", issuer: "중소벤처기업부", category: "registration" },
  { id: 27, name: "학습중심 현장실습 선도기업 확인서", issuer: "대전교육청", category: "registration" },
];

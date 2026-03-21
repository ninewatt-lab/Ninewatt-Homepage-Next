export interface Trademark {
  id: number;
  name: string;
  status: "등록" | "출원";
  date: string;
  number: string;
  applicant: string;
  country: string;
  thumbnailUrl?: string;
}

export const trademarks: Trademark[] = [
  { id: 1, name: "그린플래너", status: "등록", date: "2025.10.24", number: "4020240110870", applicant: "주식회사 나인와트", country: "국내", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/trademarks/thumbnails/4020240110870.jpg" },
  { id: 2, name: "그린플래너", status: "등록", date: "2025.10.24", number: "4020240110892", applicant: "주식회사 나인와트", country: "국내", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/trademarks/thumbnails/4020240110892.jpg" },
  { id: 3, name: "그린플래너", status: "등록", date: "2025.10.24", number: "4020240112767", applicant: "주식회사 나인와트", country: "국내", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/trademarks/thumbnails/4020240112767.jpg" },
  { id: 4, name: "그린플래너", status: "등록", date: "2025.10.24", number: "4020240110877", applicant: "주식회사 나인와트", country: "국내", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/trademarks/thumbnails/4020240110877.jpg" },
  { id: 5, name: "그린플래너", status: "등록", date: "2025.10.24", number: "4020240110866", applicant: "주식회사 나인와트", country: "국내", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/trademarks/thumbnails/4020240110866.jpg" },
  { id: 6, name: "그린플래너", status: "등록", date: "2025.10.24", number: "4020240110884", applicant: "주식회사 나인와트", country: "국내", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/trademarks/thumbnails/4020240110884.jpg" },
  { id: 7, name: "Ninewatt", status: "등록", date: "2020.09.11", number: "4020190134174", applicant: "주식회사 나인와트", country: "국내", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/trademarks/thumbnails/4020190134174.jpg" },
  { id: 8, name: "RE:park", status: "등록", date: "2024.12.27", number: "4020230182979", applicant: "주식회사 나인와트", country: "국내", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/trademarks/thumbnails/4020230182979.jpg" },
  { id: 9, name: "RE:park", status: "등록", date: "2024.10.04", number: "4020230182979", applicant: "주식회사 나인와트", country: "국내", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/trademarks/thumbnails/4020230182979.jpg" },
  { id: 10, name: "RE:park", status: "등록", date: "2024.10.04", number: "4020230182975", applicant: "주식회사 나인와트", country: "국내", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/trademarks/thumbnails/4020230182975.jpg" },
  { id: 11, name: "WATTI", status: "등록", date: "2022.08.31", number: "4020220030021", applicant: "주식회사 나인와트", country: "국내", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/trademarks/thumbnails/4020220030021.jpg" },
  { id: 12, name: "WATTI", status: "등록", date: "2022.08.31", number: "4020220030020", applicant: "주식회사 나인와트", country: "국내", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/trademarks/thumbnails/4020220030020.jpg" },
  { id: 13, name: "WATTI", status: "등록", date: "2022.08.31", number: "4020220030019", applicant: "주식회사 나인와트", country: "국내", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/trademarks/thumbnails/4020220030019.jpg" },
  { id: 14, name: "Opti", status: "출원", date: "2025.11.20", number: "-", applicant: "주식회사 나인와트", country: "미국", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/trademarks/thumbnails/%5B%EC%83%81%ED%91%9C%EC%95%A4%EB%8D%94%EC%8B%9C%ED%8B%B0%5D%5BOT25151US%5D%EB%AF%B8%EA%B5%AD%EC%B6%9C%EC%9B%90%EC%84%9C%EB%A5%98.jpg" },
  { id: 15, name: "Opti", status: "출원", date: "2025.11.25", number: "-", applicant: "주식회사 나인와트", country: "일본", thumbnailUrl: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/trademarks/thumbnails/%5B%EC%83%81%ED%91%9C%EC%95%A4%EB%8D%94%EC%8B%9C%ED%8B%B0%5D%5BOT25152JP%5D%EC%9D%BC%EB%B3%B8%EC%B6%9C%EC%9B%90%EC%84%9C%EB%A5%98.jpg" },
];

import { patentCounts } from "./patents";

export const homeStats = {
  stats: [
    { value: "2019", label: "설립" },
    { value: "30+", label: "직원 수" },
    { value: "60+", label: "프로젝트" },
    { value: "96.81%", label: "매출 성장률" },
    // 챗봇 지식베이스가 이 값을 읽는다. patents.ts 집계와 어긋나지 않게 유지할 것.
    { value: `${patentCounts().total}건`, label: "특허 보유" },
  ],
};

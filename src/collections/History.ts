import type { CollectionConfig } from "payload";

export const History: CollectionConfig = {
  slug: "history",
  labels: {
    singular: "연혁",
    plural: "회사 연혁",
  },
  admin: {
    useAsTitle: "content",
    defaultColumns: ["date", "content", "year"],
    group: "회사 정보",
    description: "회사 연혁을 관리합니다. 날짜순으로 회사 연혁 페이지에 표시됩니다.",
  },
  fields: [
    {
      name: "date",
      type: "text",
      required: true,
      label: "날짜",
      admin: {
        description: "YYYY.MM 형식으로 입력하세요",
        placeholder: "2024.03",
      },
    },
    {
      name: "content",
      type: "text",
      required: true,
      localized: true,
      label: "내용",
      admin: {
        description: "연혁 내용을 간략하게 입력하세요",
        placeholder: "나인와트 법인 설립",
      },
    },
    {
      name: "year",
      type: "number",
      required: true,
      label: "연도",
      index: true,
      admin: {
        description: "연도 4자리 숫자. 연도별 그룹핑에 사용됩니다.",
        placeholder: "2024",
      },
    },
  ],
  access: {
    read: () => true,
  },
};

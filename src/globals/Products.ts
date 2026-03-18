import type { GlobalConfig } from "payload";

export const Products: GlobalConfig = {
  slug: "products",
  label: "제품 정보",
  admin: {
    group: "홈페이지",
    description:
      "각 제품의 외부 서비스 URL을 관리합니다. URL이 입력된 제품만 '서비스 바로가기' 버튼이 표시됩니다.",
  },
  fields: [
    {
      name: "items",
      type: "array",
      label: "제품 목록",
      admin: {
        components: {
          RowLabel: "@/components/admin/RowLabels#ProductRowLabel",
        },
      },
      fields: [
        {
          name: "slug",
          type: "select",
          required: true,
          label: "제품",
          options: [
            { label: "Opti", value: "opti" },
            { label: "GreenPlanner", value: "greenplanner" },
            { label: "Watti", value: "watti" },
            { label: "Save-E", value: "save-e" },
            { label: "RE:park", value: "repark" },
            { label: "SolarScope", value: "solar-site" },
            { label: "PV Intelligence", value: "pv-intelligence" },
          ],
          admin: {
            description: "제품을 선택하세요",
          },
        },
        {
          name: "serviceUrl",
          type: "text",
          label: "서비스 URL",
          admin: {
            description: "외부 서비스 링크 (예: https://opti-bi.com). 비워두면 버튼이 표시되지 않습니다.",
            placeholder: "https://",
          },
        },
      ],
    },
  ],
  access: {
    read: () => true,
  },
};

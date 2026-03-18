import type { CollectionConfig } from "payload";

export const Partners: CollectionConfig = {
  slug: "partners",
  labels: {
    singular: "파트너",
    plural: "파트너 목록",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "category", "sortOrder"],
    group: "사업",
    description:
      "파트너/고객사를 관리합니다. 카테고리별로 파트너 섹션에 표시됩니다.",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "파트너명",
      admin: {
        description: "파트너/고객사 이름",
        placeholder: "한국전력공사",
      },
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      label: "로고",
      admin: {
        description: "파트너 로고 이미지 (권장: 가로 200px 이상, PNG/SVG 형식)",
      },
    },
    {
      name: "category",
      type: "select",
      required: true,
      label: "카테고리",
      options: [
        { label: "정부/공공기관", value: "government" },
        { label: "민간기업", value: "private" },
        { label: "해외", value: "international" },
      ],
      admin: {
        description: "파트너 유형을 선택하세요",
      },
    },
    {
      name: "sortOrder",
      type: "number",
      label: "정렬순서",
      defaultValue: 0,
      admin: {
        description: "숫자가 작을수록 먼저 표시됩니다 (기본값: 0)",
      },
    },
  ],
  access: {
    read: () => true,
  },
};

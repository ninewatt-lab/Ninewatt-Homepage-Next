import type { CollectionConfig } from "payload";

export const Awards: CollectionConfig = {
  slug: "awards",
  labels: {
    singular: "수상",
    plural: "수상 실적",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "organization", "grade", "year"],
    group: "실적",
    description: "수상 실적을 관리합니다. 홈페이지 수상 섹션에 표시됩니다.",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "수상명",
      admin: {
        description: "수상 명칭을 입력하세요",
        placeholder: "제21회 대한민국 기술대상",
      },
    },
    {
      name: "organization",
      type: "text",
      required: true,
      label: "주관기관",
      admin: {
        description: "수상 주관 기관명",
        placeholder: "과학기술정보통신부",
      },
    },
    {
      name: "grade",
      type: "text",
      required: true,
      label: "등급",
      admin: {
        description: "수상 등급",
        placeholder: "장관상",
      },
    },
    {
      name: "date",
      type: "text",
      required: true,
      label: "수상일",
      admin: {
        description: "수상일을 입력하세요",
        placeholder: "2024.03.15",
      },
    },
    {
      name: "year",
      type: "number",
      required: true,
      label: "연도",
      index: true,
      admin: {
        description: "수상 연도 4자리 숫자. 연도별 정렬에 사용됩니다.",
        placeholder: "2024",
      },
    },
  ],
  access: {
    read: () => true,
  },
};

import type { CollectionConfig } from "payload";

export const Patents: CollectionConfig = {
  slug: "patents",
  labels: {
    singular: "특허",
    plural: "특허/지재권",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "type", "status", "date"],
    group: "실적",
    description: "특허 및 지적재산권 정보를 관리합니다.",
  },
  fields: [
    {
      name: "type",
      type: "select",
      required: true,
      label: "구분",
      options: [
        { label: "국내", value: "domestic" },
        { label: "국제", value: "international" },
      ],
      defaultValue: "domestic",
      admin: {
        description: "국내 또는 국제 특허 구분",
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      label: "상태",
      options: [
        { label: "등록", value: "등록" },
        { label: "출원", value: "출원" },
      ],
      admin: {
        description: "특허 등록 완료 또는 출원 중 상태",
      },
    },
    {
      name: "date",
      type: "text",
      required: true,
      label: "등록/출원일",
      admin: {
        description: "등록일 또는 출원일",
        placeholder: "2024.03.15",
      },
    },
    {
      name: "number",
      type: "text",
      required: true,
      label: "등록/출원번호",
      admin: {
        description: "특허 등록번호 또는 출원번호",
        placeholder: "10-2024-0012345",
      },
    },
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
      label: "특허명",
      admin: {
        description: "특허 발명의 명칭",
        placeholder: "에너지 관리 시스템 및 방법",
      },
    },
    {
      name: "applicant",
      type: "text",
      label: "출원인",
      admin: {
        description: "특허 출원인",
        placeholder: "주식회사 나인와트",
      },
    },
    {
      name: "country",
      type: "text",
      label: "국가",
      admin: {
        description: "국제 특허의 출원 국가 (구분이 '국제'일 때만 표시됩니다)",
        placeholder: "US",
        condition: (data) => data?.type === "international",
      },
    },
  ],
  access: {
    read: () => true,
  },
};

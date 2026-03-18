import type { CollectionConfig } from "payload";

export const Certifications: CollectionConfig = {
  slug: "certifications",
  labels: {
    singular: "인증",
    plural: "인증 현황",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "issuer", "sortOrder"],
    group: "실적",
    description: "인증 현황을 관리합니다. 홈페이지 인증 섹션에 표시됩니다.",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "인증명",
      admin: {
        description: "인증 명칭",
        placeholder: "ISO 9001",
      },
    },
    {
      name: "issuer",
      type: "text",
      required: true,
      label: "발급기관",
      admin: {
        description: "인증 발급 기관명",
        placeholder: "한국인정지원센터",
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

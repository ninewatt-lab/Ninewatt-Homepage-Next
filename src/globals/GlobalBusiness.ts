import type { GlobalConfig } from "payload";

export const GlobalBusiness: GlobalConfig = {
  slug: "global-business",
  label: "글로벌 사업",
  admin: {
    group: "사업",
    description: "글로벌 사업 정보를 국가별로 관리합니다.",
  },
  fields: [
    {
      name: "countries",
      type: "array",
      label: "국가 목록",
      admin: {
        description: "글로벌 사업을 진행 중인 국가를 추가하세요",
        components: {
          RowLabel: "@/components/admin/RowLabels#CountryRowLabel",
        },
      },
      fields: [
        {
          name: "country",
          type: "text",
          required: true,
          localized: true,
          label: "국가명",
          admin: {
            placeholder: "미국",
          },
        },
        {
          name: "flag",
          type: "text",
          required: true,
          label: "국가코드",
          admin: {
            description: "ISO 국가코드 소문자 2자리",
            placeholder: "us",
          },
        },
        {
          name: "items",
          type: "array",
          label: "사업 항목",
          admin: {
            description: "해당 국가에서의 사업 내용을 추가하세요",
            components: {
              RowLabel: "@/components/admin/RowLabels#BusinessItemRowLabel",
            },
          },
          fields: [
            {
              name: "text",
              type: "text",
              required: true,
              localized: true,
              label: "내용",
            },
          ],
        },
      ],
    },
  ],
  access: {
    read: () => true,
  },
};

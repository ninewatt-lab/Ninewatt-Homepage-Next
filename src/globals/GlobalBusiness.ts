import type { GlobalConfig } from "payload";

export const GlobalBusiness: GlobalConfig = {
  slug: "global-business",
  label: "글로벌 사업",
  fields: [
    {
      name: "countries",
      type: "array",
      label: "국가 목록",
      fields: [
        {
          name: "country",
          type: "text",
          required: true,
          localized: true,
          label: "국가명",
        },
        {
          name: "flag",
          type: "text",
          required: true,
          label: "국가코드",
        },
        {
          name: "items",
          type: "array",
          label: "사업 항목",
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

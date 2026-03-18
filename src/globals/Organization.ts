import type { GlobalConfig } from "payload";

export const Organization: GlobalConfig = {
  slug: "organization",
  label: "조직 구조",
  fields: [
    {
      name: "departments",
      type: "array",
      label: "부서 목록",
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
          localized: true,
          label: "부서명",
        },
        {
          name: "description",
          type: "textarea",
          localized: true,
          label: "설명",
        },
      ],
    },
  ],
  access: {
    read: () => true,
  },
};

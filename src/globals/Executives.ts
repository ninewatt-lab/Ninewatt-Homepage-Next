import type { GlobalConfig } from "payload";

export const Executives: GlobalConfig = {
  slug: "executives",
  label: "경영진",
  fields: [
    {
      name: "members",
      type: "array",
      label: "경영진 목록",
      fields: [
        {
          name: "role",
          type: "text",
          required: true,
          localized: true,
          label: "직책",
        },
        {
          name: "name",
          type: "text",
          required: true,
          localized: true,
          label: "이름",
        },
        {
          name: "team",
          type: "text",
          localized: true,
          label: "소속",
        },
        {
          name: "description",
          type: "textarea",
          localized: true,
          label: "소개",
        },
        {
          name: "details",
          type: "array",
          localized: true,
          label: "경력/이력",
          fields: [
            {
              name: "item",
              type: "text",
            },
          ],
        },
        {
          name: "photo",
          type: "upload",
          relationTo: "media",
          label: "사진",
        },
      ],
    },
  ],
  access: {
    read: () => true,
  },
};

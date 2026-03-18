import type { GlobalConfig } from "payload";

export const HomeStats: GlobalConfig = {
  slug: "home-stats",
  label: "홈 통계",
  fields: [
    {
      name: "stats",
      type: "array",
      label: "통계 항목",
      minRows: 1,
      maxRows: 10,
      fields: [
        {
          name: "value",
          type: "text",
          required: true,
          label: "값",
        },
        {
          name: "label",
          type: "text",
          required: true,
          localized: true,
          label: "라벨",
        },
      ],
    },
  ],
  access: {
    read: () => true,
  },
};

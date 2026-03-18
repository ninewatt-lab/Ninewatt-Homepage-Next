import type { CollectionConfig } from "payload";

export const History: CollectionConfig = {
  slug: "history",
  admin: {
    useAsTitle: "content",
    defaultColumns: ["date", "content", "year"],
  },
  fields: [
    {
      name: "date",
      type: "text",
      required: true,
      label: "날짜",
    },
    {
      name: "content",
      type: "text",
      required: true,
      localized: true,
      label: "내용",
    },
    {
      name: "year",
      type: "number",
      required: true,
      label: "연도",
      index: true,
    },
  ],
  access: {
    read: () => true,
  },
};

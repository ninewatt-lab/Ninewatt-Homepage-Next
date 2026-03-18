import type { CollectionConfig } from "payload";

export const Awards: CollectionConfig = {
  slug: "awards",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "organization", "grade", "year"],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "수상명",
    },
    {
      name: "organization",
      type: "text",
      required: true,
      label: "주관기관",
    },
    {
      name: "grade",
      type: "text",
      required: true,
      label: "등급",
    },
    {
      name: "date",
      type: "text",
      required: true,
      label: "수상일",
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

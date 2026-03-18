import type { CollectionConfig } from "payload";

export const Partners: CollectionConfig = {
  slug: "partners",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "category", "sortOrder"],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "파트너명",
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      label: "로고",
    },
    {
      name: "category",
      type: "select",
      required: true,
      label: "카테고리",
      options: [
        { label: "정부/공공기관", value: "government" },
        { label: "민간기업", value: "private" },
        { label: "해외", value: "international" },
      ],
    },
    {
      name: "sortOrder",
      type: "number",
      label: "정렬순서",
      defaultValue: 0,
    },
  ],
  access: {
    read: () => true,
  },
};

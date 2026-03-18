import type { CollectionConfig } from "payload";

export const Certifications: CollectionConfig = {
  slug: "certifications",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "issuer", "sortOrder"],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "인증명",
    },
    {
      name: "issuer",
      type: "text",
      required: true,
      label: "발급기관",
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

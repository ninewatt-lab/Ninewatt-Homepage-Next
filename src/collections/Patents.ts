import type { CollectionConfig } from "payload";

export const Patents: CollectionConfig = {
  slug: "patents",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "type", "status", "date"],
  },
  fields: [
    {
      name: "type",
      type: "select",
      required: true,
      label: "구분",
      options: [
        { label: "국내", value: "domestic" },
        { label: "국제", value: "international" },
      ],
      defaultValue: "domestic",
    },
    {
      name: "status",
      type: "select",
      required: true,
      label: "상태",
      options: [
        { label: "등록", value: "등록" },
        { label: "출원", value: "출원" },
      ],
    },
    {
      name: "date",
      type: "text",
      required: true,
      label: "등록/출원일",
    },
    {
      name: "number",
      type: "text",
      required: true,
      label: "등록/출원번호",
    },
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
      label: "특허명",
    },
    {
      name: "applicant",
      type: "text",
      label: "출원인",
    },
    {
      name: "country",
      type: "text",
      label: "국가",
      admin: {
        condition: (data) => data?.type === "international",
      },
    },
  ],
  access: {
    read: () => true,
  },
};

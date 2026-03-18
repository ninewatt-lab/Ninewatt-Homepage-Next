import type { CollectionConfig } from "payload";

export const RndProjects: CollectionConfig = {
  slug: "rnd-projects",
  admin: {
    useAsTitle: "research",
    defaultColumns: ["research", "agency", "status", "period"],
  },
  labels: {
    singular: "R&D 과제",
    plural: "R&D 과제",
  },
  fields: [
    {
      name: "agency",
      type: "text",
      required: true,
      label: "수행기관",
    },
    {
      name: "research",
      type: "text",
      required: true,
      localized: true,
      label: "과제명",
    },
    {
      name: "lead",
      type: "text",
      required: true,
      label: "주관기관",
    },
    {
      name: "period",
      type: "text",
      required: true,
      label: "수행기간",
    },
    {
      name: "status",
      type: "select",
      required: true,
      label: "상태",
      options: [
        { label: "수행중", value: "수행중" },
        { label: "완료", value: "완료" },
      ],
    },
    {
      name: "detail",
      type: "group",
      label: "상세정보",
      fields: [
        {
          name: "goal",
          type: "textarea",
          localized: true,
          label: "목표",
        },
        {
          name: "contents",
          type: "array",
          label: "연구내용",
          fields: [
            {
              name: "item",
              type: "text",
              localized: true,
            },
          ],
        },
        {
          name: "budget",
          type: "text",
          label: "예산",
        },
        {
          name: "department",
          type: "text",
          label: "담당부서",
        },
        {
          name: "category",
          type: "text",
          label: "분류",
        },
      ],
    },
  ],
  access: {
    read: () => true,
  },
};

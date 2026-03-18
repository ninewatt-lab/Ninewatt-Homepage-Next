import type { GlobalConfig } from "payload";

export const Career: GlobalConfig = {
  slug: "career",
  label: "채용 정보",
  fields: [
    {
      name: "cultureTitle",
      type: "text",
      localized: true,
      label: "문화 제목",
    },
    {
      name: "cultureDesc",
      type: "textarea",
      localized: true,
      label: "문화 설명",
    },
    {
      name: "talentTitle",
      type: "text",
      localized: true,
      label: "인재상 제목",
    },
    {
      name: "talentSubtitle",
      type: "text",
      localized: true,
      label: "인재상 부제",
    },
    {
      name: "values",
      type: "array",
      label: "인재상 가치",
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          localized: true,
          label: "제목",
        },
        {
          name: "desc",
          type: "textarea",
          localized: true,
          label: "설명",
        },
      ],
    },
    {
      name: "benefitCategories",
      type: "array",
      label: "복리후생 카테고리",
      fields: [
        {
          name: "category",
          type: "text",
          required: true,
          localized: true,
          label: "카테고리명",
        },
        {
          name: "items",
          type: "array",
          label: "항목",
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              localized: true,
              label: "제목",
            },
            {
              name: "desc",
              type: "text",
              localized: true,
              label: "설명",
            },
          ],
        },
      ],
    },
    {
      name: "steps",
      type: "array",
      label: "채용 프로세스",
      fields: [
        {
          name: "step",
          type: "text",
          required: true,
          label: "단계",
        },
        {
          name: "title",
          type: "text",
          required: true,
          localized: true,
          label: "제목",
        },
        {
          name: "desc",
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

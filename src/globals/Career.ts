import type { GlobalConfig } from "payload";

export const Career: GlobalConfig = {
  slug: "career",
  label: "채용 정보",
  admin: {
    group: "채용",
    description:
      "채용 페이지의 문화, 인재상, 복리후생, 채용 프로세스 정보를 관리합니다.",
  },
  fields: [
    {
      name: "cultureTitle",
      type: "text",
      localized: true,
      label: "문화 제목",
      admin: {
        description: "조직 문화 섹션 제목",
        placeholder: "나인와트의 문화",
      },
    },
    {
      name: "cultureDesc",
      type: "textarea",
      localized: true,
      label: "문화 설명",
      admin: {
        description: "조직 문화를 설명하는 본문 내용",
      },
    },
    {
      name: "talentTitle",
      type: "text",
      localized: true,
      label: "인재상 제목",
      admin: {
        description: "인재상 섹션 제목",
      },
    },
    {
      name: "talentSubtitle",
      type: "text",
      localized: true,
      label: "인재상 부제",
      admin: {
        description: "인재상 섹션 부제목",
      },
    },
    {
      name: "values",
      type: "array",
      label: "인재상 가치",
      admin: {
        description: "인재상의 핵심 가치를 추가하세요",
        components: {
          RowLabel: "@/components/admin/RowLabels#ValueRowLabel",
        },
      },
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          localized: true,
          label: "제목",
          admin: {
            placeholder: "도전정신",
          },
        },
        {
          name: "desc",
          type: "textarea",
          localized: true,
          label: "설명",
          admin: {
            description: "해당 가치에 대한 설명",
          },
        },
      ],
    },
    {
      name: "benefitCategories",
      type: "array",
      label: "복리후생 카테고리",
      admin: {
        description: "복리후생 카테고리를 추가하세요",
        components: {
          RowLabel: "@/components/admin/RowLabels#BenefitCategoryRowLabel",
        },
      },
      fields: [
        {
          name: "category",
          type: "text",
          required: true,
          localized: true,
          label: "카테고리명",
          admin: {
            placeholder: "근무환경",
          },
        },
        {
          name: "items",
          type: "array",
          label: "항목",
          admin: {
            description: "해당 카테고리의 복리후생 항목을 추가하세요",
            components: {
              RowLabel: "@/components/admin/RowLabels#BenefitItemRowLabel",
            },
          },
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              localized: true,
              label: "제목",
              admin: {
                placeholder: "유연근무제",
              },
            },
            {
              name: "desc",
              type: "text",
              localized: true,
              label: "설명",
              admin: {
                description: "항목 상세 설명",
              },
            },
          ],
        },
      ],
    },
    {
      name: "steps",
      type: "array",
      label: "채용 프로세스",
      admin: {
        description: "채용 프로세스 단계를 순서대로 추가하세요",
        components: {
          RowLabel: "@/components/admin/RowLabels#StepRowLabel",
        },
      },
      fields: [
        {
          name: "step",
          type: "text",
          required: true,
          label: "단계",
          admin: {
            description: "단계 번호",
            placeholder: "01",
          },
        },
        {
          name: "title",
          type: "text",
          required: true,
          localized: true,
          label: "제목",
          admin: {
            placeholder: "서류전형",
          },
        },
        {
          name: "desc",
          type: "textarea",
          localized: true,
          label: "설명",
          admin: {
            description: "해당 단계 설명",
          },
        },
      ],
    },
  ],
  access: {
    read: () => true,
  },
};

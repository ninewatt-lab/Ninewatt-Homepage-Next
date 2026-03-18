import type { GlobalConfig } from "payload";

export const Organization: GlobalConfig = {
  slug: "organization",
  label: "조직 구조",
  admin: {
    group: "회사 정보",
    description: "조직 구조와 부서 정보를 관리합니다.",
  },
  fields: [
    {
      name: "departments",
      type: "array",
      label: "부서 목록",
      admin: {
        description: "부서를 순서대로 추가하세요",
        components: {
          RowLabel: "@/components/admin/RowLabels#DepartmentRowLabel",
        },
      },
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
          localized: true,
          label: "부서명",
          admin: {
            placeholder: "기술연구소",
          },
        },
        {
          name: "description",
          type: "textarea",
          localized: true,
          label: "설명",
          admin: {
            description: "부서 역할 및 업무 설명",
          },
        },
      ],
    },
  ],
  access: {
    read: () => true,
  },
};

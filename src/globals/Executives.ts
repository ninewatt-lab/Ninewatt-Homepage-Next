import type { GlobalConfig } from "payload";

export const Executives: GlobalConfig = {
  slug: "executives",
  label: "경영진",
  admin: {
    group: "회사 정보",
    description: "경영진 정보를 관리합니다. 회사 소개 페이지에 표시됩니다.",
  },
  fields: [
    {
      name: "members",
      type: "array",
      label: "경영진 목록",
      admin: {
        description: "경영진 정보를 순서대로 추가하세요",
        components: {
          RowLabel: "@/components/admin/RowLabels#ExecutiveMemberRowLabel",
        },
      },
      fields: [
        {
          name: "role",
          type: "text",
          required: true,
          localized: true,
          label: "직책",
          admin: {
            description: "직책",
            placeholder: "대표이사",
          },
        },
        {
          name: "name",
          type: "text",
          required: true,
          localized: true,
          label: "이름",
          admin: {
            placeholder: "홍길동",
          },
        },
        {
          name: "team",
          type: "text",
          localized: true,
          label: "소속",
          admin: {
            description: "소속 부서 또는 조직",
          },
        },
        {
          name: "description",
          type: "textarea",
          localized: true,
          label: "소개",
          admin: {
            description: "경영진 소개 문구",
          },
        },
        {
          name: "details",
          type: "array",
          localized: true,
          label: "경력/이력",
          admin: {
            description: "주요 경력 및 이력을 항목별로 추가하세요",
            components: {
              RowLabel: "@/components/admin/RowLabels#ExecutiveDetailRowLabel",
            },
          },
          fields: [
            {
              name: "item",
              type: "text",
              label: "내용",
            },
          ],
        },
        {
          name: "photo",
          type: "upload",
          relationTo: "media",
          label: "사진",
          admin: {
            description:
              "프로필 사진 (권장: 정사각형, 400x400px 이상)",
          },
        },
      ],
    },
  ],
  access: {
    read: () => true,
  },
};

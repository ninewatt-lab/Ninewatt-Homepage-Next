import type { GlobalConfig } from "payload";

export const CompanyInfo: GlobalConfig = {
  slug: "company-info",
  label: "회사 정보",
  admin: {
    group: "회사 정보",
    description:
      "회사 기본 정보(회사명, 주소, 연락처 등)를 관리합니다. 푸터 등 사이트 전반에 표시됩니다.",
  },
  fields: [
    {
      name: "companyName",
      type: "text",
      required: true,
      localized: true,
      label: "회사명",
      admin: {
        description: "공식 회사명",
        placeholder: "주식회사 나인와트",
      },
    },
    {
      name: "tagline",
      type: "textarea",
      localized: true,
      label: "태그라인",
      admin: {
        description: "회사 슬로건 또는 한 줄 소개",
      },
    },
    {
      name: "hqAddress",
      type: "text",
      localized: true,
      label: "본사 주소",
      admin: {
        description: "본사 전체 주소",
      },
    },
    {
      name: "rndAddress",
      type: "text",
      localized: true,
      label: "R&D센터 주소",
      admin: {
        description: "R&D센터 전체 주소",
      },
    },
    {
      name: "phone",
      type: "text",
      label: "전화번호",
      admin: {
        description: "대표 전화번호",
        placeholder: "02-1234-5678",
      },
    },
    {
      name: "email",
      type: "email",
      label: "이메일",
      admin: {
        description: "대표 이메일 주소",
      },
    },
    {
      name: "socialLinks",
      type: "array",
      label: "소셜 링크",
      admin: {
        description: "SNS 계정 링크를 추가하세요",
        components: {
          RowLabel: "@/components/admin/RowLabels#SocialLinkRowLabel",
        },
      },
      fields: [
        {
          name: "platform",
          type: "select",
          required: true,
          label: "플랫폼",
          options: [
            { label: "LinkedIn", value: "linkedin" },
            { label: "Instagram", value: "instagram" },
            { label: "YouTube", value: "youtube" },
            { label: "Twitter", value: "twitter" },
            { label: "Facebook", value: "facebook" },
          ],
          admin: {
            description: "SNS 플랫폼을 선택하세요",
          },
        },
        {
          name: "url",
          type: "text",
          required: true,
          label: "URL",
          admin: {
            description: "해당 SNS 프로필 URL",
            placeholder: "https://linkedin.com/company/ninewatt",
          },
        },
      ],
    },
  ],
  access: {
    read: () => true,
  },
};

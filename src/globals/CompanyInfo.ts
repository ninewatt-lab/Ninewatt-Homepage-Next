import type { GlobalConfig } from "payload";

export const CompanyInfo: GlobalConfig = {
  slug: "company-info",
  label: "회사 정보",
  fields: [
    {
      name: "companyName",
      type: "text",
      required: true,
      localized: true,
      label: "회사명",
    },
    {
      name: "tagline",
      type: "textarea",
      localized: true,
      label: "태그라인",
    },
    {
      name: "hqAddress",
      type: "text",
      localized: true,
      label: "본사 주소",
    },
    {
      name: "rndAddress",
      type: "text",
      localized: true,
      label: "R&D센터 주소",
    },
    {
      name: "phone",
      type: "text",
      label: "전화번호",
    },
    {
      name: "email",
      type: "email",
      label: "이메일",
    },
    {
      name: "socialLinks",
      type: "array",
      label: "소셜 링크",
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
        },
        {
          name: "url",
          type: "text",
          required: true,
          label: "URL",
        },
      ],
    },
  ],
  access: {
    read: () => true,
  },
};

import type { GlobalConfig } from "payload";

export const HomeStats: GlobalConfig = {
  slug: "home-stats",
  label: "홈 통계",
  admin: {
    group: "홈페이지",
    description:
      "홈페이지 메인 화면에 표시되는 주요 통계 수치를 관리합니다.",
  },
  fields: [
    {
      name: "stats",
      type: "array",
      label: "통계 항목",
      minRows: 1,
      maxRows: 10,
      admin: {
        description: "홈페이지 메인에 표시할 통계 항목을 추가하세요 (최대 10개)",
        components: {
          RowLabel: "@/components/admin/RowLabels#StatsRowLabel",
        },
      },
      fields: [
        {
          name: "value",
          type: "text",
          required: true,
          label: "값",
          admin: {
            description: "통계 수치",
            placeholder: "50+",
          },
        },
        {
          name: "label",
          type: "text",
          required: true,
          localized: true,
          label: "라벨",
          admin: {
            description: "통계 항목 설명",
            placeholder: "특허 보유",
          },
        },
      ],
    },
  ],
  access: {
    read: () => true,
  },
};

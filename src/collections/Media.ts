import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  labels: {
    singular: "미디어",
    plural: "미디어 라이브러리",
  },
  admin: {
    useAsTitle: "alt",
    group: "시스템",
    description: "이미지, PDF 등 미디어 파일을 업로드하고 관리합니다.",
  },
  upload: {
    staticDir: "public/media",
    mimeTypes: ["image/*", "application/pdf"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "대체 텍스트",
      admin: {
        description:
          "이미지 설명 텍스트 (웹 접근성 및 검색엔진 최적화에 사용됩니다)",
        placeholder: "나인와트 본사 전경 이미지",
      },
    },
  ],
  access: {
    read: () => true,
  },
};

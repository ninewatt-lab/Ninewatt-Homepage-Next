import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: "사용자",
    plural: "사용자 관리",
  },
  admin: {
    useAsTitle: "email",
    group: "시스템",
    description:
      "관리자 계정을 관리합니다. Admin 권한만 새 계정을 생성할 수 있습니다.",
  },
  auth: true,
  fields: [
    {
      name: "role",
      type: "select",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
      ],
      defaultValue: "editor",
      required: true,
      label: "권한",
      admin: {
        description:
          "Admin: 모든 권한 (계정 생성/삭제 포함) / Editor: 콘텐츠 편집 권한",
      },
    },
  ],
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
};

import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
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
    },
  ],
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
};

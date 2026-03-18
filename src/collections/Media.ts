import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    useAsTitle: "alt",
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
    },
  ],
  access: {
    read: () => true,
  },
};

import path from "path";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { fileURLToPath } from "url";

import { Users } from "@/collections/Users";
import { Media } from "@/collections/Media";
import { Awards } from "@/collections/Awards";
import { Certifications } from "@/collections/Certifications";
import { History } from "@/collections/History";
import { Patents } from "@/collections/Patents";
import { Partners } from "@/collections/Partners";
import { RndProjects } from "@/collections/RndProjects";

import { CompanyInfo } from "@/globals/CompanyInfo";
import { HomeStats } from "@/globals/HomeStats";
import { Executives } from "@/globals/Executives";
import { Organization } from "@/globals/Organization";
import { Career } from "@/globals/Career";
import { GlobalBusiness } from "@/globals/GlobalBusiness";
import { Products } from "@/globals/Products";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: "- 나인와트 콘텐츠 관리",
    },
  },
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
  }),
  localization: {
    locales: [
      { label: "한국어", code: "ko" },
      { label: "English", code: "en" },
      { label: "日本語", code: "ja" },
      { label: "Français", code: "fr" },
    ],
    defaultLocale: "ko",
    fallback: true,
  },
  collections: [Users, Media, Awards, Certifications, History, Patents, Partners, RndProjects],
  globals: [CompanyInfo, HomeStats, Executives, Organization, Career, GlobalBusiness, Products],
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "src/payload-types.ts"),
  },
});

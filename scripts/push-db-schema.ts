/**
 * Production DB에 Payload CMS 스키마를 push하는 스크립트.
 * NODE_ENV=development 상태에서 Payload를 초기화하면
 * Drizzle ORM이 자동으로 스키마 diff를 감지하고 DB에 반영합니다.
 *
 * 사용: NODE_ENV=development npx tsx scripts/push-db-schema.ts
 */
import config from "../payload.config";
import { getPayload } from "payload";

async function main() {
  console.log("Pushing database schema...");

  const payload = await getPayload({ config });

  payload.logger.info("Database schema push completed successfully");

  // Drizzle 커넥션 종료 후 프로세스 종료
  await payload.db.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error("Schema push failed:", err);
  process.exit(1);
});

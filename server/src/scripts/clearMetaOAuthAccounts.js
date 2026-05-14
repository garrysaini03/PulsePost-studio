import { connectDatabase } from "../config/db.js";
import { SocialAccount } from "../models/SocialAccount.js";

async function main() {
  await connectDatabase();

  const result = await SocialAccount.deleteMany({
    provider: { $in: ["facebook", "instagram"] },
  });

  console.log(`Removed ${result.deletedCount} saved Facebook/Instagram OAuth account(s).`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Failed to remove saved Meta OAuth accounts.");
  console.error(error);
  process.exit(1);
});

import { createApp } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

async function startServer() {
  await connectDatabase();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`PulsePost server listening on port ${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server");
  console.error(error);
  process.exit(1);
});

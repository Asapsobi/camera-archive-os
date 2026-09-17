import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cookieParser from "cookie-parser";
import { migrate } from "./migrate.js";
import { router as productRoutes } from "./routes/products.js";
import { router as orderRoutes } from "./routes/orders.js";
import { router as adminRoutes } from "./routes/admin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD_DIR = path.join(__dirname, "..", "build");
const PORT = Number(process.env.PORT) || 3000;

async function main() {
  await migrate();

  const app = express();
  app.disable("x-powered-by");
  app.use(express.json());
  app.use(cookieParser());

  app.use("/api", productRoutes);
  app.use("/api", orderRoutes);
  app.use("/api", adminRoutes);

  app.use(express.static(BUILD_DIR));

  // SPA fallback: any non-API GET falls through to index.html (covers /admin
  // and any deep link on a page refresh).
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(BUILD_DIR, "index.html"));
  });

  app.use((err, req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  });

  app.listen(PORT, () => {
    console.log(`[server] listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("[server] failed to start:", err);
  process.exit(1);
});

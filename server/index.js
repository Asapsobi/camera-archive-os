import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cookieParser from "cookie-parser";
import { ensureSheets, healthCheck } from "./sheets.js";
import { router as productRoutes } from "./routes/products.js";
import { router as orderRoutes } from "./routes/orders.js";
import { router as adminRoutes } from "./routes/admin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD_DIR = path.join(__dirname, "..", "build");
const PORT = Number(process.env.PORT) || 3000;

let dbStatus = { ready: false, error: "Not checked yet." };

// The Sheets/Drive connection might not be reachable the moment this process
// boots (wrong service account key, sheet not shared with it, wrong sheet
// ID) — that's config to fix and retry, not a reason to crash the whole
// app. So this keeps trying in the background instead of exiting, and
// /api/health always reports exactly what's wrong so it's checkable with a
// plain GET instead of digging through platform logs.
async function tryConnect() {
  try {
    await ensureSheets();
    await healthCheck();
    dbStatus = { ready: true, error: null };
    console.log("[sheets] connected.");
  } catch (err) {
    dbStatus = { ready: false, error: err.message };
    console.error("[sheets] connection failed:", err.message);
  }
}

function requireDb(req, res, next) {
  if (!dbStatus.ready) {
    return res.status(503).json({ error: `Database not connected: ${dbStatus.error}` });
  }
  next();
}

async function main() {
  await tryConnect();
  if (!dbStatus.ready) {
    setInterval(tryConnect, 10_000);
  }

  const app = express();
  app.disable("x-powered-by");
  app.use(express.json());
  app.use(cookieParser());

  app.get("/api/health", (req, res) => {
    res.json({ server: "ok", ...dbStatus });
  });

  app.use("/api", requireDb, productRoutes);
  app.use("/api", requireDb, orderRoutes);
  app.use("/api", requireDb, adminRoutes);

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

main();

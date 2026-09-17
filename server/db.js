// Postgres connection. Accepts either a single DATABASE_URL, or the
// individual PG* vars ParsPack's database panel gives you
// (host/port/user/password/database) — set whichever your host provides.
import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

export const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined,
    })
  : new Pool({
      host: process.env.PGHOST || "localhost",
      port: Number(process.env.PGPORT) || 5432,
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD || "",
      database: process.env.PGDATABASE || "camera_archive",
      ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined,
    });

export async function query(text, params) {
  return pool.query(text, params);
}

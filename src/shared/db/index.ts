import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

function createDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  const connection = mysql.createPool({
    uri: databaseUrl,
    waitForConnections: true,
    connectionLimit: 10,
  });

  return drizzle(connection);
}

type Db = ReturnType<typeof createDb>;

let _db: Db | null = null;

export function getDb(): Db {
  if (!_db) {
    _db = createDb();
  }

  return _db;
}
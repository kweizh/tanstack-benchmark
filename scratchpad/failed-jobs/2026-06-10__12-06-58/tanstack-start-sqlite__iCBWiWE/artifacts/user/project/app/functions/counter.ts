import { createServerFn } from "@tanstack/start";
import { getDb } from "../db";

export const getCount = createServerFn({ method: "GET" }).handler(async () => {
  const db = getDb();
  const row = db.prepare("SELECT value FROM counter WHERE id = 1").get() as
    | { value: number }
    | undefined;
  return row?.value ?? 0;
});

export const incrementCount = createServerFn({ method: "POST" }).handler(
  async () => {
    const db = getDb();
    db.prepare(
      "UPDATE counter SET value = value + 1 WHERE id = 1"
    ).run();
    const row = db
      .prepare("SELECT value FROM counter WHERE id = 1")
      .get() as { value: number } | undefined;
    return row?.value ?? 0;
  }
);

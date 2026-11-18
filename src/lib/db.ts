import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import {
  drizzle as drizzlePg,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import * as schema from "@/db/schemas/index";

declare global {
  // eslint-disable-next-line no-var
  var __db: NodePgDatabase<typeof schema> | undefined;
}

function createClient(): NodePgDatabase<typeof schema> {
  // The build collects route metadata in parallel. It only needs the schema.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return drizzlePg.mock({ schema });
  }
  if (process.env.DATABASE_URL) {
    return drizzlePg(process.env.DATABASE_URL, {
      schema,
    });
  }

  const dbPath = resolve(process.cwd(), "data", "local.db");
  mkdirSync(resolve(process.cwd(), "data"), { recursive: true });

  return drizzlePglite(dbPath, {
    schema,
  }) as unknown as NodePgDatabase<typeof schema>;
}

// Next imports routes while building. Open the database only when runtime code uses it.
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, key) {
    const client = (globalThis.__db ??= createClient());
    const value = Reflect.get(client, key, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

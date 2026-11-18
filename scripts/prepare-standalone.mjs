import { cp, readdir, rm } from "node:fs/promises";

const output = new URL("../.next/standalone/", import.meta.url);

// Next traces some files imported by instrumentation and copies its loaded .env files.
// Runtime databases and configuration belong on the host, outside the generated artifact.
for (const entry of await readdir(output)) {
  if (entry === "data" || entry === ".env" || entry.startsWith(".env.")) {
    await rm(new URL(entry, output), { recursive: true, force: true });
  }
}

for (const path of ["public", ".next/static", "db/migrations"]) {
  await cp(new URL(`../${path}`, import.meta.url), new URL(path, output), { recursive: true });
}

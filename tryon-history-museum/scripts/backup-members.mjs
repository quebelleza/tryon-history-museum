/**
 * Manual data backup — members, membership_payments, board_assignments.
 *
 * Usage (from project root):
 *   node --env-file=.env.local scripts/backup-members.mjs
 *
 * Writes timestamped JSON files to backups/ at the project root.
 * Does NOT modify any data.
 */

import { createClient } from "@supabase/supabase-js";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const BACKUPS_DIR = join(PROJECT_ROOT, "backups");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
    "Run with: node --env-file=.env.local scripts/backup-members.mjs"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

async function fetchAll(table) {
  const PAGE_SIZE = 1000;
  let rows = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .range(from, from + PAGE_SIZE - 1)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(`ERROR fetching ${table}:`, error.message);
      process.exit(1);
    }

    rows = rows.concat(data);

    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}

async function run() {
  console.log("──────────────────────────────────────────");
  console.log("  Tryon History Museum — Data Backup");
  console.log(`  Timestamp: ${timestamp}`);
  console.log("──────────────────────────────────────────\n");

  mkdirSync(BACKUPS_DIR, { recursive: true });

  const tables = ["members", "membership_payments", "board_assignments"];

  for (const table of tables) {
    process.stdout.write(`Fetching ${table}... `);
    const rows = await fetchAll(table);
    const filename = `${table}-${timestamp}.json`;
    const filepath = join(BACKUPS_DIR, filename);

    writeFileSync(filepath, JSON.stringify(rows, null, 2), "utf-8");
    console.log(`${rows.length} rows → backups/${filename}`);
  }

  console.log("\n✓ Backup complete. Verify row counts above before proceeding.");
  console.log("  Expected: members ~67, membership_payments > 0, board_assignments >= 0");
}

run();

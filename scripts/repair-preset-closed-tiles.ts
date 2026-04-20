import Database from "better-sqlite3";

type PresetMapRow = {
  id: string;
  slug: string;
  name: string;
  mapString: string;
};

const dbPath = process.argv[2] && !process.argv[2].startsWith("--")
  ? process.argv[2]
  : "sqlite.db";
const apply = process.argv.includes("--apply");
const slugArg = process.argv.find((arg) => arg.startsWith("--slug="));
const slugFilter = slugArg?.slice("--slug=".length);

const db = new Database(dbPath);

const rows = db
  .prepare(
    `
      SELECT id, slug, name, mapString
      FROM presetMaps
      ${slugFilter ? "WHERE slug = ?" : ""}
      ORDER BY createdAt ASC
    `,
  )
  .all(...(slugFilter ? [slugFilter] : [])) as PresetMapRow[];

const update = db.prepare(
  `
    UPDATE presetMaps
    SET mapString = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
);

let scanned = 0;
let changed = 0;

for (const row of rows) {
  scanned++;

  const parts = row.mapString.split(",");
  let rowChanged = false;
  const changedIndices: number[] = [];

  parts.forEach((value, partIndex) => {
    if (value !== "_") return;
    parts[partIndex] = "X";
    changedIndices.push(partIndex + 1);
    rowChanged = true;
  });

  if (!rowChanged) {
    console.log(`${row.slug}: no change (ok)`);
    continue;
  }

  const repaired = parts.join(",");
  changed++;

  console.log(
    `${row.slug}: ${apply ? "updated" : "would update"} closed positions ${changedIndices.join(", ")}`,
  );

  if (apply) {
    update.run(repaired, row.id);
  }
}

console.log(
  `scanned=${scanned} changed=${changed} mode=${apply ? "apply" : "dry-run"}`,
);

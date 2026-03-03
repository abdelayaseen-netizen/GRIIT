/**
 * Standalone verification for Create Challenge helpers.
 * Run: node scripts/verify-create-challenge.js
 * Or:  npm run test:create-challenge
 */
function dbTaskType(type) {
  return type === "simple" ? "manual" : type;
}

function journalMinWords(minWords) {
  return minWords ?? 20;
}

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error("FAIL:", message);
    failed++;
  } else {
    console.log("OK:", message);
  }
}

// dbTaskType
assert(dbTaskType("simple") === "manual", "dbTaskType('simple') -> 'manual'");
assert(dbTaskType("journal") === "journal", "dbTaskType('journal') -> 'journal'");
assert(dbTaskType("timer") === "timer", "dbTaskType('timer') -> 'timer'");
assert(dbTaskType("run") === "run", "dbTaskType('run') -> 'run'");

// journalMinWords
assert(journalMinWords(undefined) === 20, "journalMinWords(undefined) -> 20");
assert(journalMinWords(null) === 20, "journalMinWords(null) -> 20");
assert(journalMinWords(50) === 50, "journalMinWords(50) -> 50");
assert(journalMinWords(1) === 1, "journalMinWords(1) -> 1");

if (failed > 0) {
  console.error("\n" + failed + " assertion(s) failed.");
  process.exit(1);
}
console.log("\nAll Create Challenge helper checks passed.");
process.exit(0);

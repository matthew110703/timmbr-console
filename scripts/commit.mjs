#!/usr/bin/env node
/**
 * Interactive conventional commit helper for timmbr-console.
 * Prompts for type, scope, subject, body, and breaking change,
 * then runs: git commit -m "<assembled message>"
 *
 * Design System Safety:
 * If the design system (@timmbr/*) is locally linked via Yalc,
 * this script automatically unlinks all packages, restores
 * package.json and pnpm-lock.yaml to their clean registry versions,
 * and stages them so local file:.yalc references are never committed.
 *
 * Draft recovery: if a commit fails (e.g. pre-commit hook rejects it),
 * answers are saved to .git/COMMIT_DRAFT.json. On the next run the dev
 * is asked whether to reuse them or start fresh.
 */

import { createInterface } from "readline";
import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { join } from "path";

const ROOT_DIR = process.cwd();
const DRAFT_FILE = join(ROOT_DIR, ".git", "COMMIT_DRAFT.json");

const TYPES = [
  { value: "feat", description: "A new feature" },
  { value: "fix", description: "A bug fix" },
  { value: "docs", description: "Documentation changes only" },
  {
    value: "style",
    description: "Code style changes (formatting, whitespace)",
  },
  { value: "refactor", description: "Code refactoring without feature or fix" },
  { value: "perf", description: "Performance improvement" },
  { value: "test", description: "Adding or updating tests" },
  {
    value: "chore",
    description: "Build process, tooling, or dependency updates",
  },
  { value: "ci", description: "CI/CD configuration changes" },
  { value: "build", description: "Build system changes" },
  { value: "revert", description: "Reverts a previous commit" },
];

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const BLUE = "\x1b[34m";

// Single readline interface kept open for the full session
const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

const print = (msg) => process.stdout.write(msg + "\n");
const hr = () => print(`${DIM}${"─".repeat(60)}${RESET}`);

// ─── Design System Link Detection & Unlinking ─────────────────────────────────

function isDSLinked() {
  if (existsSync(join(ROOT_DIR, ".yalc"))) return true;
  if (existsSync(join(ROOT_DIR, "yalc.lock"))) return true;

  try {
    const pkgJson = JSON.parse(
      readFileSync(join(ROOT_DIR, "package.json"), "utf-8"),
    );
    const allDeps = {
      ...pkgJson.dependencies,
      ...pkgJson.devDependencies,
    };
    return Object.values(allDeps).some(
      (v) => typeof v === "string" && v.includes(".yalc"),
    );
  } catch {
    return false;
  }
}

function unlinkDSBeforeCommit() {
  if (!isDSLinked()) return false;

  print("");
  print(`${YELLOW}⚠️  Design System is currently linked via Yalc.${RESET}`);
  print(
    `${CYAN}Unlinking Design System and restoring package.json & pnpm-lock.yaml before commit...${RESET}\n`,
  );

  try {
    execSync("node scripts/ds-link.mjs unlink", {
      cwd: ROOT_DIR,
      stdio: "inherit",
    });

    // Re-stage package.json and pnpm-lock.yaml to commit the clean registry versions
    execSync("git add package.json pnpm-lock.yaml", {
      cwd: ROOT_DIR,
      stdio: "inherit",
    });

    print(
      `\n${GREEN}✔ Successfully restored package.json and pnpm-lock.yaml to registry versions and staged them for commit.${RESET}\n`,
    );
    return true;
  } catch (err) {
    print(
      `\n${RED}✖ Failed to unlink Design System before commit: ${err.message}${RESET}\n`,
    );
    throw err;
  }
}

// ─── Git Staged Checks ────────────────────────────────────────────────────────

function hasStagedChanges() {
  try {
    execSync("git diff --cached --quiet", { stdio: "pipe" });
    return false;
  } catch {
    return true;
  }
}

// ─── Draft helpers ────────────────────────────────────────────────────────────

function loadDraft() {
  if (!existsSync(DRAFT_FILE)) return null;
  try {
    return JSON.parse(readFileSync(DRAFT_FILE, "utf-8"));
  } catch {
    return null;
  }
}

function saveDraft(answers) {
  try {
    writeFileSync(
      DRAFT_FILE,
      JSON.stringify(
        { ...answers, savedAt: new Date().toISOString() },
        null,
        2,
      ),
    );
  } catch {}
}

function clearDraft() {
  if (existsSync(DRAFT_FILE)) {
    try {
      unlinkSync(DRAFT_FILE);
    } catch {}
  }
}

// ─── Prompt helpers ───────────────────────────────────────────────────────────

function printTypeMenu() {
  print("");
  print(`${BOLD}Select commit type:${RESET}`);
  print("");
  TYPES.forEach(({ value, description }, i) => {
    const num = String(i + 1).padStart(2);
    print(
      `  ${CYAN}${num}${RESET}  ${BOLD}${value}${RESET}${DIM} — ${description}${RESET}`,
    );
  });
  print("");
}

async function selectType() {
  printTypeMenu();
  while (true) {
    const input = (
      await ask(`${YELLOW}?${RESET} ${BOLD}Type${RESET} (1-${TYPES.length}): `)
    ).trim();
    const idx = parseInt(input, 10) - 1;
    if (idx >= 0 && idx < TYPES.length) return TYPES[idx].value;
    const direct = TYPES.find((t) => t.value === input);
    if (direct) return direct.value;
    print(
      `${RED}  Invalid selection. Enter a number (1-${TYPES.length}) or type name.${RESET}`,
    );
  }
}

async function getScope() {
  const input = (
    await ask(
      `${YELLOW}?${RESET} ${BOLD}Scope${RESET} ${DIM}(optional, e.g. ui, auth, sidebar)${RESET}: `,
    )
  ).trim();
  return input || null;
}

async function getSubject() {
  while (true) {
    const input = (
      await ask(
        `${YELLOW}?${RESET} ${BOLD}Subject${RESET} ${DIM}(short description, lowercase)${RESET}: `,
      )
    ).trim();
    if (!input) {
      print(`${RED}  Subject is required.${RESET}`);
      continue;
    }
    if (input.length > 100) {
      print(
        `${RED}  Subject must be 100 characters or less (currently ${input.length}).${RESET}`,
      );
      continue;
    }
    if (input.endsWith(".")) {
      print(`${RED}  Subject must not end with a period.${RESET}`);
      continue;
    }
    return input.toLowerCase();
  }
}

async function getBody() {
  const input = (
    await ask(
      `${YELLOW}?${RESET} ${BOLD}Body${RESET} ${DIM}(optional, longer description)${RESET}: `,
    )
  ).trim();
  return input || null;
}

async function getBreakingChange() {
  const input = (
    await ask(
      `${YELLOW}?${RESET} ${BOLD}Breaking change${RESET} ${DIM}(optional, describe if any)${RESET}: `,
    )
  ).trim();
  return input || null;
}

async function confirm(question) {
  const input = (
    await ask(
      `${YELLOW}?${RESET} ${BOLD}${question}${RESET} ${DIM}(y/N)${RESET}: `,
    )
  )
    .trim()
    .toLowerCase();
  return input === "y" || input === "yes";
}

// ─── Preview ──────────────────────────────────────────────────────────────────

function buildMessage({ type, scope, subject, body, breaking }) {
  const scopePart = scope ? `(${scope})` : "";
  const breakingMark = breaking ? "!" : "";
  const header = `${type}${scopePart}${breakingMark}: ${subject}`;
  const parts = [header];
  if (body) parts.push("", body);
  if (breaking) parts.push("", `BREAKING CHANGE: ${breaking}`);
  return { header, message: parts.join("\n") };
}

function printPreview({ header, body, breaking }) {
  print("");
  hr();
  print(`${BOLD}Commit message preview:${RESET}`);
  print("");
  print(`  ${GREEN}${header}${RESET}`);
  if (body) print(`${DIM}  ${body}${RESET}`);
  if (breaking) print(`${RED}  BREAKING CHANGE: ${breaking}${RESET}`);
  print("");
  hr();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  print("");
  print(`${BOLD}${BLUE}  Conventional Commit Helper (timmbr-console)${RESET}`);
  hr();

  // Check if anything is staged first (or if DS is linked and might need committing)
  const initiallyStaged = hasStagedChanges();
  const dsLinked = isDSLinked();

  if (!initiallyStaged && !dsLinked) {
    print(`${RED}  No staged changes detected.${RESET}`);
    print(
      `${DIM}  Stage your changes first with ${CYAN}git add <files>${RESET}${DIM}, then run ${YELLOW}pnpm commit${RESET}.${DIM}\n`,
    );
    rl.close();
    process.exit(1);
  }

  if (dsLinked) {
    print(
      `${YELLOW}  ℹ Note: Design system is currently linked via Yalc.${RESET}`,
    );
    print(
      `${DIM}  It will be automatically unlinked and restored before committing.${RESET}\n`,
    );
  }

  // ── Draft recovery ──────────────────────────────────────────────────────────
  let answers = null;
  const draft = loadDraft();

  if (draft) {
    const { type, scope, subject, body, breaking, savedAt } = draft;
    const when = new Date(savedAt).toLocaleString();

    print(`${YELLOW}  Saved draft found${RESET} ${DIM}(from ${when})${RESET}`);
    print("");
    print(
      `  ${BOLD}${type}${scope ? `(${scope})` : ""}${breaking ? "!" : ""}: ${subject}${RESET}`,
    );
    if (body) print(`  ${DIM}${body}${RESET}`);
    if (breaking) print(`  ${RED}BREAKING CHANGE: ${breaking}${RESET}`);
    print("");

    const reuse = await confirm("Use saved commit message?");
    if (reuse) {
      answers = { type, scope, subject, body, breaking };
    } else {
      clearDraft();
      print("");
    }
  }

  // ── Prompts (skipped if reusing draft) ─────────────────────────────────────
  if (!answers) {
    const type = await selectType();
    const scope = await getScope();
    const subject = await getSubject();
    const body = await getBody();
    const breaking = await getBreakingChange();
    answers = { type, scope, subject, body, breaking };
  }

  const { header, message } = buildMessage(answers);

  printPreview({ header, ...answers });

  const confirmed = await confirm("Confirm and commit?");
  rl.close();

  if (!confirmed) {
    clearDraft();
    print(`${DIM}  Aborted. Draft cleared.${RESET}\n`);
    process.exit(0);
  }

  // Unlink Design System if linked and stage restored package.json/pnpm-lock.yaml
  if (dsLinked) {
    try {
      unlinkDSBeforeCommit();
    } catch {
      print(`${RED}  Aborting commit due to unlink failure.${RESET}\n`);
      process.exit(1);
    }
  }

  // Save draft before attempting commit — if the commit hook rejects it, draft survives
  saveDraft(answers);

  try {
    execSync(`git commit -m ${JSON.stringify(message)}`, { stdio: "inherit" });
    clearDraft();
    print("");
    print(`${GREEN}  ✔ Committed successfully.${RESET}\n`);
  } catch {
    print("");
    print(
      `${RED}  Commit was rejected. Fix the errors above, then run:${RESET}`,
    );
    print(
      `${YELLOW}  pnpm commit${RESET}${DIM}  (your answers are saved)${RESET}\n`,
    );
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

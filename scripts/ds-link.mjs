#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT_DIR = process.cwd();
const DEFAULT_DS_PATH = path.resolve(ROOT_DIR, "../timmbr-ds");
const DS_PATH = process.env.TIMMBR_DS_PATH
  ? path.resolve(ROOT_DIR, process.env.TIMMBR_DS_PATH)
  : DEFAULT_DS_PATH;

const localYalcCmd = path.resolve(
  ROOT_DIR,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "yalc.cmd" : "yalc",
);
const YALC_EXEC = fs.existsSync(localYalcCmd)
  ? `"${localYalcCmd}"`
  : "pnpm exec yalc";

function findDSPackages() {
  const packagesDir = path.resolve(DS_PATH, "packages");
  if (!fs.existsSync(packagesDir)) {
    console.error(
      `\x1b[31m[ERROR] Design system repository not found at:\x1b[0m ${DS_PATH}`,
    );
    console.error(
      `Please ensure the 'timmbr-ds' repository is cloned in the parent directory (../timmbr-ds) or set TIMMBR_DS_PATH.`,
    );
    process.exit(1);
  }

  const entries = fs.readdirSync(packagesDir, { withFileTypes: true });
  const dsPackages = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const pkgJsonPath = path.resolve(packagesDir, entry.name, "package.json");
      if (fs.existsSync(pkgJsonPath)) {
        try {
          const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
          if (pkgJson.name && pkgJson.name.startsWith("@timmbr/")) {
            dsPackages.push({
              name: pkgJson.name,
              shortName: entry.name,
              dir: path.resolve(packagesDir, entry.name),
              version: pkgJson.version,
            });
          }
        } catch {}
      }
    }
  }

  return dsPackages;
}

function getConsoleTimmbrDeps() {
  const pkgJsonPath = path.resolve(ROOT_DIR, "package.json");
  if (!fs.existsSync(pkgJsonPath)) return [];
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
  const allDeps = {
    ...pkgJson.dependencies,
    ...pkgJson.devDependencies,
  };
  return Object.keys(allDeps).filter((dep) => dep.startsWith("@timmbr/"));
}

function getPackageStatus(pkgName) {
  const yalcPkgPath = path.resolve(ROOT_DIR, ".yalc", ...pkgName.split("/"));
  if (fs.existsSync(yalcPkgPath)) {
    return { status: "yalc", details: "Yalc Local Link (.yalc/)" };
  }

  const nodeModulesPath = path.resolve(
    ROOT_DIR,
    "node_modules",
    ...pkgName.split("/"),
  );
  if (!fs.existsSync(nodeModulesPath)) {
    return { status: "not-installed", details: "Not installed" };
  }

  try {
    const realPath = fs.realpathSync(nodeModulesPath);
    if (realPath.includes("timmbr-ds")) {
      return { status: "symlink", details: `Symlink (${realPath})` };
    }
    const pkgJsonPath = path.resolve(nodeModulesPath, "package.json");
    let version = "";
    if (fs.existsSync(pkgJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
      version = pkg.version ? `v${pkg.version}` : "";
    }
    return { status: "registry", details: `Registry (${version || "npm"})` };
  } catch (err) {
    return { status: "unknown", details: err.message };
  }
}

function handleStatus() {
  console.log(
    "\n=============================================================",
  );
  console.log("            TIMMBR DESIGN SYSTEM LINK STATUS (YALC)");
  console.log("=============================================================");
  console.log(`Design System Source: \x1b[36m${DS_PATH}\x1b[0m\n`);

  const timmbrDeps = getConsoleTimmbrDeps();
  console.log(`\x1b[1mApplication: timmbr-console\x1b[0m`);

  for (const dep of timmbrDeps) {
    const info = getPackageStatus(dep);
    if (info.status === "yalc") {
      console.log(
        `  \x1b[32m✔ ${dep.padEnd(20)}\x1b[0m -> \x1b[32m${info.details}\x1b[0m`,
      );
    } else if (info.status === "registry") {
      console.log(
        `  \x1b[34m📦 ${dep.padEnd(20)}\x1b[0m -> \x1b[34m${info.details}\x1b[0m`,
      );
    } else if (info.status === "symlink") {
      console.log(`  \x1b[33m🔗 ${dep.padEnd(20)}\x1b[0m -> ${info.details}`);
    } else {
      console.log(`  \x1b[31m⚠️  ${dep.padEnd(20)}\x1b[0m -> ${info.details}`);
    }
  }
  console.log(
    "=============================================================\n",
  );
}

function normalizePackageName(name) {
  const clean = name.trim().toLowerCase();
  return clean.startsWith("@timmbr/") ? clean : `@timmbr/${clean}`;
}

function matchesTarget(pkgName, shortName, targets) {
  if (!targets || targets.length === 0) return true;
  const lowerPkg = pkgName.toLowerCase();
  const lowerShort = (
    shortName || lowerPkg.replace("@timmbr/", "")
  ).toLowerCase();
  return targets.some((target) => {
    const norm = normalizePackageName(target);
    const short = norm.replace("@timmbr/", "");
    return lowerPkg === norm || lowerShort === short;
  });
}

function handleLink(dsPackages, specifiedTargets = []) {
  const hasFilter = specifiedTargets.length > 0;

  const packagesToPublish = hasFilter
    ? dsPackages.filter((pkg) =>
        matchesTarget(pkg.name, pkg.shortName, specifiedTargets),
      )
    : dsPackages;

  if (hasFilter && packagesToPublish.length === 0) {
    console.error(
      `\x1b[31m[ERROR] No matching design system packages found for: ${specifiedTargets.join(", ")}\x1b[0m`,
    );
    console.log(
      `Available in ${DS_PATH}: ${dsPackages.map((p) => p.name).join(", ")}`,
    );
    process.exit(1);
  }

  console.log(
    `\n\x1b[36m[Yalc] Publishing packages from: ${DS_PATH}...\x1b[0m\n`,
  );

  // 1. Publish matching packages in timmbr-ds to local yalc store
  for (const pkg of packagesToPublish) {
    try {
      execSync(`${YALC_EXEC} publish`, {
        cwd: pkg.dir,
        stdio: "pipe",
      });
      console.log(`  ✔ Published ${pkg.name} to yalc store`);
    } catch (err) {
      console.warn(`  ⚠️ Could not publish ${pkg.name}: ${err.message}`);
    }
  }

  // 2. Add ONLY the specified packages (or all console @timmbr deps if none specified) via yalc add
  const consoleDeps = getConsoleTimmbrDeps();
  const packagesToLink = hasFilter
    ? consoleDeps.filter((dep) => matchesTarget(dep, null, specifiedTargets))
    : consoleDeps;

  if (packagesToLink.length === 0) {
    console.warn(
      `\x1b[33m[WARN] None of the specified targets (${specifiedTargets.join(", ")}) are dependencies in timmbr-console.\x1b[0m`,
    );
    handleStatus();
    return;
  }

  console.log(
    `\n\x1b[36m[Yalc] Linking packages into timmbr-console: ${packagesToLink.join(", ")}...\x1b[0m\n`,
  );
  try {
    execSync(`${YALC_EXEC} add ${packagesToLink.join(" ")}`, {
      cwd: ROOT_DIR,
      stdio: "inherit",
    });
    console.log(
      `\n\x1b[36m[Yalc] Running pnpm install to apply links...\x1b[0m`,
    );
    execSync(`pnpm install`, {
      cwd: ROOT_DIR,
      stdio: "inherit",
    });
    console.log(
      `\x1b[32m✔ Successfully linked ${packagesToLink.join(", ")} via yalc!\x1b[0m\n`,
    );
  } catch (err) {
    console.error(
      `\x1b[31m✖ Failed adding yalc packages: ${err.message}\x1b[0m\n`,
    );
  }

  handleStatus();
}

function handleUnlink(specifiedTargets = []) {
  const hasFilter = specifiedTargets.length > 0;
  const consoleDeps = getConsoleTimmbrDeps();

  if (hasFilter) {
    const packagesToUnlink = consoleDeps.filter((dep) =>
      matchesTarget(dep, null, specifiedTargets),
    );

    if (packagesToUnlink.length === 0) {
      console.warn(
        `\x1b[33m[WARN] None of the specified targets (${specifiedTargets.join(", ")}) are dependencies in timmbr-console.\x1b[0m`,
      );
      handleStatus();
      return;
    }

    console.log(
      `\n\x1b[36m[Yalc] Unlinking specified packages: ${packagesToUnlink.join(", ")}...\x1b[0m\n`,
    );
    try {
      execSync(`${YALC_EXEC} remove ${packagesToUnlink.join(" ")}`, {
        cwd: ROOT_DIR,
        stdio: "inherit",
      });
    } catch {}

    // Check if any yalc packages remain in package.json
    const remainingYalc = getConsoleTimmbrDeps().some(
      (dep) => getPackageStatus(dep).status === "yalc",
    );
    if (!remainingYalc) {
      const yalcDir = path.resolve(ROOT_DIR, ".yalc");
      if (fs.existsSync(yalcDir)) {
        fs.rmSync(yalcDir, { recursive: true, force: true });
      }
      const yalcLock = path.resolve(ROOT_DIR, "yalc.lock");
      if (fs.existsSync(yalcLock)) {
        fs.rmSync(yalcLock, { force: true });
      }
    }

    console.log(
      "\x1b[36mRestoring registry packages via pnpm install...\x1b[0m",
    );
    execSync("pnpm install", { cwd: ROOT_DIR, stdio: "inherit" });

    console.log(
      `\x1b[32m✔ Successfully restored registry packages for ${packagesToUnlink.join(", ")}!\x1b[0m\n`,
    );
  } else {
    console.log(`\n\x1b[36m[Yalc] Unlinking all @timmbr packages...\x1b[0m\n`);

    try {
      execSync(`${YALC_EXEC} remove --all`, {
        cwd: ROOT_DIR,
        stdio: "inherit",
      });
    } catch {}

    // Remove .yalc and yalc.lock if present
    const yalcDir = path.resolve(ROOT_DIR, ".yalc");
    if (fs.existsSync(yalcDir)) {
      fs.rmSync(yalcDir, { recursive: true, force: true });
    }
    const yalcLock = path.resolve(ROOT_DIR, "yalc.lock");
    if (fs.existsSync(yalcLock)) {
      fs.rmSync(yalcLock, { force: true });
    }

    console.log(
      "\x1b[36mRestoring registry packages via pnpm install...\x1b[0m",
    );
    execSync("pnpm install", { cwd: ROOT_DIR, stdio: "inherit" });

    console.log(`\x1b[32m✔ Successfully restored registry packages!\x1b[0m\n`);
  }

  handleStatus();
}

// Argument parsing: supports "pnpm ds:link ui motion", "node scripts/ds-link.mjs ui motion", "pnpm ds:unlink ui", etc.
const firstArg = process.argv[2] || "status";
let action = "status";
let rawTargets = [];

if (["link", "unlink", "status"].includes(firstArg)) {
  action = firstArg;
  rawTargets = process.argv.slice(3);
} else {
  action = "link";
  rawTargets = process.argv.slice(2);
}

const specifiedTargets = rawTargets
  .filter((arg) => arg !== "--")
  .flatMap((arg) => arg.split(","))
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

const dsPackages = findDSPackages();

switch (action) {
  case "link":
    handleLink(dsPackages, specifiedTargets);
    break;
  case "unlink":
    handleUnlink(specifiedTargets);
    break;
  case "status":
  default:
    handleStatus();
    break;
}

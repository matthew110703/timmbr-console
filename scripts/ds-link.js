#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT_DIR = process.cwd();
const DEFAULT_DS_PATH = path.resolve(ROOT_DIR, "../timmbr-ds");
const DS_PATH = process.env.TIMMBR_DS_PATH
  ? path.resolve(ROOT_DIR, process.env.TIMMBR_DS_PATH)
  : DEFAULT_DS_PATH;

const action = process.argv[2] || "status";

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

function handleLink(dsPackages) {
  console.log(
    `\n\x1b[36m[Yalc] Publishing packages from: ${DS_PATH}...\x1b[0m\n`,
  );

  // 1. Publish each package in timmbr-ds to local yalc store
  for (const pkg of dsPackages) {
    try {
      execSync(`pnpm dlx yalc publish --push`, {
        cwd: pkg.dir,
        stdio: "pipe",
      });
      console.log(`  ✔ Published ${pkg.name} to yalc store`);
    } catch (err) {
      console.warn(`  ⚠️ Could not publish ${pkg.name}: ${err.message}`);
    }
  }

  // 2. Add each package to timmbr-console via yalc add
  const timmbrDeps = getConsoleTimmbrDeps();
  console.log(
    `\n\x1b[36m[Yalc] Linking packages into timmbr-console...\x1b[0m\n`,
  );
  try {
    execSync(`pnpm exec yalc add ${timmbrDeps.join(" ")}`, {
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
      `\x1b[32m✔ Successfully linked @timmbr packages via yalc!\x1b[0m\n`,
    );
  } catch (err) {
    console.error(
      `\x1b[31m✖ Failed adding yalc packages: ${err.message}\x1b[0m\n`,
    );
  }

  handleStatus();
}

function handleUnlink() {
  console.log(`\n\x1b[36m[Yalc] Unlinking all @timmbr packages...\x1b[0m\n`);

  try {
    execSync(`pnpm exec yalc remove --all`, {
      cwd: ROOT_DIR,
      stdio: "inherit",
    });
  } catch {
    // If yalc remove fails or has nothing to remove, proceed to cleanup
  }

  // Remove .yalc and yalc.lock if present
  const yalcDir = path.resolve(ROOT_DIR, ".yalc");
  if (fs.existsSync(yalcDir)) {
    fs.rmSync(yalcDir, { recursive: true, force: true });
  }
  const yalcLock = path.resolve(ROOT_DIR, "yalc.lock");
  if (fs.existsSync(yalcLock)) {
    fs.rmSync(yalcLock, { force: true });
  }

  console.log("\x1b[36mRestoring registry packages via pnpm install...\x1b[0m");
  execSync("pnpm install", { cwd: ROOT_DIR, stdio: "inherit" });

  console.log(`\x1b[32m✔ Successfully restored registry packages!\x1b[0m\n`);
  handleStatus();
}

const dsPackages = findDSPackages();

switch (action) {
  case "link":
    handleLink(dsPackages);
    break;
  case "unlink":
    handleUnlink();
    break;
  case "status":
  default:
    handleStatus();
    break;
}

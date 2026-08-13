#!/usr/bin/env node
// Dependency security gate for starter/mobile-app. Mirrors the root
// `npm audit --audit-level=high` gate (validate.yml, release.yml), but with a
// documented, scoped allowlist — because two of the app's transitive deps
// (metro -> image-size, both bundled by expo@57) have no upstream-patched
// version to upgrade to as of writing. See ALLOWED below for the exact
// advisories and why each is accepted; anything else at high/critical fails
// the build.
//
// An allowlist entry is not a permanent exemption: on every run this script
// (a) queries npm's registry for the package's current "latest" version and
// fails if it now falls outside the advisory's vulnerable range (a fix likely
// shipped — bump the override in package.json and drop the entry here), and
// (b) fails once `reviewBy` passes, forcing a human to re-verify by hand even
// if the automatic check above didn't catch it (e.g. the advisory's range
// string changed shape, or the registry lookup is unreachable).
"use strict";

const { execFileSync } = require("node:child_process");
const path = require("node:path");

const MOBILE_APP_DIR = path.join(__dirname, "..", "starter", "mobile-app");

const ALLOWED = {
  "GHSA-w3rx-r6r6-pgpr": {
    package: "image-size",
    reviewBy: "2026-09-01",
    reason:
      "ICNS parser infinite-loop DoS. No fixed release exists (latest is 2.0.2, still in the vulnerable range). Only reachable via metro's build-time asset pipeline parsing this repo's own bundled assets, not untrusted network input.",
  },
  "GHSA-5p2g-fcmc-qvqq": {
    package: "image-size",
    reviewBy: "2026-09-01",
    reason:
      "JXL/HEIF parser infinite-loop DoS. Same package, same unpatched status, same build-time-only exposure as GHSA-w3rx-r6r6-pgpr.",
  },
};

function runAudit() {
  try {
    const out = execFileSync("npm", ["audit", "--json"], {
      cwd: MOBILE_APP_DIR,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
    return JSON.parse(out);
  } catch (err) {
    // npm audit exits non-zero when it finds vulnerabilities; stdout still
    // has the report we need.
    if (err.stdout) return JSON.parse(err.stdout);
    throw err;
  }
}

// Numeric X.Y.Z compare only — every version this script has had to compare
// so far is a plain release (no prerelease/build metadata), and registry
// "latest" dist-tags don't point at prereleases. Good enough; not a general
// semver replacement.
function compareVersions(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff < 0 ? -1 : 1;
  }
  return 0;
}

function extractRangeCeiling(range) {
  const match = /^<=?\s*(\d+\.\d+\.\d+)/.exec(range || "");
  return match ? match[1] : null;
}

function latestPublishedVersion(pkgName) {
  try {
    return execFileSync("npm", ["view", pkgName, "version"], { encoding: "utf8" }).trim();
  } catch {
    return null; // registry unreachable — reviewBy is the fallback safety net
  }
}

function main() {
  const report = runAudit();
  const vulnerabilities = report.vulnerabilities || {};
  const today = new Date().toISOString().slice(0, 10);

  const unallowed = [];
  const staleFixAvailable = [];
  const pastReview = [];
  const allowedSeen = new Set();

  for (const vuln of Object.values(vulnerabilities)) {
    if (vuln.severity !== "high" && vuln.severity !== "critical") continue;
    for (const via of vuln.via) {
      if (typeof via !== "object") continue;
      const id = via.url.split("/").pop();
      const entry = ALLOWED[id];
      if (!entry) {
        unallowed.push({ package: vuln.name, severity: vuln.severity, id, title: via.title, url: via.url });
        continue;
      }
      allowedSeen.add(id);

      if (entry.reviewBy && today > entry.reviewBy) {
        pastReview.push({ id, ...entry });
      }

      const ceiling = extractRangeCeiling(via.range);
      const latest = ceiling ? latestPublishedVersion(entry.package) : null;
      if (ceiling && latest && compareVersions(latest, ceiling) > 0) {
        staleFixAvailable.push({ id, package: entry.package, ceiling, latest });
      }
    }
  }

  if (allowedSeen.size > 0) {
    console.log("Documented, upstream-unpatched exceptions in effect:");
    for (const id of allowedSeen) {
      console.log(`  - ${id} (${ALLOWED[id].package}, review by ${ALLOWED[id].reviewBy}): ${ALLOWED[id].reason}`);
    }
  }

  for (const id of Object.keys(ALLOWED)) {
    if (!allowedSeen.has(id)) {
      console.log(
        `NOTE: allowlisted advisory ${id} is no longer reported by npm audit — remove its entry from scripts/mobile-audit-gate.js.`,
      );
    }
  }

  let failed = false;

  if (unallowed.length > 0) {
    failed = true;
    console.error("\nUnallowlisted high/critical vulnerabilities found in starter/mobile-app:");
    for (const v of unallowed) {
      console.error(`  - [${v.severity}] ${v.package}: ${v.title} (${v.id}) ${v.url}`);
    }
    console.error(
      "Fix these (npm audit fix / manual upgrade), or if genuinely unpatched, add a scoped, justified entry to ALLOWED in scripts/mobile-audit-gate.js.",
    );
  }

  if (staleFixAvailable.length > 0) {
    failed = true;
    console.error("\nA newer version is published for an allowlisted advisory — it may now be fixed:");
    for (const v of staleFixAvailable) {
      console.error(
        `  - ${v.id} (${v.package}): advisory covers <= ${v.ceiling}, but npm's latest is ${v.latest}. Bump the override in starter/mobile-app/package.json, re-run npm install, and drop this entry if npm audit no longer reports it.`,
      );
    }
  }

  if (pastReview.length > 0) {
    failed = true;
    console.error("\nAllowlisted advisory is past its scheduled review date:");
    for (const v of pastReview) {
      console.error(`  - ${v.id} (${v.package}): reviewBy ${v.reviewBy} has passed. Re-check for an upstream fix and, if still unpatched, push reviewBy forward with a note.`);
    }
  }

  if (failed) process.exit(1);

  console.log("\nMobile dependency security gate passed.");
}

main();

#!/usr/bin/env node
// Dependency security gate for starter/mobile-app. Mirrors the root
// `npm audit --audit-level=high` gate (validate.yml, release.yml), but with a
// documented, scoped allowlist — because two of the app's transitive deps
// (metro -> image-size, both bundled by expo@57) have no upstream-patched
// version to upgrade to as of writing. See ALLOWED below for the exact
// advisories and why each is accepted; anything else at high/critical fails
// the build. Re-run `npm outdated image-size` periodically and drop an entry
// once a fixed release exists.
"use strict";

const { execFileSync } = require("node:child_process");
const path = require("node:path");

const MOBILE_APP_DIR = path.join(__dirname, "..", "starter", "mobile-app");

// GHSA ID -> justification. Keep this list as small and specific as possible;
// a wildcard/blanket allowlist defeats the point of the gate.
const ALLOWED = {
  "GHSA-w3rx-r6r6-pgpr": {
    package: "image-size",
    reason:
      "ICNS parser infinite-loop DoS. No fixed release exists (latest is 2.0.2, still in the vulnerable range). Only reachable via metro's build-time asset pipeline parsing this repo's own bundled assets, not untrusted network input.",
  },
  "GHSA-5p2g-fcmc-qvqq": {
    package: "image-size",
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

function main() {
  const report = runAudit();
  const vulnerabilities = report.vulnerabilities || {};

  const unallowed = [];
  const allowedSeen = new Set();

  for (const vuln of Object.values(vulnerabilities)) {
    if (vuln.severity !== "high" && vuln.severity !== "critical") continue;
    for (const via of vuln.via) {
      if (typeof via !== "object") continue;
      const id = via.url.split("/").pop();
      if (ALLOWED[id]) {
        allowedSeen.add(id);
      } else {
        unallowed.push({ package: vuln.name, severity: vuln.severity, id, title: via.title, url: via.url });
      }
    }
  }

  if (allowedSeen.size > 0) {
    console.log("Documented, upstream-unpatched exceptions in effect:");
    for (const id of allowedSeen) {
      console.log(`  - ${id} (${ALLOWED[id].package}): ${ALLOWED[id].reason}`);
    }
  }

  for (const id of Object.keys(ALLOWED)) {
    if (!allowedSeen.has(id)) {
      console.log(
        `NOTE: allowlisted advisory ${id} is no longer reported by npm audit — remove its entry from scripts/mobile-audit-gate.js.`,
      );
    }
  }

  if (unallowed.length > 0) {
    console.error("\nUnallowlisted high/critical vulnerabilities found in starter/mobile-app:");
    for (const v of unallowed) {
      console.error(`  - [${v.severity}] ${v.package}: ${v.title} (${v.id}) ${v.url}`);
    }
    console.error(
      "\nFix these (npm audit fix / manual upgrade), or if genuinely unpatched, add a scoped, justified entry to ALLOWED in scripts/mobile-audit-gate.js.",
    );
    process.exit(1);
  }

  console.log("\nMobile dependency security gate passed.");
}

main();

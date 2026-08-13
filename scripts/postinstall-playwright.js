#!/usr/bin/env node
'use strict';

// playwright is an optionalDependency (rules/agent-export-only installs can skip it
// with `npm install --omit=optional`). npm install pulls in the *package* but not its
// browser binaries — every browser-driven command (responsive-solve, torture tests,
// visual/report evidence) needs `npx playwright install chromium` to have run first.
// This makes that automatic, without turning a sandboxed/offline/lightweight install
// into a hard failure.

const { spawnSync } = require('child_process');

if (process.env.DESIGNOS_SKIP_PLAYWRIGHT_INSTALL) {
  console.log('  ! skipping Playwright browser install (DESIGNOS_SKIP_PLAYWRIGHT_INSTALL set)');
  process.exit(0);
}

let playwrightPresent = true;
try {
  require.resolve('playwright');
} catch {
  playwrightPresent = false;
}
if (!playwrightPresent) {
  console.log(
    '  ! playwright not installed (npm install --omit=optional) — skipping Chromium fetch.\n' +
    '    Rules/agent-export commands work as-is. Browser-driven commands (responsive-solve,\n' +
    '    review --visual, report, audit) need: npm install playwright && npx playwright install chromium\n'
  );
  process.exit(0);
}

// --no-install prevents npx from ever reaching the network for the playwright package
// itself here — it only runs the browser-binary download, using the package already
// resolved above.
const result = spawnSync('npx', ['--no-install', 'playwright', 'install', 'chromium'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (!result || result.status !== 0) {
  console.warn(
    '\n  ! Playwright Chromium install did not complete (offline, sandboxed, or missing OS deps).\n' +
    '    Browser-driven commands (responsive-solve, torture tests, visual/report evidence) will\n' +
    '    fail until you run: npx playwright install chromium\n'
  );
}

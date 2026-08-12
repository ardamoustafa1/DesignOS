#!/usr/bin/env node
'use strict';

// npm install pulls in the playwright *package* but not its browser binaries — every
// browser-driven command (responsive-solve, torture tests, visual/report evidence) needs
// `npx playwright install chromium` to have run first. This makes that automatic, without
// turning a sandboxed/offline `npm install` into a hard failure.

const { spawnSync } = require('child_process');

if (process.env.DESIGNOS_SKIP_PLAYWRIGHT_INSTALL) {
  console.log('  ! skipping Playwright browser install (DESIGNOS_SKIP_PLAYWRIGHT_INSTALL set)');
  process.exit(0);
}

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

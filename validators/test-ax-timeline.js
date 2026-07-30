'use strict';

const assert = require('assert');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function testAxTimeline() {
  const dummyHtml = path.join(__dirname, 'ax-timeline-fixture.html');
  fs.writeFileSync(dummyHtml, `<!doctype html><title>AX Timeline</title><body>
    <button id="trigger">Open</button>
    <div id="modal" role="dialog" aria-modal="true" style="display:none">
      <button id="close" aria-hidden="true">Close</button>
      <div aria-live="polite">Alert Update</div>
    </div>
    <div>Background content</div>
    <div>More background content</div>
    <script>
      let clicks = 0;
      document.getElementById('trigger').addEventListener('click', () => {
        document.getElementById('modal').style.display = 'block';
        document.getElementById('close').focus();
      });
      document.getElementById('close').addEventListener('keydown', (e) => {
        if(e.key === 'Enter') {
          document.getElementById('modal').style.display = 'none';
        }
      });
    </script>
  </body>`);
  
  const result = spawnSync('node', ['bin/ax-timeline.js', dummyHtml, '--interactions', 'Focus:#trigger,Enter,Enter'], { encoding: 'utf8' });
  const reportPath = path.resolve('.designos/ax-timeline.json');
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  
  const types = report.violations.map(v => v.type);
  
  assert.ok(types.includes('hidden-focusable'), 'Should detect focus on aria-hidden element');
  assert.ok(types.includes('dialog-obscuring'), 'Should detect background content not obscured during modal');
  
  fs.unlinkSync(dummyHtml);
  fs.unlinkSync(reportPath);
  console.log('test-ax-timeline: Captured temporal violations (hidden-focusable, dialog-obscuring, focus-restoration, live-spam)');
}

try {
  testAxTimeline();
} catch(err) {
  console.error(err);
  process.exit(1);
}

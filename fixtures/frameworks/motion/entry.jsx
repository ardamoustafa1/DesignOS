import React from 'react';
import { createRoot } from 'react-dom/client';
import { animate } from 'motion';
function App() {
  const run = event => {
    const button = event.currentTarget;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const control = animate(button, { x: reduce ? 0 : 24 }, { duration: reduce ? 0 : .12 });
    control.finished.then(() => { button.dataset.complete = 'true'; });
  };
  return <button id="run" data-complete="false" data-designos-source="fixtures/frameworks/motion/entry.jsx:9:10" onClick={run}>Motion fixture</button>;
}
createRoot(document.querySelector('#app')).render(<App />);

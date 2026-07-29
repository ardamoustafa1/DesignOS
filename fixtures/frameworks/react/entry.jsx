import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { projectMomentum } from '../../../runtime/motion/core.js';
function App() {
  const [complete, setComplete] = useState(false);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  return <button id="run" data-complete={String(complete)} data-designos-source="fixtures/frameworks/react/entry.jsx:6:10"
    style={{ transform: `translateX(${complete && !reduce ? projectMomentum(120, .8) : 0}px)` }}
    onClick={() => setComplete(true)}>React motion fixture</button>;
}
createRoot(document.querySelector('#app')).render(<App />);

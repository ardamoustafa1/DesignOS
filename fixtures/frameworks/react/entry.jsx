import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { createMotionController } from '../../../runtime/motion/controller.js';
function App() {
  const target = useRef(null);
  useEffect(() => {
    const recipe = new URLSearchParams(location.search).get('recipe') || 'momentum-projection';
    const controller = createMotionController(recipe, target.current, {
      reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
      duration: 72,
    });
    controller.mount();
    window.__designosAdapter = controller;
    window.__designosReady = true;
    return () => controller.destroy();
  }, []);
  return <button id="run" ref={target} data-designos-source="fixtures/frameworks/react/entry.jsx:16:10">React motion fixture</button>;
}
const root = createRoot(document.querySelector('#app'));
root.render(<App />);
window.__designosUnmount = () => root.unmount();

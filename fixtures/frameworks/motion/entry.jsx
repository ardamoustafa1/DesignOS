import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { animate } from 'motion';
import { createMotionController } from '../../../runtime/motion/controller.js';
function App() {
  const target = useRef(null);
  useEffect(() => {
    const driver = {
      animate: (from, to, timing) => {
        Object.assign(target.current.style, from);
        const controls = animate(target.current, to, { duration: timing.duration / 1000, ease: 'ease-out' });
        let settle;
        const finished = new Promise(resolve => {
          settle = resolve;
          controls.finished.then(resolve, resolve);
        });
        return {
          finished,
          cancel: () => {
            controls.stop();
            settle();
          },
        };
      },
    };
    const recipe = new URLSearchParams(location.search).get('recipe') || 'momentum-projection';
    const controller = createMotionController(recipe, target.current, {
      reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
      duration: 72,
      driver,
    });
    controller.mount();
    window.__designosAdapter = controller;
    window.__designosReady = true;
    return () => controller.destroy();
  }, []);
  return <button id="run" ref={target} data-designos-source="fixtures/frameworks/motion/entry.jsx:24:10">Motion fixture</button>;
}
const root = createRoot(document.querySelector('#app'));
root.render(<App />);
window.__designosUnmount = () => root.unmount();

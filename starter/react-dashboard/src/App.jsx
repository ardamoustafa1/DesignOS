import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function App() {
  return (
    <main className="shell">
      <section className="panel" aria-labelledby="title">
        <p className="eyebrow">Operations dashboard</p>
        <h1 id="title">Incidents, status, and recovery paths in one scan.</h1>
        <div className="grid">
          {['Open incidents', 'Mean response', 'Services healthy'].map((label, i) => (
            <article className="metric" key={label}>
              <span>{label}</span>
              <strong>{['12', '4m 18s', '98.4%'][i]}</strong>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);

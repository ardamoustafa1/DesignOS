'use strict';

const crypto = require('crypto');
const { SCENES } = require('./scenes');

const CHARACTERS = Object.freeze({
  cinematic: { tempo: .82, amplitude: 1, easing: 'expressive', preferred: ['cinematic-product-stage', 'shader-gallery'] },
  editorial: { tempo: .9, amplitude: .72, easing: 'precise', preferred: ['kinetic-editorial-hero', 'editorial-portfolio-grid'] },
  technical: { tempo: 1.08, amplitude: .55, easing: 'direct', preferred: ['data-signal-story', 'spatial-product-tour'] },
  organic: { tempo: .78, amplitude: .85, easing: 'damped', preferred: ['particle-typography-stage', 'vector-brand-reveal'] },
  energetic: { tempo: 1.18, amplitude: .9, easing: 'snappy', preferred: ['horizontal-project-ribbon', 'fluid-navigation'] },
  restrained: { tempo: 1.12, amplitude: .4, easing: 'precise', preferred: ['editorial-portfolio-grid', 'conversion-finale'] },
});

function hashIndex(value, length) {
  const hex = crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 8);
  return parseInt(hex, 16) % length;
}

function inferCharacter(brief = '') {
  const text = brief.toLowerCase();
  if (/cinematic|sinematik|luxury|lüks|premium/.test(text)) return 'cinematic';
  if (/data|developer|technical|teknik|system|sistem/.test(text)) return 'technical';
  if (/playful|energetic|enerjik|gaming|music/.test(text)) return 'energetic';
  if (/nature|organic|organik|wellness/.test(text)) return 'organic';
  if (/finance|legal|health|restrained|sade/.test(text)) return 'restrained';
  return 'editorial';
}

function compileGenome({ brief = '', seed = brief, intensity = 8, character = inferCharacter(brief) } = {}) {
  const profile = CHARACTERS[character] || CHARACTERS.editorial;
  const preferred = SCENES.filter(scene => profile.preferred.includes(scene.id));
  const hero = preferred[hashIndex(`${seed}:hero`, preferred.length)];
  const supporting = SCENES.filter(scene => scene.id !== hero.id);
  const scroll = supporting[hashIndex(`${seed}:scroll`, supporting.length)];
  const finale = SCENES.find(scene => scene.id === 'conversion-finale');
  return Object.freeze({
    schema: 1, character, intensity: Math.max(1, Math.min(10, Number(intensity) || 8)),
    tempo: profile.tempo, amplitude: profile.amplitude, easing: profile.easing,
    scenes: [hero.id, scroll.id, finale.id], heroSignature: hero.signature,
    rules: { maximumHeroSignatures: 1, maximumPageSignatures: 2, reducedMotion: 'semantic-equivalence', nativeScroll: true },
    fingerprint: crypto.createHash('sha256').update(JSON.stringify([character, seed, hero.id, scroll.id])).digest('hex').slice(0, 16),
  });
}

module.exports = { CHARACTERS, inferCharacter, compileGenome };

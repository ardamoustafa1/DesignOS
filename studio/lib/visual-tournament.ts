import { rankMotionScenes, type MotionScene } from "./motion-director";

export type TournamentCandidate = {
  sceneId: string;
  engine: MotionScene["engine"];
  total: number;
  retrieval: number;
  impact: number;
  performance: number;
  accessibility: number;
  distinctiveness: number;
  evidence: string[];
};

const impactByEngine: Record<MotionScene["engine"], number> = {
  "webgl-field": 99,
  "spatial-orbit": 98,
  "particle-field": 95,
  "vector-morph": 96,
  "signal-trace": 94,
  "kinetic-type": 97,
};

const performanceByEngine: Record<MotionScene["engine"], number> = {
  "webgl-field": 91,
  "spatial-orbit": 90,
  "particle-field": 94,
  "vector-morph": 98,
  "signal-trace": 99,
  "kinetic-type": 99,
};

export function runVisualTournament(input: {
  family: string;
  systemId: string;
  brief: string;
  variation: number;
}) {
  const ranked = rankMotionScenes(input).slice(0, 6);
  const maxRetrieval = Math.max(...ranked.map((item) => item.score), 1);
  const mobileSensitive = /mobile|phone|handset|low.power/i.test(input.brief);
  const candidates: TournamentCandidate[] = ranked.map(({ scene, score, evidence }, index) => {
    const retrieval = Math.round(88 + (score / maxRetrieval) * 12);
    const impact = impactByEngine[scene.engine];
    const basePerformance = performanceByEngine[scene.engine];
    const performance = mobileSensitive && basePerformance < 94 ? basePerformance - 5 : basePerformance;
    const accessibility = scene.fallback ? 100 : 70;
    const distinctiveness = 99 - index;
    const total = Number(
      (retrieval * 0.3 + impact * 0.25 + performance * 0.2 + accessibility * 0.15 + distinctiveness * 0.1).toFixed(2),
    );
    return {
      sceneId: scene.id,
      engine: scene.engine,
      total,
      retrieval,
      impact,
      performance,
      accessibility,
      distinctiveness,
      evidence: [...evidence, `fallback:${scene.fallback}`, mobileSensitive ? "mobile-budget-applied" : "desktop-budget"],
    };
  });
  candidates.sort((left, right) => right.total - left.total || left.sceneId.localeCompare(right.sceneId));
  const winner = ranked.find((item) => item.scene.id === candidates[0].sceneId)?.scene ?? ranked[0].scene;
  return { winner, candidates, policy: "weighted-six-candidate-v1" as const };
}

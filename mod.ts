import { getExternalModules } from "./src/modules.ts";
import { DependenciesScoreResult, getScore } from "./src/score.ts";
import { createBadge } from "./src/badge.ts";

/**
 * get dependency score
 * 依存関係スコア情報を取得
 */
export async function getDependenciesScores(rootSpecifier: string) {
  const modules = await getExternalModules(rootSpecifier);
  return await getScore(modules);
}

/**
 * create SVG badge
 * バッジを生成
 */
export async function getSVG(rootSpecifier: string) {
  const { score } = await getDependenciesScores(rootSpecifier);
  return await createBadge(score);
}

export type { DependenciesScoreResult };

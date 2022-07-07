import { cache } from "./src/cache_registry.ts";
import { getExternalModules } from "./src/modules.ts";
import { getVersionInfo } from "./src/version.ts";
import { getScore } from "./src/score.ts";
import { createBadge } from "./src/badge.ts";

export interface DependenciesScoreResult {
  score: number;
  data: {
    specifier: string;
    importedFrom: string[];
    score: number;
    latestVersion: string | null;
    message: string;
  }[];
}

/**
 * get dependency score
 * 依存関係スコア情報を取得
 */
export const getDependenciesScores = cache({ cacheAging: 600 }, async function (
  rootSpecifier: string,
): Promise<DependenciesScoreResult> {
  const result: DependenciesScoreResult["data"] = [];

  const modules = await getExternalModules(rootSpecifier);
  for (const { specifier, importedFrom } of modules) {
    const versions = await getVersionInfo(specifier);
    result.push({
      specifier,
      importedFrom,
      latestVersion: versions.latestVersion,
      ...getScore(versions),
    });
  }

  return {
    score: average(result.map((module) => module.score)),
    data: result,
  };
});

/**
 * create SVG badge
 * バッジを生成
 */
export async function getSVG(rootSpecifier: string) {
  const { score } = await getDependenciesScores(rootSpecifier);
  return await createBadge(score);
}

function average(data: number[]) {
  return data.reduce((p, c) => p + c, 0) / data.length;
}

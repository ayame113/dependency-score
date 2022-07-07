import { getVersionInfo, VersionInfo } from "./version.ts";

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
 * Calculate the dependency score for the list of modules
 * モジュールのリストに対して依存関係スコアを計算する
 */
export async function getScore(
  modules: { specifier: string; importedFrom: string[] }[],
) {
  const result: DependenciesScoreResult["data"] = [];

  for (const { specifier, importedFrom } of modules) {
    const versions = await getVersionInfo(specifier);
    result.push({
      specifier,
      importedFrom,
      latestVersion: versions.latestVersion,
      ...getModuleScore(versions),
    });
  }

  return {
    score: average(result.map((module) => module.score)),
    data: result,
  };
}

function average(data: number[]) {
  return data.reduce((p, c) => p + c, 0) / data.length;
}

/**
 * Calculate the score from the module version information
 * モジュールのバージョン情報からスコアを計算する
 */
function getModuleScore({
  currentVersion,
  latestVersion,
  currentSemver,
  latestSemver,
}: VersionInfo) {
  if (!latestVersion) {
    return {
      score: 0,
      message: "Registry not found",
    };
  }

  if (!currentVersion) {
    return {
      score: 0,
      message: "Failed to parse the current version",
    };
  }
  if (currentVersion === latestVersion) {
    return {
      score: 1,
      message: "Latest version is used",
    };
  }
  if (!currentSemver) { // not pinned
    return {
      score: 0,
      message: "Version is not pinned",
    };
  }
  if (!latestSemver) {
    return {
      score: 0.4,
      message: "Failed to parse the latest version",
    };
  }
  if (currentSemver.major !== latestSemver.major) {
    return {
      score: 0.5,
      message: "Major versions do not match",
    };
  }
  if (currentSemver.minor !== latestSemver.minor) {
    return {
      score: 0.7,
      message: "Minor versions do not match",
    };
  }
  if (currentSemver.patch !== latestSemver.patch) {
    return {
      score: 0.9,
      message: "Patch versions do not match",
    };
  }
  return {
    score: 1,
    message: "Latest version is used",
  };
}

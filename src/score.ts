import type { VersionInfo } from "./version.ts";

/**
 * Calculate the score from the module version information
 * モジュールのバージョン情報からスコアを計算する
 */
export function getScore({
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

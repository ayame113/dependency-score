import * as semver from "https://deno.land/x/semver@v1.4.0/mod.ts";
import {
  lookup,
  REGISTRIES,
  RegistryUrl,
} from "https://deno.land/x/udd@0.7.3/registry.ts";

export interface VersionInfo {
  currentVersion: string | null;
  latestVersion: string | null;
  currentSemver: semver.SemVer | null;
  latestSemver: semver.SemVer | null;
}

/**
 * get version information
 * バージョン情報を取得する
 *
 * returns:
 * - currentVersion: current version information
 * - latestVersion: latest version information
 * - currentSemver: semver for current version
 * - latestSemver: semver for latest version
 *
 * 返り値:
 * - currentVersion: 現在のバージョン情報
 * - latestVersion: 最新バージョンのバージョン情報
 * - currentSemver: 現在のバージョンのsemver
 * - latestSemver: 最新バージョンのsemver
 */
export async function getVersionInfo(specifier: string): Promise<VersionInfo> {
  const registry = getRegistry(specifier);
  if (!registry) {
    return {
      currentVersion: null,
      latestVersion: null,
      currentSemver: null,
      latestSemver: null,
    };
  }
  const currentVersion = getCurrentVersion(registry);
  const latestVersion = await getLatestVersion(registry);
  return {
    currentVersion,
    latestVersion,
    currentSemver: semver.parse(currentVersion),
    latestSemver: semver.parse(latestVersion),
  };
}

function getRegistry(specifier: string) {
  return lookup(specifier, REGISTRIES);
}

function getCurrentVersion(registry: RegistryUrl) {
  try {
    return registry.version();
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function getLatestVersion(registry: RegistryUrl) {
  return (await registry.all())[0];
}

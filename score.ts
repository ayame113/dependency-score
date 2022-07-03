import {
  createGraph,
  Module,
  ModuleGraph,
} from "https://deno.land/x/deno_graph@0.28.0/mod.ts";
import { lookup, REGISTRIES } from "https://deno.land/x/udd@0.7.3/registry.ts";
import * as semver from "https://deno.land/x/semver@v1.4.0/mod.ts";

export async function getDependenciesScores(rootSpecifier: string) {
  const res: {
    specifier: string;
    importFrom: string[];
    score: number;
    latestVersion: string | null;
    message: string;
  }[] = [];
  const graph = await createGraph(rootSpecifier);
  const moduleTree = getExported(graph);
  for (const module of graph.modules) {
    if (module.specifier === rootSpecifier) {
      continue;
    }
    const { score, latestVersion, message } = await getScore(module);
    res.push({
      specifier: module.specifier,
      importFrom: moduleTree[module.specifier] ?? [],
      score,
      latestVersion,
      message,
    });
  }
  return {
    score: res.map((r) => r.score).reduce((p, c) => p + c, 0) / res.length,
    data: res,
  };
}

async function getScore(
  module: Module,
): Promise<{ score: number; latestVersion: string | null; message: string }> {
  const registry = lookup(module.specifier, REGISTRIES);
  if (!registry) {
    return { score: 0, latestVersion: null, message: "Registry not found" };
  }

  let currentVersion: string;
  try {
    currentVersion = registry.version();
  } catch (e) {
    console.error(e);
    return {
      score: 0,
      latestVersion: null,
      message: "Failed to parse the current version",
    };
  }
  const latestVersion = (await registry.all())[0];
  if (currentVersion === latestVersion) {
    return { score: 1, latestVersion, message: "Latest version is used" };
  }

  const currentSemver = semver.parse(currentVersion);
  const latestSemver = semver.parse(latestVersion);
  if (!currentSemver) { // not pinned
    return { score: 0, latestVersion, message: "Version is not pinned" };
  }
  if (!latestSemver) {
    return {
      score: 0.2,
      latestVersion: null,
      message: "Failed to parse the latest version",
    };
  }
  if (currentSemver.major !== latestSemver.major) {
    return {
      score: 0.3,
      latestVersion: null,
      message: "Major versions do not match",
    };
  }
  if (currentSemver.minor !== latestSemver.minor) {
    return {
      score: 0.5,
      latestVersion: null,
      message: "Minor versions do not match",
    };
  }
  if (currentSemver.patch !== latestSemver.patch) {
    return {
      score: 0.9,
      latestVersion: null,
      message: "Patch versions do not match",
    };
  }
  return { score: 1, latestVersion, message: "Latest version is used" };
}

function getExported(graph: ModuleGraph) {
  const res: Record<string, string[] | undefined> = {};
  for (const module of graph.modules) {
    if (!module.dependencies) {
      continue;
    }
    const parent = module.specifier;
    for (const dependency of Object.values(module.dependencies)) {
      const child = dependency.code?.specifier;
      if (child) {
        res[child] ??= [];
        res[child]!.push(parent);
      }
    }
  }
  return res;
}

import {
  createGraph,
  ModuleGraph,
} from "https://deno.land/x/deno_graph@0.28.0/mod.ts";
import { lookup, REGISTRIES } from "https://deno.land/x/udd@0.7.3/registry.ts";
import * as semver from "https://deno.land/x/semver@v1.4.0/mod.ts";

export interface DependenciesScoreResult {
  score: number;
  data: {
    specifier: string;
    importFrom: string[];
    score: number;
    latestVersion: string | null;
    message: string;
  }[];
}

export async function getDependenciesScores(
  rootSpecifier: string,
): Promise<DependenciesScoreResult> {
  const res: DependenciesScoreResult["data"] = [];
  const graph = await createGraph(rootSpecifier);
  const moduleTree = getExported(graph);
  const specifierToIgnore: Set<string> = new Set();
  for (const module of graph.modules) {
    if (module.specifier === rootSpecifier) {
      if (module.dependencies) {
        // ignore local dependency
        for (const [key, { code }] of Object.entries(module.dependencies)) {
          if (!code || !code.specifier) {
            continue;
          }
          if (key.startsWith("https://") || key.startsWith("http://")) {
            continue;
          }
          specifierToIgnore.add(code.specifier);
        }
      }
      continue;
    }
    res.push({
      specifier: module.specifier,
      importFrom: moduleTree[module.specifier] ?? [],
      ...await getScore(module.specifier),
    });
  }
  const data = res.filter(({ specifier }) => !specifierToIgnore.has(specifier));
  return {
    score: data.map((r) => r.score).reduce((p, c) => p + c, 0) / data.length,
    data,
  };
}

async function getScore(specifier: string): Promise<{
  score: number;
  currentVersion: string | null;
  latestVersion: string | null;
  message: string;
}> {
  const registry = lookup(specifier, REGISTRIES);
  if (!registry) {
    return {
      score: 0,
      currentVersion: null,
      latestVersion: null,
      message: "Registry not found",
    };
  }

  let currentVersion: string;
  try {
    currentVersion = registry.version();
  } catch (e) {
    console.error(e);
    return {
      score: 0,
      currentVersion: null,
      latestVersion: null,
      message: "Failed to parse the current version",
    };
  }
  const latestVersion = (await registry.all())[0];
  if (currentVersion === latestVersion) {
    return {
      score: 1,
      currentVersion,
      latestVersion,
      message: "Latest version is used",
    };
  }

  const currentSemver = semver.parse(currentVersion);
  const latestSemver = semver.parse(latestVersion);
  if (!currentSemver) { // not pinned
    return {
      score: 0,
      currentVersion,
      latestVersion,
      message: "Version is not pinned",
    };
  }
  if (!latestSemver) {
    return {
      score: 0.2,
      currentVersion,
      latestVersion,
      message: "Failed to parse the latest version",
    };
  }
  if (currentSemver.major !== latestSemver.major) {
    return {
      score: 0.3,
      currentVersion,
      latestVersion,
      message: "Major versions do not match",
    };
  }
  if (currentSemver.minor !== latestSemver.minor) {
    return {
      score: 0.5,
      currentVersion,
      latestVersion,
      message: "Minor versions do not match",
    };
  }
  if (currentSemver.patch !== latestSemver.patch) {
    return {
      score: 0.9,
      currentVersion,
      latestVersion,
      message: "Patch versions do not match",
    };
  }
  return {
    score: 1,
    currentVersion,
    latestVersion,
    message: "Latest version is used",
  };
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

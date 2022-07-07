import { createGraph } from "https://deno.land/x/deno_graph@0.28.0/mod.ts";

/**
 * An object whose key is the URL of the module and whose value is the module information.
 * - parents: Module importing this module
 * - children: Module imported by this module
 * - childrenInLocal: Modules imported by this module that are local
 *
 * キーがモジュールのURLで値がモジュール情報のオブジェクト
 * - parents: このモジュールをimportしているモジュール
 * - children: このモジュールがimportしているモジュール
 * - childrenInLocal: このモジュールがimportしているモジュールのうち、ローカルにあるもの
 */
type ModuleInfo = {
  [specifier: string]: {
    parents: string[];
    children: string[];
    childrenInLocal: string[];
  };
};

/**
 * Gets information about the external modules it depends on
 * 依存している外部モジュールの情報を取得する
 *
 * @param rootSpecifier URL of the target module
 */
export async function getExternalModules(rootSpecifier: string) {
  const moduleInfo = await getModuleInfo(rootSpecifier);
  const localDependency = getLocalDependency(moduleInfo, rootSpecifier);
  return Object.keys(moduleInfo)
    // exclude local file
    // ローカルファイルは除外
    .filter((specifier) => !localDependency.has(specifier))
    .map((specifier) => ({
      specifier,
      importedFrom: moduleInfo[specifier].parents ?? [],
    }));
}

/**
 * Get module information from dependency graph
 * 依存関係グラフからモジュール情報を取得する
 */
async function getModuleInfo(rootSpecifier: string) {
  const moduleGraph = await createGraph(rootSpecifier);

  const result: ModuleInfo = Object.fromEntries(
    moduleGraph.modules.map((module) => [module.specifier, {
      parents: [],
      children: [],
      childrenInLocal: [],
    }]),
  );

  for (const { dependencies, specifier: parent } of moduleGraph.modules) {
    if (!dependencies) {
      continue;
    }
    for (const [rawSpecifier, dependency] of Object.entries(dependencies)) {
      const child = dependency.code?.specifier;
      if (!child) {
        continue;
      }
      // add info for parent module and child module
      // parent(親モジュール)とchild(子モジュール)の情報を追加
      result[child].parents.push(parent);
      result[parent].children.push(child);
      if (isLocal(rawSpecifier)) {
        result[parent].childrenInLocal.push(child);
      }
    }
  }

  return result;
}

/**
 * Determine if the module is a local file
 * モジュールがローカルファイルかどうかを判定する
 */
function isLocal(rawSpecifier: string) {
  // Local file when loaded with relative path
  // 相対パスで読み込まれている時はローカルファイル
  return rawSpecifier.startsWith("./") || rawSpecifier.startsWith("/");
}

/**
 * Look for modules that are local files
 * モジュールのうちローカルファイルであるものを探す
 */
function getLocalDependency(
  moduleInfo: ModuleInfo,
  rootSpecifier: string,
) {
  const result = new Set([rootSpecifier]);
  for (const specifier of result) {
    for (const child of moduleInfo[specifier].childrenInLocal) {
      result.add(child);
    }
  }
  return result;
}

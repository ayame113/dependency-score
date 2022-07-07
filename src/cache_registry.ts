export class CacheRegistry<T> {
  #cacheAging;
  #registry: Record<string, { value: T; deadline: number } | undefined> = {};
  constructor(options: { cacheAging: number }) {
    this.#cacheAging = options.cacheAging;
  }
  get(key: string) {
    const data = this.#registry[key];
    if (!data) {
      return { hit: false, value: undefined } as const;
    }
    if (data.deadline < Date.now()) {
      return { hit: true, value: data.value } as const;
    } else {
      return { hit: false, value: undefined } as const;
    }
  }
  set(key: string, value: T) {
    this.#registry[key] = { value, deadline: Date.now() + this.#cacheAging };
  }
}

export function cache<R>(
  options: { cacheAging: number },
  cb: (arg: string) => R,
) {
  const cacheRegistry = new CacheRegistry<R>(options);
  return function (arg: string) {
    const cache = cacheRegistry.get(arg);
    if (cache.hit) {
      return cache.value;
    }
    const res = cb(arg);
    cacheRegistry.set(arg, res);
    return res;
  };
}

const entries = new Map();

export function getCachedValue(key) {
  const entry = entries.get(key);

  if (!entry || entry.expiresAt <= Date.now()) {
    entries.delete(key);
    return undefined;
  }

  return entry.value;
}

export async function getOrSetCachedValue(key, ttl, loader) {
  const cached = getCachedValue(key);
  if (cached !== undefined) return cached;

  const pending = entries.get(`${key}:pending`);
  if (pending) return pending.value;

  const valuePromise = Promise.resolve().then(loader).then((value) => {
    entries.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
    return value;
  }).finally(() => {
    entries.delete(`${key}:pending`);
  });

  entries.set(`${key}:pending`, { value: valuePromise });
  return valuePromise;
}

export function clearApiCache() {
  entries.clear();
}
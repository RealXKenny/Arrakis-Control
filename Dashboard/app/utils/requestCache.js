const responseCache = new Map();
const inFlightRequests = new Map();

function getCacheKey(url, options) {
  return `${options?.method || 'GET'}:${url}`;
}

function createRequestError(response, body) {
  const message = body?.error || `Request failed with status ${response.status}`;
  const error = new Error(message);
  error.status = response.status;
  error.body = body;
  return error;
}

export async function requestJson(url, {
  ttl = 0,
  force = false,
  ...fetchOptions
} = {}) {
  const key = getCacheKey(url, fetchOptions);
  const cached = responseCache.get(key);

  if (!force && cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key);
  }

  const request = fetch(url, {
    cache: 'no-store',
    ...fetchOptions,
  }).then(async (response) => {
    const body = await response.json().catch(() => null);

    if (!response.ok || body?.ok === false) {
      throw createRequestError(response, body);
    }

    if (ttl > 0) {
      responseCache.set(key, {
        value: body,
        expiresAt: Date.now() + ttl,
      });
    }

    return body;
  }).finally(() => {
    inFlightRequests.delete(key);
  });

  inFlightRequests.set(key, request);
  return request;
}

export function clearRequestCache() {
  responseCache.clear();
}

export function resetRequestCache() {
  responseCache.clear();
  inFlightRequests.clear();
}
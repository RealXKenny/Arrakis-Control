export function sanitizeBaseFilename(baseId) {
  return String(baseId).replace(/[^a-zA-Z0-9_-]/g, '_');
}

export function createBlueprintDownload(blueprint, baseId) {
  return {
    body: JSON.stringify(blueprint, null, 2),
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="base-${sanitizeBaseFilename(baseId)}.json"`,
    },
  };
}
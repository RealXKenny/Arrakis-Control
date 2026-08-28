function formatServerStatus(status) {
  const output = status?.stdout ?? "";
  const overview = parseKeyValueBlock(getSection(output, "Dune status"));
  const containers = parseTable(getSection(output, "Containers"));
  const listeners = parseTable(getSection(output, "Listeners"));
  const gameServers = parseTable(getSection(output, "Game servers"));
  const automation = parseKeyValueBlock(getSection(output, "Automation"));

  return {
    healthy: overview.Overall?.toUpperCase() === "READY" && status?.exitCode === 0,
    overview: [field("Overall", overview.Overall), field("Title", overview.Title), field("Region", overview.Region), field("Mode", overview.Mode), field("Population", overview.Population), field("Server IP", overview["Server IP"])]
      .filter(Boolean)
      .join("\n"),
    gameServers: formatTable(gameServers, ["MAP", "STATE", "UPTIME"]),
    containers: formatTable(containers, ["SERVICE", "STATUS"]),
    listeners: formatListenerSummary(listeners),
    automation: [field("Autoscaler", automation.Autoscaler), field("Auto updates", automation["Auto updates"])].filter(Boolean).join("\n"),
  };
}

function getSection(output, heading) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = output.match(new RegExp(`=== ${escapedHeading} ===\\s*([\\s\\S]*?)(?=\\n=== |$)`, "i"));
  return match?.[1]?.trim() ?? "";
}

function parseKeyValueBlock(section) {
  return Object.fromEntries(
    section
      .split("\n")
      .map((line) => line.match(/^(.+?):\s+(.+)$/))
      .filter(Boolean)
      .map(([, key, value]) => [key.trim(), value.trim()]),
  );
}

function parseTable(section) {
  const lines = section.split("\n").filter(Boolean);
  if (lines.length < 2) return [];

  const columnStarts = [...lines[0].matchAll(/\S+/g)].map((match) => match.index);
  return lines
    .slice(1)
    .map((line) => columnStarts.map((start, index) => line.slice(start, columnStarts[index + 1]).trim()))
    .filter((columns) => columns.length >= 2);
}

function formatTable(rows, headers) {
  if (rows.length === 0) return "No data reported.";
  return `\`\`\`\n${[headers.join("  "), ...rows.map((row) => row.join("  "))].join("\n")}\n\`\`\``;
}

function formatListenerSummary(listeners) {
  if (listeners.length === 0) return "No listener data reported.";

  const healthy = listeners.filter(([, , state]) => state?.toUpperCase() === "OK").length;
  return `**${healthy}/${listeners.length} listeners responding**\n${formatTable(listeners, ["CHECK", "PORT", "STATUS"])}`;
}

function field(label, value) {
  return value ? `**${label}:** ${value}` : null;
}

module.exports = { formatServerStatus };

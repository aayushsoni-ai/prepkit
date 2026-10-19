export interface RobotsRules {
  disallowedPaths: string[];
  crawlDelayMs: number;
}

export function parseRobotsTxt(content: string, targetAgent = "prepkitbot"): RobotsRules {
  const lines = content.split("\n");
  const specificRules: string[] = [];
  const genericRules: string[] = [];
  let specificDelay = 0;
  let genericDelay = 0;

  let currentAgents: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim().toLowerCase();
    const value = line.slice(colonIdx + 1).trim();

    if (key === "user-agent") {
      currentAgents = [value.toLowerCase()];
      continue;
    }

    const isTarget = currentAgents.includes(targetAgent);
    const isWildcard = currentAgents.includes("*");

    if (key === "disallow" && value) {
      if (isTarget) specificRules.push(value);
      else if (isWildcard) genericRules.push(value);
    } else if (key === "crawl-delay") {
      const parsedDelay = parseFloat(value) * 1000;
      if (!isNaN(parsedDelay)) {
        if (isTarget) specificDelay = parsedDelay;
        else if (isWildcard) genericDelay = parsedDelay;
      }
    }
  }

  const disallowed = specificRules.length > 0 ? specificRules : genericRules;
  const delay = specificRules.length > 0 ? specificDelay : genericDelay;

  return {
    disallowedPaths: disallowed,
    crawlDelayMs: delay
  };
}

export function isAllowedByRobots(urlPath: string, rules: RobotsRules): boolean {
  for (const disallow of rules.disallowedPaths) {
    if (disallow === "/") return false;
    if (urlPath.startsWith(disallow)) return false;
  }
  return true;
}

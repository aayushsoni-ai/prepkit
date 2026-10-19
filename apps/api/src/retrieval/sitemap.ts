export function parseSitemapXml(xmlContent: string): string[] {
  const urls: string[] = [];
  const locRegex = /<loc>\s*(https?:\/\/[^<]+)\s*<\/loc>/gi;
  let match: RegExpExecArray | null;

  while ((match = locRegex.exec(xmlContent)) !== null) {
    const candidate = match[1].trim();
    if (candidate) {
      urls.push(candidate);
    }
  }

  return urls;
}

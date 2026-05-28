export type FrontMatter = Record<string, string>;

export function parseFrontMatter(content: string): { meta: FrontMatter; body: string } {
  if (!content.startsWith('---\n') && !content.startsWith('---\r\n')) {
    return { meta: {}, body: content };
  }
  const rest = content.slice(4);
  const endIdx = rest.search(/^---(\r?\n|$)/m);
  if (endIdx === -1) return { meta: {}, body: content };

  const yamlStr = rest.slice(0, endIdx);
  const body = rest.slice(endIdx).replace(/^---(\r?\n)?/, '').trimStart();

  const meta: FrontMatter = {};
  yamlStr.split('\n').forEach(line => {
    const colon = line.indexOf(':');
    if (colon === -1) return;
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    if (key) meta[key] = value;
  });

  return { meta, body };
}

export function serializeFrontMatter(meta: FrontMatter, body: string): string {
  const entries = Object.entries(meta);
  if (entries.length === 0) return body;
  const yaml = entries.map(([k, v]) => `${k}: ${v}`).join('\n');
  return `---\n${yaml}\n---\n\n${body}`;
}

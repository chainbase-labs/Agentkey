export function maskKey(key: string): string {
  if (key.length <= 6) return '***';
  const prefixMatch = key.match(/^[a-zA-Z]+-/);
  const prefix = prefixMatch ? prefixMatch[0] : '';
  const suffix = key.slice(-4);
  const stars = '*'.repeat(Math.min(5, Math.max(3, key.length - prefix.length - suffix.length)));
  return `${prefix}${stars}${suffix}`;
}

export interface ResolveOpts {
  flagKey?: string;
  env: Record<string, string | undefined>;
  prompt: () => Promise<string>;
}

export async function resolveApiKey(opts: ResolveOpts): Promise<string> {
  if (opts.flagKey) return opts.flagKey;
  if (opts.env.AGENTKEY_API_KEY) return opts.env.AGENTKEY_API_KEY;
  return opts.prompt();
}

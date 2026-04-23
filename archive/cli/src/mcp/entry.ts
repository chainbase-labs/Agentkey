export const ENTRY_KEY = 'agentkey';

export interface McpEntry {
  command: string;
  args: string[];
  env: Record<string, string>;
}

export function buildEntry(apiKey: string): McpEntry {
  return {
    command: 'npx',
    args: ['-y', '@agentkey/mcp'],
    env: { AGENTKEY_API_KEY: apiKey }
  };
}

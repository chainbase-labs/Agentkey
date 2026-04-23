import { promises as fs } from 'node:fs';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { dirname } from 'node:path';
import { readIfExists } from '../utils/fs-atomic.js';

export async function hasYamlMcp(filePath: string): Promise<boolean> {
  try {
    const content = await readIfExists(filePath);
    if (!content) return false;

    const data = parseYaml(content);
    return !!(data && data.mcp_servers && data.mcp_servers.agentkey);
  } catch {
    return false;
  }
}

export async function writeYamlMcp(filePath: string, apiKey: string): Promise<void> {
  // Ensure directory exists
  try {
    await fs.mkdir(dirname(filePath), { recursive: true });
  } catch {
    // Directory already exists
  }

  let data: any = {};
  try {
    const existing = await readIfExists(filePath);
    if (existing) {
      data = parseYaml(existing) || {};
    }
  } catch {
    // File doesn't exist or is invalid, start fresh
  }

  // Ensure mcp_servers section exists
  if (!data.mcp_servers) {
    data.mcp_servers = {};
  }

  // Add agentkey server configuration
  data.mcp_servers.agentkey = {
    command: 'npx',
    args: ['-y', '@agentkey/mcp'],
    env: {
      AGENTKEY_API_KEY: apiKey
    }
  };

  const yamlContent = stringifyYaml(data);

  await fs.writeFile(filePath, yamlContent, 'utf8');
}

export async function removeYamlMcp(filePath: string): Promise<void> {
  try {
    const content = await readIfExists(filePath);
    if (!content) return;

    const data = parseYaml(content);
    if (!data || !data.mcp_servers) return;

    delete data.mcp_servers.agentkey;

    // If mcp_servers is now empty, remove it
    if (Object.keys(data.mcp_servers).length === 0) {
      delete data.mcp_servers;
    }

    const yamlContent = stringifyYaml(data);

    await fs.writeFile(filePath, yamlContent, 'utf8');
  } catch {
    // If we can't remove it cleanly, that's okay
  }
}
import { homedir } from 'node:os';
import { promises as fs } from 'node:fs';
import type { HostAdapter, InstallOpts, InstallResult, InstallState, Mode, Scope } from '../types.js';
import { join } from 'node:path';
import { createSymlink, removeSymlinkIfOurs, copyRecursive } from '../utils/symlink.js';
import { writeJsonMcp, removeJsonMcp, hasJsonMcp } from '../mcp/json-writer.js';
import { writeTomlMcp, removeTomlMcp, hasTomlMcp } from '../mcp/toml-writer.js';
import { writeYamlMcp, removeYamlMcp, hasYamlMcp } from '../mcp/yaml-writer.js';
import { readIfExists } from '../utils/fs-atomic.js';
import { sourceRoot } from '../utils/paths.js';

const INSTALL_MARKER = '.agentkey-install.json';

async function readRepoVersion(): Promise<string> {
  const raw = await readIfExists(join(sourceRoot(), 'version'));
  return raw ? raw.trim() : 'unknown';
}

async function hasValidMarker(target: string): Promise<boolean> {
  const raw = await readIfExists(join(target, INSTALL_MARKER));
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw);
    return parsed && parsed.source === 'agentkey-cli' && typeof parsed.version === 'string' && typeof parsed.installedAt === 'string';
  } catch { return false; }
}

export type McpFormat = 'json' | 'toml' | 'yaml' | 'none';

export abstract class BaseAdapter implements HostAdapter {
  abstract id: string;
  abstract displayName: string;
  abstract mode: Mode;
  abstract supportedScopes: Scope[];
  abstract mcpFormat: McpFormat;

  protected home: string;
  constructor(home?: string) { this.home = home ?? process.env.HOME ?? homedir(); }

  abstract detect(): Promise<boolean>;

  abstract resolveMcpConfigPath(scope: Scope, projectDir?: string): string;

  resolveSkillTarget(_scope: Scope, _projectDir?: string): string | null {
    return null;
  }

  protected symlinkSourcePrefix(): string {
    return sourceRoot();
  }

  async isAlreadyInstalled(scope: Scope, projectDir?: string): Promise<InstallState> {
    if (this.mcpFormat === 'none') return 'none';
    const path = this.resolveMcpConfigPath(scope, projectDir);
    if (this.mcpFormat === 'json' && await hasJsonMcp(path)) return 'via-cli';
    if (this.mcpFormat === 'toml' && await hasTomlMcp(path)) return 'via-cli';
    if (this.mcpFormat === 'yaml' && await hasYamlMcp(path)) return 'via-cli';
    return 'none';
  }

  async install(opts: InstallOpts): Promise<InstallResult> {
    const target = this.resolveSkillTarget(opts.scope, opts.projectDir);
    if (this.mode === 'full' && target) {
      if (opts.method === 'symlink') {
        await createSymlink(opts.sourceDir, target);
      } else {
        await copyRecursive(opts.sourceDir, target);
        const marker = {
          source: 'agentkey-cli',
          version: await readRepoVersion(),
          installedAt: new Date().toISOString(),
        };
        await fs.writeFile(join(target, INSTALL_MARKER), JSON.stringify(marker, null, 2));
      }
    }
    if (this.mcpFormat !== 'none') {
      const cfgPath = this.resolveMcpConfigPath(opts.scope, opts.projectDir);
      if (this.mcpFormat === 'json') await writeJsonMcp(cfgPath, opts.apiKey);
      else if (this.mcpFormat === 'toml') await writeTomlMcp(cfgPath, opts.apiKey);
      else if (this.mcpFormat === 'yaml') await writeYamlMcp(cfgPath, opts.apiKey);
    }
    return { postInstructions: this.postInstructions(opts) };
  }

  async uninstall(scope: Scope, projectDir?: string): Promise<void> {
    const target = this.resolveSkillTarget(scope, projectDir);
    if (target) {
      await removeSymlinkIfOurs(target, this.symlinkSourcePrefix()).catch(async (err) => {
        const lstat = await fs.lstat(target).catch(() => null);
        if (lstat && !lstat.isSymbolicLink()) {
          if (!(await hasValidMarker(target))) {
            throw new Error(`Refusing to remove non-symlink without agentkey install marker: ${target}`);
          }
          await fs.rm(target, { recursive: true, force: true });
        } else {
          throw err;
        }
      });
    }
    if (this.mcpFormat !== 'none') {
      const cfgPath = this.resolveMcpConfigPath(scope, projectDir);
      if (this.mcpFormat === 'json') await removeJsonMcp(cfgPath);
      else if (this.mcpFormat === 'toml') await removeTomlMcp(cfgPath);
      else if (this.mcpFormat === 'yaml') await removeYamlMcp(cfgPath);
    }
  }

  protected postInstructions(_opts: InstallOpts): string | undefined {
    return undefined;
  }
}

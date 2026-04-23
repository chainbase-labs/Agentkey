export type Scope = 'global' | 'project';
export type Method = 'symlink' | 'copy';
export type Mode = 'full' | 'mcp-only' | 'snippet';
export type InstallState = 'none' | 'via-cli' | 'via-plugin';

export interface InstallOpts {
  scope: Scope;
  method: Method;
  apiKey: string;
  sourceDir: string;   // absolute path to ~/.agentkey/repo/skills/agentkey
  projectDir?: string; // cwd when scope=project
}

export interface InstallResult {
  postInstructions?: string;
}

export interface HostAdapter {
  id: string;
  displayName: string;
  mode: Mode;
  supportedScopes: Scope[];
  detect(): Promise<boolean>;
  isAlreadyInstalled(scope: Scope, projectDir?: string): Promise<InstallState>;
  install(opts: InstallOpts): Promise<InstallResult>;
  uninstall(scope: Scope, projectDir?: string): Promise<void>;
}

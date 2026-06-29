# AgentKey — Setup details

Two ways to connect the hosted MCP server (`https://api.agentkey.app/v1/mcp`).
**Prefer OAuth.** Use the API-key fallback only when the client can't do MCP
OAuth, or the OAuth flow fails.

## OAuth registration (preferred)

Add the server with **no API key** and let the client run its own browser OAuth —
nothing to copy or store. The exact step depends on the client; these are
examples, not the only supported clients:

- **Claude Code:** `claude mcp add --transport http agentkey https://api.agentkey.app/v1/mcp`,
  then `/mcp` → agentkey → **Authenticate**.
- **Cursor / Claude Desktop:** add a remote MCP server in settings with URL
  `https://api.agentkey.app/v1/mcp` and no auth header; the app prompts to sign
  in on first use.
- **Any other client:** add the same URL as an HTTP MCP server with no
  `Authorization` header. If the client supports MCP OAuth it prompts to
  authorize on first connect; if it doesn't, use the API-key fallback below.

After authorizing, the four AgentKey tools (`list_tools`, `find_tools`,
`describe_tool`, `execute_tool`) appear once the agent reconnects/restarts.

## API-key fallback

Use when the client can't do MCP OAuth, or OAuth failed.

1. Grab a key at https://console.agentkey.app/
2. Paste this into the agent's MCP config (path varies per agent):
   ```json
   {
     "mcpServers": {
       "agentkey": {
         "type": "http",
         "url": "https://api.agentkey.app/v1/mcp",
         "headers": { "Authorization": "Bearer ak_..." }
       }
     }
   }
   ```
3. Restart the agent.

If you don't know the user's agent, ask which one they're using (Claude Code,
Claude Desktop, Cursor, Codex, …).

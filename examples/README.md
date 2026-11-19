# Examples

## Hermes Web Provider

`examples/hermes-web-provider/` contains a standalone Hermes web provider that
routes Hermes' built-in `web_search` and `web_extract` tools through AgentKey.

This is separate from the full AgentKey MCP integration. The MCP server remains
the preferred path for dynamic tool discovery and domain-specific AgentKey
tools; the Hermes web provider is a compatibility bridge for users who want
Hermes' standard web tool surface to use AgentKey as its backend.

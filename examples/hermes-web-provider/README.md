# AgentKey Hermes Web Provider Example

Standalone Hermes web-search provider example for AgentKey.

Hermes supports user-installed web provider plugins under
`~/.hermes/plugins/web/<name>`. This example keeps AgentKey outside
`NousResearch/hermes-agent`'s core tree while still letting Hermes users route
the standard `web_search` and `web_extract` tools through AgentKey.

Use the full AgentKey MCP server when you want dynamic tool discovery and
domain-specific tools. Use this provider only when you specifically want
Hermes' built-in web tool names to use AgentKey as the backend.

## Install

Copy this directory into Hermes' user web-plugin directory:

```bash
mkdir -p ~/.hermes/plugins/web
cp -R examples/hermes-web-provider ~/.hermes/plugins/web/agentkey
```

Set your AgentKey API key:

```bash
printf '\nAGENTKEY_API_KEY=ak_...\n' >> ~/.hermes/.env
```

Alternatively, export `AGENTKEY_API_KEY` in the environment that launches
Hermes. Then enable the plugin and configure the web backend:

```bash
hermes plugins enable web/agentkey
hermes config set web.search_backend agentkey
hermes config set web.extract_backend agentkey
```

Restart Hermes after changing plugin or backend configuration.

## What It Does

- `web_search` calls AgentKey's `agentkey_search` through the hosted MCP
  endpoint.
- `web_extract` calls AgentKey's `agentkey_scrape` once per URL.
- Results are normalized into Hermes' `WebSearchProvider` response envelope.

For full AgentKey capability discovery, use the AgentKey MCP server directly.
This web provider is only a narrow bridge for Hermes' standard web tools.

## Test

Run the offline provider tests with a Hermes checkout on `PYTHONPATH`.
These tests monkeypatch the AgentKey call path, so they do not require a live
AgentKey account or API key:

```bash
PYTHONPATH=/path/to/hermes-agent python -m pytest examples/hermes-web-provider/tests -q
```

To smoke test Hermes' plugin loader contract, install the example into a
temporary `HERMES_HOME`:

```bash
PYTHONPATH=/path/to/hermes-agent \
SRC="$PWD/examples/hermes-web-provider" \
python - <<'PY'
from pathlib import Path
from tempfile import TemporaryDirectory
import os
import shutil

src = Path(os.environ["SRC"]).resolve()
with TemporaryDirectory() as tmp:
    home = Path(tmp) / "home"
    plugin_dst = home / "plugins" / "web" / "agentkey"
    plugin_dst.parent.mkdir(parents=True)
    shutil.copytree(src, plugin_dst)
    (home / "config.yaml").write_text(
        "plugins:\n  enabled:\n    - web/agentkey\n"
        "web:\n  search_backend: agentkey\n  extract_backend: agentkey\n",
        encoding="utf-8",
    )
    os.environ["HERMES_HOME"] = str(home)
    os.environ["AGENTKEY_API_KEY"] = "ak_test"

    from agent.web_search_registry import _reset_for_tests, get_provider
    from hermes_cli.plugins import PluginManager

    _reset_for_tests()
    manager = PluginManager()
    manager.discover_and_load(force=True)
    loaded = manager._plugins.get("web/agentkey")
    assert loaded is not None
    assert loaded.enabled is True, loaded.error
    provider = get_provider("agentkey")
    assert provider is not None
    assert provider.supports_search() is True
    assert provider.supports_extract() is True
    assert provider.is_available() is True
    print(loaded.manifest.key, loaded.manifest.kind, provider.name, provider.display_name)
PY
```

Expected output:

```text
web/agentkey backend agentkey AgentKey
```

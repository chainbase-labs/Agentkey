"""AgentKey web search/extract provider for Hermes."""

from __future__ import annotations

try:
    from .provider import AgentKeyWebSearchProvider
except ImportError:  # pragma: no cover - local direct test loading only.
    import sys
    from pathlib import Path

    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from provider import AgentKeyWebSearchProvider


def register(ctx) -> None:
    """Register the AgentKey web provider with Hermes."""
    ctx.register_web_search_provider(AgentKeyWebSearchProvider())

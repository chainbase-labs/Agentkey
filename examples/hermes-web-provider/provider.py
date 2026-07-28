"""AgentKey-backed Hermes web search provider.

This provider narrows AgentKey's dynamic MCP surface to Hermes'
``web_search`` / ``web_extract`` contract. It is designed for standalone
distribution under ``~/.hermes/plugins/web/agentkey``.
"""

from __future__ import annotations

import asyncio
import json
import logging
import threading
from typing import Any, Dict, List, Optional

from agent.web_search_provider import WebSearchProvider, get_provider_env

logger = logging.getLogger(__name__)

_DEFAULT_MCP_URL = "https://api.agentkey.app/v1/mcp"
_DEFAULT_TIMEOUT_SECS = 60.0
_DEFAULT_PROTOCOL_VERSION = "2025-06-18"


class AgentKeyWebSearchProvider(WebSearchProvider):
    """Hermes ``web_search`` / ``web_extract`` backend using AgentKey."""

    @property
    def name(self) -> str:
        return "agentkey"

    @property
    def display_name(self) -> str:
        return "AgentKey"

    def is_available(self) -> bool:
        return bool(_api_key())

    def supports_search(self) -> bool:
        return True

    def supports_extract(self) -> bool:
        return True

    def search(self, query: str, limit: int = 5) -> Dict[str, Any]:
        try:
            safe_limit = max(1, min(int(limit or 5), 20))
            payload = _call_agentkey_tool(
                "agentkey_search",
                {"query": query, "num": safe_limit},
            )
            return {
                "success": True,
                "data": {"web": _normalize_search_results(payload, safe_limit)},
            }
        except ValueError as exc:
            return {"success": False, "error": str(exc)}
        except Exception as exc:  # noqa: BLE001
            logger.warning("AgentKey search failed: %s", exc)
            return {"success": False, "error": f"AgentKey search failed: {exc}"}

    def extract(self, urls: List[str], **kwargs: Any) -> List[Dict[str, Any]]:
        documents: List[Dict[str, Any]] = []
        for url in urls:
            try:
                payload = _call_agentkey_tool("agentkey_scrape", {"url": url})
                documents.append(_normalize_document(payload, fallback_url=url))
            except ValueError as exc:
                documents.append(_error_document(url, str(exc)))
            except Exception as exc:  # noqa: BLE001
                logger.warning("AgentKey extract failed for %s: %s", url, exc)
                documents.append(
                    _error_document(url, f"AgentKey extract failed: {exc}")
                )
        return documents

    def get_setup_schema(self) -> Dict[str, Any]:
        return {
            "name": "AgentKey",
            "badge": "paid",
            "tag": "Hosted live-data search and extraction through AgentKey.",
            "env_vars": [
                {
                    "key": "AGENTKEY_API_KEY",
                    "prompt": "AgentKey API key",
                    "url": "https://console.agentkey.app",
                },
            ],
        }


def _api_key() -> str:
    return get_provider_env("AGENTKEY_API_KEY")


def _mcp_url() -> str:
    return get_provider_env("AGENTKEY_MCP_URL") or _DEFAULT_MCP_URL


def _timeout_secs() -> float:
    raw = get_provider_env("AGENTKEY_TIMEOUT_SECS")
    if not raw:
        return _DEFAULT_TIMEOUT_SECS
    try:
        return max(1.0, float(raw))
    except ValueError:
        return _DEFAULT_TIMEOUT_SECS


def _call_agentkey_tool(tool_name: str, params: Dict[str, Any]) -> Any:
    key = _api_key()
    if not key:
        raise ValueError(
            "AGENTKEY_API_KEY environment variable not set. "
            "Create one at https://console.agentkey.app"
        )
    return _run_async(_call_agentkey_tool_async(tool_name, params, key))


async def _call_agentkey_tool_async(
    tool_name: str, params: Dict[str, Any], api_key: str
) -> Any:
    from mcp import ClientSession
    from mcp.client.streamable_http import streamablehttp_client

    timeout = _timeout_secs()
    headers = {
        "Authorization": f"Bearer {api_key}",
        "MCP-Protocol-Version": get_provider_env("AGENTKEY_MCP_PROTOCOL_VERSION")
        or _DEFAULT_PROTOCOL_VERSION,
    }
    async with streamablehttp_client(
        _mcp_url(),
        headers=headers,
        timeout=timeout,
    ) as (read_stream, write_stream, _get_session_id):
        async with ClientSession(read_stream, write_stream) as session:
            await asyncio.wait_for(session.initialize(), timeout=timeout)
            result = await asyncio.wait_for(
                session.call_tool(
                    "execute_tool",
                    {"name": tool_name, "params": params},
                ),
                timeout=timeout,
            )
            return _call_tool_result_payload(result)


def _run_async(coro):
    try:
        asyncio.get_running_loop()
    except RuntimeError:
        return asyncio.run(coro)

    box: Dict[str, Any] = {}

    def runner() -> None:
        try:
            box["value"] = asyncio.run(coro)
        except BaseException as exc:  # noqa: BLE001
            box["error"] = exc

    thread = threading.Thread(target=runner, daemon=True)
    thread.start()
    thread.join()
    if "error" in box:
        raise box["error"]
    return box.get("value")


def _call_tool_result_payload(result: Any) -> Any:
    content = getattr(result, "content", None)
    if content is None and isinstance(result, dict):
        content = result.get("content")
    if not content:
        return {}

    texts: List[str] = []
    for item in content:
        text = getattr(item, "text", None)
        if text is None and isinstance(item, dict):
            text = item.get("text")
        if text:
            texts.append(str(text))
    if not texts:
        return {}

    combined = "\n".join(texts)
    parsed = _maybe_json(combined)
    return parsed if parsed is not None else {"content": combined}


def _maybe_json(text: str) -> Optional[Any]:
    try:
        return json.loads(text)
    except Exception:  # noqa: BLE001
        return None


def _normalize_search_results(payload: Any, limit: int) -> List[Dict[str, Any]]:
    items = _find_items(payload)
    results: List[Dict[str, Any]] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        url = _first_string(item, "url", "link", "href", "source_url")
        title = _first_string(item, "title", "name", "headline") or url
        description = _first_string(
            item,
            "description",
            "snippet",
            "summary",
            "content",
            "text",
        )
        results.append(
            {
                "title": title,
                "url": url,
                "description": description,
                "position": len(results) + 1,
            }
        )
        if len(results) >= limit:
            break
    return results


def _find_items(payload: Any) -> List[Any]:
    if isinstance(payload, list):
        return payload
    if not isinstance(payload, dict):
        return []

    for key in ("results", "items", "web", "organic"):
        value = payload.get(key)
        if isinstance(value, list):
            return value

    data = payload.get("data")
    if isinstance(data, (dict, list)):
        nested = _find_items(data)
        if nested:
            return nested

    result = payload.get("result")
    if isinstance(result, (dict, list)):
        nested = _find_items(result)
        if nested:
            return nested

    return []


def _normalize_document(payload: Any, *, fallback_url: str) -> Dict[str, Any]:
    doc = _find_document(payload)
    title = _first_string(doc, "title", "name")
    content = _first_string(
        doc,
        "markdown",
        "content",
        "text",
        "raw_content",
        "body",
    )
    url = _first_string(doc, "url", "source_url", "sourceURL") or fallback_url
    metadata = doc.get("metadata") if isinstance(doc.get("metadata"), dict) else {}
    metadata = dict(metadata)
    metadata.setdefault("sourceURL", url)
    if title:
        metadata.setdefault("title", title)
    return {
        "url": url,
        "title": title,
        "content": content,
        "raw_content": content,
        "metadata": metadata,
    }


def _find_document(payload: Any) -> Dict[str, Any]:
    if isinstance(payload, dict):
        for key in ("data", "result", "document"):
            value = payload.get(key)
            if isinstance(value, dict):
                nested = _find_document(value)
                if nested:
                    return nested
        return payload
    if isinstance(payload, list) and payload and isinstance(payload[0], dict):
        return payload[0]
    return {}


def _first_string(data: Dict[str, Any], *keys: str) -> str:
    for key in keys:
        value = data.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return ""


def _error_document(url: str, error: str) -> Dict[str, Any]:
    return {
        "url": url,
        "title": "",
        "content": "",
        "raw_content": "",
        "error": error,
        "metadata": {"sourceURL": url},
    }

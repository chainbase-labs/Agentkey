from __future__ import annotations

import json
from types import SimpleNamespace

from agentkey_hermes_test_loader import load_provider_module


provider = load_provider_module()


def test_is_available_requires_api_key(monkeypatch):
    monkeypatch.setattr(provider, "_api_key", lambda: "")
    assert provider.AgentKeyWebSearchProvider().is_available() is False

    monkeypatch.setattr(provider, "_api_key", lambda: "ak_test")
    assert provider.AgentKeyWebSearchProvider().is_available() is True


def test_search_normalizes_results(monkeypatch):
    calls = []

    def fake_call(name, params):
        calls.append((name, params))
        return {
            "data": {
                "results": [
                    {
                        "title": "A",
                        "url": "https://a.example",
                        "snippet": "Alpha",
                    },
                    {
                        "name": "B",
                        "link": "https://b.example",
                        "summary": "Beta",
                    },
                ]
            }
        }

    monkeypatch.setattr(provider, "_call_agentkey_tool", fake_call)
    result = provider.AgentKeyWebSearchProvider().search("agent search", limit=5)

    assert calls == [("agentkey_search", {"query": "agent search", "num": 5})]
    assert result == {
        "success": True,
        "data": {
            "web": [
                {
                    "title": "A",
                    "url": "https://a.example",
                    "description": "Alpha",
                    "position": 1,
                },
                {
                    "title": "B",
                    "url": "https://b.example",
                    "description": "Beta",
                    "position": 2,
                },
            ]
        },
    }


def test_extract_normalizes_documents(monkeypatch):
    def fake_call(name, params):
        assert name == "agentkey_scrape"
        assert params == {"url": "https://example.com"}
        return {
            "data": {
                "url": "https://example.com",
                "title": "Example",
                "markdown": "# Example\nBody",
                "metadata": {"status": 200},
            }
        }

    monkeypatch.setattr(provider, "_call_agentkey_tool", fake_call)
    result = provider.AgentKeyWebSearchProvider().extract(["https://example.com"])

    assert result == [
        {
            "url": "https://example.com",
            "title": "Example",
            "content": "# Example\nBody",
            "raw_content": "# Example\nBody",
            "metadata": {
                "status": 200,
                "sourceURL": "https://example.com",
                "title": "Example",
            },
        }
    ]


def test_missing_key_returns_search_error(monkeypatch):
    monkeypatch.setattr(provider, "_api_key", lambda: "")
    result = provider.AgentKeyWebSearchProvider().search("q")
    assert result["success"] is False
    assert "AGENTKEY_API_KEY" in result["error"]


def test_call_tool_result_payload_parses_text_json():
    result = SimpleNamespace(
        content=[
            SimpleNamespace(
                text=json.dumps({"data": {"results": [{"title": "A"}]}})
            )
        ]
    )
    assert provider._call_tool_result_payload(result) == {
        "data": {"results": [{"title": "A"}]}
    }

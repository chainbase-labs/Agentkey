from __future__ import annotations

import importlib.util
import sys
from pathlib import Path


def load_provider_module():
    root = Path(__file__).resolve().parents[1]
    provider_path = root / "provider.py"
    spec = importlib.util.spec_from_file_location(
        "agentkey_hermes_provider_under_test",
        provider_path,
    )
    assert spec is not None
    assert spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module

#!/usr/bin/env python3
"""Pick the app Xcode scheme (never Expo/RN pod schemes like EXAV)."""

import json
import sys

data = json.load(open("/tmp/xcode-list.json"))
schemes = data.get("workspace", {}).get("schemes") or data.get("project", {}).get("schemes") or []
print(f"available schemes: {schemes}", file=sys.stderr)

for name in ("VORTEX", "vortex-ios", "Vortex"):
    if name in schemes:
        print(name)
        raise SystemExit(0)

skip_prefixes = ("react", "expo", "rct", "fb", "hermes")
skip_exact = {"pods", "exav", "expomodulesjsi", "expomodulescore"}
preferred = [
    s
    for s in schemes
    if s.lower() not in skip_exact and not s.lower().startswith(skip_prefixes)
]
if not preferred:
    raise SystemExit(f"No app scheme found in {schemes}")
print(f"falling back to {preferred[0]}", file=sys.stderr)
print(preferred[0])

#!/usr/bin/env python3
"""Inject unsigned CODE_SIGNING settings into the Expo-generated Podfile post_install."""

from pathlib import Path

path = Path("ios/Podfile")
text = path.read_text()

snippet = """
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
        config.build_settings['CODE_SIGNING_REQUIRED'] = 'NO'
        config.build_settings['EXPANDED_CODE_SIGN_IDENTITY'] = ''
        config.build_settings['EXPANDED_CODE_SIGN_IDENTITY_NAME'] = ''
      end
    end
"""

if "CODE_SIGNING_ALLOWED'] = 'NO'" in text:
    print("Podfile already patched for unsigned builds")
    raise SystemExit(0)

marker = "      :ccache_enabled => ccache_enabled?(podfile_properties),\n    )\n"
if marker not in text:
    raise SystemExit("Podfile marker not found — Expo Podfile format changed?")

path.write_text(text.replace(marker, marker + snippet, 1))
print("patched Podfile post_install for unsigned builds")

#!/usr/bin/env python3
"""Force ad-hoc / unsigned-friendly build settings on the app Xcode project."""

from pathlib import Path

root = Path("ios")
pbx_paths = list(root.glob("*.xcodeproj/project.pbxproj"))
if not pbx_paths:
    raise SystemExit("No ios/*.xcodeproj/project.pbxproj found")

replacements = {
    "CODE_SIGN_STYLE = Automatic;": "CODE_SIGN_STYLE = Manual;",
    'CODE_SIGN_IDENTITY = "Apple Development";': 'CODE_SIGN_IDENTITY = "-";',
    '"CODE_SIGN_IDENTITY[sdk=iphoneos*]" = "iPhone Developer";': '"CODE_SIGN_IDENTITY[sdk=iphoneos*]" = "-";',
    '"CODE_SIGN_IDENTITY[sdk=iphoneos*]" = "iPhone Distribution";': '"CODE_SIGN_IDENTITY[sdk=iphoneos*]" = "-";',
}

for path in pbx_paths:
    text = path.read_text()
    original = text
    for old, new in replacements.items():
        text = text.replace(old, new)

    marker = 'CODE_SIGN_IDENTITY = "-";'
    if "AD_HOC_CODE_SIGNING_ALLOWED = YES;" not in text:
        text = text.replace(
            "buildSettings = {",
            "buildSettings = {\n"
            "\t\t\t\tCODE_SIGN_STYLE = Manual;\n"
            '\t\t\t\tCODE_SIGN_IDENTITY = "-";\n'
            "\t\t\t\tAD_HOC_CODE_SIGNING_ALLOWED = YES;\n"
            "\t\t\t\tCODE_SIGNING_REQUIRED = NO;\n"
            '\t\t\t\tDEVELOPMENT_TEAM = "";\n'
            '\t\t\t\tPROVISIONING_PROFILE_SPECIFIER = "";',
        )

    if text == original and marker not in text:
        raise SystemExit(f"Failed to patch unsigned settings in {path}")
    path.write_text(text)
    print(f"patched ad-hoc signing settings in {path}")

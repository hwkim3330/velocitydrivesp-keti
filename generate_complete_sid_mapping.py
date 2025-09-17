#!/usr/bin/env python3
"""
Complete SID Mapping Generator for VelocityDRIVE-SP Web Interface
Parses all SID files from the coreconf cache and generates
`js/sid-mapping.js` for the web interface.

Usage:
  python3 generate_complete_sid_mapping.py \
      [--coreconf-dir /path/to/coreconf] \
      [--output js/sid-mapping.js]
"""

import argparse
import json
import os
import glob
from pathlib import Path


def parse_sid_file(filepath):
    """Parse a single SID file and extract SID mappings."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        mappings = {}
        module_name = data.get('module-name', 'unknown')

        for item in data.get('items', []):
            if item.get('namespace') == 'data':
                sid = item.get('sid')
                identifier = item.get('identifier', '')
                if sid and identifier:
                    mappings[sid] = identifier

        return mappings, module_name
    except Exception as e:
        print(f"Error parsing {filepath}: {e}")
        return {}, "error"


def find_coreconf_dir(user_path: str | None) -> Path | None:
    """Resolve the coreconf directory. Try user path, then known defaults."""
    if user_path:
        p = Path(user_path).expanduser().resolve()
        if p.is_dir():
            # If a hash subdir exists, return first one
            hashes = sorted([d for d in p.iterdir() if d.is_dir()])
            return hashes[0] if hashes else p

    candidates = [
        # CT-CLI cache
        Path.home() / "Downloads/Microchip_VelocityDRIVE_CT-CLI-linux-2025.07.12/cli/downloads/coreconf",
        # CT-UI webroot
        Path.home() / "Downloads/Microchip_VelocityDRIVE_CT-UI-linux-2025.07.12/resources/bin/wwwroot/downloads/coreconf",
    ]

    for base in candidates:
        if base.is_dir():
            hashes = sorted([d for d in base.iterdir() if d.is_dir()])
            if hashes:
                return hashes[0]
            return base
    return None


def generate_complete_mapping(coreconf_dir: Path, output_file: Path):
    """Generate complete SID mapping from all coreconf files."""

    print(f"Processing SID files from: {coreconf_dir}")

    sid_files = sorted(coreconf_dir.glob("*.sid"))
    print(f"Found {len(sid_files)} SID files")

    complete_mapping: dict[int, str] = {}
    module_stats: dict[str, int] = {}

    for sid_file in sid_files:
        mappings, module_name = parse_sid_file(sid_file)
        complete_mapping.update(mappings)
        module_stats[module_name] = len(mappings)
        print(f"Processed {sid_file.name}: {len(mappings)} mappings")

    print(f"\nTotal mappings: {len(complete_mapping)}")
    print(f"Modules processed: {len(module_stats)}")

    js_content = """// Complete YANG SID Mapping for VelocityDRIVE-SP Web Interface
// Generated automatically from all coreconf SID files
// Total mappings: {total_mappings}
// Modules: {total_modules}

const yangSidMap = {{
{mappings}
}};

// Reverse mapping: YANG path to SID
const yangToSidMap = {{}};
for (const [sid, yangPath] of Object.entries(yangSidMap)) {{
    yangToSidMap[yangPath] = parseInt(sid);
}}

// Module statistics
const moduleStats = {module_stats};

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {{
    module.exports = {{ yangSidMap, yangToSidMap, moduleStats }};
}} else if (typeof window !== 'undefined') {{
    window.yangSidMap = yangSidMap;
    window.yangToSidMap = yangToSidMap;
    window.moduleStats = moduleStats;
}}

console.log('YANG SID mappings loaded:', Object.keys(yangSidMap).length, 'entries');
""".format(
        total_mappings=len(complete_mapping),
        total_modules=len(module_stats),
        mappings=",\n".join(
            f"  {sid}: \"{path}\"" for sid, path in sorted(complete_mapping.items())
        ),
        module_stats=json.dumps(module_stats, indent=2),
    )

    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(js_content)

    print(f"\nGenerated complete SID mapping file: {output_file}")

    print("\nSample mappings:")
    for i, (sid, path) in enumerate(sorted(complete_mapping.items())[:10]):
        print(f"  {sid}: {path}")

    print("\nModule statistics:")
    for module, count in sorted(module_stats.items()):
        if count > 0:
            print(f"  {module}: {count} mappings")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--coreconf-dir", help="Path to coreconf directory (hash folder or parent)")
    parser.add_argument("--output", help="Output JS file path", default=None)
    args = parser.parse_args()

    coreconf_dir = find_coreconf_dir(args.coreconf_dir)
    if not coreconf_dir or not coreconf_dir.exists():
        raise SystemExit("Could not find coreconf SID directory. Provide --coreconf-dir.")

    script_dir = Path(__file__).resolve().parent
    output_file = Path(args.output) if args.output else (script_dir / "js" / "sid-mapping.js")

    generate_complete_mapping(coreconf_dir, output_file)


if __name__ == "__main__":
    main()

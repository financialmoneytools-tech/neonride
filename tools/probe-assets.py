"""Fetch the CC0 PBR textures the realism probe uses.

    python tools/probe-assets.py

PROBE ONLY. Everything this writes lands in `public/probe/`, which exists on
the `probe/realism` branch and nowhere else. The project's standing rule is that
there are no external assets - every texture is generated at runtime - and the
whole point of the probe is to measure what breaking that rule would buy and
what it would cost, so it has to break it honestly with real production textures
rather than with procedural approximations of them.

Sources, both CC0, both no-attribution-required (credited anyway):
  Poly Haven   https://polyhaven.com     - surfaces
  ambientCG    https://ambientcg.com     - metals

1K JPG, and that is already a decision with a cost attached. A production
realistic road wants 2K or 4K for the surface directly under the camera, and
the size table this writes is what makes that argument concrete rather than a
feeling: the probe's own total is printed at the end, and doubling the
resolution is roughly four times the bytes.

Every file is written with its source URL and licence into
`public/probe/CREDITS.json`, because a directory of textures with no provenance
is a legal problem later even when every one of them is CC0.
"""

import json
import os
import sys
import urllib.request

OUT = 'public/probe'
RES = '1k'
TIMEOUT = 60

# What the scene needs, and why each one is in the list. Named by the surface
# they stand for rather than by their asset id, so a swap is one line.
POLY_HAVEN = {
    # The road itself. Worn, patched, with the aggregate showing - the tyre
    # polish in the wheel tracks is added in the shader from the lane geometry
    # rather than hoped for in the texture, because no single tile has it in
    # the right place.
    'asphalt': 'asphalt_02',
    # The hard shoulder, so the verge is not the same tile as the lane.
    'asphalt_worn': 'asphalt_04',
    'snow': 'snow_02',
    'rock': 'rock_boulder_dry',
    'bark': 'bark_willow',
}

# ambientCG, for the guardrail. Poly Haven's metals are mostly studio panels;
# ambientCG has painted and galvanised sheet, which is what a barrier is.
AMBIENT_CG = {
    'guardrail': 'Metal032',
}

MAPS = {
    'Diffuse': 'diff',
    'nor_gl': 'nor',
    'Rough': 'rough',
    'AO': 'ao',
}


def fetch(url, target):
    if os.path.exists(target):
        return os.path.getsize(target)
    os.makedirs(os.path.dirname(target), exist_ok=True)
    request = urllib.request.Request(url, headers={'User-Agent': 'neon-ride-probe'})
    with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
        data = response.read()
    with open(target, 'wb') as handle:
        handle.write(data)
    return len(data)


def poly_haven(name, asset_id, credits):
    api = f'https://api.polyhaven.com/files/{asset_id}'
    request = urllib.request.Request(api, headers={'User-Agent': 'neon-ride-probe'})
    with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
        files = json.load(response)

    total = 0
    for api_map, short in MAPS.items():
        entry = files.get(api_map)
        if not entry or RES not in entry or 'jpg' not in entry[RES]:
            print(f'  {name}: no {api_map} at {RES}, skipped')
            continue
        url = entry[RES]['jpg']['url']
        target = f'{OUT}/{name}_{short}.jpg'
        size = fetch(url, target)
        total += size
        credits.append({
            'file': os.path.basename(target), 'map': api_map,
            'source': 'Poly Haven', 'asset': asset_id, 'licence': 'CC0',
            'url': url,
        })
        print(f'  {name}_{short}.jpg  {size / 1024:7.1f} KB')
    return total


def ambient_cg(name, asset_id, credits):
    """ambientCG ships one zip per asset; the JSON API gives its address."""
    api = (f'https://ambientcg.com/api/v2/full_json?id={asset_id}'
           '&type=Material&include=downloadData')
    request = urllib.request.Request(api, headers={'User-Agent': 'neon-ride-probe'})
    with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
        payload = json.load(response)

    assets = payload.get('foundAssets') or []
    if not assets:
        print(f'  {name}: not found')
        return 0

    downloads = assets[0].get('downloadFolders', {})
    wanted = None
    for folder in downloads.values():
        for kind in folder.get('downloadFiletypeCategories', {}).values():
            for item in kind.get('downloads', []):
                attribute = item.get('attribute', '')
                if attribute.startswith('1K-JPG'):
                    wanted = item
                    break
    if not wanted:
        print(f'  {name}: no 1K-JPG download')
        return 0

    url = wanted['downloadLink']
    target = f'{OUT}/_{name}.zip'
    size = fetch(url, target)
    print(f'  {name}.zip  {size / 1024:7.1f} KB')

    # Unpacked here rather than shipped as a zip: the renderer wants files.
    import zipfile
    keep = {'Color': 'diff', 'NormalGL': 'nor', 'Roughness': 'rough',
            'AmbientOcclusion': 'ao'}
    kept = 0
    with zipfile.ZipFile(target) as archive:
        for member in archive.namelist():
            for token, short in keep.items():
                if token in member and member.lower().endswith(('.jpg', '.png')):
                    out = f'{OUT}/{name}_{short}.jpg'
                    with archive.open(member) as src, open(out, 'wb') as dst:
                        data = src.read()
                        dst.write(data)
                    kept += len(data)
                    credits.append({
                        'file': os.path.basename(out), 'map': token,
                        'source': 'ambientCG', 'asset': asset_id, 'licence': 'CC0',
                        'url': url,
                    })
                    print(f'  {name}_{short}.jpg  {len(data) / 1024:7.1f} KB')
    os.remove(target)
    return kept


def main():
    os.makedirs(OUT, exist_ok=True)
    credits = []
    total = 0

    print('Poly Haven (CC0):')
    for name, asset_id in POLY_HAVEN.items():
        try:
            total += poly_haven(name, asset_id, credits)
        except Exception as error:  # noqa: BLE001 - a missing asset is a report, not a crash
            print(f'  {name}: FAILED {error}')

    print('ambientCG (CC0):')
    for name, asset_id in AMBIENT_CG.items():
        try:
            total += ambient_cg(name, asset_id, credits)
        except Exception as error:  # noqa: BLE001
            print(f'  {name}: FAILED {error}')

    with open(f'{OUT}/CREDITS.json', 'w', encoding='utf-8') as handle:
        json.dump({'note': 'Realism probe only. Not shipped on main.',
                   'files': credits}, handle, indent=2)

    print(f'\n{len(credits)} files, {total / 1024 / 1024:.2f} MB on disk at {RES}')
    print(f'wrote {OUT}/CREDITS.json')
    return 0


if __name__ == '__main__':
    sys.exit(main())

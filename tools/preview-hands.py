"""Compose the cockpit framing into a still, from the quads measure-hands emits.

    node tools/measure-hands.mjs --quads | python tools/preview-hands.py out

Writes out-wide.png and out-tall.png: the glove sprites placed exactly where
the projection puts them, over a stand-in for the road.

This is not a renderer and is not trying to be one. It draws the one thing the
percentages are a proxy for and cannot show - what share of the picture the arm
takes, where it leaves the frame, and whether the two hands still read as a
pair - so a number that satisfies the contract can be checked against the shot
it is supposed to produce. Everything else in the frame is a flat gradient,
because everything else is somebody else's measurement.

The quads come back axis aligned, and that is exact rather than a convenience:
the sprite is a billboard, so at rest its plane is parallel to the image plane
and every corner is at the same depth. A projection of that is a uniform scale.
"""

import json
import sys

from PIL import Image, ImageDraw

FRAMES = {'wide': (1280, 720), 'tall': (720, 1280)}
# Roughly where the horizon sits in each profile, as a fraction down the frame.
# Only here so the sprite is judged against something other than flat black.
HORIZON = {'wide': 0.46, 'tall': 0.34}


def ground(name, size):
    """A stand-in road: sky above the horizon, asphalt below, one neon edge."""
    width, height = size
    image = Image.new('RGB', size)
    draw = ImageDraw.Draw(image)
    horizon = int(height * HORIZON[name])
    for y in range(height):
        if y < horizon:
            t = y / max(horizon, 1)
            draw.line([(0, y), (width, y)],
                      fill=(int(8 + 26 * t), int(6 + 10 * t), int(24 + 40 * t)))
        else:
            t = (y - horizon) / max(height - horizon, 1)
            draw.line([(0, y), (width, y)], fill=(int(10 + 8 * t), int(10 + 8 * t), int(14 + 10 * t)))
    # Two edge lines converging on the vanishing point, so the eye has a scale.
    for side, colour in ((-1, (0, 190, 210)), (1, (220, 40, 160))):
        draw.line([(width * 0.5, horizon), (width * (0.5 + side * 0.95), height)],
                  fill=colour, width=max(2, width // 320))
    return image


def place(frame, sprite, quad):
    """Paste the sprite into the frame at the projected quad, clipping is free."""
    xs = [p[0] for p in quad]
    ys = [p[1] for p in quad]
    width, height = frame.size
    left, right = min(xs) * width, max(xs) * width
    top, bottom = min(ys) * height, max(ys) * height

    # A left hand comes back with its corners in reverse order across, which is
    # the mirror the negative x scale applies. Reading it off the quad rather
    # than off the hand's name keeps this honest about what was measured.
    mirrored = quad[0][0] > quad[1][0]
    art = sprite.transpose(Image.FLIP_LEFT_RIGHT) if mirrored else sprite

    box = (max(1, round(right - left)), max(1, round(bottom - top)))
    frame.paste(art.resize(box, Image.LANCZOS), (round(left), round(top)),
                art.resize(box, Image.LANCZOS))


def main(stem):
    data = json.loads(sys.stdin.read().strip().splitlines()[-1])
    sprite = Image.open(data['sprite']).convert('RGBA')

    for name, size in FRAMES.items():
        if name not in data:
            continue
        frame = ground(name, size)
        for quad in data[name]['hands'].values():
            place(frame, sprite, quad)

        draw = ImageDraw.Draw(frame)
        # The two grip axes, when the measurement supplied them: the bar the
        # artwork draws and the bar the rig believes in. They should be one line.
        for key, colour in (('drawn', (255, 215, 0)), ('real', (255, 60, 60))):
            axis = data[name].get('axes', {}).get(key)
            if not axis:
                continue
            (ax, ay), (bx, by) = axis
            draw.line([(ax * size[0], ay * size[1]), (bx * size[0], by * size[1])],
                      fill=colour, width=max(3, size[0] // 300))
            draw.text((bx * size[0] + 6, by * size[1] - 6), key, fill=colour)

        # The contract, drawn on the picture: 20 and 80 per cent across, 85 down.
        for across in (0.20, 0.80):
            x = size[0] * across
            draw.line([(x, 0), (x, size[1])], fill=(90, 90, 110), width=1)
        y = size[1] * 0.85
        draw.line([(0, y), (size[0], y)], fill=(90, 90, 110), width=1)

        path = '%s-%s.png' % (stem, name)
        frame.save(path)
        print('%s  %sx%s' % (path, *size))


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit('usage: measure-hands.mjs --quads | preview-hands.py <output stem>')
    main(sys.argv[1])

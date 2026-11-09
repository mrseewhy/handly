"""Render the Handly favicon set from the same geometry as app/icon.svg.

Draws at 8x supersampling with Pillow, then downsamples, so edges stay clean
at 16x16. Run: python3 scripts/make-favicons.py
"""

from PIL import Image, ImageDraw

SS = 8  # supersample factor
BASE = 32  # design grid matches app/icon.svg viewBox

BRAND_TOP = (0x4F, 0x46, 0xE5)
BRAND_BOTTOM = (0x37, 0x30, 0xA3)


def _lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def render(size: int) -> Image.Image:
    w = size * SS
    img = Image.new("RGBA", (w, w), (0, 0, 0, 0))

    # Gradient background, painted through a rounded-rect mask.
    grad = Image.new("RGBA", (w, w))
    gd = ImageDraw.Draw(grad)
    for y in range(w):
        for_x = y / max(w - 1, 1)
        gd.line([(0, y), (w, y)], fill=_lerp(BRAND_TOP, BRAND_BOTTOM, for_x))

    mask = Image.new("L", (w, w), 0)
    radius = 7 / BASE * w
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, w - 1], radius=radius, fill=255)
    img.paste(grad, (0, 0), mask)

    # The "H" mark: three rounded strokes on the 32-unit grid.
    draw = ImageDraw.Draw(img)
    scale = w / BASE
    stroke = 3.2 * scale
    r = stroke / 2

    def line(x1, y1, x2, y2):
        draw.line(
            [(x1 * scale, y1 * scale), (x2 * scale, y2 * scale)],
            fill=(255, 255, 255, 255),
            width=round(stroke),
        )
        for cx, cy in ((x1 * scale, y1 * scale), (x2 * scale, y2 * scale)):
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 255, 255, 255))

    line(10.5, 8.5, 10.5, 23.5)  # left stem
    line(21.5, 8.5, 21.5, 23.5)  # right stem
    line(10.5, 16, 21.5, 16)  # crossbar

    return img.resize((size, size), Image.LANCZOS)


def main():
    out = {
        "app/favicon.ico": 256,
        "public/favicon-16x16.png": 16,
        "public/favicon-32x32.png": 32,
        "public/apple-touch-icon.png": 180,
        "public/apple-touch-icon-512x512.png": 512,
        "public/icon-192.png": 192,
        "public/icon-512.png": 512,
    }
    for path, size in out.items():
        img = render(size)
        if path.endswith(".ico"):
            img.save(path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
        else:
            img.save(path, format="PNG")
        print(f"wrote {path} ({size}px)")


if __name__ == "__main__":
    main()

// Minimal PNG writer (no deps). Produces brand favicons of several sizes.
import fs from "fs";
import path from "path";
import url from "url";
import zlib from "zlib";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

function buildFrame(size, marks) {
  const buf = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      // brand indigo background
      buf[i] = 0x4f;
      buf[i + 1] = 0x46;
      buf[i + 2] = 0xe5;
      buf[i + 3] = 0xff;
      const px = x / size;
      const py = y / size;
      for (const pred of marks) {
        if (pred(px, py)) {
          buf[i] = 0xff;
          buf[i + 1] = 0xff;
          buf[i + 2] = 0xff;
          buf[i + 3] = 0xff;
        }
      }
    }
  }
  return buf;
}

function encodePng(img, w, h) {
  const fp = (n, len) => {
    const b = Buffer.alloc(len);
    for (let i = len - 1; i >= 0; i--) b[i] = n & 0xff;
    return b;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const c = Buffer.concat([len, Buffer.from(type, "ascii"), data, fp(crc32(Buffer.concat([Buffer.from(type, "ascii"), data])) & 0xffffffff, 4)]);
    return c;
  };
  const crc32 = (buf) => {
    let c = 0xffffffff;
    const table = (() => {
      const t = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let r = i;
        for (let j = 0; j < 8; j++) r = (r & 1 ? 0xedb88320 : 0) ^ (r >>> 1);
        t[i] = r;
      }
      return t;
    })();
    for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xff];
    return (c ^ 0xffffffff) >>> 0;
  };
  // IHDR
  const ihdr = Buffer.concat([fp(w, 4), fp(h, 4), Buffer.from([8, 6, 0, 0, 0])]);
  // IDAT: raw scanlines with filter byte 0, then deflate
  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    const off = y * (1 + w * 4);
    raw[off] = 0; // filter None
    for (let x = 0; x < w; x++) {
      const si = (y * w + x) * 4;
      const di = off + 1 + x * 4;
      raw[di] = img[si];
      raw[di + 1] = img[si + 1];
      raw[di + 2] = img[si + 2];
      raw[di + 3] = img[si + 3];
    }
  }
  const deflated = zlib.deflateSync(raw);
  const idat = chunk("IDAT", deflated);
  // IEND
  const iend = chunk("IEND", Buffer.alloc(0));
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ihdr), idat, iend]);
}

function listMarks() {
  // draw 3 horizontal bars inside the rounded square
  const cx = 0.5;
  const halfW = 0.22;
  const barH = 0.08;
  const gap = 0.155;
  const y1 = 0.36;
  const y2 = y1 + barH + gap;
  const y3 = y2 + barH + gap;
  const x0 = cx - halfW;
  const x1 = cx + halfW;
  return [
    (px, py) => hline(px, py, x0, y1, x1, barH),
    (px, py) => hline(px, py, x0, y2, x1 * 0.7 + x0 * 0.3, barH),
    (px, py) => hline(px, py, x0, y3, x0 + (x1 - x0) * 0.5, barH),
  ];
}

function hline(px, py, x0, y0, x1, h) {
  return px >= x0 && px <= x1 && py >= y0 && py <= y0 + h;
}

const outDir = path.resolve(__dirname, "..", "public");
[16, 32, 192, 512].forEach((size) => {
  const img = buildFrame(size, listMarks());
  const png = encodePng(img, size, size);
  const name = size === 192 ? "apple-touch-icon.png" : size === 512 ? "apple-touch-icon-512x512.png" : `favicon-${size}x${size}.png`;
  fs.writeFileSync(path.join(outDir, name), png);
  console.log(`wrote public/${name} (${(png.length / 1024).toFixed(2)} KB)`);
});

// Favicon.ico fallback: 16x16 PNG (acceptable for legacy browsers; many sites ship PNG-in-ICO)
const icoPng = fs.readFileSync(path.join(outDir, "favicon-16x16.png"));
fs.writeFileSync(path.join(outDir, "favicon.ico"), icoPng);
console.log("wrote public/favicon.ico (16x16 PNG-in-ICO fallback)");

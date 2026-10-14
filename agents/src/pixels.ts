import zlib from "zlib";

function paeth(left: number, up: number, ul: number): number {
  const p = left + up - ul;
  const pa = Math.abs(p - left);
  const pb = Math.abs(p - up);
  const pc = Math.abs(p - ul);
  if (pa <= pb && pa <= pc) return left;
  if (pb <= pc) return up;
  return ul;
}

/** Unfiltered RGBA pixels from a non-interlaced 8-bit PNG. */
export function decodePng(buf: Buffer): { w: number; h: number; rgba: Buffer } | null {
  if (buf.length < 8 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  let offset = 8;
  let w = 0;
  let h = 0;
  let colorType = -1;
  let depth = 0;
  let interlace = 0;
  const idat: Buffer[] = [];
  while (offset + 8 <= buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.toString("ascii", offset + 4, offset + 8);
    const data = buf.subarray(offset + 8, offset + 8 + len);
    if (type === "IHDR") {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      depth = data[8] ?? 0;
      colorType = data[9] ?? -1;
      interlace = data[12] ?? 0;
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += 12 + len;
  }
  if (!w || !h || depth !== 8 || interlace !== 0) return null;
  const bpp = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 0 ? 1 : 0;
  if (!bpp) return null;
  let raw: Buffer;
  try {
    raw = zlib.inflateSync(Buffer.concat(idat));
  } catch {
    return null;
  }
  const stride = w * bpp;
  const out = Buffer.alloc(h * stride);
  let src = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[src++] ?? 0;
    const row = y * stride;
    for (let x = 0; x < stride; x++) {
      const v = raw[src++] ?? 0;
      const left = x >= bpp ? out[row + x - bpp]! : 0;
      const up = y > 0 ? out[row - stride + x]! : 0;
      const ul = y > 0 && x >= bpp ? out[row - stride + x - bpp]! : 0;
      let val = v;
      if (filter === 1) val = (v + left) & 255;
      else if (filter === 2) val = (v + up) & 255;
      else if (filter === 3) val = (v + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) val = (v + paeth(left, up, ul)) & 255;
      out[row + x] = val;
    }
  }
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    if (bpp === 4) {
      rgba[i * 4] = out[i * 4]!;
      rgba[i * 4 + 1] = out[i * 4 + 1]!;
      rgba[i * 4 + 2] = out[i * 4 + 2]!;
      rgba[i * 4 + 3] = out[i * 4 + 3]!;
    } else if (bpp === 3) {
      rgba[i * 4] = out[i * 3]!;
      rgba[i * 4 + 1] = out[i * 3 + 1]!;
      rgba[i * 4 + 2] = out[i * 3 + 2]!;
      rgba[i * 4 + 3] = 255;
    } else {
      rgba[i * 4] = out[i]!;
      rgba[i * 4 + 1] = out[i]!;
      rgba[i * 4 + 2] = out[i]!;
      rgba[i * 4 + 3] = 255;
    }
  }
  return { w, h, rgba };
}

/**
 * Coarse pixels from below the status bar. The clock changes every shot;
 * the page under it does not, unless the user scrolled or the screen changed.
 */
export function samplePng(buf: Buffer): Buffer | null {
  const decoded = decodePng(buf);
  if (!decoded) return null;
  const { w, h, rgba } = decoded;
  const y0 = Math.floor(h * 0.08);
  const y1 = Math.max(y0 + 1, Math.floor(h * 0.96));
  const step = Math.max(4, Math.floor(Math.min(w, h) / 48));
  const samples: number[] = [];
  for (let y = y0; y < y1; y += step) {
    for (let x = 0; x < w; x += step) {
      const i = (y * w + x) * 4;
      const lum = (rgba[i]! * 3 + rgba[i + 1]! * 6 + rgba[i + 2]!) / 10;
      samples.push(Math.round(lum / 16));
    }
  }
  return Buffer.from(samples);
}

/** True when the page under the status bar is the same picture. */
export function visualSame(a: Buffer | null, b: Buffer | null): boolean {
  if (!a || !b || a.length !== b.length || a.length === 0) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
  return diff / a.length < 0.02;
}

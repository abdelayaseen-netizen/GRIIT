#!/usr/bin/env node
/** Quick contrast probe — pass two hex colors as args. */

function srgbChannelToLinear(v) {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
function luminance(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * srgbChannelToLinear(r) + 0.7152 * srgbChannelToLinear(g) + 0.0722 * srgbChannelToLinear(b);
}
function ratio(fg, bg) {
  const lf = luminance(fg);
  const lb = luminance(bg);
  return (Math.max(lf, lb) + 0.05) / (Math.min(lf, lb) + 0.05);
}

const args = process.argv.slice(2);
if (args.length === 2) {
  const r = ratio(args[0], args[1]);
  console.log(`${args[0]} on ${args[1]} = ${r.toFixed(3)}:1`);
  process.exit(0);
}

const candidates = ["#D85A30", "#C04A23", "#C44A1F", "#BB471D", "#B7421A", "#AB3D17", "#DC5401"];
for (const c of candidates) {
  const r = ratio("#FFFFFF", c);
  console.log(`white on ${c} = ${r.toFixed(3)}:1  ${r >= 4.5 ? "PASS-AA" : "FAIL"}`);
}

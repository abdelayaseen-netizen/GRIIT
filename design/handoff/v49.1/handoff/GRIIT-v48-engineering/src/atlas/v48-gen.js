// GRIIT v48 atlas generator. Run from run_script: new Function(src + ';return build;')()(v47Html)
// Emits the template body for "GRIIT v48 Atlas.dc.html". Inline styles only; inline SVG icons (no Lucide pass).
const C = { ink:'#0F0F0F', surf:'#1A1918', raised:'#242322', hair:'#2A2928', t1:'#F2F0EB', t2:'#A09F9C', t3:'#737270', miss:'#6B6967', or:'#DC5401', btn:'#BB471D' };
const FONT = "-apple-system,'SF Pro Text','Helvetica Neue',sans-serif";
const NUM = "font-family:'SF Pro Display',-apple-system,sans-serif;font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:-0.02em;";
const T = { tl:'font-size:28px;line-height:34px;font-weight:600;', t:'font-size:20px;line-height:25px;font-weight:600;', h:'font-size:15px;line-height:20px;font-weight:600;', b:'font-size:15px;line-height:20px;font-weight:400;', s:'font-size:13px;line-height:18px;font-weight:400;', c:'font-size:12px;line-height:16px;font-weight:500;', l:'font-size:11px;line-height:13px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;' };
const d = (s, x='') => `<div style="${s}">${x}</div>`;
const sp = (s, x='') => `<span style="${s}">${x}</span>`;
const tx = (k, col, x, extra='') => d(T[k] + 'color:' + (col||C.t1) + ';' + extra, x);

const P = {
  check:'<path d="M20 6 9 17l-5-5"/>', x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  cl:'<path d="m15 18-6-6 6-6"/>', cr:'<path d="m9 18 6-6-6-6"/>', cd:'<path d="m6 9 6 6 6-6"/>', cu:'<path d="m18 15-6-6-6 6"/>',
  camera:'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  snow:'<line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/>',
  shield:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  flame:'<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  heart:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  msg:'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  share:'<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/>',
  more:'<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  home:'<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  compass:'<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  plus:'<path d="M5 12h14"/><path d="M12 5v14"/>', minus:'<path d="M5 12h14"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  lock:'<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  wifioff:'<path d="M12 20h.01"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/><path d="M5 12.859a10 10 0 0 1 5.17-2.69"/><path d="M19 12.859a10 10 0 0 0-2.007-1.523"/><path d="M2 8.82a15 15 0 0 1 4.177-2.643"/><path d="M22 8.82a15 15 0 0 0-11.288-3.764"/><path d="m2 2 20 20"/>',
  alert:'<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  retry:'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  play:'<polygon points="6 3 20 12 6 21 6 3"/>', pause:'<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
  flip:'<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  imgoff:'<line x1="2" x2="22" y1="2" y2="22"/><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"/><line x1="13.5" x2="6" y1="13.5" y2="21"/><line x1="18" x2="21" y1="12" y2="15"/><path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59"/><path d="M21 15V5a2 2 0 0 0-2-2H9"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  ig:'<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
  sms:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  run:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>', pen:'<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>',
  timer:'<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
  hash:'<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>',
  ccheck:'<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>', arrow:'<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>', link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  nav:'<polygon points="3 11 22 2 13 21 11 13 3 11"/>', del:'<path d="M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/><path d="m12 9 6 6"/><path d="m18 9-6 6"/>',
  trash:'<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  wifi:'<path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/>',
  grid:'<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  book:'<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  sunrise:'<path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/>',
  dumbbell:'<path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/><path d="m21.5 21.5-1.4-1.4"/><path d="M3.9 3.9 2.5 2.5"/><path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z"/>',
  sticker:'<path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M14 3v4a2 2 0 0 0 2 2h4"/>',
  type:'<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/>',
  calendar:'<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  file:'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
};
function ic(n, size=20, col=C.t1, o={}) {
  const inner = (P[n]||'').replace(/<(\w+)([^>]*?)\/>/g, '<$1$2></$1>');
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" style="flex:none;display:block;fill:${o.fill||'none'};stroke:${col};stroke-width:${o.sw||2};stroke-linecap:round;stroke-linejoin:round;">${inner}</svg>`;
}
const flame = (s=28) => ic('flame', s, C.or, { fill:C.or });

// ---------- people, photos ----------
const TINTS = [['#3B3F4A','#C9CEDA'],['#3E3A48','#D3CBE0'],['#34413C','#C6D8CF'],['#44403A','#DDD3C4'],['#3A4144','#C4D3D8'],['#463B3B','#E0CACA']];
const PPL = { yaseen:['Yaseen Abdelaziz','YA',0], khalid:['Khalid Noor','KN',3], omar:['Omar Siddiqui','OS',2], bilal:['Bilal Ahmed','BA',4], zayd:['Zayd Rahman','ZR',1], abd:['Abdurrahman Al-Faisal Rahimullah','AA',5], sami:['Sami Haddad','SH',4], hamza:['Hamza Idris','HI',1] };
function av(k, s=32, ring) { const p = PPL[k], t = TINTS[p[2]]; return d(`width:${s}px;height:${s}px;border-radius:999px;background:${t[0]};display:flex;align-items:center;justify-content:center;flex:none;${ring?`box-shadow:0 0 0 2px ${ring};`:''}`, sp(`font-size:${Math.round(s*0.36)}px;line-height:1;font-weight:600;color:${t[1]};`, p[1])); }
const PH = ['book1','pray2','gym3','book2','gym1','run4'];
function img(k=0) { const n = typeof k === 'string' ? k : PH[k % PH.length]; return `<img src="assets/proofs/${n}.jpg" alt="" style="width:100%;height:100%;object-fit:cover;display:block;filter:brightness(0.86) contrast(1.04) saturate(0.9);">`; }
const seal = () => d(`width:28px;height:28px;border-radius:999px;background:rgba(15,15,15,0.45);border:1px solid rgba(242,240,235,0.55);display:flex;align-items:center;justify-content:center;flex:none;`, ic('camera',14));

// ---------- primitives ----------
const btnP = (label, o={}) => d(`height:48px;border-radius:999px;background:${o.off?C.raised:C.btn};display:flex;align-items:center;justify-content:center;gap:8px;flex:none;${o.w?`width:${o.w}px;`:''}`, (o.spin?spin(16):'') + (o.icon&&!o.spin?ic(o.icon,18,o.off?C.t2:C.t1):'') + sp(T.h+`color:${o.off?C.t2:C.t1};`, label));
const btnS = (label, o={}) => d(`height:44px;border-radius:999px;background:${o.bg||C.raised};display:flex;align-items:center;justify-content:center;gap:8px;padding:0 16px;flex:${o.flex||'none'};`, (o.icon?ic(o.icon,17):'') + sp(T.h+'color:'+C.t1+';white-space:nowrap;', label));
const btnT = (label, col=C.t1) => d(`min-height:44px;display:flex;align-items:center;justify-content:center;`, sp(T.h+'color:'+col+';', label));
const spin = (s=16) => d(`width:${s}px;height:${s}px;border-radius:999px;border:2px solid ${C.t3};border-top-color:${C.t1};flex:none;`);
const doneDot = (s=28) => d(`width:${s}px;height:${s}px;border-radius:999px;background:${C.raised};display:flex;align-items:center;justify-content:center;flex:none;`, ic('check', Math.round(s*0.57), C.or, {sw:3}));
const openDot = (s=28) => d(`width:${s}px;height:${s}px;border-radius:999px;border:1.5px solid ${C.t3};flex:none;box-sizing:border-box;`);
const closedDot = (s=28) => d(`width:${s}px;height:${s}px;border-radius:999px;border:1.5px solid ${C.miss};flex:none;box-sizing:border-box;display:flex;align-items:center;justify-content:center;`, d(`width:10px;height:2px;border-radius:1px;background:${C.t2};`));
const seg = (opts, sel) => d(`display:inline-flex;padding:2px;border-radius:999px;background:${C.surf};gap:2px;`, opts.map((o,i)=>d(`height:32px;padding:0 14px;border-radius:999px;display:flex;align-items:center;${T.c}font-size:13px;${i===sel?`background:${C.t1};color:${C.ink};`:`color:${C.t2};`}`, o)).join(''));
const chip = (label, on, icon) => d(`height:34px;padding:0 14px;border-radius:999px;display:flex;align-items:center;gap:6px;flex:none;${on?`background:${C.t1};color:${C.ink};`:`background:${C.surf};color:${C.t1};`}${T.c}font-size:13px;`, (icon?ic(icon,14,on?C.ink:C.t1):'') + label);

// ---------- week strip (frame 192, locked) ----------
function dayCircle(s, size=30, ctx=C.ink, prog=0) {
  const g = size>=36?15:size<=20?9:13;
  const base = `width:${size}px;height:${size}px;border-radius:999px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;flex:none;`;
  if (s==='sec') return d(base+`background:${C.t1};`, ic('check',g,C.ink,{sw:3}));
  if (s==='todayDone') return d(base+`background:${C.t1};box-shadow:0 0 0 3px ${ctx},0 0 0 5px ${C.t1};`, ic('check',g,C.ink,{sw:3}));
  if (s==='held') return d(base+`background:${C.raised};border:1.5px solid ${C.miss};`, ic('snow',g,C.t1,{sw:2.5}));
  if (s==='shield') return d(base+`background:${C.raised};border:1.5px solid ${C.miss};`, ic('shield',g,C.t1,{sw:2.5}));
  if (s==='miss') return d(base+`border:1.5px solid ${C.miss};`, d(`width:${Math.round(size*0.3)}px;height:2px;border-radius:1px;background:${C.t2};`));
  if (s==='fut') return d(base+`border:1.5px dashed ${C.t3};`);
  if (s==='pre') return d(base, d(`width:4px;height:4px;border-radius:999px;background:${C.t3};`));
  if (s==='today') { const deg = Math.round(prog*360); return d(base+`background:${deg?`conic-gradient(${C.t1} 0 ${deg}deg,${C.t3} ${deg}deg 360deg)`:C.t3};`, d(`width:${size-4}px;height:${size-4}px;border-radius:999px;background:${ctx};`)); }
  return d(base);
}
function strip(days, o={}) {
  const size=o.size||30, L = o.letters||'MTWTFSS', ti = o.today ?? days.length-1;
  return d(`display:grid;grid-template-columns:repeat(${days.length},1fr);min-height:44px;`, days.map((s,i)=>d(`display:flex;flex-direction:column;align-items:center;gap:4px;`, d(`${T.c}font-size:11px;line-height:13px;color:${i===ti?C.t1:C.t2};`, L[i]) + dayCircle(s,size,o.ctx||C.ink,o.prog||0))).join(''));
}

// ---------- device ----------
function statusBar(time, onPhoto) {
  const bars = d(`display:flex;align-items:flex-end;gap:1.5px;height:12px;`, [4,6,8.5,11].map(h=>d(`width:3px;height:${h}px;border-radius:1px;background:${C.t1};`)).join(''));
  const bat = d(`display:flex;align-items:center;gap:1px;`, d(`width:24px;height:12px;border-radius:3.5px;border:1px solid rgba(242,240,235,0.45);padding:1.5px;box-sizing:border-box;`, d(`width:80%;height:100%;border-radius:1.5px;background:${C.t1};`)) + d(`width:1.5px;height:4px;border-radius:0 1px 1px 0;background:rgba(242,240,235,0.45);`));
  return d(`position:absolute;left:0;right:0;top:0;height:59px;z-index:20;${onPhoto?'background:linear-gradient(rgba(15,15,15,0.55),transparent);':`background:${C.ink};`}`,
    d(`position:absolute;left:0;width:150px;top:19px;text-align:center;font-size:17px;line-height:22px;font-weight:600;color:${C.t1};letter-spacing:-0.01em;`, time) +
    d(`position:absolute;right:28px;top:24px;display:flex;align-items:center;gap:6px;`, bars + ic('wifi',16,C.t1,{sw:2.4}) + bat)) +
    d(`position:absolute;top:11px;left:134px;width:125px;height:37px;border-radius:20px;background:#000;z-index:21;`);
}
const homeInd = (dark) => d(`position:absolute;bottom:8px;left:129px;width:135px;height:5px;border-radius:3px;background:${dark?C.ink:C.t1};z-index:40;`);
function tabbar(active='home', dot=true) {
  const it = [['home','home','Home'],['discover','compass','Discover'],['create','plus','Create'],['activity','bell','Activity'],['profile','user','Profile']];
  return d(`position:absolute;left:0;right:0;bottom:0;height:83px;background:${C.surf};z-index:15;display:flex;padding:0 6px;`, it.map(([k,i,l])=>{
    const on = k===active;
    const icon = k==='create' ? d(`width:32px;height:32px;border-radius:999px;background:${C.raised};display:flex;align-items:center;justify-content:center;`, ic('plus',18,on?C.or:C.t1,{sw:2.4})) :
      d('position:relative;', ic(i,24,on?C.or:C.t2) + (k==='activity'&&dot?d(`position:absolute;top:-1px;right:-2px;width:9px;height:9px;border-radius:999px;background:${C.t1};box-shadow:0 0 0 2px ${C.surf};`):''));
    return d(`flex:1;height:49px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;`, d('height:32px;display:flex;align-items:center;', icon) + d(`font-size:11px;line-height:13px;font-weight:500;color:${on?C.t1:C.t2};`, l));
  }).join(''));
}
function insetOverlay(kind) {
  const band = (top, h, label, side='top') => d(`position:absolute;left:0;right:0;${side}:${top}px;height:${h}px;z-index:50;background:repeating-linear-gradient(45deg,rgba(242,240,235,0.13) 0 3px,transparent 3px 8px);border-${side==='top'?'bottom':'top'}:1px dashed ${C.t1};`, d(`position:absolute;right:10px;${side==='top'?'bottom':'top'}:4px;height:22px;padding:0 8px;border-radius:6px;background:${C.t1};color:${C.ink};font-size:11px;line-height:22px;font-weight:600;white-space:nowrap;`, label));
  const mark = (bottom, label) => d(`position:absolute;left:12px;bottom:${bottom}px;z-index:51;height:22px;padding:0 8px;border-radius:6px;background:${C.t1};color:${C.ink};font-size:11px;line-height:22px;font-weight:600;`, label);
  let o = band(0, 59, 'Top inset 59pt · status bar + Dynamic Island');
  if (kind==='tab') o += band(0, 83, 'Tab bar 49 + home indicator 34 = 83pt', 'bottom') + mark(99, 'Last content ends 16pt above the bar');
  if (kind==='pushed') o += band(0, 34, 'Home indicator 34pt', 'bottom');
  if (kind==='step') o += band(0, 34, 'Home indicator 34pt', 'bottom') + mark(160, 'Sticky band above: 12pt over the inset, 16pt gutters');
  if (kind==='sheet') o += band(0, 34, 'Sheet content ends 34pt + 16pt above the edge', 'bottom') + d(`position:absolute;left:0;right:0;top:71px;height:0;border-top:1px dashed ${C.t1};z-index:50;`, d(`position:absolute;left:12px;top:4px;height:22px;padding:0 8px;border-radius:6px;background:${C.t1};color:${C.ink};font-size:11px;line-height:22px;font-weight:600;white-space:nowrap;`, 'Sheet top never above 71pt (59 + 12)'));
  if (kind==='camera') o += band(0, 34, 'Home indicator 34pt', 'bottom') + d(`position:absolute;left:12px;bottom:81px;z-index:51;width:134px;padding:4px 8px;border-radius:6px;background:${C.t1};color:${C.ink};font-size:11px;line-height:14px;font-weight:600;`, 'Shutter centre 92pt up. Controls stay below 59pt.') + d(`position:absolute;left:146px;bottom:92px;width:12px;height:0;border-top:1px dashed ${C.t1};z-index:51;`);
  return o;
}
function phone(o) {
  const bottom = o.tab ? 83 : 34, sh = o.sticky ? (o.stickyH||72) : 0;
  return d(`position:relative;width:393px;height:852px;background:${o.bg||C.ink};border-radius:55px;overflow:hidden;flex:none;box-shadow:0 0 0 1px #2A2928,0 0 0 6px #050505;font-family:${FONT};color:${C.t1};`,
    (o.full !== undefined ? o.full : d(`position:absolute;left:0;right:0;top:59px;bottom:${bottom+sh}px;overflow:hidden;`, d(`margin-top:${-(o.scroll||0)}px;`, o.body||''))) +
    (o.sticky ? d(`position:absolute;left:0;right:0;bottom:${bottom}px;height:${sh}px;padding:12px 16px;box-sizing:border-box;background:${C.ink};display:flex;flex-direction:column;justify-content:flex-end;gap:4px;z-index:12;`, o.sticky) : '') +
    (o.tab ? tabbar(o.tab, o.dot!==false) : '') +
    (o.toast || '') +
    statusBar(o.time||'9:41', o.onPhoto) + (o.overlay || '') + homeInd(o.lightInd) + (o.inset ? insetOverlay(o.inset) : ''));
}
function sheet(content, o={}) {
  return d(`position:absolute;inset:0;z-index:30;background:rgba(0,0,0,0.6);`) +
    d(`position:absolute;left:0;right:0;bottom:0;z-index:31;background:${C.surf};border-radius:24px 24px 0 0;padding:8px 16px 50px;display:flex;flex-direction:column;gap:14px;${o.h?`height:${o.h}px;box-sizing:border-box;`:''}`,
      d(`width:36px;height:5px;border-radius:3px;background:${C.t3};align-self:center;margin-bottom:4px;`) + content);
}
function dialog(title, body, btns) {
  return d(`position:absolute;inset:0;z-index:30;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;`,
    d(`width:300px;background:${C.surf};border-radius:20px;padding:20px 18px 12px;display:flex;flex-direction:column;gap:6px;`, tx('t',C.t1,title) + tx('b',C.t2,body,'margin-bottom:10px;') + btns));
}
// pushed / step header: close or back, centred two-line title
function stepHead(title, sub, o={}) {
  return d(`height:52px;display:flex;align-items:center;padding:0 6px;`, d('width:44px;height:44px;display:flex;align-items:center;justify-content:center;', ic(o.back?'cl':'x',22)) +
    d('flex:1;display:flex;flex-direction:column;align-items:center;min-width:0;', tx('h',C.t1,title,'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;') + (sub?tx('c',C.t2,sub):'')) + d('width:44px;height:44px;display:flex;align-items:center;justify-content:center;', o.right||''));
}
const gateRow = (items) => d(`display:flex;justify-content:center;flex-wrap:wrap;gap:6px;padding:4px 16px 0;`, items.map(([i,l])=>d(`height:28px;padding:0 10px;border-radius:999px;background:${C.surf};display:flex;align-items:center;gap:6px;`, (i?ic(i,13,C.t1):'') + sp(T.c+'color:'+C.t1+';', l))).join(''));

// ---------- gate line (one function, one order) ----------
function gateLine(g) { // g: array of [icon|null, text]
  return d(`display:flex;align-items:center;gap:5px;flex-wrap:wrap;`, g.map(([i,t],k)=>(k?sp(T.s+'color:'+C.t2+';','·'):'') + (i?ic(i,13,C.t2):'') + sp(T.s+'color:'+C.t2+';', t)).join(''));
}
// task row
function taskRow(t) { // {name, gate, st:'open'|'done'|'closed'|'running', meta}
  const dot = t.st==='done'?doneDot():t.st==='closed'?closedDot():openDot();
  return d(`display:flex;align-items:center;gap:12px;min-height:56px;padding:6px 0;`, dot +
    d('flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;', tx('h', t.st==='done'||t.st==='closed'?C.t2:C.t1, t.name) + gateLine(t.gate)) +
    (t.right !== undefined ? t.right : (t.st==='open'?ic('cr',18,C.t2):'')));
}
function section(ch) { // {name, day, done, total, tasks, collapsed, note}
  const head = d(`display:flex;align-items:center;gap:8px;min-height:44px;`, d('flex:1;min-width:0;display:flex;flex-direction:column;', tx('h',C.t1,ch.name) + tx('s',C.t2,ch.day)) + sp(T.s+'color:'+C.t2+';', `${ch.done} of ${ch.total} done`) + ic(ch.collapsed?'cd':'cu',16,C.t2));
  return d(`background:${C.surf};border-radius:16px;padding:6px 14px;display:flex;flex-direction:column;`, head + (ch.note?tx('s',C.t1,ch.note,'padding:2px 0 6px;'):'') + (ch.collapsed?'':ch.tasks.map(taskRow).join('')));
}
// ---------- seeded data ----------
const G = { self:[null,'Self-reported'], cam:['camera','Camera'], by7:['clock','By 7:00 am'], loc:['pin','Location'], opt:['camera','Photo optional'] };
const W_B = ['sec','sec','sec','sec','sec','sec','today'];
const Y = {
  read: (st='open') => ({ name:'Read 10 pages', gate:[[null,'10 pages'],G.cam], st }),
  bed: (st='open', g) => ({ name:'Out of bed', gate: g || [G.self,['clock','4:30–5:30 am']], st }),
};
const secRead = (st, o={}) => ({ name:'Read 30', day:'Day 2 of 30', done: st==='done'?1:0, total:1, tasks:[Y.read(st)], ...o });
const secBed = (st, g, o={}) => ({ name:'Up by 5', day:'Day 5 of 7', done: st==='done'?1:0, total:1, tasks:[Y.bed(st,g)], ...o });

// ---------- feed ----------
function postHead(k, sub, time) {
  return d(`display:flex;align-items:center;gap:10px;padding:10px 6px 10px 16px;`, av(k,32) + d('flex:1;min-width:0;display:flex;flex-direction:column;', tx('h',C.t1,PPL[k][0],'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;') + tx('s',C.t2,sub)) + tx('c',C.t2,time) + d('width:44px;height:44px;display:flex;align-items:center;justify-content:center;', ic('more',20,C.t2)));
}
function actions(r, c) {
  const a = (i,n,on) => d('display:flex;align-items:center;gap:5px;min-height:44px;min-width:44px;', ic(i,24,C.t1,on?{fill:C.t1}:{}) + (n?sp(T.c+'color:'+C.t1+';',n):''));
  return d('display:flex;align-items:center;gap:8px;padding:0 12px;', a('heart',r) + a('msg',c) + d('flex:1') + a('share',''));
}
function photoPost(p) { // {who, sub, time, ph:[..], cap, r, c, idx}
  const multi = p.ph.length>1;
  return d('display:flex;flex-direction:column;', postHead(p.who,p.sub,p.time) +
    d(`position:relative;width:393px;height:491px;overflow:hidden;background:${C.surf};`, (p.broken?brokenTile(p.task):img(p.ph[p.idx||0])) +
      (p.broken?'':d('position:absolute;left:12px;top:12px;', seal())) +
      (multi?d(`position:absolute;right:12px;top:12px;height:26px;padding:0 10px;border-radius:999px;background:rgba(15,15,15,0.62);${T.c}color:${C.t1};display:flex;align-items:center;`, `${(p.idx||0)+1} of ${p.ph.length}`):'') +
      (multi?d(`position:absolute;left:12px;right:12px;bottom:${p.cap?66:14}px;display:flex;gap:4px;`, p.ph.map((x,i)=>d(`flex:1;height:2px;border-radius:1px;background:${i===(p.idx||0)?C.t1:'rgba(242,240,235,0.35)'};`)).join('')):'') +
      (p.cap?d('position:absolute;left:0;right:0;bottom:0;padding:44px 16px 14px;background:linear-gradient(transparent,rgba(15,15,15,0.72) 45%,rgba(15,15,15,0.9));', tx('b',C.t1,p.cap)):'')) +
    actions(p.r,p.c));
}
function brokenTile(task) { return d(`position:absolute;inset:0;background:linear-gradient(160deg,${C.raised},${C.surf});display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;`, ic('imgoff',28,C.t2) + tx('h',C.t1,task) + tx('s',C.t2,'Photo didn’t load')); }
function selfRow(k, task, sub, time, r) {
  return d(`margin:6px 16px;background:${C.surf};border-radius:16px;padding:10px 6px 10px 12px;display:flex;align-items:center;gap:10px;`, av(k,32) +
    d('flex:1;min-width:0;display:flex;flex-direction:column;gap:1px;', d(T.b+'color:'+C.t1+';', sp(T.h, PPL[k][0].split(' ')[0]) + ' ' + task) + tx('s',C.t2,sub + ' · ' + time)) +
    d('display:flex;align-items:center;gap:4px;min-width:44px;min-height:44px;justify-content:center;', ic('heart',20,C.t1) + (r?sp(T.c+'color:'+C.t1+';',r):'')));
}
function actGroup(ks, text, time) {
  return d(`display:flex;align-items:center;gap:10px;padding:10px 16px;min-height:44px;`, d('display:flex;', ks.map((k,i)=>d(i?'margin-left:-8px;':'', av(k,24,C.ink))).join('')) + d(T.s+'color:'+C.t2+';flex:1;', text) + tx('c',C.t2,time));
}
const feedHead = (sel, hint) => d(`padding:24px 16px 8px;display:flex;flex-direction:column;gap:8px;`, d('display:flex;align-items:center;justify-content:space-between;', tx('t',C.t1,'Feed') + seg(['Following','Everyone'], sel)) + (hint?tx('s',C.t2,hint):''));
const KH_POST = { who:'khalid', sub:'Read 30 · Day 15 of 30', time:'12m', ph:['book1'], cap:'Before work. Chapter 9.', r:'12', c:'3' };

// ---------- home ----------
function streakBlock(n, week, o={}) {
  return d(`display:flex;flex-direction:column;gap:10px;`, d(`display:flex;align-items:center;gap:8px;min-height:44px;`, flame(30) + sp(NUM+`font-size:40px;line-height:44px;color:${C.t1};`, n) + d('flex:1;display:flex;flex-direction:column;', tx('s',C.t1, n===1?'day streak':'day streak') + (o.sub?tx('c',C.t2,o.sub):'')) + ic('cr',20,C.t2)) + strip(week, { prog:o.prog||0 }));
}
function freezeRow(o={}) {
  return d(`background:${C.surf};border-radius:16px;padding:12px 14px;display:flex;flex-direction:column;align-items:flex-start;gap:10px;`, d('display:flex;flex-direction:column;gap:2px;', tx('h',C.t1,'Saturday wasn’t secured.') + tx('s',C.t2, o.none ? 'No freezes left. Your streak resets to 0 at midnight.' : 'A freeze can hold it until midnight. 1 left.')) + (o.none?'':btnS('Use a freeze',{icon:'snow'})));
}
function home(o) {
  const top = d(`padding:4px 16px 0;display:flex;flex-direction:column;gap:12px;`, streakBlock(o.streak, o.week, o) + (o.banner||'') + (o.freeze?freezeRow(o.freeze):'') + (o.line?tx('b',C.t1,o.line):'') + (o.primary||''));
  const today = o.sections ? d(`padding:22px 16px 0;display:flex;flex-direction:column;gap:8px;`, d('display:flex;align-items:baseline;justify-content:space-between;', tx('t',C.t1,'Today') + (o.left?tx('s',C.t2,o.left):'')) + o.sections.map(section).join('')) : '';
  return top + today + (o.feed===undefined ? feedHead(0) + photoPost(KH_POST) : o.feed) + d('height:16px');
}
function toast(o) { // above tab bar
  return d(`position:absolute;left:10px;right:10px;bottom:${o.bottom||95}px;z-index:16;background:${C.raised};border-radius:18px;padding:12px;display:flex;flex-direction:column;gap:10px;box-shadow:0 8px 24px rgba(0,0,0,0.5);`,
    d('display:flex;align-items:center;gap:10px;', (o.thumb!==undefined?d('width:40px;height:50px;border-radius:8px;overflow:hidden;flex:none;', img(o.thumb)):doneDot(32).replace(C.raised, C.surf)) + d('flex:1;display:flex;flex-direction:column;', tx('h',C.t1,o.title) + tx('s',C.t2,o.sub))) +
    (o.share===false?'':d('display:flex;gap:8px;', btnS(o.shareLabel||'Share to the feed',{bg:C.surf,flex:1}) + btnS('Keep it to the record',{bg:C.surf,flex:1}))) + (o.share===false?'':tx('c',C.t2, o.note || 'No answer keeps it private.', 'text-align:center;')));
}

// ---------- registry, frames ----------
const REG = {}; const ORDER = []; let NEXT = 301; let CUR = '';
const FL = { hub:'GRIIT v48 Atlas.dc.html', home:'GRIIT v48 Atlas 2 Home.dc.html', t1:'GRIIT v48 Atlas 3a Tasks.dc.html', t2:'GRIIT v48 Atlas 3b Tasks.dc.html', share:'GRIIT v48 Atlas 4 Sharing.dc.html', flows:'GRIIT v48 Atlas Flows.dc.html' };
const href = (k) => encodeURI(REG[k].file) + '#f' + REG[k].n;
function F(key, m, html) {
  if (!REG[key]) { REG[key] = { n: NEXT++, file: CUR, ...m }; ORDER.push(key); }
  REG[key].html = html; return frameWrap(key);
}
function checks(f) {
  const items = [['Header', f.hdr], ['Safe areas', f.safe], ['≤1 orange fill', f.or], ['No grey box', f.gr], ['44pt · 11pt · AA', f.a11y], ['Fill edges', f.edge], ['Copy', f.copy], ['Fields named', f.fld], ['Built in 75: ' + (f.b75||'pending'), 'b']];
  return d('display:flex;flex-wrap:wrap;gap:4px;', items.map(([l,v])=>{ const s = v==='b' ? 'info' : (v||'ok'); return d(`height:20px;padding:0 7px;border-radius:5px;display:flex;align-items:center;gap:4px;font-size:11px;line-height:13px;font-weight:500;${s==='ok'?`background:${C.surf};color:${C.t2};`:s==='na'?`background:transparent;color:${C.t2};box-shadow:inset 0 0 0 1px ${C.surf};`:`background:${C.raised};color:${C.t1};`}`, (s==='ok'?ic('check',10,C.t2,{sw:3}):s==='na'?'–':'') + l); }).join(''));
}
function frameWrap(key, scale, noId) {
  const f = REG[key];
  const ph = scale ? d(`width:${Math.round(393*scale)}px;height:${Math.round(852*scale)}px;flex:none;overflow:visible;`, d(`transform:scale(${scale});transform-origin:0 0;width:393px;`, f.html)) : f.html;
  return d(`display:flex;flex-direction:column;gap:10px;width:${scale?Math.round(393*scale):393}px;flex:none;`, 
    (scale?'':`<div ${noId?'':`id="f${f.n}" `}style="display:flex;align-items:baseline;gap:8px;line-height:20px;min-height:20px;">${sp(NUM+'font-size:15px;color:'+C.t1+';', f.n)}${sp(T.c+'color:'+C.t1+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;', f.route+' · '+f.comp)}</div>`) +
    (scale?d('display:flex;gap:6px;align-items:baseline;', sp(NUM+'font-size:13px;color:'+C.t1+';', f.n) + sp(T.c+'color:'+C.t2+';', f.state)) : tx('s',C.t2, f.state + (f.src?' · from '+f.src:''), 'margin-top:0;')) + ph +
    (scale?'':(f.fields?tx('c',C.t2,f.fields):'') + checks(f)));
}
const arrow = (label) => d(`width:76px;flex:none;align-self:center;display:flex;flex-direction:column;align-items:center;gap:6px;padding-top:40px;`, ic('arrow',22,C.t1) + d(`${T.c}color:${C.t1};text-align:center;`, label));
const rowOf = (...xs) => d(`display:flex;gap:16px;align-items:flex-start;`, xs.join(''));
const wrapRow = (xs) => d(`display:flex;flex-wrap:wrap;gap:32px 24px;align-items:flex-start;`, xs.join(''));
function areaHead(id, eyebrow, title, purpose, note) {
  return `<div id="${id}" data-screen-label="${eyebrow}" style="display:flex;flex-direction:column;gap:6px;max-width:980px;">` + tx('l',C.t2,eyebrow) + tx('tl',C.t1,title) + tx('b',C.t1,purpose,'text-wrap:pretty;') + (note?tx('s',C.t2,note,'text-wrap:pretty;'):'') + '</div>';
}
const stripHead = (title, note) => d('display:flex;flex-direction:column;gap:4px;max-width:900px;', tx('t',C.t1,title) + (note?tx('s',C.t2,note,'text-wrap:pretty;'):''));
const entry = (label) => d(`width:120px;flex:none;align-self:center;display:flex;flex-direction:column;gap:6px;padding:14px;border-radius:16px;background:${C.surf};`, tx('l',C.t2,'Starts on') + tx('s',C.t1,label));
const panel = (w, x) => d(`width:${w}px;background:${C.surf};border-radius:20px;padding:20px;display:flex;flex-direction:column;gap:12px;flex:none;`, x);

// ===================================================================================
function build(v47) {
  const out = [];
  // ---------- Device reference (Part 2.2) ----------
  const devFrames = [];
  // built later after renderers exist; placeholder index
  // ---------- AREA 2 · HOME ----------
  CUR = FL.home; const A2 = [];
  const pReadBtn = btnP('Read 10 pages', { icon:'camera' });
  const homeB = (x={}) => home({ streak:7, week:W_B, prog:0.5, line:'1 of 2 left today.', primary:pReadBtn, sections:[secRead('open'), secBed('done',[G.self,['clock','4:30–5:30 am']])], ...x });
  A2.push(F('hA', { route:'(tabs)/index', comp:'HomeScreen', state:'A · Brand new, no challenge', src:'v47 193', b75:'pending', fields:'streak ← profiles.current_streak (0) · strip ← day_states[] (before join)' },
    phone({ time:'10:12', tab:'home', body: home({ streak:0, week:['pre','pre','pre','pre','pre','pre','today'], line:'No challenge yet. Join one and Day 1 is today.', primary:btnP('Find a challenge',{icon:'compass'}), feed: feedHead(1,'Showing everyone until you follow 3 people.') + photoPost(KH_POST) }) })));
  A2.push(F('hB', { route:'(tabs)/index', comp:'HomeScreen', state:'B · Mid-day, 1 of 2 left', src:'v47 194', b75:'pending', fields:'7 ← current_streak · “1 of 2 left” ← count(required tasks not done today) · Day 2 of 30 ← enrollment.day_index / duration_days' },
    phone({ time:'7:40', tab:'home', body: homeB() })));
  const homeC = (x={}) => home({ streak:7, week:['sec','sec','sec','sec','sec','miss','today'], freeze:{}, line:'2 tasks left today.', primary:btnP('Out of bed',{icon:'sunrise'}), sections:[secBed('open',[G.self,['clock','4:30–5:30 am · 18 min left']]), secRead('open')], ...x });
  A2.push(F('hC', { route:'(tabs)/index', comp:'HomeScreen', state:'C · Morning after a miss, freeze available', src:'v47 195', b75:'pending', fields:'freeze row ← streak_state.pending_miss_date + freezes_available (1) · copy = FREEZE_LINE, shared with challenge detail' },
    phone({ time:'5:12', tab:'home', body: homeC() })));
  const freezeOffer = (busy) => sheet(d('display:flex;flex-direction:column;gap:6px;align-items:center;text-align:center;padding-top:4px;', d(`width:56px;height:56px;border-radius:999px;background:${C.raised};display:flex;align-items:center;justify-content:center;`, ic('snow',26)) + tx('t',C.t1,'Use a freeze on Saturday?','margin-top:6px;') + tx('b',C.t2,'Saturday shows as held and your 7-day streak continues. This uses your 1 freeze; the next arrives Nov 3.')) + d('display:flex;justify-content:center;', strip(['sec','sec','sec','sec','sec', busy==='done'?'held':'miss','today'],{size:36,ctx:C.surf})) + btnP(busy?'Using freeze':'Use freeze',{spin:!!busy}) + btnT('Not now'));
  A2.push(F('hCs', { route:'(tabs)/index', comp:'FreezeSheet', state:'C · Offer', src:'v47 196', b75:'pending', fields:'next arrival ← freezes.next_grant_at' }, phone({ time:'5:13', tab:'home', body: homeC(), overlay: freezeOffer(false), inset:'sheet' })));
  A2.push(F('hCc', { route:'(tabs)/index', comp:'FreezeSheet', state:'C · Confirming (button holds the spinner)', src:'v47 197', b75:'pending' }, phone({ time:'5:13', tab:'home', body: homeC(), overlay: freezeOffer(true) })));
  const homeCd = () => home({ streak:7, week:['sec','sec','sec','sec','sec','held','today'], line:'Saturday is held by a freeze. 2 tasks left today.', primary:btnP('Out of bed',{icon:'sunrise'}), sections:[secBed('open',[G.self,['clock','4:30–5:30 am · 16 min left']]), secRead('open')] });
  A2.push(F('hCd', { route:'(tabs)/index', comp:'HomeScreen', state:'C · Freeze used, Saturday held', src:'v47 198', b75:'pending', fields:'held ← day_states[sat] = frozen' }, phone({ time:'5:14', tab:'home', body: homeCd() })));
  const homeD = () => home({ streak:0, week:['sec','sec','sec','sec','sec','miss','today'], freeze:{none:true}, line:'Best stays 18. Secure today and it’s 1.', primary:btnP('Out of bed',{icon:'sunrise'}), sections:[secBed('open',[G.self,['clock','4:30–5:30 am · 10 min left']]), secRead('open')] });
  A2.push(F('hD', { route:'(tabs)/index', comp:'HomeScreen', state:'D · Miss with no freezes left', src:'v47 199', b75:'pending', fields:'0 shown once reconcile has run; best ← profiles.best_streak' }, phone({ time:'5:20', tab:'home', body: homeD() })));
  A2.push(F('hDs', { route:'(tabs)/index', comp:'FreezeSheet', state:'D · None left', src:'v47 200', b75:'pending' }, phone({ time:'5:20', tab:'home', body: homeD(), overlay: sheet(d('display:flex;flex-direction:column;gap:6px;align-items:center;text-align:center;', d(`width:56px;height:56px;border-radius:999px;background:${C.raised};display:flex;align-items:center;justify-content:center;`, ic('snow',26,C.t2)) + tx('t',C.t1,'No freezes left','margin-top:6px;') + tx('b',C.t2,'Free accounts get 1 every 30 days. Your next one arrives Oct 21. Pro gets 4.')) + btnS('See Pro') + btnT('Close')) })));
  A2.push(F('hE', { route:'(tabs)/index', comp:'HomeScreen', state:'E · Today can’t be secured (said once)', src:'v47 201', b75:'differs · build 75 says it twice in one card', fields:'lost ← any required window closed_unfinished today' },
    phone({ time:'6:10', tab:'home', body: home({ streak:7, week:W_B, line:'Out of bed closed at 5:30 am, so today can’t be secured. Read 10 pages still counts for Read 30.', primary:pReadBtn, sections:[secRead('open'), secBed('closed',[['clock','Window closed · 4:30–5:30 am']])] }) })));
  A2.push(F('hF', { route:'(tabs)/index', comp:'HomeScreen', state:'F · All done, secured', src:'v47 202', b75:'pending', fields:'secured_today ← day_secures (server), never a client count' },
    phone({ time:'8:20', tab:'home', body: home({ streak:8, week:['sec','sec','sec','sec','sec','sec','todayDone'], line:'Day secured. Come back tomorrow.', primary:btnS('Share today',{icon:'share'}), sections:[secRead('done',{collapsed:true}), secBed('done',[G.self,['clock','4:30–5:30 am']],{collapsed:true})] }) })));
  A2.push(F('hG', { route:'(tabs)/index', comp:'HomeScreen', state:'G · Milestone (Oct 7, streak 10)', src:'v47 203', b75:'not built', fields:'milestone ← streak in [7,10,14,30,50,75,100]' },
    phone({ time:'8:02', tab:'home', body: home({ streak:10, week:['sec','sec','sec','todayDone','fut','fut','fut'], prog:0, line:'10 days in a row. Your best is 18.', primary:btnS('Share 10 days',{icon:'share'}), sections:[secRead('done',{collapsed:true, day:'Day 5 of 30'}), {name:'Up by 5', day:'Finished · 7 of 7', done:1,total:1,collapsed:true,tasks:[]}] }) })));
  A2.push(F('hH', { route:'(tabs)/index', comp:'HomeScreen', state:'H · Offline', src:'v47 204', b75:'not built' },
    phone({ time:'7:41', tab:'home', body: home({ streak:7, week:W_B, prog:0.5, banner: d(`display:flex;align-items:center;gap:8px;`, ic('wifioff',16,C.t2) + tx('s',C.t2,'Offline. Showing what was saved at 7:38 am.')), line:'Proofs post when you’re back online.', primary:btnP('Read 10 pages',{icon:'camera',off:true}), sections:[secRead('open'), secBed('done')], feed: feedHead(0) + tx('s',C.t2,'The feed loads when you’re back.','padding:8px 16px;') }) })));
  const sk = (w,h,r=8) => d(`width:${w};height:${h}px;border-radius:${r}px;box-shadow:inset 0 0 0 1px ${C.hair};`);
  A2.push(F('hI', { route:'(tabs)/index', comp:'HomeScreen', state:'I · Loading, first paint (after 1 s)', src:'v47 205', b75:'pending' },
    phone({ time:'7:40', tab:'home', body: d('padding:8px 16px;display:flex;flex-direction:column;gap:14px;', d('display:flex;gap:10px;align-items:center;', sk('30px',30,999) + sk('64px',36)) + sk('100%',50) + sk('100%',48,999) + sk('40%',22) + sk('100%',120,16) + sk('100%',120,16)) })));
  A2.push(F('hJ', { route:'(tabs)/index', comp:'HomeScreen', state:'J · Error', src:'v47 206', b75:'pending' },
    phone({ time:'7:40', tab:'home', body: d('display:flex;flex-direction:column;align-items:center;gap:8px;padding:220px 32px 0;text-align:center;', ic('alert',28,C.t2) + tx('t',C.t1,'Today didn’t load') + tx('b',C.t2,'Your streak and proofs are safe. Check your connection and try again.') + d('height:8px') + btnS('Try again',{icon:'retry'})) })));
  A2.push(F('hK', { route:'(tabs)/index', comp:'HomeScreen', state:'K · Just left Up by 5 (effective tomorrow)', src:'new', b75:'not built', fields:'recalculated ← required tasks across remaining enrollments' },
    phone({ time:'9:30', tab:'home', toast: toast({ title:'Leaving Up by 5 at midnight', sub:'Today still counts it. Tomorrow it moves to Profile, Challenges.', share:false, bottom:95 }), body: home({ streak:7, week:W_B, prog:0, line:'Up by 5 ends tonight. Today still needs both tasks.', primary:pReadBtn, sections:[secRead('open'), secBed('done',[G.self,['clock','4:30–5:30 am']],{ day:'Day 5 of 7 · leaving at midnight' })] }) })));
  const hydr = { name:'Hydrate 30', day:'Day 9 of 30', done:0, total:1, tasks:[{name:'Drink 3 L', gate:[[null,'12 cups'],G.self], st:'open'}] };
  A2.push(F('hL', { route:'(tabs)/index', comp:'HomeScreen', state:'L · Three challenges, primary on top, bar measured', src:'new', b75:'differs · build 75 hides the primary under the tab bar', fields:'scroll content inset bottom = 83 + 16' },
    phone({ time:'4:48', tab:'home', inset:'tab', body: home({ streak:7, week:W_B, line:'3 tasks left today.', primary:btnP('Out of bed',{icon:'sunrise'}), sections:[secBed('open',[G.self,['clock','4:30–5:30 am · 42 min left']]), secRead('open'), hydr] }) })));
  // Today list
  const omarSecs = [
    { name:'No Days Off 75', day:'Day 12 of 75 · Strict', done:1, total:5, tasks:[
      {name:'Progress photo', gate:[G.cam,G.by7], st:'done'}, {name:'Workout 45 min', gate:[[null,'45 min'],G.self], st:'open'},
      {name:'Drink 3 L', gate:[[null,'12 cups'],G.self], st:'open'}, {name:'Read 10 pages', gate:[[null,'10 pages'],G.opt], st:'open'}, {name:'Journal', gate:[[null,'100 words'],G.self], st:'open'} ] },
    { name:'Show Up 7', day:'Day 3 of 7', done:0, total:1, tasks:[{name:'Gym check-in', gate:[G.loc], st:'open'}] },
    { name:'Run 30', day:'Day 9 of 30', done:0, total:1, collapsed:true, tasks:[] } ];
  A2.push(F('tl5', { route:'(tabs)/index', comp:'TodayList', state:'5-task section expanded, 1-task section, collapsed section (Omar)', src:'v47 207', b75:'pending', fields:'gate line ← gateLine(task) · order Camera, Time, Location' },
    phone({ time:'6:38', tab:'home', scroll:200, body: home({ streak:12, week:W_B, prog:0.15, line:'6 tasks left today.', primary:btnP('Workout 45 min',{icon:'timer'}), sections:omarSecs, feed:'' }) })));
  const specRows = [ ['Self-reported',[G.self]], ['Camera',[G.cam]], ['Camera · By 7:00 am',[G.cam,G.by7]], ['Location',[G.loc]], ['Window closed · 4:30–5:30 am',[['clock','Window closed · 4:30–5:30 am']],'closed'], ['Photo optional',[G.opt]], ['Not open yet',[['clock','Opens at 4:30 am']]] ];
  A2.push(d('display:flex;flex-direction:column;gap:8px;width:393px;', tx('c',C.t1,'Gate line specimen · gateLine()') + panel(393, specRows.map(([l,g,st])=>taskRow({name:l, gate:g, st:st||'open'})).join('') + tx('s',C.t2,'One function builds every gate line, always in the order Camera, Time, Location. A task with no gate reads “Self-reported”. A closed window shows an outlined dash, never red. “Opens at” uses the window start, never midnight.'))));
  // Feed
  const feedFrame = (key, m, time, sel, hint, posts, scroll=0) => F(key, m, phone({ time, tab:'home', scroll, body: feedHead(sel,hint) + posts }));
  const caught = d('display:flex;flex-direction:column;align-items:center;gap:4px;padding:28px 16px;', ic('ccheck',22,C.t2) + tx('h',C.t1,'You’re caught up') + tx('s',C.t2,'Everything from people you follow since yesterday.') + btnT('See Everyone'));
  A2.push(feedFrame('fdAlone', { route:'(tabs)/index', comp:'HomeFeed', state:'Sparse · alone in your challenge', src:'v47 208', b75:'pending' }, '7:40', 0, null,
    caught.replace('Everything from people you follow since yesterday.','You don’t follow anyone yet.') + d(`margin:0 16px;background:${C.surf};border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px;`, tx('h',C.t1,'Read 30 is just you') + tx('s',C.t2,'People you invite join your room. Up to 10.') + btnS('Invite to Read 30',{icon:'link'}))));
  A2.push(feedFrame('fdEvery', { route:'(tabs)/index', comp:'HomeFeed', state:'Everyone, until you follow 3 (hint only on Everyone)', src:'v47 209', b75:'differs · build 75 shows the hint under Following' }, '7:40', 1, 'Showing everyone until you follow 3 people. You follow 1.',
    actGroup(['bilal','zayd','hamza'],'Bilal, Zayd and 4 others started Read 30','1h') + photoPost({ who:'hamza', sub:'Fajr 30 · Day 21 of 30', time:'2h', ph:['pray2'], cap:'', r:'4', c:'' })));
  A2.push(feedFrame('fdFollow', { route:'(tabs)/index', comp:'HomeFeed', state:'Following', src:'v47 210', b75:'pending' }, '7:40', 0, null, photoPost(KH_POST) + selfRow('omar','Drink 3 L','Self-reported · No Days Off 75','1h','2')));
  A2.push(feedFrame('fdCaught', { route:'(tabs)/index', comp:'HomeFeed', state:'Caught up', src:'v47 211', b75:'pending' }, '7:40', 0, null, selfRow('omar','Drink 3 L','Self-reported · No Days Off 75','1h','2') + actGroup(['khalid'],'Khalid finished Up by 5','3h') + caught));
  A2.push(feedFrame('fdMix1', { route:'(tabs)/index', comp:'HomeFeed', state:'Mixed feed · photo, compact rows, grouped activity', src:'new · direction 3', b75:'differs · build 75 is mostly “started” lines', fields:'activity lines: one group per 4 posts, max 3 avatars' }, '7:40', 0, null,
    photoPost(KH_POST) + selfRow('omar','Drink 3 L','Self-reported · No Days Off 75','1h','2') + actGroup(['bilal','zayd','abd'],'Bilal, Zayd and 3 others started Read 30','1h') + photoPost({ who:'abd', sub:'Run 30 · Day 4 of 30', time:'2h', ph:['run1'], cap:'', r:'', c:'' }), 0));
  A2.push(feedFrame('fdMix2a', { route:'(tabs)/index', comp:'HomeFeed', state:'Two-photo day · 1 of 2', src:'new · direction 3', b75:'not built' }, '7:41', 0, null,
    photoPost({ who:'bilal', sub:'2 proofs today · Clean 30, Fajr 30', time:'40m', ph:['food2','pray1'], idx:0, cap:'Meal prep for the week.', r:'5', c:'' }) + selfRow('zayd','Journal','Self-reported · Mind 14','3h',''), 0));
  A2.push(d('align-self:center;', arrow('Swipe left')));
  A2.push(feedFrame('fdMix2b', { route:'(tabs)/index', comp:'HomeFeed', state:'Two-photo day · swiped to 2 of 2', src:'new · direction 3', b75:'not built' }, '7:41', 0, null,
    photoPost({ who:'bilal', sub:'2 proofs today · Clean 30, Fajr 30', time:'40m', ph:['food2','pray1'], idx:1, cap:'Fajr, then a page.', r:'5', c:'' }) + selfRow('zayd','Journal','Self-reported · Mind 14','3h',''), 0));
  A2.push(feedFrame('fdMix2', { route:'(tabs)/index', comp:'HomeFeed', state:'Multi-photo day · swiped to 2 of 2', src:'new · direction 3', b75:'not built' }, '7:41', 0, null,
    photoPost({ who:'omar', sub:'2 proofs today · No Days Off 75, Run 30', time:'1h', ph:['gym3','run4'], idx:1, cap:'3.2 km before the gym.', r:'7', c:'1' }) + selfRow('zayd','Journal','Self-reported · Mind 14','3h',''), 0));
  // StreakSheet
  const month = d('display:grid;grid-template-columns:repeat(7,1fr);gap:8px 0;justify-items:center;', 'MTWTFSS'.split('').map(l=>tx('c',C.t2,l)).join('') + d('width:36px;height:36px') + ['sec','miss','sec','sec','sec','sec','sec','held','sec','sec','sec','sec','sec','sec','sec','miss','sec','sec','sec','sec','sec','sec','sec','sec','sec','miss','sec','sec','sec'].map(s=>dayCircle(s,36,C.surf)).join(''));
  const keyRow = d('display:flex;flex-wrap:wrap;gap:10px 16px;', [['sec','Secured'],['held','Freeze'],['shield','Last Stand'],['miss','Missed'],['fut','Ahead']].map(([s,l])=>d('display:flex;align-items:center;gap:6px;', dayCircle(s,20,C.surf) + tx('c',C.t2,l))).join(''));
  A2.push(F('ss', { route:'(tabs)/index', comp:'StreakSheet', state:'Month (swiped back to September), key, stock', src:'v47 212', b75:'pending', fields:'stats ← current_streak, best_streak, days_secured_total · week line ← secured / closed days since Monday' },
    phone({ time:'7:42', tab:'home', body: homeB(), overlay: sheet(d('display:flex;align-items:center;gap:8px;', flame(26) + sp(NUM+'font-size:28px;color:'+C.t1+';','7') + tx('s',C.t1,'day streak · Best 18 · 23 days secured')) + d('display:flex;justify-content:space-between;align-items:center;', tx('h',C.t1,'September 2026') + d('display:flex;', d('width:44px;height:44px;display:flex;align-items:center;justify-content:center;', ic('cl',18,C.t2)) + d('width:44px;height:44px;display:flex;align-items:center;justify-content:center;', ic('cr',18,C.t1)))) + month + keyRow +
      d(`display:flex;flex-direction:column;gap:2px;`, tx('h',C.t1,'This week: 6 of 6 days secured') + tx('s',C.t2,'Counts closed days since Monday. Today counts once it’s secured.')) +
      d(`background:${C.raised};border-radius:14px;padding:4px 12px;`, d('display:flex;align-items:center;gap:10px;min-height:44px;', ic('snow',18) + tx('b',C.t1,'Freezes','flex:1;') + tx('s',C.t2,'1 left · next Nov 3')) + d('display:flex;align-items:center;gap:10px;min-height:44px;', ic('shield',18) + tx('b',C.t1,'Last Stand','flex:1;') + tx('s',C.t2,'0 · no longer earned on Free'))) + tx('s',C.t2,'A freeze covers yesterday only, until midnight. Pro gets 4.'), { h:780 }) })));

  // ---------- AREA 3 · DOING A TASK ----------
  CUR = FL.t1; const A3 = [];
  const stepPhone = (time, head, body, sticky, o={}) => phone({ time, body: head + body, sticky, stickyH:o.sh, overlay:o.overlay, inset:o.inset });
  const bigQ = (q, s) => d('display:flex;flex-direction:column;gap:8px;padding:120px 24px 0;text-align:center;align-items:center;', tx('tl',C.t1,q) + tx('b',C.t2,s));
  const winCard = (t) => d(`margin:28px 16px 0;background:${C.surf};border-radius:16px;padding:12px 14px;display:flex;align-items:center;gap:10px;`, ic('clock',18) + tx('b',C.t1,t));
  const askHead = stepHead('Out of bed','Up by 5 · Day 5 of 7') + gateRow([[null,'Self-reported'],['clock','4:30–5:30 am']]);
  const askBody = bigQ('Did you do it?','Self-reported.') + winCard('Closes at 5:30 am · 39 min left');
  // 3.1 check-off
  const s31 = [ entry('Home, tap Out of bed'), arrow('Tap'),
    F('ask', { route:'task/complete', comp:'AskStep', state:'Did you do it?', src:'v47 214', b75:'pending' }, stepPhone('4:51', askHead, askBody, btnP('Done') + btnT('Not yet'), { sh:116, inset:'step' })), arrow('Done'),
    F('askSave', { route:'task/complete', comp:'AskStep', state:'Saving, in-button (under 800 ms)', src:'v47 215', b75:'pending' }, stepPhone('4:51', askHead, askBody, btnP('Saving',{spin:true}) + d('min-height:44px'), { sh:116 })), arrow('Saved'),
    F('askLand', { route:'(tabs)/index', comp:'TaskCompleteToast', state:'Lands on Home · day still open · text card share', src:'v47 216', b75:'pending' }, phone({ time:'4:51', tab:'home', body: home({ streak:7, week:W_B, prog:0.5, line:'1 of 2 left today.', primary:pReadBtn, sections:[secRead('open'), secBed('done')] }), toast: toast({ title:'Out of bed is done', sub:'1 task left: Read 10 pages.', shareLabel:'Share as a card' }) })) ];
  // 3.2 location
  const locHead = stepHead('Gym check-in','Show Up 7 · Day 3 of 7') + gateRow([['pin','Location']]);
  const iconHero = (i, t, s) => d('display:flex;flex-direction:column;gap:8px;padding:110px 28px 0;text-align:center;align-items:center;', d(`width:64px;height:64px;border-radius:999px;background:${C.surf};display:flex;align-items:center;justify-content:center;margin-bottom:6px;`, ic(i,28)) + tx('t',C.t1,t) + tx('b',C.t2,s));
  const omarHome = (x={}) => home({ streak:12, week:W_B, prog:0.3, line:'4 tasks left today.', primary:btnP('Workout 45 min',{icon:'timer'}), sections:[{...omarSecs[0], collapsed:true}, {...omarSecs[1], done:1, tasks:[{name:'Gym check-in',gate:[G.loc],st:'done'}]}, omarSecs[2]], feed:'', ...x });
  const s32 = [ entry('Home, tap Gym check-in'), arrow('Tap · first time'),
    F('locPre', { route:'task/complete', comp:'LocationPermission', state:'Pre-prompt', src:'v47 220', b75:'not built' }, stepPhone('6:41', locHead, iconHero('pin','Check-ins use your location','GRIIT checks you’re within 250 m of your gym when you tap Check in. It doesn’t track you otherwise.'), btnP('Continue') + btnT('Not now'), { sh:116 })), arrow('Continue'),
    F('locIOS', { route:'task/complete', comp:'LocationPermission', state:'iOS alert (context)', src:'v47 221', b75:'pending' }, stepPhone('6:41', locHead, iconHero('pin','Check-ins use your location','GRIIT checks you’re within 250 m of your gym when you tap Check in. It doesn’t track you otherwise.'), btnP('Continue') + btnT('Not now'), { sh:116, overlay: d(`position:absolute;inset:0;z-index:30;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;`, d(`width:270px;border-radius:14px;background:#2C2C2E;overflow:hidden;text-align:center;`, d('padding:18px 16px 14px;', tx('h',C.t1,'Allow “GRIIT” to use your location?') + tx('s',C.t1,'Used to confirm you’re at your gym when you check in.','margin-top:4px;')) + ['Allow Once','Allow While Using App','Don’t Allow'].map(l=>d(`height:44px;display:flex;align-items:center;justify-content:center;border-top:1px solid #3A3A3C;font-size:17px;color:#0A84FF;`, l)).join(''))) })), arrow('Allow While Using'),
    F('locOut', { route:'task/complete', comp:'CheckinEntryStep', state:'Outside the radius', src:'v47 217', b75:'pending', fields:'distance ← device location vs task.place, radius ← task.radius_m (250)' }, stepPhone('6:42', locHead, iconHero('nav','You’re 1.2 km from your gym','Check-in opens within 250 m. Nothing is lost by waiting; it closes at midnight.'), btnP('Check in',{off:true}) + btnT('Check again'), { sh:116 })), arrow('Walk in'),
    F('locIn', { route:'task/complete', comp:'CheckinEntryStep', state:'Inside the radius', src:'v47 218', b75:'pending' }, stepPhone('7:05', locHead, iconHero('pin','You’re at your gym','40 m away. Check in to finish this task.'), btnP('Check in'), { sh:72 })), arrow('Check in'),
    F('locLand', { route:'(tabs)/index', comp:'TaskCompleteToast', state:'Lands on Home · text card share', src:'v47 267', b75:'pending' }, phone({ time:'7:05', tab:'home', body: omarHome(), toast: toast({ title:'Gym check-in is done', sub:'4 tasks left today.', shareLabel:'Share as a card' }) })),
    arrow('Denied instead'),
    F('locDen', { route:'task/complete', comp:'LocationPermission', state:'Denied', src:'v47 222', b75:'not built' }, stepPhone('6:41', locHead, iconHero('pin','Location is off for GRIIT','Gym check-in needs it. Turn on Location in Settings, then come back.'), btnP('Open Settings') + btnT('Back to Home'), { sh:116 })) ];
  // 3.3 timer
  const timHead = stepHead('Workout 45 min','No Days Off 75 · Day 12 of 75') + gateRow([[null,'Self-reported'],['timer','45 min']]);
  const clockBig = (t, s, pct) => d('display:flex;flex-direction:column;align-items:center;gap:10px;padding:130px 24px 0;', d(`font-size:72px;line-height:76px;font-weight:600;font-variant-numeric:tabular-nums;color:${C.t1};letter-spacing:-0.02em;`, t) + d(`width:240px;height:4px;border-radius:2px;background:${C.raised};overflow:hidden;`, d(`width:${pct}%;height:100%;background:${C.t1};`)) + tx('b',C.t2,s,'text-align:center;'));
  const s33 = [ entry('Home, tap Workout 45 min'), arrow('Tap'),
    F('timPre', { route:'task/complete', comp:'TimerEntryStep', state:'Before start', src:'v47 223', b75:'pending' }, stepPhone('6:40', timHead, clockBig('45:00','Runs on the clock. Leaving the app doesn’t stop it.',0), btnP('Start',{icon:'play'}), { sh:72 })), arrow('Start'),
    F('timRun', { route:'task/complete', comp:'RunningStep', state:'Running', src:'v47 224', b75:'pending', fields:'remaining ← timer.started_at + duration − now (wall clock)' }, stepPhone('6:54', timHead, clockBig('31:12','Ends at 7:25 am.',31), btnS('Pause',{icon:'pause'}), { sh:68 })), arrow('Pause'),
    F('timPause', { route:'task/complete', comp:'RunningStep', state:'Paused', src:'v47 225', b75:'pending' }, stepPhone('6:55', timHead, clockBig('31:12','Paused. 31 minutes 12 seconds to go.',31), btnP('Resume',{icon:'play'}) + btnT('Reset'), { sh:116 })), arrow('Resume, wait'),
    F('timDone', { route:'task/complete', comp:'RunningStep', state:'Done, save enabled', src:'v47 226', b75:'pending' }, stepPhone('7:26', timHead, clockBig('45:00','45 minutes done.',100), btnP('Save workout'), { sh:72 })), arrow('Save'),
    F('timLand', { route:'(tabs)/index', comp:'TaskCompleteToast', state:'Lands on Home · timer done, day open', src:'v47 274', b75:'pending' }, phone({ time:'7:26', tab:'home', body: omarHome({ line:'3 tasks left today.', primary:btnP('Drink 3 L',{icon:'hash'}) }), toast: toast({ title:'Workout 45 min is done', sub:'3 tasks left today.', shareLabel:'Share as a card' }) })),
    arrow('Left mid-timer'),
    F('timLeft', { route:'(tabs)/index', comp:'TodayList', state:'Left mid-timer, still running', src:'v47 227', b75:'not built' }, phone({ time:'6:58', tab:'home', body: home({ streak:12, week:W_B, prog:0.15, line:'Workout 45 min is running. 27 min left.', primary:btnP('Back to the timer',{icon:'timer'}), sections:[{...omarSecs[0], tasks: omarSecs[0].tasks.map((t,i)=>i===1?{...t, gate:[['timer','Running · 27:04 left']], right: sp(T.c+'color:'+C.t1+';', '')}:t)}], feed:'' }) })) ];
  const secured = (time, n, week, title, lines, photos, o={}) => phone({ time, body: d('display:flex;flex-direction:column;align-items:center;gap:10px;padding:24px 16px 0;', d('display:flex;align-items:center;gap:8px;', flame(40) + sp(NUM+`font-size:56px;line-height:60px;color:${C.t1};`, n)) + tx('s',C.t2,'day streak') + tx('tl',C.t1,title,'margin-top:4px;') + d('width:100%;padding:0 8px;box-sizing:border-box;', strip(week,{})) +
    (photos.length ? d(`display:grid;grid-template-columns:repeat(${Math.min(photos.length,3)},1fr);gap:6px;width:${photos.length===1?220:361}px;margin-top:6px;`, photos.slice(0,3).map(p=>d('position:relative;aspect-ratio:4/5;border-radius:12px;overflow:hidden;', img(p) + d('position:absolute;left:6px;top:6px;transform:scale(0.85);transform-origin:0 0;', seal()))).join('')) : '') +
    d('width:100%;display:flex;flex-direction:column;gap:2px;margin-top:4px;', lines.map(l=>d('display:flex;align-items:center;gap:10px;min-height:36px;', doneDot(24) + tx('s',C.t1,l))).join(''))), sticky: o.sticky, stickyH: o.sh||172 });
  const shareBlock = (one) => tx('c',C.t2, one, 'text-align:center;') + d('display:flex;gap:8px;', btnS('Share to the feed',{flex:1}) + btnS('Keep it to the record',{flex:1})) + btnP('Done');
  // 3.4 counter + camera
  const cntHead = (n) => stepHead('Read 10 pages','Read 30 · Day 2 of 30') + gateRow([[null,'10 pages'],['camera','Camera']]);
  const counter = (n, sub) => d('display:flex;flex-direction:column;align-items:center;gap:14px;padding:84px 24px 0;', d('display:flex;align-items:baseline;gap:8px;', d(`font-size:56px;line-height:60px;font-weight:600;font-variant-numeric:tabular-nums;color:${C.t1};`, n) + tx('t',C.t2,'of 10 pages')) + tx('s',C.t2,sub) +
    d(`width:116px;height:116px;border-radius:999px;background:${C.raised};display:flex;align-items:center;justify-content:center;margin-top:8px;`, d('display:flex;align-items:center;gap:2px;', ic('plus',26) + sp(T.t+'color:'+C.t1+';','1'))) +
    d('display:flex;gap:8px;', chip('−1') + chip('+5') + chip('+10') + chip('Type it')));
  const kb = (rows, cols=3) => d(`position:absolute;left:0;right:0;bottom:0;height:300px;z-index:25;background:${C.surf};padding:8px 6px 40px;box-sizing:border-box;display:grid;grid-template-columns:repeat(${cols},1fr);gap:${cols>3?'12px 6px':'7px'};`, rows.map(k=>d(`height:${cols>3?42:48}px;border-radius:8px;background:${k?C.raised:'transparent'};display:flex;align-items:center;justify-content:center;font-size:24px;line-height:1;color:${C.t1};`, k==='del'?ic('del',22):k)).join(''));
  const camScreen = (time, pill, o={}) => phone({ time, onPhoto:true, inset:o.inset, full:
    d('position:absolute;inset:0;', img(o.ph||0)) + d('position:absolute;left:0;right:0;top:59px;height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;z-index:5;', d('width:44px;height:44px;border-radius:999px;background:rgba(15,15,15,0.5);display:flex;align-items:center;justify-content:center;', ic('x',20)) + d(`height:32px;padding:0 12px;border-radius:999px;background:rgba(15,15,15,0.6);display:flex;align-items:center;gap:6px;${T.c}color:${C.t1};`, ic('camera',13) + pill) + d('width:44px;height:44px;border-radius:999px;background:rgba(15,15,15,0.5);display:flex;align-items:center;justify-content:center;', ic('flip',20))) +
      d('position:absolute;left:0;right:0;bottom:0;height:200px;background:linear-gradient(transparent,rgba(15,15,15,0.75));') + d(`position:absolute;left:0;right:0;bottom:142px;text-align:center;${T.c}color:${C.t1};`, 'Live photo only. Your camera roll isn’t used.') +
      d(`position:absolute;left:158px;bottom:54px;width:76px;height:76px;border-radius:999px;border:4px solid ${C.t1};box-sizing:border-box;padding:4px;`, d(`width:100%;height:100%;border-radius:999px;background:${C.t1};`)) });
  const review = (time, head, cap, n, o={}) => phone({ time, body: head + d('padding:8px 16px 0;display:flex;flex-direction:column;gap:12px;', d('position:relative;width:100%;aspect-ratio:4/5;max-height:430px;border-radius:16px;overflow:hidden;', img(o.ph||0) + d('position:absolute;left:10px;top:10px;', seal())) + d(`background:${C.surf};border-radius:14px;padding:12px 14px;display:flex;align-items:flex-end;gap:8px;min-height:52px;`, tx('b',cap?C.t1:C.t2,cap||'Add a caption (optional)','flex:1;') + tx('c',C.t2,`${n} / 120`))), sticky: o.sticky || (btnP(o.save||'Save',{spin:o.spin}) + btnT('Retake')), stickyH:116, overlay:o.overlay });
  const revHead = stepHead('Read 10 pages','Read 30 · Day 2 of 30');
  const s34 = [ entry('Home, tap Read 10 pages'), arrow('Tap'),
    F('cnt3', { route:'task/complete', comp:'CountStep', state:'3 of 10, +5 / +10', src:'v47 228', b75:'pending', fields:'count ← draft.count (local) · target ← task.config.target (10)' }, stepPhone('7:41', cntHead(), counter('3','7 pages to go. Then a photo.'), btnP('Take photo',{off:true,icon:'camera'}), { sh:72 })), arrow('Type it'),
    F('cntType', { route:'task/complete', comp:'CountStep', state:'Type it, keypad', src:'v47 229', b75:'pending' }, phone({ time:'7:42', body: cntHead() + d('display:flex;flex-direction:column;align-items:center;gap:10px;padding:60px 24px 0;', tx('s',C.t2,'Pages read today') + d(`width:160px;height:72px;border-radius:16px;background:${C.surf};display:flex;align-items:center;justify-content:center;font-size:44px;font-weight:600;font-variant-numeric:tabular-nums;color:${C.t1};box-shadow:inset 0 0 0 2px ${C.t1};`, '10') + tx('s',C.t2,'Target met.')) + d('position:absolute;left:16px;right:16px;bottom:318px;', btnP('Done')), overlay: kb(['1','2','3','4','5','6','7','8','9','','0','del']) })), arrow('Done'),
    F('cntMet', { route:'task/complete', comp:'CountStep', state:'Target met → photo', src:'v47 230', b75:'pending' }, stepPhone('7:42', cntHead(), counter('10','Target met. A live photo finishes it.'), btnP('Take photo',{icon:'camera'}), { sh:72 })), arrow('Take photo'),
    F('cap', { route:'task/complete', comp:'CaptureStep', state:'Shutter, flip, cancel', src:'v47 238', b75:'pending' }, camScreen('7:42','Read 10 pages', { inset:'camera' })), arrow('Shutter'),
    F('rev', { route:'task/complete', comp:'ReviewStep', state:'Caption, 15 / 120', src:'v47 239', b75:'pending', fields:'caption ≤ 120 chars, sent with the completion' }, review('7:43', revHead, 'Chapter 4 done.', 15)), arrow('Save · last task'),
    F('sec1', { route:'task/secured', comp:'SecuredDayScreen', state:'1 photo · share block once', src:'v47 248', b75:'pending', fields:'8 ← current_streak after secure · route only when secured_today = true' }, secured('7:44','8',['sec','sec','sec','sec','sec','sec','todayDone'],'Day secured.',['Read 30 · Day 2 of 30 · Camera','Up by 5 · Day 5 of 7 · Self-reported'],[0],{ sticky: shareBlock('Your Read 10 pages photo. No answer keeps it private.') })),
    arrow('Retake or ✕'),
    F('discard', { route:'task/complete', comp:'DiscardPhotoModal', state:'Discard this photo?', src:'v47 240', b75:'pending' }, review('7:43', revHead, 'Chapter 4 done.', 15, { overlay: dialog('Discard this photo?','You’ll need a new photo to finish Read 10 pages.', d('display:flex;gap:8px;', btnS('Keep it',{flex:1}) + btnS('Discard',{flex:1,bg:C.raised}))) })) ];
  // 3.5 text
  const wHead = stepHead('Journal','No Days Off 75 · Day 12 of 75') + gateRow([[null,'Self-reported'],['type','100 words']]);
  const writing = (t, n) => d('padding:16px 20px 0;display:flex;flex-direction:column;gap:10px;', tx('b', t?C.t1:C.t2, t||'Write it here. 100 words or more.','min-height:220px;font-size:17px;line-height:24px;') + d(`height:2px;background:${C.raised};border-radius:1px;overflow:hidden;`, d(`width:${Math.min(100,n)}%;height:100%;background:${C.t1};`)) + tx('c',C.t2,`${n} / 100 words`));
  const jt2 = "Slept late, still made the gym. Noticed I skip journaling on days I feel behind, which is exactly when it helps. Tomorrow: clothes out tonight, phone in the kitchen, alarm across the room. Week two is where I quit last time. The pattern was the same every time: one bad morning, then I told myself the week was already ruined, so why bother. This time the rule is smaller. Show up, write one honest line before anything else, and do the next task even if the day can't be secured. A missed day is a fact, not a verdict. Twelve days in, it is starting to feel normal.";
  const wc = (t) => t.trim().split(/\s+/).length;
  const jt = 'Slept late, still made the gym. Noticed I skip journaling on days I feel behind, which is exactly when it helps. Tomorrow: lay out clothes, phone in the kitchen, alarm across the room.';
  const s35 = [ entry('Home, tap Journal'), arrow('Tap'),
    F('wEmpty', { route:'task/complete', comp:'WriteStep', state:'Empty', src:'v47 231', b75:'pending' }, stepPhone('21:10'.replace('21:10','9:10'), wHead, writing('',0), btnP('100 words to go',{off:true}), { sh:72 })), arrow('Type'),
    F('wShort', { route:'task/complete', comp:'WriteStep', state:'Typing, minimum not met', src:'v47 232', b75:'pending', fields:'words ← client count of the draft · min ← task.config.min_words' }, phone({ time:'9:14', body: wHead + writing(jt, wc(jt)).replace(wc(jt)+' / 100 words', wc(jt)+' / 100 words · '+(100-wc(jt))+' to go'), overlay: d('position:absolute;left:16px;right:16px;bottom:318px;z-index:26;', btnP((100-wc(jt))+' words to go',{off:true})) + kb(Array(30).fill(' '),10) })), arrow('Keep typing'),
    F('wMet', { route:'task/complete', comp:'WriteStep', state:'Minimum met', src:'v47 233', b75:'pending' }, stepPhone('9:20', wHead, writing(jt2, wc(jt2)).replace('font-size:17px;line-height:24px;','font-size:15px;line-height:21px;'), btnP('Save'), { sh:72 })), arrow('Save'),
    F('wLand', { route:'(tabs)/index', comp:'TaskCompleteToast', state:'Lands on Home · text card share', src:'new', b75:'pending' }, phone({ time:'9:20', tab:'home', body: omarHome({ line:'2 tasks left today.', primary:btnP('Drink 3 L',{icon:'hash'}) }), toast: toast({ title:'Journal is done', sub:'2 tasks left today.', shareLabel:'Share as a card', note:'The card shows the task, not your words. No answer keeps it private.' }) })) ];
  CUR = FL.t2;
  // 3.6 run
  const rHead = stepHead('3 km run','Run 30 · Day 9 of 30') + gateRow([['run','3 km'],['camera','Photo optional']]);
  const field = (l, v, unit, on) => d(`background:${C.surf};border-radius:14px;padding:10px 14px;display:flex;flex-direction:column;gap:2px;${on?`box-shadow:inset 0 0 0 2px ${C.t1};`:''}`, tx('c',C.t2,l) + d('display:flex;align-items:baseline;gap:6px;', d(`font-size:28px;line-height:34px;font-weight:600;font-variant-numeric:tabular-nums;color:${v?C.t1:C.t2};`, v||'0') + tx('s',C.t2,unit)));
  const runBody = (dist, time, note) => d('padding:24px 16px 0;display:flex;flex-direction:column;gap:10px;', field('Distance', dist, 'km', !dist) + field('Time', time, 'min:sec') + tx('s',C.t2,note));
  const optSheet = (bg) => sheet(tx('t',C.t1,'Add a photo?') + tx('b',C.t2,'With a photo it carries the camera seal. Without one it still counts, as self-reported.') + btnP('Take photo',{icon:'camera'}) + btnS('Done without a photo'));
  const s36 = [ entry('Home, tap 3 km run'), arrow('Tap'),
    F('runEmpty', { route:'task/complete', comp:'LogStep', state:'Empty, before typing', src:'v47 268', b75:'pending' }, stepPhone('6:20', rHead, runBody('','','You type these. Add a photo and it carries the camera seal.'), btnP('Save run',{off:true}), { sh:72 })), arrow('Type'),
    F('runTyped', { route:'task/complete', comp:'LogStep', state:'Self-entered distance and time', src:'v47 234', b75:'pending', fields:'pace = time / distance (client)' }, stepPhone('6:21', rHead, runBody('3.2','17:48','5:34 per km. Typed by you.'), btnP('Save run'), { sh:72 })), arrow('Save run'),
    F('optRun', { route:'task/complete', comp:'OptionalPhotoSheet', state:'Add a photo or done without', src:'v47 235', b75:'pending' }, phone({ time:'6:21', body: rHead + runBody('3.2','17:48','5:34 per km. Typed by you.'), overlay: optSheet(), inset:'sheet' })), arrow('Done without'),
    F('runLand', { route:'(tabs)/index', comp:'TaskCompleteToast', state:'Run done without photo → Self-reported', src:'v47 272', b75:'pending' }, phone({ time:'6:22', tab:'home', body: omarHome(), toast: toast({ title:'3 km run is done', sub:'Self-reported · 3.2 km in 17:48', shareLabel:'Share as a card' }) })),
    arrow('Or, from Health'),
    F('runGPS', { route:'task/complete', comp:'LogStep', state:'From Apple Health (GPS run)', src:'new', b75:'not built' }, stepPhone('6:21', rHead, d('padding:24px 16px 0;display:flex;flex-direction:column;gap:10px;', d(`background:${C.surf};border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:8px;`, tx('l',C.t2,'From Apple Health') + tx('h',C.t1,'Outdoor run · 6:02 am') + tx('b',C.t1,'3.21 km · 17:46 · 5:32 per km') + btnS('Use this run')) + tx('s',C.t2,'Imported runs still show as self-reported unless you add a photo. GRIIT doesn’t verify Health data.') + btnT('Type it instead')), btnP('Save run',{off:true}), { sh:72 })) ];
  // 3.7 optional photo (Read in No Days Off 75)
  const oHead = stepHead('Read 10 pages','No Days Off 75 · Day 12 of 75') + gateRow([[null,'10 pages'],['camera','Photo optional']]);
  const s37 = [ entry('Counter target met'), arrow('Save'),
    F('optRead', { route:'task/complete', comp:'OptionalPhotoSheet', state:'Read: add a photo?', src:'v43 153', b75:'pending' }, phone({ time:'7:50', body: oHead + counter('10','Target met.'), overlay: optSheet() })), arrow('Take photo, shutter'),
    F('optRev', { route:'task/complete', comp:'ReviewStep', state:'Optional photo, review', src:'v47 276', b75:'pending' }, review('7:51', stepHead('Read 10 pages','No Days Off 75 · Day 12 of 75'), '', 0, { ph:3 })), arrow('Save'),
    F('optLandP', { route:'(tabs)/index', comp:'TaskCompleteToast', state:'Done with a photo → camera seal', src:'v47 277', b75:'pending' }, phone({ time:'7:51', tab:'home', body: omarHome(), toast: toast({ thumb:3, title:'Read 10 pages is done', sub:'Camera · 3 tasks left today.' }) })),
    arrow('Done without'),
    F('optLandS', { route:'(tabs)/index', comp:'TaskCompleteToast', state:'Done without a photo → Self-reported', src:'v47 278', b75:'pending' }, phone({ time:'7:51', tab:'home', body: omarHome(), toast: toast({ title:'Read 10 pages is done', sub:'Self-reported · 3 tasks left today.', shareLabel:'Share as a card' }) })) ];
  // 3.8 time gate
  const s38 = [
    F('by7', { route:'task/complete', comp:'TaskChrome', state:'Camera · By 7:00 am, 22 min left', src:'v47 241', b75:'pending', fields:'deadline ← task.window_end (server clock)' }, camScreen('6:38','Progress photo · 22 min left', { ph:'gym2' })), arrow('Before 4:30'),
    F('notOpen', { route:'task/complete', comp:'BlockedStep', state:'Not open yet · “Opens at 4:30 am”', src:'v47 242', b75:'differs · build 75 says “Opens at midnight”', fields:'opens ← task.window_start' }, stepPhone('4:12', askHead.replace('4:30–5:30 am','Opens at 4:30 am'), iconHero('clock','Opens at 4:30 am','Out of bed can be done between 4:30 and 5:30 am. 18 minutes from now.'), btnS('Back to Home'), { sh:68 })), arrow('After 5:30'),
    F('closed', { route:'task/complete', comp:'WindowClosedStep', state:'Closed · drawn with the safe area', src:'v47 243', b75:'differs · build 75 puts the text under the clock' }, stepPhone('6:10', askHead, iconHero('clock','The window closed at 5:30 am','A closed window can’t be reopened, so today can’t be secured. Read 10 pages still counts for Read 30.'), btnP('Read 10 pages',{icon:'camera'}) + btnT('Back to Home'), { sh:116, inset:'step' })) ];
  // 3.9 camera permission
  const s39 = [ entry('First camera task'), arrow('Tap'),
    F('camPre', { route:'task/complete', comp:'CameraPermission', state:'Pre-prompt', src:'v47 236', b75:'not built' }, stepPhone('7:41', revHead, iconHero('camera','Proof photos are taken in GRIIT','Read 10 pages needs a live photo. GRIIT never opens your camera roll.'), btnP('Continue') + btnT('Not now'), { sh:116 })), arrow('Don’t Allow'),
    F('camDen', { route:'task/complete', comp:'CameraPermission', state:'Denied', src:'v47 237', b75:'not built' }, stepPhone('7:41', revHead, iconHero('camera','Camera is off for GRIIT','Read 10 pages needs a live photo. Turn on Camera in Settings, then come back.'), btnP('Open Settings') + btnT('Not now'), { sh:116 })) ];
  // endings
  const sEnd = [
    F('saveTake', { route:'task/complete', comp:'TaskFlowV2', state:'Saving, past 800 ms (takeover)', src:'v47 244', b75:'pending' }, phone({ time:'7:43', body: d('display:flex;flex-direction:column;align-items:center;gap:10px;padding:300px 32px 0;text-align:center;', spin(28) + tx('t',C.t1,'Saving Read 10 pages')) })), arrow('Fails'),
    F('failed', { route:'task/complete', comp:'FailedStep', state:'Didn’t save', src:'v47 245', b75:'pending' }, stepPhone('7:44', revHead, iconHero('alert','Didn’t save','Read 10 pages isn’t saved yet. Your photo and caption are kept on this phone.'), btnP('Try again',{icon:'retry'}) + btnT('Back to Home, keep the draft'), { sh:116 })),
    F('sec0', { route:'task/secured', comp:'SecuredDayScreen', state:'0 photos (Yaseen, Oct 2)', src:'v47 247', b75:'pending' }, secured('4:58','6',['sec','sec','sec','todayDone','fut','fut','fut'],'Day secured.',['Up by 5 · Day 3 of 7 · Self-reported'],[],{ sticky: btnS('Share as a card',{icon:'share'}) + btnP('Done'), sh:120 })),
    F('sec3', { route:'task/secured', comp:'SecuredDayScreen', state:'3+ photos (Omar)', src:'v47 249', b75:'pending' }, secured('9:40','13',W_B.map((s,i)=>i===6?'todayDone':s),'Day secured.',['No Days Off 75 · Day 12 of 75 · 2 photos','Show Up 7 · Day 3 of 7 · Location','Run 30 · Day 9 of 30 · 1 photo'],['gym1','book3','run4'],{ sticky: shareBlock('Your last task was self-reported. Today’s 3 photos can be shared from Profile.').replace(d('display:flex;gap:8px;', btnS('Share to the feed',{flex:1}) + btnS('Keep it to the record',{flex:1})),''), sh:110 })),
    F('finish', { route:'task/complete', comp:'FinishMomentV3', state:'Last task of the last day (Up by 5, Oct 6)', src:'v47 250', b75:'pending', fields:'days done ← enrollment.days_done · secured ← day_secures in range' }, phone({ time:'4:49', body: d('display:flex;flex-direction:column;align-items:center;gap:10px;padding:90px 20px 0;text-align:center;', tx('l',C.t2,'Up by 5 · finished') + sp(NUM+`font-size:56px;line-height:60px;color:${C.t1};`,'7 of 7') + tx('b',C.t1,'days done · 7 secured') + d('width:100%;margin-top:10px;', strip(['sec','sec','sec','sec','sec','sec','todayDone'],{letters:'1234567'}))), sticky: shareBlock('Share the finish? No answer keeps it private.').replace('Done','See the record'), stickyH:172 })),
    F('chDone', { route:'challenge/complete', comp:'ChallengeComplete', state:'Record and next', src:'v47 251', b75:'pending' }, phone({ time:'4:50', body: stepHead('Up by 5','Finished Oct 6',{back:true}) + d('padding:12px 16px 0;display:flex;flex-direction:column;gap:14px;', d(`background:${C.surf};border-radius:16px;padding:14px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;`, [['7','Days done'],['7','Secured'],['0','Missed']].map(([n,l])=>d('display:flex;flex-direction:column;', sp(NUM+'font-size:28px;color:'+C.t1+';',n) + tx('c',C.t2,l))).join('')) + d('display:grid;grid-template-columns:repeat(7,1fr);gap:4px;', [...Array(7)].map((_,i)=>d(`aspect-ratio:4/5;border-radius:6px;background:${C.surf};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;`, tx('c',C.t1,String(i+1)) + ic('check',12,C.t2,{sw:3}))).join('')) + tx('s',C.t2,'Every day was self-reported: Out of bed has no camera gate.') + tx('h',C.t1,'Next') + d(`background:${C.surf};border-radius:16px;padding:12px 14px;display:flex;align-items:center;gap:12px;`, d('width:44px;height:55px;border-radius:8px;background:linear-gradient(160deg,#3A3631,#151414);display:flex;align-items:center;justify-content:center;', sp(NUM+'font-size:18px;color:'+C.t1+';','14')) + d('flex:1;', tx('h',C.t1,'Up by 5, 14 days') + tx('s',C.t2,'Same task, twice as long')) + ic('cr',18,C.t2))), sticky: btnP('Start Up by 5, 14 days') + btnT('Done'), stickyH:116 })),
    F('moment', { route:'task/complete', comp:'MomentScreenV3', state:'Proof landed, day still open (Omar)', src:'v47 252', b75:'pending' }, phone({ time:'6:44', onPhoto:true, full: d('position:absolute;inset:0;', img(4)) + d('position:absolute;left:0;right:0;bottom:0;height:420px;background:linear-gradient(transparent,rgba(15,15,15,0.92) 45%);') + d('position:absolute;left:12px;top:59px;width:44px;height:44px;border-radius:999px;background:rgba(15,15,15,0.5);display:flex;align-items:center;justify-content:center;', ic('x',20)) + d('position:absolute;left:16px;right:16px;bottom:46px;display:flex;flex-direction:column;gap:8px;', d('display:flex;align-items:center;gap:8px;', seal() + tx('t',C.t1,'Progress photo is done')) + tx('s',C.t1,'No Days Off 75 · Day 12 of 75 · 4 tasks left today') + tx('c',C.t1,'No answer keeps it private.','margin-top:6px;') + d('display:flex;gap:8px;', btnS('Share to the feed',{flex:1}) + btnS('Keep it to the record',{flex:1}))) })),
    F('contact', { route:'task/complete', comp:'ContactSheet', state:'All proofs in a run (Read 30, Nov 1)', src:'v47 253', b75:'pending' }, phone({ time:'8:10', body: stepHead('Read 30','Finished Nov 1',{back:true}) + d('padding:8px 16px 0;display:flex;flex-direction:column;gap:10px;', d('display:flex;align-items:baseline;gap:8px;', sp(NUM+'font-size:40px;color:'+C.t1+';','28 of 30') + tx('s',C.t2,'days done · 27 secured')) + d('display:grid;grid-template-columns:repeat(6,1fr);gap:4px;', [...Array(30)].map((_,i)=> i===11 ? d(`aspect-ratio:4/5;border-radius:4px;background:${C.raised};display:flex;align-items:center;justify-content:center;`, ic('snow',14)) : i===19 ? d(`aspect-ratio:4/5;border-radius:4px;box-shadow:inset 0 0 0 1.5px ${C.miss};display:flex;align-items:center;justify-content:center;`, d(`width:10px;height:2px;background:${C.t2};`)) : d('aspect-ratio:4/5;border-radius:4px;overflow:hidden;', img(['book1','book2','book3'][i%3]))).join('')) + d('display:flex;gap:14px;', d('display:flex;gap:6px;align-items:center;', ic('snow',14) + tx('c',C.t2,'Held, day 12')) + d('display:flex;gap:6px;align-items:center;', d(`width:12px;height:2px;background:${C.t2};`) + tx('c',C.t2,'Missed, day 20')))), sticky: btnS('Share the run',{icon:'share'}) + btnP('Done'), stickyH:120 })) ];
  // matrix
  const MX = [['Check-off','ask','—','closed · notOpen','locIn'],['Timer','timRun','—','—','—'],['Counter','cnt3','cap · rev','—','—'],['Text','wShort','—','—','—'],['Run','runTyped','optRun','—','—'],['Optional photo','optRead','optRev','—','—'],['Camera · By 7','—','by7','by7','—'],['Permissions','—','camPre · camDen','—','locPre · locDen']];
  const nums = (s) => s==='—'?'—':s.split(' · ').map(k=>REG[k]?`<a href="${href(k)}" style="color:${C.t1};">${REG[k].n}</a>`:k).join(' · ');
  const matrix = panel(760, tx('l',C.t2,'Type × gate matrix · frame numbers') + `<div style="display:grid;grid-template-columns:160px repeat(4,1fr);gap:0;">` + ['Type','No gate','Camera','Time','Location'].map(h=>d(`${T.c}color:${C.t2};padding:8px 0;`,h)).join('') + MX.map(r=>r.map((c,i)=>d(`${i?T.s:T.h}color:${C.t1};padding:10px 0;border-top:1px solid ${C.raised};`, i?nums(c):c)).join('')).join('') + '</div>' + tx('s',C.t2,'Every gate combination resolves to one of these steps; gates stack in the order Camera, Time, Location, so a camera task with a window opens CaptureStep with the deadline pill (frame ' + REG.by7.n + ').'));

  // ---------- AREA 4 · SHARING ----------
  CUR = FL.share;
  const momentState = (key, state, src, foot, b75='pending') => F(key, { route:'task/complete', comp:'FinishMomentV3 · share choice', state, src, b75 }, phone({ time:'6:44', onPhoto:true, full: d('position:absolute;inset:0;', img(4)) + d('position:absolute;left:0;right:0;bottom:0;height:420px;background:linear-gradient(transparent,rgba(15,15,15,0.92) 45%);') + d('position:absolute;left:16px;right:16px;bottom:46px;display:flex;flex-direction:column;gap:8px;', d('display:flex;align-items:center;gap:8px;', seal() + tx('t',C.t1,'Progress photo is done')) + tx('s',C.t1,'No Days Off 75 · Day 12 of 75') + foot) }));
  const A4a = [
    momentState('shU','Unanswered','v47 254', tx('c',C.t1,'No answer keeps it private.','margin-top:6px;') + d('display:flex;gap:8px;', btnS('Share to the feed',{flex:1}) + btnS('Keep it to the record',{flex:1}))),
    momentState('shS','Shared to the feed','v47 255', d('display:flex;align-items:center;gap:8px;min-height:44px;margin-top:6px;', ic('ccheck',18) + tx('h',C.t1,'Shared to the feed.','flex:1;') + btnT('Undo')) + btnS('Share to Instagram',{icon:'ig'})),
    momentState('shK','Kept to the record','v47 256', d('display:flex;align-items:center;gap:8px;min-height:44px;margin-top:6px;', ic('lock',18) + tx('h',C.t1,'Kept private.','flex:1;')) + tx('s',C.t1,'Share it later from Profile, Proofs.')),
    momentState('shF','Failed to share','v47 257', d('display:flex;align-items:center;gap:8px;min-height:44px;margin-top:6px;', ic('alert',18) + tx('h',C.t1,'Couldn’t share. It’s still private.','flex:1;')) + btnS('Try again',{icon:'retry'}), 'not built') ];
  const styleCard = (k, w=393, h=698) => { // preview inside share sheet; styles keyed
    const ink = k.bg==='white' ? C.t1 : k.bg==='orange' ? C.or : C.ink, fg = k.bg==='white' ? C.ink : C.t1;
    return d(`position:relative;width:${w}px;height:${h}px;background:${k.style==='Sticker'?'repeating-conic-gradient(#2A2928 0 25%,#1F1E1D 0 50%) 0 0/16px 16px':ink};overflow:hidden;border-radius:${k.r||0}px;`,
      (k.style==='Photo'?d('position:absolute;inset:0;', img(0)) + d('position:absolute;inset:0;background:linear-gradient(transparent 50%,rgba(15,15,15,0.85));'):'') +
      d(`position:absolute;left:${w*0.08}px;right:${w*0.08}px;bottom:${h*0.2}px;display:flex;flex-direction:column;gap:${h*0.01}px;color:${k.style==='Photo'?C.t1:fg};`, d('display:flex;align-items:center;gap:6px;', ic('flame',w*0.07,C.or,{fill:C.or}) + sp(NUM+`font-size:${w*0.16}px;line-height:1;`, k.num||'8')) + d(`font-size:${w*0.045}px;line-height:1.25;font-weight:600;`, k.line||'days. Read 30 · Day 2 of 30') + d(`font-size:${w*0.032}px;font-weight:500;opacity:0.8;`, '{INVITE_BASE}/i/{code}')));
  };
  const shareSheet = (time, st, extra='') => phone({ time, body: d('display:flex;align-items:center;justify-content:space-between;padding:0 6px;height:52px;', d('width:44px;height:44px;display:flex;align-items:center;justify-content:center;', ic('x',22)) + tx('h',C.t1,st.style + ' · ' + (st.i||1) + ' of 7') + d('width:44px')) +
    d('display:flex;justify-content:center;padding-top:4px;', d('position:relative;', styleCard({...st, r:16}, 260, 462))) +
    d('display:flex;justify-content:center;gap:6px;padding:10px 0 6px;', [...Array(7)].map((_,i)=>d(`width:6px;height:6px;border-radius:999px;background:${i===(st.i||1)-1?C.t1:C.t3};`)).join('')) +
    d('display:flex;justify-content:center;gap:8px;', chip('Ink',st.bg==='ink') + chip('Orange',st.bg==='orange') + chip('White',st.bg==='white')) +
    d(`margin:10px 16px 0;background:${C.surf};border-radius:14px;padding:12px 14px;display:flex;justify-content:space-between;`, tx('b',st.cap?C.t1:C.t2,st.cap||'Caption (sent as text)') + tx('c',C.t2,(st.cap||'').length+' / 120')) +
    d('display:flex;justify-content:space-around;padding:16px 16px 0;', [['ig','Instagram Story'],['download','Save'],['sms','Messages'],['more','More']].map(([i,l])=>d('display:flex;flex-direction:column;align-items:center;gap:6px;width:76px;', d(`width:52px;height:52px;border-radius:999px;background:${C.raised};display:flex;align-items:center;justify-content:center;`, ic(i,22)) + tx('c',C.t1,l,'text-align:center;'))).join('')), overlay: extra });
  const A4b = [
    F('ssPhoto', { route:'share', comp:'ShareSystemSheet', state:'Photo style, Ink', src:'v47 258', b75:'not built' }, shareSheet('7:45', { style:'Photo', i:1, bg:'ink' })),
    F('ssSticker', { route:'share', comp:'ShareSystemSheet', state:'Sticker style, White', src:'v47 259', b75:'not built' }, shareSheet('7:45', { style:'Sticker', i:2, bg:'white' })),
    F('ssCap', { route:'share', comp:'ShareSystemSheet', state:'Caption typing', src:'v47 260', b75:'not built' }, shareSheet('7:46', { style:'Big number', i:5, bg:'orange', cap:'8 days.' }, kb(Array(30).fill(' '),10))) ];
  const STY = [['Photo','ink','8','days. Read 30 · Day 2 of 30'],['Sticker','white','8','days secured'],['Card','ink','8','days. Read 10 pages · Camera'],['Grid','ink','6','proofs this week'],['Big number','orange','8','days in a row'],['Finish','ink','7 of 7','Up by 5 finished'],['Invite','ink','10','spots in Read 30. Join me.']];
  const styles = panel(1720, tx('l',C.t2,'Seven styles at 1080 × 1920, shown at 20% · Instagram safe areas: top 250 px, bottom 340 px') + d('display:flex;gap:24px;', STY.map(([s,bg,n,l])=>d('display:flex;flex-direction:column;gap:6px;', d('position:relative;', styleCard({style:s,bg,num:n,line:l, r:8}, 216, 384) + d(`position:absolute;left:0;right:0;top:0;height:50px;border-bottom:1px dashed ${C.t1};background:rgba(242,240,235,0.08);border-radius:8px 8px 0 0;`) + d(`position:absolute;left:0;right:0;bottom:0;height:68px;border-top:1px dashed ${C.t1};background:rgba(242,240,235,0.08);border-radius:0 0 8px 8px;`)) + tx('h',C.t1,s) + tx('c',C.t2, s==='Sticker'?'Transparent PNG':s==='Grid'?'Shared photos only':s==='Invite'?'Link ends every style':'1080 × 1920'))).join('')) + tx('s',C.t2,'Orange appears inside the Orange export as a background: it is the user’s chosen artwork, not app UI, so it is outside the four-places rule. Private photos are never offered in Photo or Grid.'));
  const A4c = [
    F('stkTask', { route:'share', comp:'ShareStickerSheet', state:'Task sticker, three backgrounds', src:'v37 chunk 1', b75:'pending' }, phone({ time:'7:46', body: homeB(), overlay: sheet(tx('t',C.t1,'Share Read 10 pages') + d('display:flex;gap:8px;', [['Clear','Sticker'],['Dark card','Card'],['Your photo','Photo']].map(([l,s],i)=>d('display:flex;flex-direction:column;gap:6px;flex:1;', d(`border-radius:12px;overflow:hidden;${i===2?`box-shadow:0 0 0 2px ${C.t1};`:''}`, styleCard({style:s,bg:'ink',num:'8',line:'days'}, 112, 199)) + tx('c',i===2?C.t1:C.t2,l,'text-align:center;'))).join('')) + btnP('Share to Instagram Story',{icon:'ig'}) + btnT('Save to Photos')) })),
    F('dayPick', { route:'share', comp:'DayStickerSheet', state:'Which day · 2 challenges secured today', src:'v47 261', b75:'pending' }, phone({ time:'8:21', body: homeB(), overlay: sheet(tx('t',C.t1,'Which challenge goes on the sticker?') + [['Read 30','Day 2 of 30 · Camera',true],['Up by 5','Day 5 of 7 · Self-reported',false],['Both','Day secured · 8 days',false]].map(([a,b,on])=>d(`display:flex;align-items:center;gap:12px;min-height:56px;padding:0 14px;border-radius:14px;background:${on?C.t1:C.raised};`, d('flex:1;', tx('h',on?C.ink:C.t1,a) + tx('s',on?'#3A3836':C.t2,b)) + (on?ic('check',18,C.ink,{sw:3}):''))).join('') + btnP('Next')) })),
    F('finCard', { route:'share', comp:'FinishTextCard', state:'Up by 5 finished, text card', src:'v44.1 F', b75:'pending' }, phone({ time:'4:50', body: d('display:flex;flex-direction:column;align-items:center;padding-top:30px;gap:14px;', styleCard({style:'Finish',bg:'ink',num:'7 of 7',line:'Up by 5 finished. Every day self-reported.', r:16}, 300, 533) + tx('s',C.t2,'Self-reported days stay labelled on the card.')), sticky: btnP('Share to Instagram Story',{icon:'ig'}) + btnT('Save to Photos'), stickyH:116 })) ];
  const A4d = [
    F('igEdit', { route:'Instagram', comp:'Story editor', state:'Hand-off (Instagram UI, context only)', src:'v47 262', b75:'pending' }, phone({ time:'7:47', onPhoto:true, full: d('position:absolute;inset:0;', img(0)) + d('position:absolute;left:66px;top:300px;transform:rotate(-4deg);', styleCard({style:'Sticker',bg:'white',num:'8',line:'days secured', r:12}, 260, 200).replace(/repeating-conic-gradient\([^)]*\) 0 0\/16px 16px/,'rgba(242,240,235,0.94)')) + d('position:absolute;right:16px;top:70px;display:flex;flex-direction:column;gap:18px;', ['type','sticker','more'].map(i=>ic(i,26)).join('')) + d(`position:absolute;left:16px;right:16px;bottom:44px;display:flex;justify-content:space-between;`, d(`height:44px;padding:0 16px;border-radius:999px;background:rgba(15,15,15,0.6);display:flex;align-items:center;${T.h}color:${C.t1};`, 'Your story') + d(`height:44px;padding:0 16px;border-radius:999px;background:${C.t1};display:flex;align-items:center;${T.h}color:${C.ink};`, 'Close Friends')) })),
    F('igBack', { route:'(tabs)/index', comp:'Toast', state:'Back in GRIIT', src:'v47 263', b75:'not built' }, phone({ time:'7:48', tab:'home', body: home({ streak:8, week:['sec','sec','sec','sec','sec','sec','todayDone'], line:'Day secured. Come back tomorrow.', primary:btnS('Share today',{icon:'share'}), sections:[secRead('done',{collapsed:true}), secBed('done',[G.self],{collapsed:true})] }), toast: d(`position:absolute;left:16px;right:16px;bottom:95px;z-index:16;background:${C.raised};border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:10px;`, ic('ig',18) + tx('s',C.t1,'Opened in Instagram. GRIIT can’t see whether it was posted.','flex:1;')) })),
    F('igNone', { route:'share', comp:'ShareSystemSheet', state:'Instagram not installed', src:'v47 264', b75:'not built' }, shareSheet('7:46', { style:'Photo', i:1, bg:'ink' }, d(`position:absolute;left:16px;right:16px;bottom:44px;z-index:30;background:${C.raised};border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:10px;`, ic('alert',18) + tx('s',C.t1,'Instagram isn’t on this phone. Save the image, or use More.','flex:1;')))),
    F('igSaved', { route:'share', comp:'ShareSystemSheet', state:'Saved to Photos', src:'v47 265', b75:'not built' }, shareSheet('7:46', { style:'Photo', i:1, bg:'ink' }, d(`position:absolute;left:16px;right:16px;bottom:44px;z-index:30;background:${C.raised};border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:10px;`, ic('ccheck',18) + tx('s',C.t1,'Saved to Photos.','flex:1;')))),
    F('pastProof', { route:'proof/[id]', comp:'ProofViewer', state:'Past private proof, owner · Share this proof', src:'v39 112 / v47 266', b75:'differs · build 75 has no share action here' }, phone({ time:'9:02', body: stepHead('Proofs','',{}) + tx('l',C.t2,'Saturday 3 October','padding:4px 16px 8px;') + d('position:relative;width:393px;height:491px;', img('book3') + d('position:absolute;left:12px;top:12px;', seal()) + d(`position:absolute;right:12px;top:12px;height:26px;padding:0 10px;border-radius:999px;background:rgba(15,15,15,0.62);display:flex;align-items:center;gap:5px;${T.c}color:${C.t1};`, ic('lock',12) + 'Private')) + d('padding:12px 16px;display:flex;flex-direction:column;gap:2px;', tx('h',C.t1,'Read 10 pages') + tx('s',C.t2,'Read 30 · Day 1 of 30 · Camera · 7:12 am')), sticky: btnP('Share this proof',{icon:'share'}), stickyH:72 })) ];

  // ---------- Part 4 fixes needing their own frames ----------
  CUR = FL.hub; const P4 = [];
  P4.push(F('notFound', { route:'+not-found', comp:'NotFound', state:'Dark, no system header', src:'new', b75:'differs · build 75 shows a white “Page Not Found” after posting' },
    phone({ time:'7:44', body: d('display:flex;flex-direction:column;align-items:center;gap:8px;padding:250px 32px 0;text-align:center;', ic('file',28,C.t2) + tx('t',C.t1,'This page isn’t here') + tx('b',C.t2,'The link may be old. Your proofs and streak aren’t affected.')), sticky: btnP('Go to Home',{icon:'home'}), stickyH:72 })));
  P4.push(F('leave', { route:'challenge/active/[id]', comp:'LeaveConfirm', state:'Overflow → Leave · confirm (takes effect tomorrow)', src:'new', b75:'pending' },
    phone({ time:'9:29', body: stepHead('Up by 5','Day 5 of 7',{back:true, right: ic('more',20)}) + d('padding:12px 16px;', strip(W_B,{prog:0})), overlay: sheet(tx('t',C.t1,'Leave Up by 5?') + tx('b',C.t2,'You leave at midnight. Today still counts Up by 5, so Out of bed is still needed to secure today. Your 5 days stay in your record as “Left on day 5”.') + btnS('Leave at midnight') + btnT('Stay')) })));
  P4.push(F('leaveLost', { route:'challenge/active/[id]', comp:'LeaveConfirm', state:'Leave when today is already unsecurable', src:'new', b75:'not built' },
    phone({ time:'6:30', body: stepHead('Up by 5','Day 5 of 7',{back:true, right: ic('more',20)}) + d('padding:12px 16px;', strip(W_B,{prog:0})), overlay: sheet(tx('t',C.t1,'Leave Up by 5?') + tx('b',C.t2,'You leave at midnight. Out of bed closed at 5:30 am, so today already can’t be secured, and leaving doesn’t change that.') + btnS('Leave at midnight') + btnT('Stay')) })));
  P4.push(F('limit', { route:'create · challenge/[id]', comp:'FreeLimitScreen', state:'Free tier: 3 of 3 running (Yaseen)', src:'new', b75:'differs · build 75 is a near-blank page with one line', fields:'active ← count(enrollments where status = active) · limit ← plan.max_active (3)' },
    phone({ time:'12:30', body: stepHead('Join Fajr 30','',{}) + d('padding:16px 16px 0;display:flex;flex-direction:column;gap:12px;', tx('tl',C.t1,'You’re in 3 challenges') + tx('b',C.t2,'Free accounts run 3 at a time. Leave one to join Fajr 30, or go Pro for more.') +
      [['Read 30','Day 2 of 30'],['Up by 5','Day 5 of 7'],['Hydrate 30','Day 9 of 30']].map(([a,b])=>d(`background:${C.surf};border-radius:16px;padding:8px 8px 8px 14px;display:flex;align-items:center;gap:10px;`, d('flex:1;', tx('h',C.t1,a) + tx('s',C.t2,b)) + btnS('Leave',{bg:C.raised}))).join('') + tx('s',C.t2,'Leaving takes effect at midnight and keeps your days in your record. Fajr 30 starts tomorrow.')), sticky: btnP('See Pro') + btnT('Not now'), stickyH:116 })));

  // ---------- Device reference (insets) ----------
  devFrames.push(F('dTab', { route:'reference', comp:'Safe areas', state:'Tab screen (Home)', src:'new', b75:'differs · content under the island and the tab bar' }, phone({ time:'7:40', tab:'home', inset:'tab', body: homeB() })));
  devFrames.push(F('dPush', { route:'reference', comp:'Safe areas', state:'Pushed screen (proof/[id])', src:'new', b75:'pending' }, phone({ time:'9:02', inset:'pushed', body: stepHead('Proofs','',{back:true}) + d('position:relative;width:393px;height:491px;', img('book3')) + d('padding:12px 16px;', tx('h',C.t1,'Read 10 pages') + tx('s',C.t2,'Read 30 · Day 1 of 30 · Camera')) })));
  devFrames.push(frameWrap('ask',0,1), frameWrap('hCs',0,1), frameWrap('cap',0,1));

  // ---------- Flows ----------
  // new frames used only by flows
  CUR = FL.hub;
  const welcome = F('fWelcome', { route:'onboarding/index', comp:'OnboardingFlowV2 · Welcome', state:'First open', src:'v42 onboarding', b75:'pending' }, phone({ time:'9:00', body: d('display:flex;flex-direction:column;gap:12px;padding:220px 24px 0;', flame(44) + d(`font-size:40px;line-height:44px;font-weight:500;color:${C.t1};letter-spacing:-0.02em;`, 'Do what you said.<br>Prove it.') + tx('b',C.t2,'Daily challenges, honest proof, a streak that grows.')), sticky: btnP('Get started') + btnT('I have an account'), stickyH:116 }));
  const firstCh = F('fFirst', { route:'onboarding/index', comp:'FirstChallenge', state:'Pick card selected', src:'v42 onboarding', b75:'pending' }, phone({ time:'9:02', body: stepHead('','',{back:true}) + d('padding:0 16px;display:flex;flex-direction:column;gap:10px;', tx('tl',C.t1,'Pick your first challenge') + tx('s',C.t2,'You can join more later. Day 1 is today.') + [['Read 30','30 days · Read 10 pages · Camera','#36351F',true],['Up by 5','7 days · Out of bed by 5:30 · Self-reported','#3A3631',false],['Hydrate 30','30 days · Drink 3 L · Self-reported','#24363A',false]].map(([a,b,tint,on])=>d(`display:flex;align-items:center;gap:12px;padding:10px;border-radius:16px;background:${on?C.t1:C.surf};`, d(`width:48px;height:60px;border-radius:10px;background:linear-gradient(160deg,${tint},#151414);display:flex;align-items:center;justify-content:center;`, sp(NUM+'font-size:20px;color:'+C.t1+';', a.match(/\d+/)[0])) + d('flex:1;', tx('h',on?C.ink:C.t1,a) + tx('s',on?'#3A3836':C.t2,b)) + (on?ic('check',18,C.ink,{sw:3}):''))).join('') + btnT('Browse all')), sticky: btnP('Start Read 30'), stickyH:72 }));
  const samiHome = F('fSamiHome', { route:'(tabs)/index', comp:'HomeScreen', state:'Day 1, first challenge (Yaseen, Sep 27)', src:'new', b75:'pending' }, phone({ time:'9:04', tab:'home', body: home({ streak:0, week:['pre','pre','pre','pre','pre','pre','today'], line:'Day 1 of Read 30. Finish it to start your streak.', primary:btnP('Read 10 pages',{icon:'camera'}), sections:[{...secRead('open'), day:'Day 1 of 30'}], feed: feedHead(1,'Showing everyone until you follow 3 people.') + photoPost(KH_POST) }) }));
  const samiSec = F('fSamiSec', { route:'task/secured', comp:'SecuredDayScreen', state:'First day secured, 1 photo (Yaseen, Sep 27)', src:'v47 248', b75:'pending' }, secured('9:12','1',['pre','pre','pre','pre','pre','pre','todayDone'],'Day secured.',['Read 30 · Day 1 of 30 · Camera'],[0],{ sticky: shareBlock('Your first proof. No answer keeps it private.') }));
  const samiShare = F('fSamiShare', { route:'share', comp:'ShareSystemSheet', state:'Photo style, from Secured · streak 1', src:'v44.1 173', b75:'differs · build 75 says “1 days”' }, shareSheet('9:13', { style:'Photo', i:1, bg:'ink', num:'1', line:'days. Read 30 · Day 1 of 30' }));
  const yHome441 = F('fY441', { route:'(tabs)/index', comp:'HomeScreen', state:'4:41 am, both open (Yaseen)', src:'new', b75:'pending' }, phone({ time:'4:41', tab:'home', body: home({ streak:7, week:W_B, line:'2 tasks left today.', primary:pReadBtn, sections:[secRead('open'), secBed('open',[G.self,['clock','4:30–5:30 am · 49 min left']])] }) }));
  const yToast = F('fYToast', { route:'(tabs)/index', comp:'TaskCompleteToast', state:'Read done, photo share choice, day open', src:'v47 246', b75:'pending' }, phone({ time:'4:52', tab:'home', body: home({ streak:7, week:W_B, prog:0.5, line:'1 of 2 left today.', primary:btnP('Out of bed',{icon:'sunrise'}), sections:[secRead('done'), secBed('open',[G.self,['clock','4:30–5:30 am · 38 min left']])] }), toast: toast({ thumb:0, title:'Read 10 pages is done', sub:'Camera · 1 task left: Out of bed.' }) }));
  const ySecSelf = F('fYSecSelf', { route:'task/secured', comp:'SecuredDayScreen', state:'Secured, closing task self-reported', src:'v28.2', b75:'pending' }, secured('4:53','8',['sec','sec','sec','sec','sec','sec','todayDone'],'Day secured.',['Read 30 · Day 2 of 30 · Camera','Up by 5 · Day 5 of 7 · Self-reported'],[0],{ sticky: tx('c',C.t2,'You answered Read 10 pages already. Share the day as a card?','text-align:center;') + btnS('Share today',{icon:'share'}) + btnP('Done'), sh:130 }));
  const yShareBig = F('fYBig', { route:'share', comp:'ShareSystemSheet', state:'Big number, Orange', src:'v44.1 174', b75:'not built' }, shareSheet('4:54', { style:'Big number', i:5, bg:'orange' }));
  const yHomeF = frameWrap('hF', 0.62);
  const yE = F('fYE2', { route:'(tabs)/index', comp:'TaskCompleteToast', state:'Read done on a day that can’t be secured', src:'new', b75:'pending' }, phone({ time:'6:16', tab:'home', body: home({ streak:7, week:W_B, line:'Read 10 pages counted for Read 30. Today can’t be secured because Out of bed closed.', primary:null, sections:[secRead('done'), secBed('closed',[['clock','Window closed · 4:30–5:30 am']])] }), toast: toast({ thumb:0, title:'Read 10 pages is done', sub:'Counts for Read 30 · Day 2 of 30.' }) }));
  const S = (k) => frameWrap(k, 0.62);
  const flow = (id, title, note, steps) => `<div id="${id}" data-screen-label="${title}" style="display:flex;flex-direction:column;gap:14px;">` + stripHead(title, note) + d('display:flex;gap:10px;align-items:flex-start;', steps.join('')) + '</div>';
  const fa = (l) => d(`width:64px;flex:none;align-self:center;display:flex;flex-direction:column;align-items:center;gap:4px;`, ic('arrow',20,C.t1) + d(`${T.c}color:${C.t1};text-align:center;`, l));
  const flows = [
    flow('flow1','Flow 1 · First open','First open to a shared first proof. Ends back on Home after Instagram.', [S('fWelcome'), fa('Get started'), S('fFirst'), fa('Start Read 30'), S('fSamiHome'), fa('Read 10 pages'), S('cntMet'), fa('Take photo'), S('cap'), fa('Shutter'), S('rev'), fa('Save · last task'), S('fSamiSec'), fa('Share to the feed, Done'), S('fSamiShare'), fa('Instagram Story'), S('igEdit'), fa('Post, return'), S('igBack')]),
    flow('flow2','Flow 2 · A normal day with two challenges','Yaseen, 4:41 am. Counter with camera, then the check-off secures the day.', [S('fY441'), fa('Read 10 pages'), S('cnt3'), fa('+5, +1 ×2'), S('cntMet'), fa('Take photo'), S('cap'), fa('Shutter'), S('rev'), fa('Save'), S('fYToast'), fa('Share to the feed · Out of bed'), S('ask'), fa('Done'), S('fYSecSelf'), fa('Share today'), S('fYBig'), fa('Instagram Story, return'), S('hF')]),
    flow('flow3','Flow 3 · The morning after a miss','One freeze message, the same on Home and challenge detail.', [S('hC'), fa('Use a freeze'), S('hCs'), fa('Use freeze'), S('hCc'), fa('Server confirms'), S('hCd')]),
    flow('flow4','Flow 4 · A closed window','Today can’t be secured, said once; the other task still counts.', [S('hE'), fa('Out of bed row'), S('closed'), fa('Read 10 pages'), S('cntMet'), fa('Take photo, shutter'), S('rev'), fa('Save'), S('fYE2')]) ];

  // ---------- Part 4 table ----------
  const L = (k) => REG[k] ? `<a href="${href(k)}" style="color:${C.t1};text-decoration:underline;">${REG[k].n}</a>` : k;
  const P4rows = [
    ['White “Page Not Found” after posting', 'Every action has a landing (map below). +not-found is dark with no system header.', L('notFound')],
    ['Window-closed step under the clock', 'Step content starts at 59pt; measured overlay on the frame.', L('closed')],
    ['Home primary hidden by the tab bar', 'The primary moved into the top block, under the strip. Scroll content ends 83 + 16pt up.', L('hB') + ' · ' + L('hL')],
    ['“Today can’t be secured” twice in one card', 'Said once, in the status line. The row says only “Window closed · 4:30–5:30 am”.', L('hE')],
    ['Contradictory freeze copy', 'One string, FREEZE_LINE: “Saturday wasn’t secured. A freeze can hold it until midnight.” Same on challenge detail (batch 2).', L('hC')],
    ['Challenge detail text on the left edge', '16pt gutter is part of every section component; detail is redrawn in batch 2 on the same parts.', 'batch 2'],
    ['First-day message takes over Home', 'A first day is a caption on its own section (“Day 1 of 30”), never a Home-level line when other challenges run.', L('hB') + ' · ' + L('fSamiHome')],
    ['Discover hero shows the proof fallback “Task”', 'Covers only come from the cover generator. Drawn in batch 2, Area 6.', 'batch 2'],
    ['Past private proof with no share action', '“Share this proof” is the primary on an owner’s private proof.', L('pastProof')],
    ['Everyone hint shown under Following', 'The hint renders only while Everyone is selected.', L('fdEvery') + ' · ' + L('fdFollow')],
    ['“Opens at midnight” for a 4:30 am window', '“Opens at” reads task.window_start.', L('notOpen')],
    ['Clipped leaderboard chip', 'Chip rows scroll horizontally and never truncate. Batch 3, Area 10.', 'batch 3'],
    ['Two week counts on one screen', 'Decided: one count, “{secured} of {closed} days secured this week”, only in StreakSheet. Home shows the strip, no count.', L('ss')],
    ['Free-tier limit page nearly blank', 'A real screen: the limit, your 3 challenges with Leave, then Pro.', L('limit')],
    ['Leaving a challenge', 'Decided (192): leaving takes effect tomorrow. Today still counts the challenge; if today is already unsecurable, the confirm says leaving doesn’t change that.', L('leave') + ' · ' + L('leaveLost') + ' · ' + L('hK')] ];
  const tbl = (cols, rows, w) => `<div style="display:grid;grid-template-columns:${cols};max-width:${w}px;">` + rows.map((r,ri)=>r.map((c,i)=>d(`${ri===0?T.c+'color:'+C.t2+';':(i===0?T.h:T.s)+'color:'+C.t1+';'}padding:10px 12px 10px 0;border-top:${ri?`1px solid ${C.raised}`:'none'};text-wrap:pretty;`, c)).join('')).join('') + '</div>';
  const landing = [ ['Post a proof, day still open','Home + toast with the share choice', L('askLand')], ['Post the last task','task/secured, then Done → Home', L('sec1')], ['Save fails','FailedStep, draft kept', L('failed')], ['Share to the feed','Stays on the moment, “Shared to the feed.”', L('shS')], ['Instagram Story','Instagram, then Home + return toast', L('igBack')], ['Use a freeze','Sheet closes on Home, held day drawn', L('hCd')], ['Leave a challenge','Home + one-line recalculation', L('hK')], ['Unknown route or old link','+not-found (dark) → Go to Home', L('notFound')] ];
  const part4 = `<div id="part4" data-screen-label="Part 4 · Device problems" style="display:flex;flex-direction:column;gap:18px;">` + areaHead('p4h','Part 4 · Device problems','Problems the design now makes impossible','Each build 75 problem, the rule that prevents it, and the frame that draws it. Build 75 screenshots are not in the project yet, so these come from the brief’s descriptions.') +
    tbl('260px 1fr 120px', [['Problem','Rule','Frame']].concat(P4rows), 1100) + stripHead('Where every action lands','No action ends on a route that doesn’t exist. If one ever does, +not-found catches it in the app’s own dark chrome.') + tbl('260px 1fr 120px', [['Action','Lands on','Frame']].concat(landing), 1100) + wrapRow(P4) + '</div>';

  // ---------- intro, changes, contradictions ----------
  const intro = d('display:flex;flex-direction:column;gap:14px;max-width:1100px;', tx('l',C.t2,'GRIIT v48 · Atlas · Batch 1R of 4') + d(T.tl+'font-size:40px;line-height:46px;color:'+C.t1+';', 'Home, tasks and sharing, redrawn') + tx('b',C.t2,'Areas 2, 3 and 4, flows 1–4, the Part 4 fixes, and the safe-area reference, split across six linked files so each stays responsive. 393 × 852pt. Labels read route · component · state. Every frame shows its source frame and a check strip.') +
    d('display:flex;flex-wrap:wrap;gap:8px;', [[FL.hub+'#changes','What changed'],[FL.hub+'#part4','Part 4 fixes'],[FL.hub+'#dev','Safe areas'],[FL.hub+'#s192','Week strip'],[FL.home,'Area 2 Home'],[FL.t1,'Area 3 Tasks, 3.1–3.5'],[FL.t2,'Area 3 Tasks, 3.6–3.10'],[FL.share,'Area 4 Sharing'],[FL.flows,'Flows 1–4'],[FL.hub+'#contra','Contradictions'],[FL.hub+'#index','Index']].map(([h,l])=>`<a href="${encodeURI(h)}" style="${T.s}padding:8px 14px;border-radius:999px;background:${C.surf};color:${C.t1};">${l}</a>`).join('')));
  const changes = `<div id="changes" data-screen-label="What changed" style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start;">` +
    panel(640, tx('l',C.t2,'What changed and why') + [
      ['Streak first','Home opens on the flame, the number and the week strip. The date, the name and the “Today” title are gone; the strip is one button to StreakSheet.'],
      ['Primary on top','The one orange button sits under the status line, so it can never hide behind the tab bar. Today follows, then the feed.'],
      ['Safe areas','Every frame draws the island, the status bar and the home indicator. Five frames carry a measured overlay: tab, pushed, step, sheet, camera.'],
      ['Feed like Instagram','Full-width 4:5 photos, edge to edge. Multi-photo days swipe with a “1 of 2” pill. Self-reported posts are compact rows. “Started” lines group, at most one group per four posts.'],
      ['One sentence each','Every Home state says what happened and what’s next in one line. The freeze message is one string. “Today can’t be secured” appears once.'],
      ['Status bar = data','Times follow the Up by 5 window: before 5:30 while it’s open, later once it’s closed.'],
      ['Strips','Area 3 is drawn as strips from the tap to the landing screen, with every arrow naming the tap.'],
      ['Less','Removed from Home: date, name, “Days done” count, week count, first-day takeover. Removed everywhere: orange text, the unread orange dot.'] ].map(([a,b])=>d('display:grid;grid-template-columns:150px 1fr;gap:12px;', tx('h',C.t1,a) + tx('s',C.t2,b,'text-wrap:pretty;'))).join('')) +
    panel(420, tx('l',C.t2,'Self-score') + d('display:flex;align-items:baseline;gap:8px;', sp(NUM+'font-size:56px;line-height:60px;color:'+C.t1+';','8.5') + tx('t',C.t2,'/ 10')) + tx('s',C.t1,'Short of 9 for one reason:') + tx('s',C.t2,'Build 75 screenshots aren’t in the project, so the Built in 75 column reads “pending” or “not built” (from the code), and the Part 4 fixes are drawn from the brief, not the device. Upload them and I’ll fill the column and re-score.','text-wrap:pretty;') + tx('s',C.t1,'Met:') + tx('s',C.t2,'every frame 393 × 852 with chrome; one orange fill per screen; no text under 11pt; no grey boxes; every number names its field; the week strip is unchanged from 192.','text-wrap:pretty;')) + '</div>';
  const CONTRA = [
    ['Strictness name collides with a pack','Decided: the mode is “Strict”. The starter pack keeps “No Days Off”. Omar’s challenge reads “No Days Off 75 · Strict”.'],
    ['Streak during the morning after','Drawn as today’s rule: the 7 stays until midnight while a freeze can still hold Saturday; with no freezes it reads 0 at once. Streak computation is out of scope.'],
    ['Leaving can secure a day','Decided: leaving takes effect tomorrow. Today still counts the challenge, so Leave can’t rescue a miss. If today is already unsecurable, the confirm says leaving doesn’t change that.'],
    ['Unread dot was orange','Activity’s unread dot would be a fifth orange use. It’s text-primary with a surface ring.'],
    ['Offline posting','No offline queue is known. H says proofs post when you’re back and disables the primary. Engineering to confirm.'],
    ['Instagram can’t report back','The return toast says “Opened in Instagram”, never “Shared”: iOS gives no post confirmation.'],
    ['Health import','A Run from Apple Health isn’t built and would still be self-reported. Drawn as (not built).'],
    ['Feed card shape changes','Full-bleed photos replace the v44 inset photo panel (frame 164). Self-reported posts stay inset compact rows.'],
    ['Week count','Only “{secured} of {closed} days secured this week”, only in StreakSheet. The challenge-detail board (batch 2) must use the same definition or drop its count.'] ];
  const contra = `<div id="contra" data-screen-label="Contradictions" style="display:flex;flex-direction:column;gap:12px;">` + stripHead('Contradictions and flags, batch 1R','Flagged, not decided, unless marked “decided”.') + panel(1100, CONTRA.map(([a,b],i)=>d('display:grid;grid-template-columns:40px 260px 1fr;gap:12px;', sp(NUM+'font-size:15px;color:'+C.t1+';', String(190+i)) + tx('h',C.t1,a) + tx('s',C.t2,b,'text-wrap:pretty;'))).join('')) + '</div>';

  // ---------- week strip, copied from v47 frame 192 ----------
  let s192 = (v47.split('\n').find(l=>l.includes('id="s192"'))||'').trim();
  s192 = s192.replace(/<i data-lucide="([a-z-]+)" style="width:(\d+)px;height:\d+px;color:([^;]+);[^"]*?(?:stroke-width:([\d.]+);)?[^"]*"><\/i>/g, (m,n,s,col,sw)=>ic({check:'check',snowflake:'snow',shield:'shield',minus:'minus',flame:'flame'}[n]||n, +s, col, {sw: sw||2}))
    .replace('192 · Week strip</div>', '192 · Week strip · unchanged, approved in batch 1</div>');

  // ---------- index ----------
  const idxRows = ORDER.map(k=>{ const f = REG[k]; return [`<a href="${href(k)}" style="color:${C.t1};">${f.n}</a>`, f.route, f.comp, f.state, f.src||'new', f.b75||'pending']; });
  const index = `<div id="index" data-screen-label="Index" style="display:flex;flex-direction:column;gap:12px;">` + stripHead(`Atlas index, batch 1R (${ORDER.length} frames)`,'Frame · route · component · state · source frame · built in 75. “pending” means the frame exists in code but build 75 screenshots aren’t in the project to compare against.') + panel(1300, tbl('60px 190px 220px 1fr 140px 220px', [['#','Route','Component','State','Source','Built in 75']].concat(idxRows), 1260)) + '</div>';

  const sec = (id, eyebrow, title, purpose, note, body) => `<div style="display:flex;flex-direction:column;gap:22px;">` + areaHead(id, eyebrow, title, purpose, note) + body + '</div>';
  const wrapDoc = (parts) => `<div style="filter:{{ filt }};font-family:${FONT};color:${C.t1};padding:48px;display:flex;flex-direction:column;gap:80px;background:${C.ink};">` + parts.join('\n') + '</div>';
  const a3strips = (list) => list.map(([t,xs])=>d('display:flex;flex-direction:column;gap:14px;', stripHead(t) + (t.startsWith('3.10')?wrapRow(xs):rowOf(...xs)))).join('');
  const a3p = 'A task step is for finishing one task honestly. Within 3 seconds: which task, what proves it, and the one button that finishes it.';
  const a3n = 'Each strip runs from the tap to the screen you land on. Omar (free, 3 challenges) carries the timer, text, run and location types; Yaseen carries counter, camera and the time window.';
  return {
    [FL.hub]: wrapDoc([intro, changes, part4, sec('dev','Part 2.2 · Safe areas','Safe areas, measured','Nothing sits in the top 59pt or the bottom 34pt; tab screens reserve 83pt. One measured frame per screen type.', 'Sticky buttons sit 12pt above the home indicator; on tab screens the primary lives in content, never pinned over the bar.', wrapRow(devFrames)), s192,
      d('display:flex;flex-direction:column;gap:22px;', stripHead('Frames drawn for the flows','Full-size versions of flow steps that aren’t in an area file.') + wrapRow([welcome, firstCh, samiHome, samiSec, samiShare, yHome441, yToast, ySecSelf, yShareBig, yE])), contra, index]),
    [FL.home]: wrapDoc([intro, sec('a2','Area 2 · Home','Home','Home is for today. Within 3 seconds: my streak, what’s left, and the one next thing.', 'Order: streak and strip → one status line → one primary → Today → Feed. JeopardyModal stays retired.', wrapRow(A2))]),
    [FL.t1]: wrapDoc([intro, sec('a3','Area 3 · Doing a task (1 of 2)','Doing a task', a3p, a3n, a3strips([ ['3.1 Check-off (AskStep)', s31], ['3.2 Location check-in', s32], ['3.3 Timer', s33], ['3.4 Counter with camera', s34], ['3.5 Text', s35] ]))]),
    [FL.t2]: wrapDoc([intro, sec('a3b','Area 3 · Doing a task (2 of 2)','Doing a task', a3p, a3n, a3strips([ ['3.6 Run', s36], ['3.7 Optional photo', s37], ['3.8 Time gate', s38], ['3.9 Camera permission', s39], ['3.10 Endings', sEnd] ]) + matrix)]),
    [FL.share]: wrapDoc([intro, sec('a4','Area 4 · Sharing','Sharing','Sharing is for choosing who sees a proof. Within 3 seconds: it’s private unless I say so, and how to send it.', 'Private by default. The share choice is two buttons that both advance; no answer keeps it private.',
      stripHead('The share choice') + wrapRow(A4a) + stripHead('ShareSystemSheet') + wrapRow(A4b) + styles + stripHead('Sticker sheets') + wrapRow(A4c) + stripHead('The trip to Instagram, and sharing a past proof') + wrapRow(A4d))]),
    [FL.flows]: wrapDoc([intro, d('display:flex;flex-direction:column;gap:48px;', flows.join(''))]),
  };
}

function wrapFile(body) {
  return '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<script src="./support.js"></script>\n</head>\n<body>\n<template id="__bundler_thumbnail" data-bg-color="#0F0F0F"><svg viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="800" fill="#0F0F0F"/><path transform="translate(480 220) scale(10)" d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="#DC5401"/></svg></template>\n<x-dc>\n<helmet>\n<meta name="design_doc_mode" content="canvas">\n<style>\n  html, body { margin:0; background:#0F0F0F; -webkit-font-smoothing:antialiased; }\n  * { box-sizing:border-box; }\n  a { color:#F2F0EB; text-decoration:none; }\n  a:hover { color:#A09F9C; }\n</style>\n</helmet>' + body +
  '\n</x-dc>\n<script type="text/x-dc" data-dc-script data-props=\'{"brightness":{"editor":"range","default":100,"min":50,"max":100,"step":5,"unit":"%","tsType":"number"},"greyscale":{"editor":"boolean","default":false,"tsType":"boolean"}}\'>\nclass Component extends DCLogic {\n  renderVals() {\n    const b = (this.props.brightness ?? 100) / 100;\n    return { filt: \'brightness(\' + b + \')\' + (this.props.greyscale ? \' grayscale(1)\' : \'\') };\n  }\n}\n</script>\n</body>\n</html>\n';
}
// regen: const g = new Function(src + ';return {build, wrapFile};')(); for (const [n,b] of Object.entries(g.build(v47))) saveFile(n, g.wrapFile(b));

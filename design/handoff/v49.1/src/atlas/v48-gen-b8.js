// v49.1 · Discover covers. Runs after gen..b7: new Function(g1..g8+';return {build8, wrapFile};')
function build8(v47) {
  const pages7 = build7(v47);
  NEXT = 1101; BUILD_N = '77';
  const FILE = 'GRIIT v49.1 Discover Covers.dc.html';
  CUR = FILE;
  const F8 = (k, m, html) => F(k, { b75:'pending', ...m }, html);
  const flex = (s, x) => d('display:flex;' + s, x);
  const catList = ['All','Fitness','Faith','Mind','Health','Discipline','Learning'];
  const PEOPLE = { fajr:'214', read:'1,208', show:'96', run:'412', mind:'88', clean:'301', ndo:'2,140', hyd:'530', up5:'77', fajr14:'64', morning:'150', hyd14:'45' };
  const proofOf = (k) => { const p = CH[k][3].split(' · '); return p[p.length-1]; };
  const meta = (k) => `${PEOPLE[k]} people · ${proofOf(k)}`;
  const PHC = { fajr:'pray1', fajr14:'pray2', read:'book2', show:'gym1', run:'run1', mind:'note1', clean:'food1', hyd:'water1', hyd14:'water2', ndo:'gym3', up5:'sunrise1', morning:'coffee1' };
  const catTag = (t, cat) => flex('align-items:center;gap:6px;', ic(t[1],14) + sp(`font-size:11px;line-height:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${C.t1};`, cat));
  const titleOn = (txt, w) => d(`font-size:${w>=300?28:w>=170?21:19}px;line-height:1.12;font-weight:600;letter-spacing:-0.01em;color:${C.t1};text-wrap:balance;`, txt);
  const dayChip = (n) => d(`align-self:flex-start;height:22px;padding:0 8px;border-radius:6px;background:rgba(15,15,15,0.42);display:flex;align-items:center;font-size:12px;line-height:14px;font-weight:600;font-variant-numeric:tabular-nums;color:${C.t1};`, n + ' days');
  const box = (w,h,r,bg,inner) => d(`position:relative;width:${w}px;height:${h}px;border-radius:${r}px;overflow:hidden;flex:none;background:${bg};`, inner);
  // A · title on the cover
  const covA = (k, w, h) => { const c = CH[k], t = CAT[c[1]], bg = `linear-gradient(160deg,${t[0]} 0%,#151414 100%)`;
    if (w < 60) return box(w,h,10,bg, d('position:absolute;inset:0;display:flex;align-items:center;justify-content:center;', ic(t[1],20)));
    return box(w,h,14,bg, d('position:absolute;left:12px;top:12px;right:12px;', catTag(t,c[1])) + d('position:absolute;left:12px;right:12px;bottom:12px;display:flex;flex-direction:column;gap:8px;', titleOn(c[0],w) + dayChip(c[2]))); };
  // B · day grid: one cell per day of the challenge
  const covB = (k, w, h) => { const c = CH[k], t = CAT[c[1]], n = c[2], bg = t[0];
    if (w < 60) { const cz = 5, cols = 5; return box(w,h,10,bg, d(`position:absolute;left:8px;top:9px;display:grid;grid-template-columns:repeat(${cols},${cz}px);gap:2px;`, Array(Math.min(n,35)).fill(d(`width:${cz}px;height:${cz}px;border-radius:1.5px;background:rgba(242,240,235,0.32);`)).join(''))); }
    const pad = 12, top = 34, titleH = w>=300 ? 64 : 62, avail = h - top - titleH - pad - 8, gw = w - 2*pad;
    let cols = 7, cz = 0, gap = 4;
    for (const cc of [7,10,15,25]) { gap = cc>=15?3:4; cz = Math.floor((gw-(cc-1)*gap)/cc); if (Math.ceil(n/cc)*(cz+gap) <= avail) { cols = cc; break; } cols = cc; }
    cz = Math.min(cz, 30);
    return box(w,h,14,bg, d(`position:absolute;left:${pad}px;top:${pad}px;right:${pad}px;`, catTag(t,c[1])) +
      d(`position:absolute;left:${pad}px;top:${top}px;display:grid;grid-template-columns:repeat(${cols},${cz}px);gap:${gap}px;`, Array(n).fill(d(`width:${cz}px;height:${cz}px;border-radius:${Math.max(2,Math.round(cz*0.24))}px;background:rgba(242,240,235,0.22);`)).join('')) +
      d(`position:absolute;left:${pad}px;right:${pad}px;bottom:${pad}px;display:flex;flex-direction:column;gap:2px;`, titleOn(c[0],w) + d(`font-size:12px;line-height:16px;font-weight:600;color:${C.t1};font-variant-numeric:tabular-nums;`, n + ' days'))); };
  // C · curated category photo
  const covC = (k, w, h) => { const c = CH[k], t = CAT[c[1]], ph = `<img src="assets/proofs/${PHC[k]}.jpg" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;filter:brightness(0.8) saturate(0.85);">`;
    if (w < 60) return box(w,h,10,C.surf, ph);
    return box(w,h,14,C.surf, ph + d('position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,15,15,0.5) 0%,transparent 28%,transparent 42%,rgba(15,15,15,0.92) 100%);') + d('position:absolute;left:12px;top:12px;right:12px;', catTag(t,c[1])) + d('position:absolute;left:12px;right:12px;bottom:12px;display:flex;flex-direction:column;gap:8px;', titleOn(c[0],w) + dayChip(c[2]))); };
  const COV = { A:covA, B:covB, C:covC };
  const card = (cov, k, w, h) => flex(`flex-direction:column;gap:6px;width:${w}px;flex:none;`, cov(k,w,h) + tx('s',C.t2,meta(k),'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'));
  const POP = ['ndo','run','mind','clean','hyd','up5'];
  const disc = (L) => { const cov = COV[L];
    const feat = L==='C' ? d('padding:0 16px;', card(cov,'read',361,220)) : flex('gap:12px;padding:0 16px;overflow:hidden;', ['fajr','read','show'].map(k=>card(cov,k,160,200)).join(''));
    return rootHead('Discover') + searchBar() + chips(catList,0) + sectionH('Featured') + feat + sectionH('Popular','this week') + d('display:grid;grid-template-columns:1fr 1fr;gap:18px 12px;padding:0 16px 24px;', POP.map(k=>card(cov,k,174,218)).join('')); };
  const listUse = (L) => { const cov = COV[L];
    return rootHead('Discover') + searchBar('fa', true) + d('padding:8px 16px;display:flex;flex-direction:column;', tx('l',C.t2,'Challenges','padding:10px 0 2px;') + ['fajr','fajr14','show'].map(k=>flex('align-items:center;gap:12px;min-height:72px;', cov(k,48,60) + flex('flex:1;min-width:0;flex-direction:column;gap:2px;', tx('h',C.t1,CH[k][0]) + tx('s',C.t2,`${CH[k][2]} days · ${meta(k)}`)) + ic('cr',18,C.t2))).join('')) +
      sheet(flex('gap:14px;align-items:center;', cov('fajr',96,120) + d('flex:1;', tx('t',C.t1,CH.fajr[0]) + tx('s',C.t2,`30 days · Faith · ${PEOPLE.fajr} people`))) + tx('b',C.t1,CH.fajr[3]) + btnP('Join')); };
  const OPT = {
    A:['Title on the cover','The cover carries the name in 600-weight text, category tag on top, day count shrinks to a small chip. Same tint system as v48, no new colour. Caption under the cover becomes people · proof.'],
    B:['Day grid','The cover draws one cell per day of the challenge: 7 days is one row, 75 is a dense block. The length reads at a glance without a numeral; the title sits under the grid on the cover.'],
    C:['Category photo','A curated library photo per challenge (never a user’s proof), ink fade at the bottom, title and day chip on top. Most alive, but needs ~40 licensed images and a fallback to A for user-made challenges.'] };
  const ids = { A:'1a', B:'1b', C:'1c' };
  const frames = {};
  for (const L of ['A','B','C']) {
    frames[L] = [
      F8('dc'+L+'_top', { route:'(tabs)/discover', comp:'ChallengeCover · '+L, state:'Discover · Featured and Popular', src:'v48 discAll', fields:'title ← challenges.title · category ← challenges.category · days ← duration_days · people ← member_count · proof ← primary task gate' + (L==='C'?' · photo ← cover_library[challenge.cover_key], fallback A':'') }, phone({ time:'12:10', tab:'discover', body: disc(L) })),
      F8('dc'+L+'_grid', { route:'(tabs)/discover', comp:'ChallengeCover · '+L, state:'Discover · Popular grid', src:'v48 discAll' }, phone({ time:'12:10', tab:'discover', scroll:L==='C'?380:340, body: disc(L) })),
      F8('dc'+L+'_use', { route:'(tabs)/discover', comp:'ChallengeCover · '+L, state:'Small (48×60) in search, 96×120 in the preview sheet', src:'v48 discSearch' }, phone({ time:'12:11', tab:'discover', body: listUse(L) })) ];
  }
  const setPanel = (L) => panel(860, tx('l',C.t2,'All six categories at grid size · detail header at 361×200 · lengths 7 / 30 / 75') +
    flex('gap:12px;flex-wrap:wrap;', ['show','fajr','mind','clean','ndo','read'].map(k=>COV[L](k,126,158)).join('')) + flex('gap:12px;align-items:flex-end;flex-wrap:wrap;', COV[L]('up5',361,200) + flex('flex-direction:column;gap:8px;', flex('gap:8px;', ['up5','read','ndo'].map(k=>COV[L](k,48,60)).join('')) + tx('c',C.t2,'48×60 list size'))));
  const badge = (id) => d(`height:28px;min-width:28px;padding:0 10px;border-radius:999px;background:${C.t1};display:flex;align-items:center;justify-content:center;${T.h}color:${C.ink};flex:none;`, id);
  const optBox = (L) => `<div id="${ids[L]}" data-screen-label="Option ${ids[L]}" style="display:flex;flex-direction:column;gap:18px;padding:24px;border-radius:24px;box-shadow:inset 0 0 0 1px ${C.raised};">` + flex('align-items:center;gap:12px;', badge(ids[L]) + tx('t',C.t1,OPT[L][0])) + tx('s',C.t2,OPT[L][1],'max-width:900px;text-wrap:pretty;') + wrapRow(frames[L].concat([setPanel(L)])) + '</div>';
  const before = `<div style="display:flex;flex-direction:column;gap:14px;">` + stripHead('Before', `Build 77 screenshots haven’t reached the project (uploads hold build 64 and older), so this is the current v48 Discover frame ${REG.discAll.n}, which build 77 follows. Problems: the 800-weight numeral fills a third of the cover, the area above it is empty, and the name sits outside the cover.`) + wrapRow([frameWrap('discAll',0,true), frameWrap('discCovers',0,true)]) + '</div>';
  const rules = panel(620, tx('l',C.t2,'Shared rules (all options)') + [
    ['Type','Title 600 weight, −0.01em, 19–21pt on grid covers, 28pt on the detail header. The 800 display numeral is gone from covers; day counts are 12pt tabular.'],
    ['Colour','v48 category tints only. Orange never appears on a cover.'],
    ['Contrast','Text 1 on tint or on the ink fade passes 4.5:1. Greyscale test still reads.'],
    ['Long titles','Two lines, balanced; a third line truncates. Tested with “No Days Off 75” and “Morning routine”.'],
    ['Under the cover','One Text 2 line: people · proof method. The name lives on the cover.'] ].map(([a,b])=>d('display:grid;grid-template-columns:100px 1fr;gap:12px;', tx('h',C.t1,a) + tx('s',C.t2,b,'text-wrap:pretty;'))).join(''));
  const intro = d('display:flex;flex-direction:column;gap:14px;max-width:1100px;', tx('l',C.t2,'GRIIT v49.1 · Discover covers') + d(T.tl+'font-size:40px;line-height:46px;color:'+C.t1+';', 'Challenge cover and Discover grid, three directions') + tx('b',C.t2,'Same v48 tokens, no orange. Each option shows Discover, the Popular grid, small and sheet sizes, and every category. Pick one by id: 1a, 1b or 1c.') +
    flex('flex-wrap:wrap;gap:8px;', [['#before','Before'],['#1a','1a Title on cover'],['#1b','1b Day grid'],['#1c','1c Category photo'],[encodeURI('GRIIT v49.dc.html'),'v49 overview']].map(([h,l])=>`<a href="${h}" style="${T.s}padding:8px 14px;border-radius:999px;background:${C.surf};color:${C.t1};">${l}</a>`).join('')));
  const body = `<div style="filter:{{ filt }};font-family:${FONT};color:${C.t1};padding:48px;display:flex;flex-direction:column;gap:56px;background:${C.ink};">` + [intro, `<div id="before">${before}</div>`, optBox('A'), optBox('B'), optBox('C'), rules].join('\n') + '</div>';
  return { ...pages7, [FILE]: body };
}

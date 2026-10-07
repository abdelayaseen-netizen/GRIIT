// v48.2 · Home opening band. Runs after gen..b5: new Function(g1..g6+';return {build6, wrapFile};')
function build6(v47) {
  const pages5 = build5(v47);
  NEXT = 901;
  const FL6 = { page:'GRIIT v48.2 Home Opening.dc.html', b4:'GRIIT v48 Atlas B4.dc.html' };
  CUR = FL6.page;
  const B6 = []; const F6 = (k, m, html) => { B6.push(k); return F(k, m, html); };
  const N = (k) => PPL[k][0].split(' ')[0];
  const nm = (t) => sp(T.h+'color:'+C.t1+';', t);
  const STATES = {
    none: { who:[], copy: 'No one’s posted today. ' + nm('You’re first.'), short:'No one’s posted today. You’re first.' },
    one:  { who:['khalid'], copy: nm('Khalid') + ' posted today.' },
    many: { who:['khalid','omar','abd','bilal','hamza'], copy: nm('Khalid') + ', ' + nm('Omar') + ' and 3 others posted today.' },
    mine: { who:['yaseen','khalid','omar','abd','bilal','hamza'], copy: nm('You') + ', ' + nm('Khalid') + ' and 4 others posted today.' } };
  const stack = (ks, s, ring) => d('display:flex;flex:none;', ks.slice(0,3).map((k,i)=>d(i?`margin-left:-${Math.round(s*0.3)}px;`:'', av(k,s,ring))).join(''));
  const latest = { none:null, one:['book1','12m'], many:['book1','12m'], mine:['book1','now'] };
  const bandA = (st) => { const S = STATES[st]; return d('display:flex;align-items:center;gap:8px;min-height:44px;', (S.who.length?stack(S.who,20,C.ink):'') + d(T.s+'color:'+C.t2+';flex:1;', S.copy) + (S.who.length?ic('cd',16,C.t2):'')); };
  const bandB = (st) => { const S = STATES[st]; const l = latest[st];
    return d(`display:flex;align-items:center;gap:10px;min-height:56px;padding:10px 8px 10px 12px;border-radius:14px;background:${C.surf};`, (S.who.length?stack(S.who,28,C.surf):d(`width:32px;height:32px;border-radius:999px;box-shadow:inset 0 0 0 1.5px ${C.t3};flex:none;display:flex;align-items:center;justify-content:center;`, ic('user',16,C.t2))) +
      d('flex:1;min-width:0;display:flex;flex-direction:column;gap:1px;', d(T.s+'color:'+C.t2+';letter-spacing:-0.01em;', S.copy) + (l?tx('c',C.t2,'Latest '+(l[1]==='now'?'just now':l[1]+' ago')):'')) + (S.who.length?ic('cd',18,C.t2):'')); };
  const bandC = (st) => { const S = STATES[st]; const l = latest[st];
    if (st==='none') return d('display:flex;align-items:center;min-height:44px;', d(T.s+'color:'+C.t2+';', S.copy));
    const thumb = l ? d('position:relative;width:44px;height:55px;border-radius:8px;overflow:hidden;flex:none;', img(st==='mine'?'book3':l[0]) + d('position:absolute;left:3px;top:3px;transform:scale(0.55);transform-origin:0 0;', seal())) : d(`width:44px;height:55px;border-radius:8px;flex:none;box-shadow:inset 0 0 0 1.5px ${C.t3};display:flex;align-items:center;justify-content:center;`, ic('camera',18,C.t2));
    const head = st==='none' ? tx('s',C.t2,'No one’s posted today.') : st==='mine' ? d(T.s+'color:'+C.t2+';', nm('You') + ' posted just now') : d(T.s+'color:'+C.t2+';', nm('Khalid') + ' posted 12m ago');
    const sub = st==='none' ? tx('s',C.t1,'You’re first.','font-weight:600;') : st==='one' ? tx('c',C.t2,'Read 10 pages · Read 30') : st==='many' ? tx('c',C.t2,'Omar and 3 others too') : tx('c',C.t2,'Khalid and 4 others too');
    return d(`display:flex;align-items:center;gap:12px;min-height:56px;padding:8px 12px 8px 8px;border-radius:14px;background:${C.surf};`, thumb + d('flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;', head + sub) + (S.who.length>1?stack(S.who.filter(k=>st==='mine'?k!=='yaseen':k!=='khalid'),24,C.surf):'') + (S.who.length?ic('cd',18,C.t2):'')); };
  const BANDS = { A:bandA, B:bandB, C:bandC };
  const homeAt = (band, st) => st==='mine'
    ? home({ streak:8, week:['sec','sec','sec','sec','sec','sec','todayDone'], banner:band, line:'Day secured. Come back tomorrow.', primary:btnS('Share today',{icon:'share'}), sections:[secRead('done',{collapsed:true}), secBed('done',[G.self,['clock','4:30–5:30 am']],{collapsed:true})], feed: feedHead(0) + photoPost({ who:'yaseen', sub:'Read 30 · Day 2 of 30', time:'now', ph:['book3'], cap:'', r:'', c:'' }) + photoPost(KH_POST) })
    : home({ streak:7, week:W_B, prog:0.5, banner:band, line:'1 of 2 left today.', primary:btnP('Read 10 pages',{icon:'camera'}), sections:[secRead('open'), secBed('done',[G.self,['clock','4:30–5:30 am']])] });
  const stName = { many:'Many (5) · 9:41 mid-day', none:'None yet', one:'One person', mine:'My own post counted' };
  const opt = {};
  for (const L of ['A','B','C']) {
    opt[L] = ['many','none','one','mine'].map(st => F6(`h${L}_${st}`, { route:'(tabs)/index', comp:'TodaySocialBand · option '+L, state: stName[st] + (L==='C' && st==='none' ? ' · one text line, no card' : ''), src:'new', b75: L==='C' ? 'not built · ships' : 'not chosen', fields: st==='none' ? 'today_posters ← [] · copy fixed' : 'today_posters ← distinct poster_id from shared proofs since local midnight (follows ∪ challenge-mates), newest first' },
      phone({ time: st==='mine' ? '9:52' : '9:41', tab:'home', body: homeAt(BANDS[L](st), st) })));
  }
  const tapFeed = F6('hTapFeed', { route:'(tabs)/index', comp:'HomeScreen · feed', state:'After tapping the band · scrolled to today’s first post', src:'new', b75:'not built', fields:'scrollTo(feed.firstTodayIndex), animated 280 ms' },
    phone({ time:'9:41', tab:'home', scroll:470, body: homeAt(bandC('many'), 'many').replace(feedHead(0), feedHead(0).replace(tx('t',C.t1,'Feed'), tx('t',C.t1,'Feed') )) }));
  const badge = (id) => d(`height:28px;min-width:28px;padding:0 10px;border-radius:999px;background:${C.t1};display:flex;align-items:center;justify-content:center;${T.h}color:${C.ink};flex:none;`, id);
  const optSec = (id, L, title, why) => `<div id="${id}" data-screen-label="Option ${id}" style="display:flex;flex-direction:column;gap:18px;padding:24px;border-radius:24px;box-shadow:inset 0 0 0 1px ${C.raised};">` +
    d('display:flex;align-items:center;gap:12px;', badge(id) + tx('t',C.t1,title)) + tx('s',C.t2,why,'max-width:900px;text-wrap:pretty;') + wrapRow(opt[L]) + '</div>';
  const rules = panel(620, tx('l',C.t2,'Band rules (all options)') + [
    ['Place','Between the streak strip and the day line + primary button. Never above the streak.'],
    ['Who counts','People I follow and members of my active challenges, de-duplicated. Blocked people never count. One person counts once, however many proofs.'],
    ['What counts','A proof shared to the feed since my local midnight. Private proofs and self-reported cards don’t count.'],
    ['Avatars','Up to 3, newest first. When I’ve posted, I’m first and called “You”.'],
    ['Copy','0: “No one’s posted today. You’re first.” · 1: “Khalid posted today.” · 2: “Khalid and Omar posted today.” · 3+: “Khalid, Omar and {n} others posted today.” · with me: “You, Khalid and {n} others posted today.” Plurals through count().'],
    ['Tap','The whole band (≥ 44pt) scrolls Home to today’s first post in the feed. No new screen. The none state is one plain text line and isn’t tappable.'],
    ['Refresh','On opening Home, pull to refresh and returning to the tab. No live ticking.'],
    ['Colour','Ink, surface and text tokens only. Orange stays on the primary, flame, done check and active tab.'] ].map(([a,b])=>d('display:grid;grid-template-columns:110px 1fr;gap:12px;', tx('h',C.t1,a) + tx('s',C.t2,b,'text-wrap:pretty;'))).join(''));
  const intro = d('display:flex;flex-direction:column;gap:14px;max-width:1100px;', tx('l',C.t2,'GRIIT v48.2 · Home opening') + d(T.tl+'font-size:40px;line-height:46px;color:'+C.t1+';', 'I’m in it, others showed up, here’s my move') + tx('b',C.t2,`One new band on Home, between the streak strip and the primary button. Three ways it could look, each in four states. Frames 301–326 stay as they are. ${B6.length} new frames from 901, all in the full index.`) +
    d('display:flex;flex-wrap:wrap;gap:8px;', [['#2a','2a Minimal line'],['#2b','2b Avatar strip'],['#2c','2c Latest photo'],['#rules','Rules and tap'],[encodeURI(FL6.b4)+'#indexAll','Full atlas index']].map(([h,l])=>`<a href="${h}" style="${T.s}padding:8px 14px;border-radius:999px;background:${C.surf};color:${C.t1};">${l}</a>`).join('')));
  const tapRow = `<div id="rules" style="display:flex;flex-direction:column;gap:18px;">` + stripHead('Rules, and what the tap does','Option 2c ships (approved at 9.3). The tap frame uses 2c.') + d('display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap;', rules + frameWrap('hC_many',0.62,1) + d(`width:64px;flex:none;align-self:center;display:flex;flex-direction:column;align-items:center;gap:4px;`, ic('arrow',20,C.t1) + d(`${T.c}color:${C.t1};text-align:center;`, 'Tap the band')) + tapFeed) + '</div>';
  const body = `<div style="filter:{{ filt }};font-family:${FONT};color:${C.t1};padding:48px;display:flex;flex-direction:column;gap:64px;background:${C.ink};">` + [intro,
    optSec('2a','A','Minimal line · not chosen','Small avatars and one line of text, no container. The quietest: it reads as part of the streak block and costs about 44pt.'),
    optSec('2b','B','Avatar strip · not chosen','A surface row with three larger faces, the names and when the latest proof landed. The faces carry “others showed up” before you read anything.'),
    optSec('2c','C','Latest photo · ships','A thumbnail of the newest proof, with who and when. Approved at 9.3. When no one has posted yet it collapses to one text line: no thumbnail, no card.'),
    tapRow].join('\n') + '</div>';
  // full index including 901+
  const all = ORDER.filter(k => REG[k].n >= 301).sort((a,b)=>REG[a].n-REG[b].n);
  const batchOf = (n) => n>=901?'4.2':n>=801?'4.1':n>=701?'4':n>=601?'3':n>=501?'2':'1R';
  const counts = {}; const b75 = {}; all.forEach(k=>{ const b = batchOf(REG[k].n); counts[b]=(counts[b]||0)+1; const v = (REG[k].b75||'pending').split(' ')[0]; b75[v]=(b75[v]||0)+1; });
  const summary = d('display:flex;gap:12px;flex-wrap:wrap;', [['Frames', all.length],['Batch 1R',counts['1R']],['Batch 2',counts['2']],['Batch 3',counts['3']],['Batch 4',counts['4']],['Patch 4.1',counts['4.1']],['Patch 4.2',counts['4.2']],['Not built', b75['not']||0],['Differs', b75['differs']||0],['Retire', b75['retire']||0]].map(([l,n])=>d(`background:${C.surf};border-radius:14px;padding:12px 16px;display:flex;flex-direction:column;min-width:110px;`, sp(NUM+'font-size:28px;color:'+C.t1+';', n) + tx('c',C.t2,l))).join(''));
  const rows = all.map(k=>{ const f = REG[k]; return [`<a href="${href(k)}" style="color:${C.t1};">${f.n}</a>`, batchOf(f.n), f.route, f.comp, f.state, f.src||'new', f.b75||'pending']; });
  const idxAll = `<div id="indexAll" data-screen-label="Full atlas index" style="display:flex;flex-direction:column;gap:14px;">` + stripHead(`The atlas index · every frame, batches 1R–4 and patches 4.1–4.2 (${all.length})`, 'Frame · batch · route · component · state · source frame · built in 75. Every number links to its frame.') + summary +
    panel(1500, `<div style="display:grid;grid-template-columns:56px 44px 200px 230px 1fr 150px 230px;max-width:1460px;">` + [['#','Batch','Route','Component','State','Source','Built in 75']].concat(rows).map((r,ri)=>r.map((c,i)=>d(`${ri===0?T.c+'color:'+C.t2+';':(i===0?T.h:T.s)+'color:'+C.t1+';'}padding:8px 12px 8px 0;border-top:${ri?`1px solid ${C.raised}`:'none'};`, c)).join('')).join('') + '</div>') + '</div>';
  let hub = pages5[FL6.b4];
  hub = hub.slice(0, hub.indexOf('<div id="indexAll"')) + idxAll + '\n</div>';
  hub = hub.replace('>Patch 4.1</a>', `>Patch 4.1</a><a href="${encodeURI(FL6.page)}" style="${T.s}padding:8px 14px;border-radius:999px;background:${C.surf};color:${C.t1};">Patch 4.2</a>`);
  return { ...pages5, [FL6.b4]: hub, [FL6.page]: body };
}

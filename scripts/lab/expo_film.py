"""부스 영상(고급판) 타임라인 HTML 을 만든다. expo_capture.cjs 가 이 페이지를 프레임마다 찍는다.

    python3 scripts/lab/expo_film.py <film_dir> <qr.svg> <font.woff2>

film_dir 에 있어야 하는 것
  plan.json          plan_vectors.py 출력 (1층 평면 선)
  r/<scene>/f_####   blender_film.py 출력 (rise · section · wrap · thermal · glow), r/section/anchors.json
출력: film_dir/film.html, film_dir/timeline.json (전체 프레임 수)

화면에 나오는 숫자는 모두 저장소 데이터에서 읽는다(에너지·견적·실 면적). 도면 통계는 labProjects.ts 의 stats 와 같다.
"""
import json
import re
import sys
from pathlib import Path

film = Path(sys.argv[1]).resolve()
qr = Path(sys.argv[2]).read_text()
font = Path(sys.argv[3]).resolve()
root = Path(__file__).resolve().parents[2]

energy = json.loads((root / "src/data/lab/ai-building-workspace-energy.json").read_text())
viewer = json.loads((root / "public/lab/ai-building-workspace/viewer/viewer.json").read_text())
lab = json.loads((root / "src/messages/ko/lab.json").read_text())["projects"]["ai-building-workspace"]
names = lab["case"]["rooms"]
plan = json.loads((film / "plan.json").read_text())
anchors = json.loads((film / "r/section/anchors.json").read_text())
logo_paths = re.findall(r'd="([^"]+)"', (root / "src/components/icons/NinewattLogo.tsx").read_text())

rooms = [{"name": names[r["key"]].split(" · ")[0], "area": r["area"], "poly": r["polygon"], "label": r["label"],
          "review": r["review"]}
         for r in viewer["rooms"] if r["floor"] == "1f"]
stats = {"lines": "14,682", "dims": "396", "layers": "38", "rooms": "12"}  # labProjects.ts caseStudy.stats

data = {
    "plan": plan, "rooms": rooms, "stats": stats, "anchors": anchors, "energy": energy,
    "logo": logo_paths, "qr": qr,
    "photos": {k: (root / f"public/lab/ai-building-workspace/{k}.webp").as_uri()
               for k in ("photo-exterior-r2", "photo-1f-r2")},
    "frames": {s: (film / "r" / s).as_uri() for s in ("rise", "section", "wrap", "thermal", "glow")},
}

html = r"""<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:P;src:url("__FONT__") format("woff2");font-weight:100 900}
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;overflow:hidden;background:#0d0f10}
body{font-family:P,sans-serif;color:#f2efea;-webkit-font-smoothing:antialiased;font-feature-settings:"tnum" 1;word-break:keep-all}
.layer{position:absolute;inset:0;opacity:0}
.full{position:absolute;inset:0;width:1920px;height:1080px;object-fit:cover}
/* 건물 장면: 제목과 겹치지 않게 조금 작게 오른쪽으로, 가장자리는 배경으로 녹인다 */
.inset{transform:translateX(150px) scale(.82);-webkit-mask-image:radial-gradient(ellipse 50% 50% at 50% 52%,#000 58%,transparent 100%)}
.t{position:absolute;will-change:transform,opacity}
.eyebrow{font-size:19px;letter-spacing:.32em;font-weight:500;color:rgba(242,239,234,.55)}
.chap{font-size:20px;font-weight:600;color:#49b6ca;letter-spacing:.12em}
.h1{font-size:96px;font-weight:700;letter-spacing:-.025em;line-height:1.12}
.h2{font-size:56px;font-weight:700;letter-spacing:-.02em;line-height:1.18}
.sub{font-size:26px;font-weight:400;color:rgba(242,239,234,.62);line-height:1.5}
.en{font-size:20px;font-weight:400;color:rgba(242,239,234,.42);letter-spacing:.01em}
.rule{position:absolute;height:2px;background:#49b6ca}
.note{position:absolute;left:120px;bottom:56px;font-size:17px;color:rgba(242,239,234,.38)}
</style>
<div id="stage"></div>
<script>
const D = __DATA__;
const FPS = 30;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const eo = x => 1 - Math.pow(1 - clamp(x), 3);            // ease-out cubic
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const fmt = (v, d = 0) => v.toLocaleString("en-US", {minimumFractionDigits: d, maximumFractionDigits: d});
const stage = document.getElementById("stage");
const el = (tag, cls, html, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; (parent || stage).appendChild(e); return e; };
const at = (e, x, y) => { e.style.left = x + "px"; e.style.top = y + "px"; return e; };
// 글자 등장: t0 부터 0.7초 동안 아래 24px 에서 올라오며 나타나고, t1 부터 0.45초 동안 사라진다
const reveal = (e, t, t0, t1 = 1e9, dy = 24) => {
  const a = eo((t - t0) / .7), b = 1 - eo((t - t1) / .45);
  e.style.opacity = a * b; e.style.transform = `translateY(${(1 - a) * dy}px)`;
};

// ── 장면 정의: [시작 s, 길이 s, 만들기, 그리기(t_local)] ─────────────────
const scenes = [];
const scene = (dur, build, draw) => { const layer = el("div", "layer"); const ctx = build(layer) || {}; scenes.push({dur, layer, ctx, draw}); };
const XF = .7; // 장면 사이 겹침(교차 페이드) 초

function logo(color = "#49b6ca", word = "#f2efea", w = 210) {
  return `<svg viewBox="0 0 157 60" width="${w}" height="${w * 60 / 157}">` +
    D.logo.map((d, i) => `<path fill-rule="evenodd" d="${d}" fill="${i === 0 ? color : word}"/>`).join("") + "</svg>";
}
function chapter(layer, n, ko, en) {
  const c = el("div", "t chap", `${String(n).padStart(2, "0")}`, layer); at(c, 120, 112);
  const r = el("div", "rule", "", layer); at(r, 120, 150);
  const h = el("div", "t h2", ko, layer); at(h, 120, 172);
  const s = el("div", "t en", en, layer); at(s, 122, 252);
  return (t, dur) => { reveal(c, t, .2, dur - .9); r.style.width = 40 * eo((t - .35) / .6) * (1 - eo((t - dur + .9) / .45)) + "px";
    reveal(h, t, .4, dur - .9); reveal(s, t, .6, dur - .9); };
}
function seq(layer, name, cls = "full") { const img = el("img", cls, null, layer); img.dataset.seq = name; return img; }
function setSeq(img, t, n, ext = "jpg") {
  const f = Math.min(n, Math.max(1, Math.round(t * FPS) + 1));
  img.src = `${D.frames[img.dataset.seq]}/f_${String(f).padStart(4, "0")}.${ext}`; return f;
}

// 1. 제목 ──────────────────────────────────────────────────────────────
scene(6, L => ({
  rule: at(el("div", "rule", "", L), 160, 392),
  eye: at(el("div", "t eyebrow", "NINEWATT LAB · AI BUILDING WORKSPACE", L), 160, 420),
  l1: at(el("div", "t h1", "도면 한 장으로,", L), 154, 470),
  l2: at(el("div", "t h1", "그린리모델링까지.", L), 154, 578),
  en: at(el("div", "t sub", "From a single drawing to green remodeling.", L), 160, 718),
  expo: at(el("div", "t en", "2026 대한민국 ESG 친환경 대전", L), 160, 960),
}), (c, t, dur) => {
  c.rule.style.width = 72 * eo((t - .4) / .9) * (1 - eo((t - dur + .8) / .45)) + "px";
  reveal(c.eye, t, .8, dur - .8); reveal(c.l1, t, 1.2, dur - .8, 34); reveal(c.l2, t, 1.6, dur - .8, 34);
  reveal(c.en, t, 2.4, dur - .8); reveal(c.expo, t, 2.9, dur - .8);
});

// 2. 도면이 그려진다 ───────────────────────────────────────────────────
scene(9.5, L => {
  // 시트 전체가 아니라 벽선 범위 + 여백에 맞춘다
  const wal = D.plan.layers.WAL.flat(), M = 2.4;
  const x0 = Math.min(...wal.map(p => p[0])) - M, x1 = Math.max(...wal.map(p => p[0])) + M;
  const y0 = Math.min(...wal.map(p => p[1])) - M, y1 = Math.max(...wal.map(p => p[1])) + M;
  const W = 1000, H = 900, s = Math.min(W / (x1 - x0), H / (y1 - y0));
  const ox = 800 + (W - (x1 - x0) * s) / 2, oy = 90 + (H - (y1 - y0) * s) / 2;
  const P = (x, y) => [ox + (x - x0) * s, oy + (y1 - y) * s];
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("width", 1920); svg.setAttribute("height", 1080);
  svg.style.position = "absolute"; svg.style.inset = 0; svg.style.transformOrigin = "1300px 540px";
  svg.innerHTML = `<defs><clipPath id="pc"><rect x="720" y="0" width="1200" height="1080"/></clipPath></defs>`;
  const g = document.createElementNS(NS, "g"); g.setAttribute("clip-path", "url(#pc)"); svg.appendChild(g);
  L.appendChild(svg);
  const style = {WAL: ["#ece7df", 1.7, 0, 2.6], WIN: ["#9fb4b9", 1.0, .9, 3.0], DIM: ["rgba(242,239,234,.16)", .7, 1.8, 2.8]};
  const paths = [];
  for (const [layer, lines] of Object.entries(D.plan.layers)) {
    const [col, w, start, dur] = style[layer] || ["rgba(242,239,234,.3)", .8, 1.4, 3.0];
    for (const pts of lines) {
      const sp = pts.map(p => P(p[0], p[1]));
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", "M" + sp.map(q => q[0].toFixed(1) + " " + q[1].toFixed(1)).join("L"));
      p.setAttribute("fill", "none"); p.setAttribute("stroke", col); p.setAttribute("stroke-width", w);
      p.setAttribute("pathLength", 1); p.setAttribute("stroke-dasharray", "1 1"); p.setAttribute("stroke-linecap", "round");
      g.appendChild(p);
      const cx = sp.reduce((a, q) => a + q[0], 0) / sp.length, cy = sp.reduce((a, q) => a + q[1], 0) / sp.length;
      paths.push({p, start: start + ((cx - ox) / ((x1 - x0) * s)) * 1.1 + ((cy - oy) / ((y1 - y0) * s)) * .7, dur: dur * .45});
    }
  }
  const rooms = D.rooms.map((r, i) => {
    const poly = document.createElementNS(NS, "polygon");
    poly.setAttribute("points", r.poly.map(p => P(p[0], p[1]).join(",")).join(" "));
    poly.setAttribute("fill", "#49b6ca"); poly.setAttribute("stroke", "#49b6ca"); poly.setAttribute("stroke-width", 1.4);
    g.appendChild(poly);
    const [lx, ly] = P(r.label[0], r.label[1]);
    const lab = el("div", "t", `<div style="font-size:17px;font-weight:600;color:#f2efea;white-space:nowrap">${r.name}</div>` +
      `<div class="num" style="font-size:22px;font-weight:500;color:#9fdbe6;margin-top:2px;white-space:nowrap"></div>`, L);
    lab.style.textAlign = "center"; lab.style.width = "160px"; at(lab, lx - 80, ly - 26);
    return {poly, lab, area: r.area, delay: i * .12};
  });
  const ch = chapter(L, 1, "도면을 읽습니다", "Reading the original drawing");
  const s1 = at(el("div", "t sub", `선 ${D.stats.lines} · 치수 ${D.stats.dims} · 레이어 ${D.stats.layers}`, L), 120, 312);
  const s2 = at(el("div", "t sub", `실 ${D.stats.rooms}개 · 면적 자동 계산`, L), 120, 356);
  return {svg, paths, rooms, ch, s1, s2};
}, (c, t, dur) => {
  c.ch(t, dur); reveal(c.s1, t, 1.0, dur - .9); reveal(c.s2, t, 5.0, dur - .9);
  c.svg.style.transform = `scale(${1 + .05 * eio(t / dur)})`;
  for (const q of c.paths) q.p.setAttribute("stroke-dashoffset", 1 - eo((t - q.start) / q.dur));
  for (const r of c.rooms) {
    const a = eo((t - 4.6 - r.delay) / .8);
    r.poly.setAttribute("fill-opacity", .14 * a); r.poly.setAttribute("stroke-opacity", .8 * a);
    reveal(r.lab, t, 5.0 + r.delay, 1e9, 12);
    r.lab.lastChild.textContent = fmt(r.area * eo((t - 5.0 - r.delay) / 1.2), 2) + " ㎡";
  }
  // 끝으로 갈수록 선만 남기고 라벨을 걷어 3D 장면으로 넘긴다
  const out = 1 - eo((t - dur + 1.3) / .8);
  for (const r of c.rooms) r.lab.style.opacity *= out;
});

// 3. 벽이 세워진다 ─────────────────────────────────────────────────────
scene(8, L => ({img: seq(L, "rise", "full inset"), ch: chapter(L, 2, "도면이 모델이 됩니다", "Walls rise from the plan, at the drawing's scale")}),
  (c, t, dur) => { setSeq(c.img, t, 240); c.ch(t, dur); });

// 4. 외벽 단면 ─────────────────────────────────────────────────────────
scene(8, L => {
  const img = seq(L, "section");
  const ch = chapter(L, 3, "그린리모델링", "The retrofit written in the drawing");
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg"); svg.setAttribute("width", 1920); svg.setAttribute("height", 1080);
  svg.style.position = "absolute"; svg.style.inset = 0; L.appendChild(svg);
  const items = [["concrete", "기존 콘크리트", "200 mm", .6], ["pf", "외단열 PF보드", "100 mm", 3.9], ["stucco", "스타코 마감", "10 mm", 5.7]];
  const labs = items.map(([k, ko, mm, t0], i) => {
    const line = document.createElementNS(NS, "polyline");
    line.setAttribute("fill", "none"); line.setAttribute("stroke", "rgba(242,239,234,.55)"); line.setAttribute("stroke-width", 1.2);
    svg.appendChild(line);
    const dot = document.createElementNS(NS, "circle"); dot.setAttribute("r", 4); dot.setAttribute("fill", "#f2efea"); svg.appendChild(dot);
    const lab = el("div", "t", `<span style="font-size:30px;font-weight:600">${ko}</span><span class="num" style="font-size:26px;color:#9fdbe6;margin-left:14px">${mm}</span>`, L);
    return {k, line, dot, lab, t0, y: 150 + i * 84};
  });
  const u = at(el("div", "t", `<div class="en" style="font-size:19px;letter-spacing:.08em">외벽 열관류율 · U-VALUE</div>` +
    `<div style="display:flex;align-items:baseline;gap:18px;margin-top:10px"><span class="num" style="font-size:96px;font-weight:700;letter-spacing:-.03em"></span>` +
    `<span style="font-size:24px;color:rgba(242,239,234,.55)">W/㎡K</span></div>`, L), 120, 760);
  return {img, ch, labs, u};
}, (c, t, dur) => {
  const f = setSeq(c.img, t, 240); c.ch(t, dur);
  const A = D.anchors[f - 1];
  const lx = 1280;
  for (const q of c.labs) {
    const [ax, ay] = [A[q.k][0] * 1920, A[q.k][1] * 1080];
    const a = eo((t - q.t0) / .6) * (1 - eo((t - dur + .9) / .45));
    q.line.setAttribute("points", `${ax},${ay} ${ax + 40},${q.y + 18} ${lx - 18},${q.y + 18}`);
    q.line.setAttribute("stroke-opacity", a); q.dot.setAttribute("cx", ax); q.dot.setAttribute("cy", ay); q.dot.setAttribute("fill-opacity", a);
    at(q.lab, lx, q.y - 2); reveal(q.lab, t, q.t0 + .15, dur - .9, 14);
  }
  const k = eio((t - 6.0) / 1.4);
  reveal(c.u, t, 5.8, dur - .9);
  c.u.querySelector(".num").textContent = fmt(1.0 + (0.16 - 1.0) * k, 2);
});

// 5. 건물 전체에 적용 ─────────────────────────────────────────────────
scene(6, L => {
  const img = seq(L, "wrap", "full inset");
  const row = (ko, val, y) => at(el("div", "t", `<div class="en" style="letter-spacing:.06em">${ko[1]}</div>` +
    `<div style="display:flex;align-items:baseline;gap:20px;margin-top:6px"><span style="font-size:32px;font-weight:600">${ko[0]}</span>` +
    `<span class="num" style="font-size:32px;color:#9fdbe6">${val}</span></div>`, L), 120, y);
  const e = D.energy.envelope;
  return {img, a: row(["외벽 외단열", "EXTERNAL INSULATION"], `${e.wallArea.toFixed(1)} ㎡`, 760),
          b: row(["창호 교체", "NEW WINDOWS · LOW-E 24 mm"], `${e.windows}개 · ${e.windowArea.toFixed(1)} ㎡`, 868)};
}, (c, t, dur) => { setSeq(c.img, t, 180); reveal(c.a, t, .6, dur - .7); reveal(c.b, t, 3.2, dur - .7); });

// 6. 열이 새는 곳 ───────────────────────────────────────────────────────
scene(9, L => {
  const img = seq(L, "thermal", "full inset");
  const g1 = seq(L, "glow", "full inset"); g1.style.filter = "blur(26px)"; g1.style.mixBlendMode = "screen"; g1.style.opacity = .42;
  const g2 = seq(L, "glow", "full inset"); g2.style.filter = "blur(6px)"; g2.style.mixBlendMode = "screen"; g2.style.opacity = .22;
  const ch = chapter(L, 4, "열이 새는 곳", "Heat loss, coloured by the simulation's U-values");
  const tag = (ko, en) => el("div", "t", `<div style="font-size:34px;font-weight:700">${ko}</div><div class="en" style="margin-top:4px">${en}</div>`, L);
  const before = at(tag("리모델링 전", "BEFORE · assumed ageing envelope"), 120, 760);
  const after = at(tag("리모델링 후", "AFTER · as specified in the drawing"), 120, 760);
  // 범례: 열 손실 ∝ U (발광 밝기와 같은 비례)
  const lg = at(el("div", "t", `<div class="en" style="letter-spacing:.06em">열관류율 U · W/㎡K</div>` +
    `<div style="position:relative;width:340px;height:6px;margin-top:16px;border-radius:3px;background:linear-gradient(90deg,#2a2622,#ff8a3d)"></div>` +
    `<div class="mk" style="position:relative;height:64px;margin-top:6px"></div>`, L), 1460, 860);
  const marks = ["외벽", "창"].map(n => { const m = el("div", "t", "", lg.querySelector(".mk")); m.style.whiteSpace = "nowrap"; return m; });
  const note = el("div", "note", "EnergyPlus 간이 시뮬레이션에 넣은 열관류율로 색칠한 화면입니다 · 열화상 촬영이 아닙니다", L);
  return {img, g1, g2, ch, before, after, lg, marks, note};
}, (c, t, dur) => {
  setSeq(c.img, t, 270); setSeq(c.g1, t, 270, "png"); setSeq(c.g2, t, 270, "png"); c.ch(t, dur);
  reveal(c.before, t, 1.4, 3.7); reveal(c.after, t, 6.4, dur - .8); reveal(c.lg, t, 1.8, dur - .8); reveal(c.note, t, 1.8, dur - .8);
  const k = eio((t - 3.7) / 3.0);   // sweep 와 같은 구간 (프레임 110–200)
  [["외벽", 1.0, .16], ["창", 4.0, 1.8]].forEach(([n, a, b], i) => {
    const u = a + (b - a) * k;
    c.marks[i].innerHTML = `<span style="font-size:20px;color:rgba(242,239,234,.6)">${n}</span> <span class="num" style="font-size:24px;font-weight:600">${fmt(u, 2)}</span>`;
    c.marks[i].style.position = "absolute"; c.marks[i].style.left = (u / 4 * 340 - 12) + "px"; c.marks[i].style.top = (i * 32) + "px";
  });
});

// 7. 월별 부하 ─────────────────────────────────────────────────────────
scene(9, L => {
  const e = D.energy.energy;
  const B = e.before.heat_m.map((h, i) => h + e.before.cool_m[i]), A = e.after.heat_m.map((h, i) => h + e.after.cool_m[i]);
  const ch = chapter(L, 5, "1년을 계산하면", "A full-year EnergyPlus simulation, month by month");
  const max = Math.max(...B), H = 470, X0 = 760, BW = 22, SLOT = 88, BASE = 860;
  const bars = B.map((v, i) => {
    const b = el("div", "", "", L), a = el("div", "", "", L), m = el("div", "", `${i + 1}월`, L);
    Object.assign(b.style, {position: "absolute", left: X0 + i * SLOT + "px", width: BW + "px", bottom: 1080 - BASE + "px", border: "1.5px solid rgba(242,239,234,.35)", borderBottom: "none", borderRadius: "4px 4px 0 0"});
    Object.assign(a.style, {position: "absolute", left: X0 + i * SLOT + BW + 6 + "px", width: BW + "px", bottom: 1080 - BASE + "px", background: "#49b6ca", borderRadius: "4px 4px 0 0"});
    Object.assign(m.style, {position: "absolute", left: X0 + i * SLOT - 10 + "px", width: 2 * BW + 26 + "px", top: BASE + 18 + "px", textAlign: "center", fontSize: "18px", color: "rgba(242,239,234,.45)"});
    return {b, a, vb: v, va: A[i], i};
  });
  const axis = el("div", "", "", L); Object.assign(axis.style, {position: "absolute", left: X0 - 20 + "px", top: BASE + "px", width: 12 * SLOT + 20 + "px", height: "1px", background: "rgba(242,239,234,.35)"});
  const legend = at(el("div", "t en", `<span style="display:inline-block;width:14px;height:14px;border:1.5px solid rgba(242,239,234,.5);border-radius:3px;vertical-align:-2px"></span>&nbsp; 리모델링 전 &nbsp;&nbsp;&nbsp;<span style="display:inline-block;width:14px;height:14px;background:#49b6ca;border-radius:3px;vertical-align:-2px"></span>&nbsp; 리모델링 후 · kWh`, L), X0, 330);
  const tb = e.before.heat + e.before.cool, ta = e.after.heat + e.after.cool;
  const tot = at(el("div", "t", `<div class="en" style="letter-spacing:.06em">연간 냉난방 부하 · kWh/년</div>` +
    `<div class="num nb" style="font-size:40px;font-weight:500;color:rgba(242,239,234,.45);margin-top:14px"></div>` +
    `<div class="num na" style="font-size:64px;font-weight:700;margin-top:2px"></div>`, L), 120, 430);
  const big = at(el("div", "t", `<div class="num" style="font-size:168px;font-weight:700;letter-spacing:-.04em;color:#49b6ca;line-height:1">−${Math.round((1 - ta / tb) * 100)}%</div>` +
    `<div style="font-size:26px;font-weight:600;margin-top:10px">냉난방 에너지 절감</div>`, L), 112, 650);
  return {ch, bars, max, H, legend, tot, big, tb, ta, sB: B.reduce((x, y) => x + y), sA: A.reduce((x, y) => x + y)};
}, (c, t, dur) => {
  c.ch(t, dur); reveal(c.legend, t, .8, dur - .8); reveal(c.tot, t, .9, dur - .8); reveal(c.big, t, 5.6, dur - .8, 30);
  let gb = 0, ga = 0;
  for (const q of c.bars) {
    const g = eo((t - 1.2 - q.i * .22) / .9);
    q.b.style.height = q.vb / c.max * c.H * g + "px"; q.a.style.height = q.va / c.max * c.H * g + "px";
    gb += q.vb * g; ga += q.va * g;
  }
  const out = 1 - eo((t - dur + .8) / .45);
  for (const q of c.bars) { q.b.style.opacity = out; q.a.style.opacity = out; }
  c.tot.querySelector(".nb").textContent = fmt(c.tb * gb / c.sB);
  c.tot.querySelector(".na").textContent = fmt(c.ta * ga / c.sA);
});

// 8. 견적 ──────────────────────────────────────────────────────────────
scene(7, L => {
  const ch = chapter(L, 6, "리모델링 견적", "Estimate from measured quantities · example unit prices");
  const it = D.energy.estimate.items;
  const label = {insulation: ["외벽 외단열", `${D.energy.envelope.wallArea.toFixed(1)} ㎡`], windows: ["창호 교체", `${D.energy.envelope.windowArea.toFixed(1)} ㎡`], interior: ["내부 마감", "자재 11종"]};
  const rows = it.map((r, i) => {
    const row = at(el("div", "t", `<div style="display:flex;align-items:baseline;width:1100px;padding:26px 0;border-bottom:1px solid rgba(242,239,234,.16)">` +
      `<span style="font-size:34px;font-weight:600;width:420px">${label[r.key][0]}</span><span class="num" style="font-size:26px;color:rgba(242,239,234,.55);width:300px">${label[r.key][1]}</span>` +
      `<span class="num amt" style="font-size:38px;font-weight:500;margin-left:auto"></span></div>`, L), 120, 360 + i * 104);
    return {row, v: r.amount, t0: 1.0 + i * .45};
  });
  const total = at(el("div", "t", `<div style="display:flex;align-items:baseline;width:1100px;padding-top:30px">` +
    `<span style="font-size:30px;font-weight:600">합계 <span class="en">예시 단가 · 실제 견적이 아닙니다</span></span>` +
    `<span class="num amt" style="font-size:72px;font-weight:700;color:#49b6ca;margin-left:auto;letter-spacing:-.02em"></span></div>`, L), 120, 690);
  const won = at(el("div", "t en", "원 · KRW", L), 1180, 800);
  return {ch, rows, total, won, sum: D.energy.estimate.total};
}, (c, t, dur) => {
  c.ch(t, dur);
  for (const r of c.rows) { reveal(r.row, t, r.t0, dur - .8); r.row.querySelector(".amt").textContent = fmt(r.v * eo((t - r.t0) / 1.1)); }
  reveal(c.total, t, 2.6, dur - .8); reveal(c.won, t, 2.9, dur - .8);
  c.total.querySelector(".amt").textContent = fmt(c.sum * eio((t - 2.6) / 1.6));
});

// 9. 완성 모습 (도면 마감재를 입힌 렌더링) ─────────────────────────────────
scene(8, L => {
  const a = el("img", "full", null, L), b = el("img", "full", null, L);
  a.src = D.photos["photo-exterior-r2"]; b.src = D.photos["photo-1f-r2"];
  const shade = el("div", "", "", L); Object.assign(shade.style, {position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.42) 0%,rgba(0,0,0,0) 34%,rgba(0,0,0,0) 70%,rgba(0,0,0,.45) 100%)"});
  const cap = at(el("div", "t", `<div class="chap">07</div><div style="font-size:44px;font-weight:700;margin-top:14px;letter-spacing:-.02em">도면에 적힌 마감 그대로</div>` +
    `<div class="en" style="margin-top:8px;color:rgba(242,239,234,.7)">Rendered with the finishes noted on the drawing</div>`, L), 120, 100);
  return {a, b, cap};
}, (c, t, dur) => {
  c.a.style.transform = `scale(${1.02 + .05 * (t / dur)})`;
  c.b.style.opacity = eio((t - 4.0) / 1.0); c.b.style.transform = `scale(${1.06 - .04 * clamp((t - 4) / 4)})`;
  reveal(c.cap, t, .6, dur - .8);
});

// 10. 연계 제품 ────────────────────────────────────────────────────────
scene(6.5, L => {
  const h = at(el("div", "t h2", "나인와트 제품과 이어집니다", L), 120, 300);
  const s = at(el("div", "t en", "Building data from the drawing, feeding the tools we already run", L), 122, 378);
  const items = [["Energy Studio", "국토안전원 기존 건축물 에너지 · 온실가스 시뮬레이터"], ["GreenPlanner", "건물주를 위한 리모델링 의사결정 서비스"], ["GRAI", "공공건축물 그린리모델링 시뮬레이션 플랫폼"]]
    .map(([n, d], i) => at(el("div", "t", `<div style="width:2px;height:120px;background:rgba(73,182,202,.6);position:absolute;left:0;top:0"></div>` +
      `<div style="padding-left:28px"><div style="font-size:40px;font-weight:700;color:#49b6ca;letter-spacing:-.01em">${n}</div>` +
      `<div style="font-size:23px;color:rgba(242,239,234,.66);margin-top:14px;width:440px;line-height:1.45">${d}</div></div>`, L), 120 + i * 560, 540));
  return {h, s, items};
}, (c, t, dur) => { reveal(c.h, t, .3, dur - .8); reveal(c.s, t, .5, dur - .8); c.items.forEach((e, i) => reveal(e, t, 1.1 + i * .3, dur - .8)); });

// 11. QR ───────────────────────────────────────────────────────────────
scene(8, L => {
  const q = at(el("div", "t", `<div style="width:360px;height:360px;background:#f2efea;border-radius:28px;padding:30px">${D.qr.replace("<svg", '<svg width="300" height="300"')}</div>`, L), 1440, 360);
  const h = at(el("div", "t h2", "자세한 결과는 QR로", L), 120, 380);
  const s = at(el("div", "t en", "Scan for the full case study · 詳しくはQRで", L), 122, 458);
  const u = at(el("div", "t", `<span style="font-size:40px;font-weight:600;color:#49b6ca">ninewatt.com/ko/expo</span>`, L), 120, 560);
  const lang = at(el("div", "t en", "한국어 · English · 日本語", L), 122, 626);
  const lg = at(el("div", "t", logo(), L), 120, 820);
  const black = el("div", "", "", L); Object.assign(black.style, {position: "absolute", inset: 0, background: "#0d0f10", opacity: 0});
  return {q, h, s, u, lang, lg, black};
}, (c, t, dur) => {
  reveal(c.q, t, .5); reveal(c.h, t, .3); reveal(c.s, t, .5); reveal(c.u, t, .8); reveal(c.lang, t, 1.0); reveal(c.lg, t, 1.3);
  c.black.style.opacity = eio((t - dur + 1.0) / 1.0);   // 배경색으로 끝나 처음 화면과 이어진다
});

// ── 타임라인 ────────────────────────────────────────────────────────────
let acc = 0;
for (const s of scenes) { s.start = acc; acc += s.dur - XF; }
const TOTAL = acc + XF;
window.TOTAL_FRAMES = Math.round(TOTAL * FPS);
window.renderFrame = async (f) => {
  const T = f / FPS, waits = [];
  for (const s of scenes) {
    const t = T - s.start;
    if (t < -0.01 || t > s.dur + 0.01) { s.layer.style.display = "none"; continue; }
    s.layer.style.display = "block";
    s.layer.style.opacity = Math.min(eio(t / XF), eio((s.dur - t) / XF), 1);
    if (s.start === 0) s.layer.style.opacity = Math.min(eio(t / 1.0), eio((s.dur - t) / XF));
    s.draw(s.ctx, t, s.dur);
    s.layer.querySelectorAll("img").forEach(i => waits.push(i.decode().catch(() => {})));
  }
  await Promise.all(waits);
  await document.fonts.ready;
};
</script>"""

page = html.replace("__FONT__", font.as_uri()).replace("__DATA__", json.dumps(data, ensure_ascii=False))
(film / "film.html").write_text(page)
print("film.html", len(page) // 1024, "KB")

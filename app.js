// Answers are emailed to Philippe through FormSubmit (alias hides his address).
const FORM_ENDPOINT = "https://formsubmit.co/ajax/7f10409a2a25e4180280eb483da20456";
const PARTY_START = new Date("2026-12-05T00:00:00-05:00");

const SCENES = [
  { q: "Samedi matin, tu veux te réveiller à quelle heure ?",
    a: ["7 h", "8 h", "9 h", "10 h", "Le plus tard possible"] },
  { q: "On s'en va où, d'après toi ?",
    a: ["En ville", "En nature", "Aucune idée"] },
  { q: "L'après-midi, ça te tente de…", multi: true,
    a: ["Prendre un cocktail", "Faire une rando", "Un massage", "Magasiner", "Faire une sieste", "Un peu de tout"] },
  { q: "Pour souper, t'aimerais mieux…",
    a: ["Quelque chose de chic", "Quelque chose de relax"] },
  { q: "Après le souper ?", multi: true,
    a: ["Jeux de société", "Spa", "Des drinks", "Film collés", "Une partie de Magic", "Strip poker 🃏", "Jeux coquins 🫣", "Soirée pas sage 😈"] },
  { q: "Dimanche matin ?",
    a: ["Grasse matinée", "Gros brunch", "Les deux"] }
];

const card = document.getElementById("card");
let step = -1;
let picked = new Set();
const answers = [];

function dots(active) {
  return '<div class="dots">' + SCENES.map((_, i) =>
    '<div class="dot' + (i <= active ? ' on' : '') + '"></div>').join("") + '</div>';
}
function render(html) {
  card.innerHTML = '<div class="scene">' + html + '</div>';
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function intro() {
  step = -1; answers.length = 0;
  render(`
    <div class="kicker">Pour tes 25 ans</div>
    <h1 class="script">Alice</h1>
    <div class="divider"><span></span>♥<span></span></div>
    <p>Garde ta fin de semaine du 5 décembre libre.</p>
    <p>J'ai planifié ta fête. J'ai juste besoin de quelques réponses.</p>
    <div class="choices" style="margin-top:22px"><button class="primary" onclick="next()">Commencer</button></div>
  `);
}

function next() {
  step++;
  if (step >= SCENES.length) return finale();
  const s = SCENES[step];
  if (s.multi) {
    picked = new Set();
    render(`
      <div class="kicker">${step + 1} / ${SCENES.length}</div>
      <h2>${s.q}</h2>
      <div class="hint">Coche tout ce que tu veux</div>
      <div class="checklist">
        ${s.a.map((t, i) => `<div class="check" id="c${i}" onclick="toggle(${i})"><span class="box"></span><span>${t}</span></div>`).join("")}
      </div>
      <div class="choices"><button class="primary" id="ok" disabled onclick="confirmMulti()">Suivant</button></div>
      ${dots(step)}
    `);
    return;
  }
  render(`
    <div class="kicker">${step + 1} / ${SCENES.length}</div>
    <h2>${s.q}</h2>
    <div class="choices">
      ${s.a.map((t, i) => `<button onclick="choose(${i})">${t}</button>`).join("")}
    </div>
    ${dots(step)}
  `);
}

function toggle(i) {
  const el = document.getElementById("c" + i);
  if (picked.has(i)) { picked.delete(i); el.classList.remove("on"); el.querySelector(".box").textContent = ""; }
  else { picked.add(i); el.classList.add("on"); el.querySelector(".box").textContent = "✓"; }
  document.getElementById("ok").disabled = picked.size === 0;
}
function confirmMulti() {
  const s = SCENES[step];
  answers[step] = [...picked].sort((a, b) => a - b).map(i => s.a[i]).join(", ");
  next();
}
function choose(i) {
  answers[step] = SCENES[step].a[i];
  next();
}

function send() {
  if (!FORM_ENDPOINT || FORM_ENDPOINT.startsWith("__")) return;
  const data = { _subject: "Réponses d'Alice ✨", _template: "table", _captcha: "false" };
  SCENES.forEach((s, i) => { data[(i + 1) + ". " + s.q] = answers[i] || ""; });
  data["Envoyé le"] = new Date().toLocaleString("fr-CA");
  fetch(FORM_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(data)
  }).catch(() => {});
}

function finale() {
  send();
  render(`
    <div class="kicker">Ta fête</div>
    <h1 class="script" style="font-size:64px">Joyeux 25 ans</h1>
    <div class="divider"><span></span>♥<span></span></div>
    <div class="details">
      <div class="date">Samedi 5 et dimanche 6 décembre</div>
      <div class="line muted">Le reste, c'est une surprise.</div>
    </div>
    <div class="label">Dans ta valise</div>
    <div class="pack">maillot de bain · bottes chaudes<br>une tenue chic<br>ton pyjama</div>
    <div class="label">Ta fête commence dans</div>
    <div class="countdown" id="cd"></div>
    <div class="choices"><button class="primary" id="yes" onclick="yes()">J'ai hâte ♥</button></div>
    <div class="thanks" id="thanks"><div class="script sig">Philippe ♥</div></div>
  `);
  tick();
}

function tick() {
  const el = document.getElementById("cd");
  if (!el) return;
  let ms = PARTY_START - new Date();
  if (ms <= 0) { el.innerHTML = '<div style="min-width:200px"><b>C\'est aujourd\'hui !</b></div>'; return; }
  const d = Math.floor(ms / 864e5); ms -= d * 864e5;
  const h = Math.floor(ms / 36e5); ms -= h * 36e5;
  const m = Math.floor(ms / 6e4);
  el.innerHTML = `<div><b>${d}</b><small>jours</small></div><div><b>${h}</b><small>heures</small></div><div><b>${m}</b><small>min</small></div>`;
  setTimeout(tick, 20000);
}

function yes() {
  document.getElementById("yes").style.display = "none";
  document.getElementById("thanks").classList.add("show");
  confetti();
}

// Background: champagne bubbles by default; ?fond=rose (gold flecks) or ?fond=sapin (snow) to preview the others.
(function air() {
  const fond = new URLSearchParams(location.search).get("fond");
  if (fond === "rose" || fond === "sapin") document.body.dataset.fond = fond;
  const kind = fond === "sapin" ? "flake" : fond === "rose" ? "fleck" : "bub";
  const box = document.getElementById("air");
  const count = kind === "flake" ? 70 : kind === "fleck" ? 30 : 38;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    const size = kind === "bub" ? 3 + Math.random() * 7 : kind === "flake" ? 2 + Math.random() * 4 : 2 + Math.random() * 3;
    const dur = kind === "bub" ? 9 + Math.random() * 10 : kind === "flake" ? 10 + Math.random() * 12 : 14 + Math.random() * 12;
    p.className = kind;
    p.style.width = p.style.height = size.toFixed(1) + "px";
    p.style.left = Math.random() * 100 + "%";
    p.style.setProperty("--d", dur.toFixed(1) + "s");
    p.style.setProperty("--x", ((Math.random() - .5) * 40).toFixed(0) + "px");
    p.style.setProperty("--o", (kind === "fleck" ? .35 + Math.random() * .35 : .45 + Math.random() * .5).toFixed(2));
    p.style.animationDelay = (-Math.random() * dur).toFixed(1) + "s";
    if (kind === "flake" && size > 4.5) p.style.filter = "blur(1px)";
    box.appendChild(p);
  }
})();

function confetti() {
  const c = document.getElementById("confetti"), ctx = c.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  c.width = innerWidth * dpr; c.height = innerHeight * dpr; ctx.scale(dpr, dpr);
  const colors = ["#e0bd7a", "#f2bebb", "#f8f0e4", "#cfa65f", "#ffd9e0"];
  const parts = Array.from({ length: 160 }, () => ({
    x: innerWidth / 2 + (Math.random() - .5) * 80, y: innerHeight * .55,
    vx: (Math.random() - .5) * 12, vy: -Math.random() * 14 - 6,
    w: 6 + Math.random() * 6, h: 8 + Math.random() * 8,
    r: Math.random() * Math.PI, vr: (Math.random() - .5) * .3,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));
  let frames = 0;
  (function draw() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts.forEach(p => {
      p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    });
    if (++frames < 260) requestAnimationFrame(draw); else ctx.clearRect(0, 0, innerWidth, innerHeight);
  })();
}

intro();

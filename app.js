// 仮面ライダー図鑑: data/riders.json を読み込んで一覧・検索・詳細表示を行う
const state = { riders: [], era: "すべて", role: "すべて", query: "" };

const listEl = document.getElementById("list");
const countEl = document.getElementById("count");
const dialog = document.getElementById("detail");

async function load() {
  // 更新後に古いデータがキャッシュから読まれないよう、毎回サーバーに確認する
  const res = await fetch(`data/riders.json?v=${Date.now()}`, { cache: "no-store" });
  const data = await res.json();
  state.riders = data.map((r) => ({ role: "主役", forms: [], ...r }));
  render();
}

function matches(r) {
  if (state.era !== "すべて" && r.era !== state.era) return false;
  if (state.role !== "すべて" && r.role !== state.role) return false;
  const q = state.query.trim().toLowerCase();
  if (!q) return true;
  return [r.name, r.series, r.transformer, r.actor, r.belt, ...(r.forms || [])]
    .some((v) => v && v.toLowerCase().includes(q));
}

// 画像がないライダー用に、テーマカラーで仮面のイラストを描く
function helmetSvg(color) {
  const c = /^#[0-9a-f]{6}$/i.test(color) ? color : "#888888";
  return `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
    <rect width="160" height="120" fill="${c}" opacity="0.18"/>
    <path d="M80 14 C112 14 124 40 124 66 C124 92 106 110 80 110 C54 110 36 92 36 66 C36 40 48 14 80 14 Z" fill="${c}"/>
    <path d="M80 14 L74 4 M80 14 L86 4" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="62" cy="58" rx="15" ry="11" fill="#fff" opacity="0.9"/>
    <ellipse cx="98" cy="58" rx="15" ry="11" fill="#fff" opacity="0.9"/>
    <ellipse cx="62" cy="58" rx="9" ry="6" fill="#d32f2f"/>
    <ellipse cx="98" cy="58" rx="9" ry="6" fill="#d32f2f"/>
    <rect x="66" y="84" width="28" height="12" rx="4" fill="#222" opacity="0.55"/>
  </svg>`;
}

function imageEl(r) {
  const wrap = document.createElement("div");
  if (r.image) {
    const img = document.createElement("img");
    img.src = r.image;
    img.alt = r.name;
    img.loading = "lazy";
    img.onerror = () => { wrap.innerHTML = helmetSvg(r.color); };
    wrap.append(img);
  } else {
    wrap.innerHTML = helmetSvg(r.color);
  }
  return wrap;
}

function render() {
  const items = state.riders.filter(matches);
  countEl.textContent = `${items.length} 件`;
  listEl.replaceChildren(
    ...items.map((r) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "card";
      const thumb = imageEl(r);
      thumb.className = "thumb";
      const badges = document.createElement("div");
      badges.className = "badges";
      badges.innerHTML = `<span class="badge"></span><span class="badge role"></span>`;
      badges.children[0].classList.add(r.era);
      badges.children[0].textContent = r.era;
      badges.children[1].classList.add(r.role);
      badges.children[1].textContent = r.role;
      const h3 = document.createElement("h3");
      h3.textContent = r.name;
      const p = document.createElement("p");
      p.textContent = `${r.series}（${r.year}年）`;
      card.append(thumb, badges, h3, p);
      card.addEventListener("click", () => showDetail(r));
      return card;
    })
  );
}

function section(el, title, children) {
  if (!children.length) { el.replaceChildren(); return; }
  const h = document.createElement("h3");
  h.textContent = title;
  const ul = document.createElement("ul");
  ul.className = "chips";
  ul.append(...children.map((c) => { const li = document.createElement("li"); li.append(c); return li; }));
  el.replaceChildren(h, ul);
}

function showDetail(r) {
  const imgBox = document.getElementById("detail-image");
  imgBox.replaceChildren(...imageEl(r).childNodes);
  document.getElementById("detail-name").textContent = r.name;
  const rows = [
    ["作品", r.series],
    ["放送開始", `${r.year}年`],
    ["時代", r.era],
    ["種類", r.role],
    ["変身者", r.transformer],
    ["演者", r.actor],
    ["変身ベルト", r.belt],
    ["メモ", r.note],
  ].filter(([, v]) => v);
  document.getElementById("detail-body").replaceChildren(
    ...rows.flatMap(([k, v]) => {
      const dt = document.createElement("dt");
      dt.textContent = k;
      const dd = document.createElement("dd");
      dd.textContent = v;
      return [dt, dd];
    })
  );

  section(document.getElementById("detail-forms"), "主なフォーム",
    (r.forms || []).map((f) => document.createTextNode(f)));

  const related = state.riders.filter((o) => o.series === r.series && o.id !== r.id);
  section(document.getElementById("detail-related"), "同じ作品のライダー",
    related.map((o) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = o.name;
      b.addEventListener("click", () => showDetail(o));
      return b;
    }));

  if (!dialog.open) dialog.showModal();
}

document.getElementById("search").addEventListener("input", (e) => {
  state.query = e.target.value;
  render();
});

function setupFilter(selector, key) {
  const buttons = document.querySelectorAll(selector);
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state[key] = btn.dataset[key];
      render();
    });
  });
}
setupFilter("button[data-era]", "era");
setupFilter("button[data-role]", "role");

load();

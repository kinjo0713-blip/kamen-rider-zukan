// 仮面ライダー図鑑: data/riders.json を読み込んで一覧・検索・詳細表示を行う
const state = { riders: [], era: "すべて", query: "" };

const listEl = document.getElementById("list");
const countEl = document.getElementById("count");
const dialog = document.getElementById("detail");

async function load() {
  const res = await fetch("data/riders.json");
  state.riders = await res.json();
  render();
}

function matches(r) {
  if (state.era !== "すべて" && r.era !== state.era) return false;
  const q = state.query.trim().toLowerCase();
  if (!q) return true;
  return [r.name, r.series, r.transformer, r.actor]
    .some((v) => v && v.toLowerCase().includes(q));
}

function render() {
  const items = state.riders.filter(matches);
  countEl.textContent = `${items.length} 件`;
  listEl.replaceChildren(
    ...items.map((r) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "card";
      card.innerHTML = `
        <span class="badge ${r.era}">${r.era}</span>
        <h3></h3>
        <p></p>`;
      card.querySelector("h3").textContent = r.name;
      card.querySelector("p").textContent = `${r.series}（${r.year}年）`;
      card.addEventListener("click", () => showDetail(r));
      return card;
    })
  );
}

function showDetail(r) {
  document.getElementById("detail-name").textContent = r.name;
  const rows = [
    ["作品", r.series],
    ["放送開始", `${r.year}年`],
    ["時代", r.era],
    ["変身者", r.transformer],
    ["演者", r.actor],
    ["メモ", r.note],
  ].filter(([, v]) => v);
  const body = document.getElementById("detail-body");
  body.replaceChildren(
    ...rows.flatMap(([k, v]) => {
      const dt = document.createElement("dt");
      dt.textContent = k;
      const dd = document.createElement("dd");
      dd.textContent = v;
      return [dt, dd];
    })
  );
  dialog.showModal();
}

document.getElementById("search").addEventListener("input", (e) => {
  state.query = e.target.value;
  render();
});

document.querySelectorAll(".era-filter button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".era-filter button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.era = btn.dataset.era;
    render();
  });
});

load();

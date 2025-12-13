const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

const els = {
  q: document.getElementById("q"),
  go: document.getElementById("go"),
  status: document.getElementById("status"),
  result: document.getElementById("result"),
  word: document.getElementById("word"),
  meta: document.getElementById("meta"),
  img: document.getElementById("img"),
  audio: document.getElementById("audio"),
  etymology: document.getElementById("etymology"),
  mnemonic: document.getElementById("mnemonic"),
  story: document.getElementById("story"),
  shareBtn: document.getElementById("shareBtn"),
  themeBtn: document.getElementById("themeBtn"),
};

let current = null;

function setStatus(msg) {
  els.status.textContent = msg;
  els.status.classList.remove("hidden");
}

function clearStatus() {
  els.status.classList.add("hidden");
  els.status.textContent = "";
}

function applyTelegramTheme() {
  if (!tg || !tg.themeParams) return;
  const p = tg.themeParams;
  // fallbacks keep it readable
  document.documentElement.style.setProperty("--bg", p.bg_color || "#0f1115");
  document.documentElement.style.setProperty("--text", p.text_color || "#e9eef6");
  document.documentElement.style.setProperty("--card", p.secondary_bg_color || "#151922");
  document.documentElement.style.setProperty("--accent", p.button_color || "#5b9dff");
}
applyTelegramTheme();

async function fetchEtymology(word) {
  const url = `https://api.etymology.ai/etymology?word=${encodeURIComponent(word)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  if (!data?.etymology?.length) return null;
  return data.etymology[0];
}

function render(e) {
  els.word.textContent = e.word;
  els.meta.textContent = `v${e.version ?? "?"} • id ${e.id ?? "?"}`;

  els.etymology.textContent = e.etymology || "—";
  els.mnemonic.textContent = e.mnemonic || "—";
  els.story.textContent = e.shortStory || "—";

  if (e.imgUrl) {
    els.img.src = e.imgUrl;
    els.img.classList.remove("hidden");
  } else {
    els.img.classList.add("hidden");
  }

  if (e.audioUrl) {
    els.audio.src = e.audioUrl;
    els.audio.classList.remove("hidden");
  } else {
    els.audio.classList.add("hidden");
  }

  els.result.classList.remove("hidden");
}

function share(e) {
  if (!e) return;

  const text =
`📖 ${e.word}

🧠 Etymology:
${e.etymology || "-"}

💡 Mnemonic:
${e.mnemonic || "-"}

🧩 Story:
${(e.shortStory || "-").slice(0, 400)}${(e.shortStory && e.shortStory.length > 400) ? "…" : ""}

via ety.ai`;

  // Opens Telegram share UI
  const link = `https://t.me/share/url?text=${encodeURIComponent(text)}`;
  if (tg) tg.openTelegramLink(link);
  else window.open(link, "_blank");
}

async function doSearch(wordRaw) {
  const word = (wordRaw || "").trim();
  if (!word) {
    setStatus("Type a word to search.");
    return;
  }

  clearStatus();
  setStatus("Searching…");

  try {
    const e = await fetchEtymology(word);
    if (!e) {
      setStatus(`No result found for "${word}".`);
      els.result.classList.add("hidden");
      return;
    }
    current = e;
    clearStatus();
    render(e);
  } catch (err) {
    setStatus(`Something went wrong. Try again. (${err.message})`);
    els.result.classList.add("hidden");
  }
}

els.go.addEventListener("click", () => doSearch(els.q.value));
els.q.addEventListener("keydown", (ev) => {
  if (ev.key === "Enter") doSearch(els.q.value);
});
els.shareBtn.addEventListener("click", () => share(current));
els.themeBtn.addEventListener("click", () => applyTelegramTheme());

// Deep link support: https://t.me/YourBot?startapp=bread
const startParam = tg?.initDataUnsafe?.start_param;
if (startParam) {
  els.q.value = startParam;
  doSearch(startParam);
}

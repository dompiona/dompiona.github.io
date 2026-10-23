"use strict";
/* ==========================================================
   1. НАСТРОЙКИ МАГАЗИНА — меняйте только этот блок
   ========================================================== */
const CONFIG = {
  shop: "Дом Пиона",
  whatsapp: "79011020737",        // номер WhatsApp: только цифры, с кодом страны
  telegram: "kuzenkovWork",       // Telegram без @
  phoneText: "+7 901 102-07-37",
  address: "Москва, ул. Цветочная, 1",
  hours: "ежедневно 8:00–22:00",
  delivery: { price: 450, freeFrom: 10000, onTime: 900 },
  loyalty: {
    welcome: 300, friendGift: 500, quizGift: 300, quizDiscount: 10,
    careDiscount: 10,             // % скидки по напоминанию календаря заботы
    careLeadDays: 14,             // скидка, только если дата добавлена минимум за столько дней
    masterGift: 50,               // баллы за букет с гармонией 90+ в 3D
    maxSpendPercent: 30,
    levels: [
      { name: "Бутон",  from: 0,     cashback: 5 },
      { name: "Цветок", from: 15000, cashback: 7 },
      { name: "Сад",    from: 40000, cashback: 10 }
    ]
  },
  metrikaId: "",                  // номер счётчика Яндекс.Метрики
  vkPixelId: "",                  // ID пикселя VK Рекламы
  vapidPublicKey: "",             // ключ для серверных push-рассылок
  aiEndpoint: "https://dom-piona-ai.senyamoralez.workers.dev", // ИИ-посредник (worker.js на Cloudflare), см. ИНСТРУКЦИЯ.txt
};

const IMG = (id, w = 480) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

/* Язык цветов — используют консультант и ИИ */
const MEANING = {
  rose_pink: "розовые розы — благодарность и восхищение",
  rose_white: "белые розы — уважение и чистота намерений",
  rose_dark: "тёмные розы — глубокое чувство и верность",
  rose_peach: "персиковые розы — радость и искренняя симпатия",
  peony: "пионы — благополучие и счастье в доме",
  hydrangea: "гортензия — сердечность и благодарность за понимание",
  eucalyptus: "эвкалипт — защита и душевное равновесие",
  poppy: "маки — покой, мечты и тёплая память",
  lisianthus: "эустома — уважение и признательность",
  gypsophila: "гипсофила — искренность и лёгкость",
  tulip: "тюльпаны — новое начало и весеннее настроение",
  ranunculus: "ранункулюсы — «вы очаровательны»",
  delphinium: "дельфиниум — открытость и доброжелательность",
  garden: "садовые цветы — уют и простое тепло"
};

const BOUQUETS = [
  { id:"provence", name:"Утро в Провансе", desc:"Пионовидные розы, гортензия, эвкалипт", price:7900, img:"1782038522861-22e8c23c96e5", tag:"Хит", cats:["roses","peony"], flowers:["rose_pink","hydrangea","eucalyptus"], colors:["розов","бел","нежн","пастел","постел"], occ:["день рожд","мам","свидан","девушк","жен","подруг"], recipe:{ base:"paper", items:[["euc",null,3],["hydr","#FBF8F3",2],["rose","#E7A9A8",7],["peony","#FBF8F3",2]] } },
  { id:"peony", name:"Пудровый пион", desc:"Сортовые пионы, 15 стеблей", price:9500, img:"1527061011665-3652c757a4d4", tag:"Сезон", cats:["peony","season"], flowers:["peony"], colors:["розов","нежн","пастел","постел","пудр"], occ:["мам","свадьб","юбиле","жен"], recipe:{ base:"paper", items:[["peony","#EBC4BE",15]] } },
  { id:"nocturne", name:"Ноктюрн", desc:"Тёмные розы, пионы, бархатная зелень", price:11900, img:"1612351641432-20a0f196086c", tag:"Авторский", cats:["roses","peony"], flowers:["rose_dark","peony","eucalyptus"], colors:["темн","бордо","красн","винн","глубок"], occ:["любим","годовщ","жен","предлож","страст"], recipe:{ base:"box", items:[["rose","#7A2234",9],["peony","#E7A9A8",4],["euc",null,2]] } },
  { id:"poppies", name:"Белые маки", desc:"Исландские маки в стеклянной вазе", price:6400, img:"1587317996237-eddd7e834d84", tag:"В вазе", cats:["vase","season"], flowers:["poppy"], colors:["бел","светл","минимал"], occ:["коллег","интерьер","без повод","офис","начальн","строг","сдержан"], recipe:{ base:"vase", items:[["tulip","#FBF8F3",9],["euc",null,2]] } },
  { id:"tender", name:"Нежность", desc:"Розовые розы и пионы в вазе", price:8200, img:"1575178114667-c8a832c61f45", cats:["roses","vase"], flowers:["rose_pink","peony"], colors:["розов","нежн","пастел","постел"], occ:["мам","бабушк","извин","выписк"], recipe:{ base:"ceramic", items:[["rose","#E7A9A8",7],["peony","#EBC4BE",4],["euc",null,2]] } },
  { id:"garden", name:"Сад у дома", desc:"Садовые цветы и зелень в чёрной вазе", price:8800, img:"1608656218680-e8be81ce71d7", tag:"В вазе", cats:["vase","season"], flowers:["garden","delphinium"], colors:["бел","сирен","фиолет","микс"], occ:["новосел","учител","дом","мужчин"], recipe:{ base:"vase", items:[["hydr","#C3B1D9",2],["tulip","#FBF8F3",5],["gyps",null,3],["peony","#FBF8F3",2],["euc",null,3]] } },
  { id:"sunny", name:"Солнечный", desc:"Кустовые розы, ранункулюсы, персик", price:6900, img:"1587317997383-2e6c1b24040f", cats:["roses","season"], flowers:["rose_peach","ranunculus"], colors:["желт","оранж","ярк","персик"], occ:["подруг","коллег","выздоров","поздрав","8 март"], recipe:{ base:"paper", items:[["rose","#E98F7C",7],["rose","#F1DC9A",6],["euc",null,2]] } },
  { id:"cloud", name:"Облако", desc:"Розовые розы и гипсофила", price:5600, img:"1612526031467-2b6bf1f49961", cats:["roses"], flowers:["rose_pink","gypsophila"], colors:["розов","бел","нежн","пастел","постел"], occ:["девушк","свидан","студ"], recipe:{ base:"paper", items:[["rose","#EBC4BE",9],["gyps",null,5]] } },
  { id:"pastel", name:"Пастель", desc:"Пудровые розы, эустома, фисташковая зелень", price:4500, img:"1560113405-0c86fcd406ab", tag:"До 5 000", cats:["roses","cheap"], flowers:["rose_pink","lisianthus","eucalyptus"], colors:["пастел","постел","пудр","нежн","розов","бел","спокойн"], occ:["знакомств","мама парн","мама муж","мама девушк","свекров","теще","тёще","строг","сдержан","элегант","мам","уважен"], recipe:{ base:"paper", items:[["rose","#F3E7D3",5],["rose","#EBC4BE",4],["euc",null,3]] } },
  { id:"aquarelle", name:"Акварель", desc:"Розы и диантусы в керамической вазе", price:4900, img:"1435783459217-ee7fe5414abe", cats:["vase","cheap"], flowers:["rose_pink","garden"], colors:["розов","пастел","постел","нежн"], occ:["подруг","бабушк","благодар","спасиб","учител"], recipe:{ base:"ceramic", items:[["rose","#E7A9A8",5],["hydr","#C3B1D9",1],["gyps",null,3]] } },
  { id:"tulips", name:"Тюльпаны Мэй", desc:"25 тюльпанов в крафте", price:3900, img:"1491994336086-44f5d76dd8f2", cats:["season","cheap"], flowers:["tulip"], colors:["ярк","микс","розов","весен"], occ:["8 март","коллег","весн","подруг","маме"], recipe:{ base:"paper", items:[["tulip","#E7A9A8",9],["tulip","#F1DC9A",8],["tulip","#FBF8F3",8]] } }
];
const EXTRAS = [ { id:"card", name:"Дизайнерская открытка", price:250 }, { id:"sweet", name:"Конфеты ручной работы", price:1200 } ];

/* 3D-конструктор: цветы, оттенки, основы */
const FLOWERS3D = {
  rose:  { name:"Роза", price:250, colored:true, icon:"f-rose", meaning:"rose_pink" },
  peony: { name:"Пион", price:420, colored:true, icon:"f-peony", meaning:"peony" },
  tulip: { name:"Тюльпан", price:180, colored:true, icon:"f-tulip", meaning:"tulip" },
  hydr:  { name:"Гортензия", price:690, colored:true, icon:"f-hydr", meaning:"hydrangea" },
  euc:   { name:"Эвкалипт", price:150, colored:false, icon:"f-euc", green:true, meaning:"eucalyptus", tint:"#8FA597" },
  gyps:  { name:"Гипсофила", price:220, colored:false, icon:"f-gyps", filler:true, meaning:"gypsophila", tint:"#B9B4AA" }
};
const PALETTE3D = [
  { c:"#EBC4BE", n:"Пудра" }, { c:"#F3E7D3", n:"Крем" }, { c:"#FBF8F3", n:"Белый" }, { c:"#E7A9A8", n:"Румянец" },
  { c:"#E98F7C", n:"Коралл" }, { c:"#F1DC9A", n:"Ваниль" }, { c:"#C3B1D9", n:"Сирень" }, { c:"#7A2234", n:"Бордо" }
];
const BASES3D = { paper:{ name:"Бумага", price:0, note:"бесплатно" }, ceramic:{ name:"Керамика", price:2500, note:"+2 500 ₽" }, vase:{ name:"Стекло", price:1500, note:"+1 500 ₽" }, box:{ name:"Коробка", price:1900, note:"+1 900 ₽" } };

const GALLERY = ["1557982780-d68d843c32ab","1782038522911-10e919331c16","1706796204047-42799881e989","1589244159943-460088ed5c92","1619707046314-e76ae25d5ab3","1615488913817-095134dfeb54","1782038522695-12ecda5b5e6d","1520179737749-b7752f6f56fb"];

/* ==========================================================
   2. ОБЩИЕ ФУНКЦИИ
   ========================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rub = n => Math.round(n).toLocaleString("ru-RU") + " ₽";
const num = n => Math.round(n).toLocaleString("ru-RU");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const norm = t => String(t).toLowerCase().replace(/ё/g, "е").replace(/[^a-zа-я0-9\s]/g, " ").replace(/\s+/g, " ").trim();
const store = {
  get(k, d) { try { const v = localStorage.getItem("dp_" + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem("dp_" + k, JSON.stringify(v)); } catch {} }
};
const plural = (n, a, b, c) => { const m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 10 || h >= 20) ? b : c; };
let toastT;
function toast(t, action) {
  const el = $("#toast"); el.textContent = t; el.classList.toggle("act", !!action);
  if (action) { const b = document.createElement("button"); b.type = "button"; b.textContent = action.label; b.onclick = () => { el.classList.remove("show"); action.fn(); }; el.appendChild(b); }
  el.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("show"), action ? 5000 : 3800);
}
const waLink = text => `https://wa.me/${CONFIG.whatsapp}` + (text ? `?text=${encodeURIComponent(text)}` : "");
const tgLink = () => `https://t.me/${CONFIG.telegram}`;
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch {
    const ta = document.createElement("textarea"); ta.value = text; ta.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand("copy"); } catch {} ta.remove(); return ok;
  }
}
/* Сайт внутри Telegram (мини-приложение): Telegram дописывает к адресу подписанные данные о человеке (tgWebAppData).
   По ним сервер узнаёт участника клуба без кода, а ссылки открываются средствами Telegram. */
const TG = (() => {
  const raw = location.hash || "";
  let initData = "";
  const at = raw.indexOf("tgWebAppData=");
  if (at >= 0) { try { initData = decodeURIComponent(raw.slice(at + 13).split(/&tgWebApp/)[0]); sessionStorage.setItem("dp_tgInit", initData); } catch {} }
  else { try { initData = sessionStorage.getItem("dp_tgInit") || ""; } catch {} }
  const inside = !!initData;
  let wa = null, readyCb = [];
  const ready = new Promise(res => readyCb.push(res));
  if (inside) {
    const sc = document.createElement("script");
    sc.src = "https://telegram.org/js/telegram-web-app.js";
    sc.onload = () => {
      wa = window.Telegram && window.Telegram.WebApp;
      try { wa.ready(); wa.expand(); wa.setHeaderColor && wa.setHeaderColor("#F6F1EA"); wa.setBackgroundColor && wa.setBackgroundColor("#F6F1EA"); } catch {}
      cleanHash(); readyCb.forEach(f => f(wa));
    };
    sc.onerror = () => { cleanHash(); readyCb.forEach(f => f(null)); };
    document.head.appendChild(sc);
  }
  /* убираем служебные данные Telegram из адреса (после того как их прочитал скрипт Telegram) */
  function cleanHash() {
    if (!/tgWebApp/.test(location.hash)) return;
    const v = location.hash.slice(1).split(/[?&]/)[0];
    try { history.replaceState(null, "", location.pathname + location.search + (v && !/^tgWebApp/.test(v) ? "#" + v : "")); } catch {}
  }
  function open(url) {
    if (!wa) return false;
    try { if (/^https:\/\/t\.me\//.test(url)) wa.openTelegramLink(url); else wa.openLink(url); return true; } catch { return false; }
  }
  function requestContact() {
    return ready.then(w => new Promise(res => {
      if (!w || !w.requestContact || (w.isVersionAtLeast && !w.isVersionAtLeast("6.9"))) return res(null);
      try { w.requestContact(ok => res(!!ok)); } catch { res(null); }
    }));
  }
  return { inside, initData, open, requestContact, ready };
})();
function openUrl(url) { if (!TG.open(url)) window.open(url, "_blank", "noopener"); }
/* внутри Telegram внешние ссылки открываем через Telegram, иначе они могут не сработать */
document.addEventListener("click", e => {
  if (!TG.inside) return;
  const a = e.target.closest && e.target.closest("a[href^='http']");
  if (a && (a.target === "_blank" || !a.href.startsWith(location.origin)) && TG.open(a.href)) e.preventDefault();
});
async function sendTo(channel, text) {
  if (channel === "wa") { openUrl(waLink(text)); toast("Открываем WhatsApp с вашей заявкой"); }
  else {
    // в обычном браузере окно открываем сразу (иначе браузер его заблокирует), в Telegram — сначала копируем текст
    if (!TG.inside) window.open(tgLink(), "_blank", "noopener");
    const ok = await copyText(text); if (TG.inside) openUrl(tgLink());
    toast(ok ? "Заявка скопирована. Вставьте её в чат Telegram" : "Откройте чат Telegram и опишите заказ");
  }
}
const todayISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };

/* ==========================================================
   3. СКВОЗНАЯ АНАЛИТИКА И UTM
   ========================================================== */
const Track = (() => {
  const qs = new URLSearchParams(location.search);
  let ref = ""; try { ref = document.referrer ? new URL(document.referrer).hostname : ""; } catch {}
  const sameSite = ref && ref === location.hostname;
  function detect() {
    const u = k => qs.get(k) || "";
    if (u("utm_source")) return { source:u("utm_source"), medium:u("utm_medium"), campaign:u("utm_campaign"), content:u("utm_content"), term:u("utm_term") };
    if (qs.get("yclid")) return { source:"yandex", medium:"cpc", campaign:"Яндекс Директ" };
    if (qs.get("rb_clickid") || qs.get("vkclid")) return { source:"vk", medium:"cpc", campaign:"VK Реклама" };
    if (qs.get("gclid")) return { source:"google", medium:"cpc" };
    if (!ref || sameSite) return null;
    if (/t\.me|telegram/.test(ref)) return { source:"telegram", medium:"social" };
    if (/vk\.com|vk\.ru|vkontakte/.test(ref)) return { source:"vk", medium:"social" };
    if (/yandex|ya\.ru/.test(ref)) return { source:"yandex", medium:"organic" };
    if (/google/.test(ref)) return { source:"google", medium:"organic" };
    if (/instagram|facebook/.test(ref)) return { source:"instagram", medium:"social" };
    if (/whatsapp|wa\.me/.test(ref)) return { source:"whatsapp", medium:"social" };
    return { source:ref, medium:"referral" };
  }
  const now = new Date().toISOString();
  const hit = detect();
  const t = store.get("track", null) || { cid: "DP-" + Math.random().toString(36).slice(2, 8).toUpperCase(), first: null, last: null, visits: 0, path: [] };
  let fresh = false; try { fresh = !sessionStorage.getItem("dp_session"); sessionStorage.setItem("dp_session", "1"); } catch { fresh = true; }
  if (fresh) t.visits++;
  const touch = hit ? { ...hit, at: now } : null;
  if (!t.first) t.first = touch || { source: "(direct)", medium: "(none)", at: now };
  if (touch) t.last = touch;
  const r = qs.get("ref"); if (r) store.set("referrer", r.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12));
  store.set("track", t);

  if (CONFIG.metrikaId) {
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0];k.async=1;k.src=r;a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
    ym(CONFIG.metrikaId, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true, ecommerce:"dataLayer" });
    ym(CONFIG.metrikaId, "userParams", { UserID: t.cid });
  }
  if (CONFIG.vkPixelId) {
    window._tmr = window._tmr || []; _tmr.push({ id: CONFIG.vkPixelId, type: "pageView", start: Date.now() });
    const s = document.createElement("script"); s.async = true; s.src = "https://top-fwz1.mail.ru/js/code.js"; document.head.appendChild(s);
  }
  window.dataLayer = window.dataLayer || [];
  function event(name, params = {}) {
    const st = store.get("track", t);
    st.path.push({ e: name, at: Date.now() }); if (st.path.length > 40) st.path = st.path.slice(-40);
    store.set("track", st);
    if (CONFIG.metrikaId && window.ym) ym(CONFIG.metrikaId, "reachGoal", name, params);
    if (CONFIG.vkPixelId && window._tmr) _tmr.push({ id: CONFIG.vkPixelId, type: "reachGoal", goal: name });
    window.dataLayer.push({ event: name, ...params });
  }
  const NAMES = { view_home:"Главная", view_catalog:"Каталог", view_build:"3D", view_quiz:"Подбор", view_cabinet:"Кабинет", add_bouquet:"Выбрал букет", open_3d:"Открыл букет в 3D", builder_done:"Собрал в 3D", ar_open:"Примерка AR", quiz_done:"Прошёл подбор", quiz_lead:"Оставил контакты", register:"Регистрация", chat_open:"Чат", chat_ai:"Вопрос ИИ", chat_order:"Заказ в чате", card_ai:"Открытка с ИИ", care_add:"Добавил дату", care_offer:"Заказ по напоминанию", order_open:"Открыл заказ", order_send:"Отправил заявку", ref_share:"Поделился ссылкой", pwa_install:"Установил приложение" };
  const fmt = x => !x ? "прямой заход" : [x.source, x.medium, x.campaign].filter(Boolean).join(" / ");
  function report() {
    const st = store.get("track", t);
    const steps = []; st.path.forEach(p => { const n = NAMES[p.e] || p.e; if (steps[steps.length - 1] !== n) steps.push(n); });
    const lines = ["", "— для магазина —", `Клиент: ${st.cid}, визитов: ${st.visits}`, `Источник: ${fmt(st.last || st.first)}`];
    if (st.last && st.first && fmt(st.first) !== fmt(st.last)) lines.push(`Первый визит: ${fmt(st.first)}`);
    lines.push(`Путь: ${steps.slice(-10).join(" → ") || "—"}`);
    return lines.join("\n");
  }
  function purchase(sum, item) {
    window.dataLayer.push({ ecommerce: { currencyCode: "RUB", purchase: { actionField: { id: String(Date.now()), revenue: sum }, products: [{ name: item, price: sum, quantity: 1 }] } } });
    event("order_send", { order_price: sum, currency: "RUB" });
  }
  return { event, report, purchase, get cid() { return t.cid; } };
})();

/* ==========================================================
   4. ШТОРКИ
   ========================================================== */
const Sheets = (() => {
  let current = null, lastFocus = null;
  function open(id) {
    if (current) { current.classList.remove("show"); } else lastFocus = document.activeElement;
    $("#toast").classList.remove("show");
    current = $("#" + id); current.classList.add("show"); $("#sheetBg").classList.add("show");
    document.body.style.overflow = "hidden"; document.body.classList.add("hide-fab");
    setTimeout(() => { if (!current) return; const f = current.querySelector(".sheet-x"); if (id !== "chatSheet" && f) f.focus({ preventScroll: true }); }, 400);
  }
  function close() {
    if (!current) return;
    current.classList.remove("show"); current = null;
    $("#sheetBg").classList.remove("show"); document.body.style.overflow = ""; document.body.classList.remove("hide-fab");
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  $("#sheetBg").onclick = close;
  $$("[data-close]").forEach(b => b.onclick = close);
  addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  $$(".sheet-h").forEach(h => {
    let y0 = null;
    h.addEventListener("touchstart", e => { y0 = e.touches[0].clientY; }, { passive: true });
    h.addEventListener("touchend", e => { if (y0 !== null && e.changedTouches[0].clientY - y0 > 60) close(); y0 = null; });
  });
  return { open, close, get current() { return current && current.id; } };
})();

/* ==========================================================
   5. ПРОГРАММА ЛОЯЛЬНОСТИ + КАЛЕНДАРЬ ЗАБОТЫ (кабинет)
   ========================================================== */
/* Клуб: баллы, уровни, друзья. Всё хранится и считается на сервере (worker.js + база),
   вход — с подтверждением номера в Telegram. В браузере только копия для быстрого показа. */
const Loyalty = (() => {
  const L = CONFIG.loyalty;
  const API = (CONFIG.aiEndpoint || "").replace(/\/$/, "") + "/api/";
  let me = store.get("me", null), session = store.get("session", null), selected = null, offline = false, off = !CONFIG.aiEndpoint;
  let login = null; // { token, link, bot, timer, then, name }
  try { localStorage.removeItem("dp_loyalty"); } catch {} // старый формат (баллы в браузере) больше не используется

  async function call(path, body) {
    const r = await fetch(API + path, {
      method: body ? "POST" : "GET",
      headers: { "Content-Type": "application/json", ...(session ? { Authorization: "Bearer " + session } : {}) },
      body: body ? JSON.stringify(body) : undefined, keepalive: !!(body && body.keepalive)
    });
    const j = await r.json().catch(() => ({}));
    if (r.status === 401 && session) { session = null; me = null; store.set("session", null); store.set("me", null); render(); }
    if (r.status === 503 && j.error === "club_off") off = true;
    if (!r.ok && !j.status) throw Object.assign(new Error(j.message || "HTTP " + r.status), { data: j });
    return j;
  }
  function setMe(m) {
    me = m; offline = false; store.set("me", m);
    if (selected && !(m.promos || []).some(p => p.kind === selected.kind && (p.id || "") === (selected.id || ""))) selected = null;
    render(); Care.banner(); Cart.fromServer(m.cart); if (Sheets.current === "orderSheet") Order.render();
  }
  async function refresh(quiet) {
    if (!session) return;
    try {
      const m = await call("me");
      if (!m || !m.user) return;
      if (quiet && JSON.stringify(m) === JSON.stringify(me)) return; // ничего не поменялось — не перерисовываем
      setMe(m);
    } catch { if (!quiet) { offline = true; render(); } }
  }

  /* ---------- вход через Telegram ---------- */
  async function startLogin(opts = {}) {
    if (off) { toast("Клуб скоро заработает"); return; }
    if (location.hash !== "#cabinet") { Sheets.close(); location.hash = "#cabinet"; }
    stopLogin();
    login = { then: opts.then, name: opts.name || "", pending: true };
    render();
    try {
      const ref = store.get("referrer", "") || "";
      if (TG.inside) {
        /* внутри Telegram: подпись Telegram + номер через системное окно Telegram, без перехода в бота */
        const r = await call("auth/tg", { initData: TG.initData, name: opts.name || "", ref });
        if (r.status === "ok") { login.pending = false; done(r); return; }
        if (r.status !== "need_contact") throw new Error(r.message || "Не удалось войти");
        Object.assign(login, { token: r.token, link: r.link, bot: r.bot, pending: false, started: Date.now(), tg: true });
        login.timer = setInterval(poll, 2000);
        render();
        const shared = await TG.requestContact();
        if (shared === false) toast("Без номера телефона войти в клуб не получится");
        if (shared === null && login) { login.tg = false; render(); openUrl(r.link); } // старый Telegram без окна «Поделиться номером» — вход через бота, как в браузере
        return;
      }
      const r = await call("auth/start", { name: opts.name || "", ref });
      if (r.error) throw new Error(r.message);
      Object.assign(login, { token: r.token, link: r.link, bot: r.bot, pending: false, started: Date.now() });
      login.timer = setInterval(poll, 2500);
    } catch (e) { login = null; toast(e.message && !/HTTP|fetch/i.test(e.message) ? e.message : "Не удалось начать вход. Проверьте интернет и попробуйте ещё раз"); }
    render();
  }
  function stopLogin() { if (login && login.timer) clearInterval(login.timer); login = null; }
  async function poll() {
    if (!login || !login.token || document.hidden) return;
    if (Date.now() - login.started > 15 * 60e3) { stopLogin(); render(); toast("Время входа истекло. Попробуйте ещё раз"); return; }
    try { const r = await call("auth/check", { token: login.token }); done(r); } catch {}
  }
  async function sendCode(code) {
    if (!login || !login.token) return;
    const r = await call("auth/code", { token: login.token, code }).catch(() => ({ message: "Нет связи, попробуйте ещё раз" }));
    if (!done(r)) toast(r.message || (r.status === "expired" ? "Код устарел, начните вход заново" : "Неверный код"));
    if (r.status === "locked" || r.status === "expired") { stopLogin(); render(); }
  }
  function done(r) {
    if (!r || r.status !== "ok") return false;
    const then = login && login.then; stopLogin();
    session = r.session; store.set("session", session); store.set("noAuto", false);
    const isNew = Date.now() - r.me.user.at < 5 * 60e3 && r.me.history.length <= 2;
    setMe(r.me);
    if (isNew) Track.event("register");
    toast(isNew ? `Добро пожаловать в клуб! +${L.welcome} баллов` : `С возвращением, ${r.me.user.name.split(" ")[0]}!`);
    Care.migrate();
    if (then) setTimeout(then, 600);
    return true;
  }
  document.addEventListener("visibilitychange", () => { if (!document.hidden) { if (login) poll(); else if (session && me) refresh(true); } });

  async function logout() {
    try { await call("logout", {}); } catch {}
    session = null; me = null; selected = null; store.set("session", null); store.set("me", null); store.set("noAuto", true); render(); Care.banner();
    toast("Вы вышли. Баллы сохранены, войти снова можно через Telegram");
  }

  /* ---------- бонусы и заказы (проверяет сервер) ---------- */
  async function bonus(kind) {
    if (!session) return { granted: false };
    try { const r = await call("bonus", { kind }); if (r.me) setMe(r.me); return r; } catch { return { granted: false }; }
  }
  const orderId = () => { const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", b = crypto.getRandomValues(new Uint8Array(8)); return [...b].map(x => a[x % a.length]).join(""); };
  /* заказ регистрируем на сервере в фоне: заявка в мессенджер уходит сразу, номер заказа совпадает */
  function onOrder(o) {
    if (!session || !o.base) return null;
    const id = orderId();
    call("order", { id, base: o.base, points: o.points || 0, promo: o.promo ? { kind: o.promo.kind, id: o.promo.id } : null, items: o.items || "", channel: o.channel || "", keepalive: true })
      .then(r => { if (r.me) setMe(r.me); if (r.notes && r.notes.length) toast("Флорист уточнит скидку и баллы: сервер пересчитал их по правилам клуба"); })
      .catch(() => {});
    if (o.promo) selected = null;
    return id;
  }

  /* ---------- данные для остального сайта ---------- */
  const level = () => (me && me.level) || L.levels[0];
  const nextLevel = () => L.levels.find(l => l.from > ((me && me.spent) || 0));
  const promos = () => (me && me.promos) || [];
  function promo() { const p = promos(); return selected ? p.find(x => x.kind === selected.kind && (x.id || "") === (selected.id || "")) || null : p.find(x => x.kind === "quiz") || null; }
  const refLink = () => me ? `${location.protocol.startsWith("http") ? location.origin + location.pathname : "https://ваш-сайт.ru/"}?ref=${me.user.card}&utm_source=referral&utm_medium=friend` : "";

  /* ---------- кабинет ---------- */
  function render() {
    $("#pillPts").textContent = num(me ? me.balance : 0);
    const root = $("#cabinet"); if (!root) return;
    if (!me) {
      const how = `<ol class="steps-mini"><li>Нажмите кнопку ниже, откроется бот магазина в Telegram</li><li>Поделитесь номером в боте: так мы знаем, что номер ваш</li><li>Вернитесь сюда: вход выполнится сам, или введите код из бота</li></ol>`;
      root.innerHTML = `
        <h2>Клуб ${esc(CONFIG.shop)}</h2>
        <p class="muted" style="margin:8px 0 18px">${L.welcome} баллов за вступление, кэшбэк с каждого заказа и календарь заботы о близких. Баллы хранятся в клубе, а не в телефоне: войдёте с любого устройства, и они на месте.</p>
        <div class="panel glass" id="loginBox">
          ${off ? `<h3>Клуб скоро заработает</h3><p>Регистрация откроется в ближайшее время.</p>` :
          !login ? `
            <h3>Вход и регистрация</h3>${how}
            <div class="fields" style="margin-top:12px">
              <div class="field"><label for="r-name">Как к вам обращаться</label><input id="r-name" autocomplete="given-name" placeholder="Анна" value="${esc(store.get("lastName", ""))}"></div>
              <button class="btn btn-tg block" id="tgLogin" type="button"><svg aria-hidden="true"><use href="#i-tg"/></svg>${TG.inside ? "Войти по номеру Telegram" : "Войти через Telegram"}</button>
            </div>
            <small class="muted" style="display:block;margin-top:10px">Без SMS и паролей. Номер виден только магазину.</small>` :
          login.pending ? `<h3>Готовим вход…</h3><p>Секунду.</p>` : login.tg ? `
            <h3>Подтвердите номер</h3>
            <p>Telegram покажет окно «Поделиться номером» — нажмите «Поделиться». Вход выполнится сам.</p>
            <button class="btn btn-tg block" type="button" id="tgAgain" style="margin-top:12px"><svg aria-hidden="true"><use href="#i-tg"/></svg>Поделиться номером</button>
            <button class="btn btn-line block" type="button" id="loginCancel" style="margin-top:10px">Отмена</button>
            <small class="muted wait-dots" style="display:block;margin-top:10px">Ждём подтверждения</small>` : `
            <h3>Подтвердите номер в Telegram</h3>
            <p>Откройте бота, нажмите «Поделиться номером». Бот пришлёт код, а вход здесь выполнится сам.</p>
            <a class="btn btn-tg block" href="${esc(login.link)}" target="_blank" rel="noopener" style="margin-top:12px"><svg aria-hidden="true"><use href="#i-tg"/></svg>Открыть @${esc(login.bot)}</a>
            <form class="fields" id="codeForm" style="margin-top:14px" novalidate>
              <div class="field"><label for="r-code">Код из Telegram</label><input id="r-code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6 цифр"></div>
              <div class="btn-row"><button class="btn btn-dark" type="submit">Войти</button><button class="btn btn-line" type="button" id="loginCancel">Отмена</button></div>
            </form>
            <small class="muted wait-dots" style="display:block;margin-top:10px">Ждём подтверждения</small>`}
        </div>
        ${Care.panel()}
        ${levelsHtml()}
        ${appPanel()}`;
      const b = $("#tgLogin"); if (b) b.onclick = () => { const n = $("#r-name").value.trim(); store.set("lastName", n); startLogin({ name: n }); };
      const cf = $("#codeForm"); if (cf) cf.onsubmit = e => { e.preventDefault(); const c = $("#r-code").value.replace(/\D/g, ""); if (c.length !== 6) { toast("Код из 6 цифр"); return; } sendCode(c); };
      const rc = $("#r-code"); if (rc) rc.oninput = () => { const c = rc.value.replace(/\D/g, ""); if (c.length === 6) sendCode(c); };
      const lc = $("#loginCancel"); if (lc) lc.onclick = () => { stopLogin(); render(); };
      const ta = $("#tgAgain"); if (ta) ta.onclick = async () => { const sh = await TG.requestContact(); if (sh === null && login) { login.tg = false; render(); openUrl(login.link); } };
    } else {
      const lv = level(), nx = nextLevel(), spent = me.spent || 0;
      const pct = nx ? Math.min(100, (spent - lv.from) / (nx.from - lv.from) * 100) : 100;
      const STG = ["new", "assembling", "delivering", "done"], STN = { new: "Принят", assembling: "Собираем", delivering: "В пути", done: "Доставлен", cancel: "Отменён" };
      const orderRow = o => {
        const stg = o.status === "cancel" ? "cancel" : o.status === "done" ? "done" : (o.stage || "new"), i = STG.indexOf(stg);
        return `<div class="ord">${o.photo && /^https:\/\//.test(o.photo) ? `<a href="${esc(o.photo)}" target="_blank" rel="noopener" aria-label="Фото букета, заказ ${esc(o.id)}"><img class="order-ph" src="${esc(o.photo)}" alt="" loading="lazy"></a>` : ""}<div class="oi"><b>Заказ ${esc(o.id)}</b><small>${new Date(o.at).toLocaleDateString("ru-RU")}, ${rub(o.base - o.discount)}</small>${stg === "cancel" ? `<small style="color:var(--rose)">Отменён</small>` : `<div class="track" aria-hidden="true">${STG.map((_, k) => `<i class="${k <= i ? "on" : ""}"></i>`).join("")}</div><small>${STN[stg]}${o.photo ? " · фото букета готово" : ""}</small>`}</div></div>`;
      };
      root.innerHTML = `
        ${offline ? `<div class="panel glass" style="border-color:var(--rose)"><p style="margin:0">Нет связи с клубом, показаны последние данные.</p></div>` : ""}
        <div class="loy-card">
          <div class="loy-top"><div><b style="font-family:var(--serif);font-size:23px;font-weight:500">${esc(me.user.name)}</b><small style="display:block;color:rgba(246,241,234,.7);font-size:12px">карта ${esc(me.user.card)} · ${esc(me.user.phone)}</small></div><span class="lvl">${lv.name}, ${lv.cashback}%</span></div>
          <div class="bal"><b>${num(me.balance)}</b><small>баллов доступно${me.wait ? `, ещё ${num(me.wait)} ожидают подтверждения` : ""}</small></div>
          <div class="lvl-bar"><i style="width:${pct}%"></i></div>
          <small style="font-size:12px;color:rgba(246,241,234,.7);margin-top:8px;position:relative">${nx ? `До уровня «${nx.name}» (${nx.cashback}%) осталось ${rub(nx.from - spent)} покупок` : "У вас максимальный уровень"}</small>
        </div>
        <div class="kpis">
          <div class="kpi glass"><b>${lv.cashback}%</b><small>кэшбэк баллами</small></div>
          <div class="kpi glass"><b>${me.friends.filter(f => f.status === "ok").length}</b><small>друзей привели</small></div>
          <div class="kpi glass"><b>${L.maxSpendPercent}%</b><small>заказа баллами</small></div>
        </div>
        ${promos().map(p => `<div class="panel glass" style="border-color:var(--sage-deep)"><h3>Скидка ${p.percent}% ${p.kind === "quiz" ? "за подбор букета" : "к дате «" + esc(p.title) + "»"}</h3><p>Применится к заказу автоматически${p.kind === "quiz" ? ", один раз" : ""}.</p></div>`).join("")}
        ${Care.panel()}
        ${me.orders && me.orders.length ? `<div class="panel glass"><h3>Мои заказы</h3>${me.orders.map(orderRow).join("")}<p class="empty">Статусы и фото готового букета приходят и в Telegram-бот. Кэшбэк начисляется после доставки.</p></div>` : ""}
        <div class="panel glass">
          <h3>Приведи друга</h3>
          <p>Друг получит ${L.friendGift} баллов на первый заказ, а вы ${L.friendGift} баллов, когда флорист выполнит его заказ.</p>
          <div class="ref-box"><input id="refLink" readonly value="${esc(refLink())}" aria-label="Ваша ссылка"></div>
          <div class="btn-row"><button class="btn btn-dark btn-sm" id="refShare">Поделиться</button><button class="btn btn-line btn-sm" id="refCopy">Скопировать</button></div>
          ${me.friends.length ? `<ul class="hist">${me.friends.map(f => `<li><span>${esc(f.name)}<small>${new Date(f.at).toLocaleDateString("ru-RU")}</small></span><span class="${f.status === "ok" ? "plus" : "wait"}">${f.status === "ok" ? "+" + L.friendGift : "ожидает заказа"}</span></li>`).join("")}</ul>` : `<p class="empty">Друзья появятся здесь, когда вступят в клуб по вашей ссылке.</p>`}
        </div>
        <div class="panel glass">
          <h3>История баллов</h3>
          <ul class="hist">${me.history.slice(0, 15).map(h => `<li><span>${esc(h.label)}<small>${new Date(h.at).toLocaleDateString("ru-RU")}${h.status === "wait" ? ", ожидает" : h.status === "cancel" ? ", отменено" : ""}</small></span><span class="${h.status !== "ok" ? "wait" : h.amount < 0 ? "minus" : "plus"}"${h.status === "cancel" ? ' style="text-decoration:line-through"' : ""}>${h.amount > 0 ? "+" : ""}${num(h.amount)}</span></li>`).join("")}</ul>
        </div>
        ${levelsHtml(lv)}
        ${appPanel()}
        <button class="btn btn-line block" id="logout" style="margin-top:14px">Выйти из кабинета</button>`;
      $("#refCopy").onclick = async () => { await copyText(refLink()); toast("Ссылка скопирована"); Track.event("ref_share"); };
      $("#refShare").onclick = async () => {
        Track.event("ref_share");
        const data = { title: CONFIG.shop, text: `Дарю ${L.friendGift} баллов на букеты в «${CONFIG.shop}»`, url: refLink() };
        if (navigator.share) { try { await navigator.share(data); } catch {} } else { await copyText(refLink()); toast("Ссылка скопирована, отправьте её другу"); }
      };
      $("#logout").onclick = logout;
      $$(".order-ph", root).forEach(i => i.onerror = () => { const a = i.closest("a"); (a || i).remove(); });
    }
    Care.bind();
    $$(".js-install", root).forEach(b => b.onclick = PWA.install);
    const pt = $("#pushToggle"); if (pt) pt.onchange = () => PWA.togglePush(pt);
  }
  function levelsHtml(cur) {
    return `<div class="panel glass"><h3>Уровни клуба</h3><p>Чем больше покупок, тем выше кэшбэк.</p><div class="levels">${L.levels.map(l => `<div class="level ${cur && cur.name === l.name ? "cur" : ""}"><b>${l.name}</b><span>${l.from ? "от " + rub(l.from) : "сразу"}</span><em>${l.cashback}%</em></div>`).join("")}</div></div>`;
  }
  function appPanel() {
    const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
    const notif = "Notification" in window;
    return `<div class="panel glass"><h3>Приложение</h3>
      ${standalone ? `<p>Вы в приложении ${esc(CONFIG.shop)}.</p>` : `<p>Установите сайт на экран телефона: открывается мгновенно и работает как приложение.</p><button class="btn btn-dark block js-install" style="margin-top:14px">Установить на телефон</button>`}
      ${notif ? `<div class="toggle-row" style="margin-top:8px"><span>Уведомления о заказах и важных датах</span><label class="switch"><input type="checkbox" id="pushToggle" ${Notification.permission === "granted" && store.get("push", false) ? "checked" : ""} aria-label="Уведомления"><i></i></label></div>` : ""}
    </div>`;
  }
  /* ready — промис «вход проверен»: ссылки из бота (корзина, скидка к дате) ждут его, прежде чем что-то открывать */
  let ready = Promise.resolve();
  if (session) setTimeout(refresh, 300);
  /* в мини-приложении участник клуба входит сам, без кода: Telegram подтверждает, кто это */
  else if (TG.inside && !store.get("noAuto", false)) ready = (async () => {
    try { const r = await call("auth/tg", { initData: TG.initData }); if (r.status === "ok" && !session) { session = r.session; store.set("session", session); setMe(r.me); Care.migrate(); } } catch {}
  })();
  return {
    render, refresh, login: startLogin, logout, onOrder, level, bonus, call,
    get ready() { return ready; },
    get me() { return me; },
    /* совместимость с остальным кодом сайта */
    get state() { return { user: me ? { name: me.user.name, phone: me.user.phone, code: me.user.card } : null, balance: me ? me.balance : 0, promo: promo(), flags: (me && me.flags) || {} }; },
    promo,
    selectPromo(p) { selected = p; if (Sheets.current === "orderSheet") Order.render(); },
    maxSpend(total) { return Math.max(0, Math.min(me ? me.balance : 0, Math.floor(total * L.maxSpendPercent / 100))); }
  };
})();

/* Календарь заботы: важные даты, напоминание за 3 дня, скидка */
const Care = (() => {
  const TYPES = { mom:"Маме", love:"Любимой", friend:"Подруге", colleague:"Коллеге", other:"Другое" };
  const SUGGEST = { mom:"tender", love:"nocturne", friend:"sunny", colleague:"poppies", other:"provence", march8:"tulips" };
  /* гость хранит даты в телефоне, участник клуба — на сервере (там же проверяется скидка) */
  let events = store.get("care", []);
  const save = () => { store.set("care", events); Loyalty.render(); banner(); };
  const src = () => Loyalty.me ? Loyalty.me.care || [] : events;
  const L = CONFIG.loyalty;
  async function server(body) {
    try { const r = await Loyalty.call("care", body); if (r.care) { Loyalty.me.care = r.care; Loyalty.refresh(); } return r; }
    catch (e) { toast((e.data && e.data.message) || "Нет связи, попробуйте ещё раз"); return null; }
  }
  /* после входа переносим даты гостя в клуб */
  async function migrate() {
    if (!Loyalty.me || !events.length) return;
    for (const e of events) await server({ add: { title: e.title, date: e.date, who: e.who } });
    events = []; store.set("care", events);
  }
  function nextDate(iso) {
    const [, m, d] = iso.split("-").map(Number); const now = new Date(); now.setHours(0, 0, 0, 0);
    let n = new Date(now.getFullYear(), m - 1, d); if (n < now) n = new Date(now.getFullYear() + 1, m - 1, d);
    return n;
  }
  const daysLeft = iso => Math.round((nextDate(iso) - new Date(new Date().setHours(0, 0, 0, 0))) / 864e5);
  const sorted = () => src().map(e => ({ ...e, left: daysLeft(e.date) })).sort((a, b) => a.left - b.left);
  const offerBtn = e => {
    if (e.left > 3) return "";
    const disc = Loyalty.me && e.discount;
    return `<br><button class="btn btn-dark btn-sm" data-care-order="${e.id}" style="margin-top:6px">${disc ? `Букет со скидкой ${e.discount}%` : "Выбрать букет"}</button>${!disc ? `<small style="display:block;margin-top:4px;color:var(--muted)">${!Loyalty.me ? "Скидка — для участников клуба" : e.used ? "Скидка к этой дате уже использована" : `Скидка действует, если дата добавлена минимум за ${L.careLeadDays} дней`}</small>` : ""}`;
  };
  function panel() {
    const list = sorted();
    return `<div class="panel glass" id="carePanel">
      <h3>Календарь заботы</h3>
      <p>Отметьте важные даты. За 3 дня напомним и предложим готовый букет. Участникам клуба — скидка ${L.careDiscount}%, если дата добавлена заранее, минимум за ${L.careLeadDays} дней.</p>
      ${list.length ? `<div style="margin-top:8px">${list.map(e => `<div class="ev ${e.left <= 3 ? "soon" : ""}"><div class="cd"><div><b>${e.left}</b><small>${plural(e.left, "день", "дня", "дней")}</small></div></div><div class="t"><b>${esc(e.title)}</b>${nextDate(e.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}${offerBtn(e)}</div><button class="x" data-care-del="${e.id}" aria-label="Удалить дату">×</button></div>`).join("")}</div>` : ""}
      <div class="presets">${[["8 Марта","2000-03-08","friend"],["14 февраля","2000-02-14","love"],["ДР мамы","","mom"],["Годовщина","","love"]].map(p => `<button type="button" data-preset="${p[0]}|${p[1]}|${p[2]}">${p[0]}</button>`).join("")}</div>
      <form id="careForm" class="fields" novalidate>
        <div class="field"><label for="c-title">Событие</label><input id="c-title" placeholder="День рождения мамы"></div>
        <div class="two">
          <div class="field"><label for="c-date">Дата</label><input id="c-date" type="date"></div>
          <div class="field"><label for="c-who">Для кого</label><select id="c-who">${Object.entries(TYPES).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></div>
        </div>
        <button class="btn btn-dark block">Добавить дату</button>
      </form>
      ${src().length ? `<div class="btn-row" style="margin-top:10px"><button type="button" class="btn btn-line btn-sm" id="careIcs">В календарь телефона</button><button type="button" class="btn btn-line btn-sm" id="careSms">SMS-напоминания</button></div><p class="hint">«В календарь телефона» поставит напоминание за 3 дня до каждой даты, каждый год.</p>` : ""}
    </div>`;
  }
  function bind() {
    const f = $("#careForm"); if (!f) return;
    f.onsubmit = async e => {
      e.preventDefault();
      const title = $("#c-title").value.trim(), date = $("#c-date").value, who0 = $("#c-who").value;
      if (!title || !date) { toast("Укажите событие и дату"); return; }
      const who = /8 март/i.test(title) ? "march8" : who0;
      if (Loyalty.me) { if (!(await server({ add: { title, date, who } }))) return; }
      else { events.push({ id: Date.now().toString(36), title, date, who }); save(); }
      Track.event("care_add"); toast("Дата сохранена. Напомним за 3 дня");
      if ("Notification" in window && Notification.permission === "default") setTimeout(() => toast("Включите уведомления ниже, чтобы не пропустить дату"), 4000);
    };
    $$("[data-preset]").forEach(b => b.onclick = () => {
      const [t, d, w] = b.dataset.preset.split("|"); $("#c-title").value = t === "ДР мамы" ? "День рождения мамы" : t;
      $("#c-who").value = w; if (d) $("#c-date").value = new Date().getFullYear() + d.slice(4); else $("#c-date").focus();
    });
    $$("[data-care-del]").forEach(b => b.onclick = () => { if (Loyalty.me) server({ del: b.dataset.careDel }); else { events = events.filter(e => e.id !== b.dataset.careDel); save(); } });
    $$("[data-care-order]").forEach(b => b.onclick = () => offer(sorted().find(e => e.id === b.dataset.careOrder)));
    const ics = $("#careIcs"); if (ics) ics.onclick = downloadIcs;
    const sms = $("#careSms"); if (sms) sms.onclick = () => {
      const u = Loyalty.state.user;
      const msg = ["Здравствуйте! Прошу присылать SMS-напоминания за 3 дня до дат:", ...sorted().map(e => `• ${e.title}: ${nextDate(e.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}`), "", u ? `Имя: ${u.name}, телефон: ${u.phone}, карта ${u.code}` : ""].join("\n");
      sendTo("wa", msg);
    };
  }
  function offer(e) {
    if (!e) return;
    const b = BOUQUETS.find(x => x.id === (SUGGEST[e.who] || "provence"));
    if (Loyalty.me && e.discount) Loyalty.selectPromo({ kind: "care", id: e.id });
    else if (!Loyalty.me) setTimeout(() => toast(`Скидка ${L.careDiscount}% — для участников клуба`, { label: "Вступить", fn: () => Loyalty.login() }), 900);
    Track.event("care_offer");
    Order.open(b.id, `${e.title}`);
  }
  function downloadIcs() {
    const pad = n => String(n).padStart(2, "0");
    const url = location.protocol.startsWith("http") ? location.origin + location.pathname + "#cabinet" : "";
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Dom Piona//Care//RU", "CALSCALE:GREGORIAN"];
    src().forEach(e => {
      const d = nextDate(e.date); const ds = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
      lines.push("BEGIN:VEVENT", `UID:${e.id}@dompiona`, `DTSTAMP:${ds}T090000Z`, `DTSTART;VALUE=DATE:${ds}`, "RRULE:FREQ=YEARLY", `SUMMARY:${e.title}`, `DESCRIPTION:Букет со скидкой ${CONFIG.loyalty.careDiscount}% в «${CONFIG.shop}» ${url}`,
        "BEGIN:VALARM", "TRIGGER:-P3D", "ACTION:DISPLAY", `DESCRIPTION:Через 3 дня: ${e.title}. Закажите букет со скидкой`, "END:VALARM", "END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "kalendar-zaboty.ics"; document.body.appendChild(a); a.click(); a.remove();
    toast("Откройте файл, чтобы добавить даты в календарь");
  }
  function banner() {
    const host = $("#careBanner"); if (!host) return;
    const soon = sorted().find(e => e.left <= 3);
    host.innerHTML = soon ? `<div class="care-banner glass rv on"><div class="cd"><div><b>${soon.left}</b><small>${plural(soon.left, "день", "дня", "дней")}</small></div></div><p><b>${esc(soon.title)}</b>${Loyalty.me && soon.discount ? `Готовый букет со скидкой ${soon.discount}%` : "Выберите букет заранее"}</p><button class="btn btn-dark btn-sm" data-care-order="${soon.id}">Выбрать</button></div>` : "";
    const b = $("[data-care-order]", host); if (b) b.onclick = () => offer(soon);
  }
  async function notifyDue() {
    if (!("Notification" in window) || Notification.permission !== "granted" || !store.get("push", false)) return;
    const sent = store.get("careSent", {});
    const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration().catch(() => null) : null;
    sorted().filter(e => e.left <= 3).forEach(e => {
      const key = e.id + nextDate(e.date).getFullYear(); if (sent[key]) return; sent[key] = 1;
      const body = `${e.title} через ${e.left} ${plural(e.left, "день", "дня", "дней")}. Букет со скидкой ${CONFIG.loyalty.careDiscount}% ждёт вас`;
      if (reg) reg.showNotification("Календарь заботы", { body, icon: "icons/icon-192.png", data: { url: "./index.html#cabinet" } }); else try { new Notification("Календарь заботы", { body }); } catch {}
    });
    store.set("careSent", sent);
  }
  function offerById(id) { const e = sorted().find(x => x.id === id); if (e) offer(e); return !!e; }
  return { panel, bind, banner, notifyDue, migrate, offerById };
})();

/* ==========================================================
   6. PWA: установка и уведомления
   ========================================================== */
const PWA = (() => {
  let deferred = null;
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; });
  addEventListener("appinstalled", () => { Track.event("pwa_install"); toast("Приложение установлено"); });
  async function install() {
    if (deferred) { deferred.prompt(); const r = await deferred.userChoice; deferred = null; if (r.outcome === "accepted") Track.event("pwa_install"); return; }
    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) { Sheets.open("iosSheet"); return; }
    if (!location.protocol.startsWith("http")) { toast("Установка заработает, когда сайт будет на хостинге с https"); return; }
    toast("Откройте меню браузера и выберите «Установить приложение»");
  }
  async function togglePush(input) {
    if (!input.checked) { store.set("push", false); toast("Уведомления выключены"); return; }
    const perm = await Notification.requestPermission();
    if (perm !== "granted") { input.checked = false; toast("Разрешите уведомления в настройках браузера"); return; }
    store.set("push", true);
    const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration().catch(() => null) : null;
    const opts = { body: "Сообщим о статусе заказа и напомним о важных датах", icon: "icons/icon-192.png" };
    if (reg) {
      reg.showNotification("Уведомления включены", opts);
      if (CONFIG.vapidPublicKey && reg.pushManager) {
        try {
          const k = CONFIG.vapidPublicKey.replace(/-/g, "+").replace(/_/g, "/"); const pad = "=".repeat((4 - k.length % 4) % 4);
          const key = Uint8Array.from(atob(k + pad), c => c.charCodeAt(0));
          const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key }); store.set("pushSub", sub.toJSON());
        } catch {}
      }
    } else { try { new Notification("Уведомления включены", opts); } catch {} }
    Care.notifyDue();
  }
  return { install, togglePush };
})();

/* ==========================================================
   7. ЗАКАЗ
   ========================================================== */
function validName(i) { const ok = i.value.trim().length >= 2; i.closest(".field").classList.toggle("bad", !ok); return ok; }
function validPhone(i) { const ok = i.value.replace(/\D/g, "").length >= 10; i.closest(".field").classList.toggle("bad", !ok); return ok; }
document.addEventListener("input", e => { const f = e.target.closest && e.target.closest(".field.bad"); if (f) f.classList.remove("bad"); });

/* Корзина: несколько букетов, количество, хранится на устройстве */
const Cart = (() => {
  let items = store.get("cart", []), syncT = 0, synced = "";
  const save = () => { store.set("cart", items); badge(); if (Sheets.current === "orderSheet") Order.render(); sync(); };
  /* участнику клуба корзина сохраняется и на сервере: бот напомнит о ней, а на другом устройстве она восстановится */
  const key = list => JSON.stringify(list.map(i => [i.id, i.qty, i.price]));
  function sync() {
    clearTimeout(syncT);
    syncT = setTimeout(() => {
      if (!Loyalty.me || key(items) === synced) return;
      const k = key(items);
      Loyalty.call("cart", { items: items.map(({ id, name, price, qty }) => ({ id, name, price, qty })) }).then(() => { synced = k; }).catch(() => {});
    }, 1200);
  }
  function fromServer(list) {
    if (!Array.isArray(list)) return;
    if (!items.length && list.length) {
      items = list.map(i => { const b = BOUQUETS.find(x => x.id === i.id); return { id: i.id, name: i.name, price: i.price, qty: i.qty, img: b ? b.img : undefined }; });
      synced = key(items); store.set("cart", items); badge(); return;
    }
    synced = key(list); if (key(items) !== synced) sync();
  }
  function badge() {
    const n = items.reduce((a, i) => a + i.qty, 0), b = $("#cartCount");
    b.textContent = n; b.hidden = !n;
    const btn = $("#cartBtn"); btn.classList.remove("bump"); void btn.offsetWidth; if (n) btn.classList.add("bump");
  }
  function fromBouquet(id) { const b = BOUQUETS.find(x => x.id === id); return b && { id: b.id, name: b.name, price: b.price, img: b.img }; }
  return {
    get items() { return items; },
    add(item, qty = 1) { if (!item) return; const ex = items.find(i => i.id === item.id); if (ex) ex.qty += qty; else items.push({ ...item, qty }); save(); },
    addBouquet(id, qty = 1) { this.add(fromBouquet(id), qty); },
    setQty(id, q) { const it = items.find(i => i.id === id); if (!it) return; it.qty = Math.max(0, Math.min(99, q)); if (!it.qty) items = items.filter(i => i !== it); save(); },
    remove(id) { items = items.filter(i => i.id !== id); save(); },
    clear() { items = []; save(); },
    sum: () => items.reduce((a, i) => a + i.price * i.qty, 0),
    count: () => items.reduce((a, i) => a + i.qty, 0),
    lines: () => items.map(i => `• ${i.name}${i.qty > 1 ? " ×" + i.qty : ""} — ${rub(i.price * i.qty)}`),
    badge, fromServer
  };
})();

const Order = (() => {
  let usePts = false;
  function calc() {
    const ship = $("input[name=ship]:checked").value; const lp = Loyalty.state;
    const promo = lp.promo || null;
    const base = Cart.sum(), disc = promo ? Math.round(base * promo.percent / 100) : 0, time = $("#o-time").value;
    let deliv = 0; if (ship === "delivery" && base) deliv = base - disc >= CONFIG.delivery.freeFrom ? 0 : (time ? CONFIG.delivery.onTime : CONFIG.delivery.price);
    const max = Loyalty.maxSpend(base - disc), pts = usePts ? max : 0;
    const g = Gift.applied, due = base - disc - pts + deliv, gift = g && base ? Math.min(g.balance, due) : 0;
    return { ship, base, disc, deliv, pts, max, total: due - gift, promo, time, gift, giftCode: g ? g.code : "" };
  }
  function renderCart() {
    const box = $("#cartList"), it = Cart.items;
    box.innerHTML = it.length ? it.map(i => `
      <div class="cart-row">
        ${i.img ? `<img src="${IMG(i.img, 160)}" alt="">` : `<span class="cart-3d">3D</span>`}
        <div class="cart-info"><b>${esc(i.name)}</b><span>${rub(i.price)}${i.qty > 1 ? ` × ${i.qty} = ${rub(i.price * i.qty)}` : ""}</span></div>
        <div class="qty"><button type="button" data-q="${esc(i.id)}" data-d="-1" aria-label="Меньше">−</button><output>${i.qty}</output><button type="button" data-q="${esc(i.id)}" data-d="1" aria-label="Больше">+</button></div>
      </div>`).join("") : `<p class="cart-empty">Корзина пока пуста. Добавьте букет из каталога или соберите свой в 3D. Можно отправить заявку и без букета: флорист подберёт его в переписке.</p>`;
    $$("[data-q]", box).forEach(b => b.onclick = () => { const x = Cart.items.find(i => i.id === b.dataset.q); if (x) Cart.setQty(x.id, x.qty + +b.dataset.d); });
    $("#orderTitle").textContent = it.length ? `Корзина · ${Cart.count()} ${plural(Cart.count(), "букет", "букета", "букетов")}` : "Корзина";
  }
  function render() {
    renderCart();
    const c = calc(), lp = Loyalty.state;
    $("#o-addr-f").style.display = c.ship === "delivery" ? "" : "none";
    const box = $("#ptsBox");
    if (!lp.user) box.innerHTML = `<div class="toggle-row" style="min-height:auto"><span>Получите ${CONFIG.loyalty.welcome} баллов и кэшбэк с этого заказа</span><button type="button" class="btn btn-dark btn-sm" id="quickReg">Вступить</button></div><small>Вход через Telegram за полминуты, корзина сохранится</small>`;
    else if (c.max > 0 && c.base) box.innerHTML = `<div class="toggle-row" style="min-height:auto"><span>Списать <b>${num(c.max)}</b> баллов</span><label class="switch"><input type="checkbox" id="usePts" ${usePts ? "checked" : ""} aria-label="Списать баллы"><i></i></label></div><small>Баланс ${num(lp.balance)}, можно оплатить до ${CONFIG.loyalty.maxSpendPercent}% заказа</small>`;
    else box.innerHTML = `<small style="margin:0">Баланс ${num(lp.balance)} баллов. С этого заказа вернётся ${Loyalty.level().cashback}% баллами.</small>`;
    const up = $("#usePts"); if (up) up.onchange = () => { usePts = up.checked; render(); };
    const qr = $("#quickReg"); if (qr) qr.onclick = () => Loyalty.login({ name: $("#o-name").value.trim(), then: () => Order.open() });
    $("#orderSum").innerHTML = c.base ? `
      <div><span>Букеты (${Cart.count()})</span><span>${rub(c.base)}</span></div>
      ${c.disc ? `<div class="disc"><span>Скидка ${c.promo.percent}% (${esc(c.promo.code)})</span><span>−${rub(c.disc)}</span></div>` : ""}
      ${c.pts ? `<div class="disc"><span>Баллами</span><span>−${rub(c.pts)}</span></div>` : ""}
      ${c.ship === "delivery" ? `<div><span>Доставка${c.time ? " ко времени" : ""}</span><span>${c.deliv ? rub(c.deliv) : "бесплатно"}</span></div>` : ""}
      ${c.gift ? `<div class="disc"><span>Сертификат</span><span>−${rub(c.gift)}</span></div>` : ""}
      <div class="tot"><span>Итого</span><b>${rub(c.total)}</b></div>` : `<div><span>Флорист рассчитает стоимость в переписке</span></div>`;
  }
  /* open(id) — добавить букет из каталога и открыть корзину; open() — просто открыть */
  function open(id, note) {
    if (id) Cart.addBouquet(id);
    const u = Loyalty.state.user; if (u) { if (!$("#o-name").value) $("#o-name").value = u.name; if (!$("#o-phone").value) $("#o-phone").value = u.phone; }
    if (note && !$("#o-note").value) $("#o-note").dataset.event = note;
    usePts = false; Gift.fill(); render(); Sheets.open("orderSheet"); Track.event("order_open");
  }
  $("#orderForm").addEventListener("change", render);
  $("#o-date").min = todayISO();
  $("#openCard").onclick = () => CardGen.open();
  $("#addMore").onclick = () => { Sheets.close(); location.hash = "#catalog"; toast("Выберите ещё букет: плюс на карточке добавит его в корзину"); };
  $$("[data-send]").forEach(b => b.addEventListener("click", () => {
    const n = $("#o-name"), p = $("#o-phone");
    if (!validName(n) | !validPhone(p)) { toast("Проверьте имя и телефон"); (n.closest(".field").classList.contains("bad") ? n : p).focus(); return; }
    const c = calc(), f = Object.fromEntries(new FormData($("#orderForm"))), lp = Loyalty.state, ref = lp.user ? null : store.get("referrer", null);
    /* участник клуба: заказ регистрируется на сервере, он сам проверит скидку и баллы и пришлёт флористу в Telegram */
    const orderNo = lp.user && c.base ? Loyalty.onOrder({ base: c.base, points: c.pts, promo: c.promo, items: Cart.lines().join("\n"), channel: b.dataset.send }) : null;
    const date = f.date ? new Date(f.date + "T12:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long" }) : "";
    const ev = $("#o-note").dataset.event;
    const lines = [
      `Здравствуйте! Заказ с сайта «${CONFIG.shop}».`, "",
      ...(Cart.items.length ? ["Букеты:", ...Cart.lines()] : ["Букет: нужна консультация флориста"]),
      ev && `Повод из календаря заботы: ${ev}`,
      (() => { const off = Cart.items.filter(i => Shop.missing(BOUQUETS.find(b => b.id === i.id)).length).map(i => i.name); return off.length ? `Под заказ, сейчас не всё в наличии: ${off.join(", ")}` : ""; })(),
      c.disc && `Скидка ${c.promo.percent}% по коду ${c.promo.code}: −${rub(c.disc)}`,
      c.pts && `Списать баллов: ${c.pts} (карта ${lp.user.code})`,
      orderNo && `Номер заказа в клубе: ${orderNo}`,
      c.giftCode && (c.gift ? `Оплата сертификатом ${c.giftCode}: −${rub(c.gift)} (флористу: /gift ${c.giftCode} ${c.gift})` : `Есть сертификат ${c.giftCode} (баланс ${rub(Gift.applied.balance)})`),
      c.ship === "delivery" ? `Доставка: ${f.address || "адрес уточним"}${c.base ? ", " + (c.deliv ? rub(c.deliv) : "бесплатно") : ""}` : "Самовывоз",
      `Когда: ${date || "сегодня"}, ${c.time || "как можно скорее"}`,
      f.note.trim() && `Текст открытки: ${f.note.trim()}`,
      c.base && `Итого к оплате: ${rub(c.total)}`, "",
      `Имя: ${n.value.trim()}`, `Телефон: ${p.value.trim()}`,
      lp.user && `Карта клуба: ${lp.user.code}, уровень ${Loyalty.level().name}`,
      ref && `Пригласил друг: ${ref}`
    ].filter(x => x !== false && x !== null && x !== undefined && x !== 0 && x !== "");
    const msg = lines.join("\n").replace(/\n{3,}/g, "\n\n").replace("Букеты:", "\nБукеты:") + "\n" + Track.report();
    Track.purchase(c.total, Cart.items.map(i => i.name).join(", ") || "Консультация");
    if (orderNo) { const cb = Math.round((c.base - c.disc - c.pts) * Loyalty.level().cashback / 100); if (cb > 0) setTimeout(() => toast(`+${cb} баллов кэшбэка появятся, когда флорист выполнит заказ`), 4200); }
    delete $("#o-note").dataset.event;
    sendTo(b.dataset.send, msg); Sheets.close(); Cart.clear(); Gift.clear();
  }));
  return { open, render };
})();
$("#cartBtn").onclick = () => Order.open();
Cart.badge();

/* Подарочные сертификаты. Покупка — заявка флористу (он связывается и принимает оплату, затем активирует сертификат в боте).
   Получатель открывает ссылку ?gift=КОД, видит открытку и баланс, а код вводит при заказе. Списывает сумму флорист: /gift КОД сумма */
const Gift = (() => {
  const SUMS = [3000, 5000, 10000];
  let applied = store.get("gift", null); // { code, balance }
  const norm = v => String(v || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16);
  const card = (sum, to, from) => `<div class="gcard"><span class="gc-logo">${esc(CONFIG.shop)}</span><span class="gc-sum">${sum ? rub(sum) : "— ₽"}</span><span class="gc-k">Подарочный сертификат</span>${to || from ? `<span class="gc-to">${to ? "Кому: " + esc(to) : ""}${to && from ? " · " : ""}${from ? "От: " + esc(from) : ""}</span>` : ""}</div>`;
  async function api(path, body) { try { return await Loyalty.call(path, body); } catch (e) { return (e && e.data && e.data.error) ? e.data : { error: "net", message: "Нет связи. Попробуйте ещё раз или напишите флористу" }; } }

  function buy() {
    let amount = 5000;
    const u = Loyalty.state.user;
    $("#giftTitle").textContent = "Подарочный сертификат";
    $("#giftBody").innerHTML = `
      <div id="gPrev"></div>
      <div class="fields" style="margin-top:16px">
        <div class="field"><label>Сумма</label><div class="gift-sums" role="group" aria-label="Сумма сертификата">${SUMS.map(v => `<button type="button" class="chip" data-sum="${v}" aria-pressed="${v === amount}">${num(v)}</button>`).join("")}<button type="button" class="chip" data-sum="" aria-pressed="false">Другая</button></div></div>
        <div class="field" id="gOwnF" hidden><label for="gOwn">Своя сумма, ₽</label><input id="gOwn" type="number" inputmode="numeric" min="1000" max="50000" step="500" placeholder="от 1 000 до 50 000"></div>
        <div class="two">
          <div class="field"><label for="gTo">Кому</label><input id="gTo" maxlength="40" placeholder="Маме"></div>
          <div class="field"><label for="gFrom">От кого</label><input id="gFrom" maxlength="40" placeholder="Аня"></div>
        </div>
        <div class="field"><label for="gNote">Пожелание</label><textarea id="gNote" maxlength="160" placeholder="Пусть дома всегда будут цветы"></textarea></div>
        <div class="two">
          <div class="field"><label for="gName">Ваше имя</label><input id="gName" autocomplete="name" value="${esc(u ? u.name : "")}"><span class="err">Укажите имя</span></div>
          <div class="field"><label for="gPhone">Телефон</label><input id="gPhone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7" value="${esc(u ? u.phone : "")}"><span class="err">Нужно 10+ цифр</span></div>
        </div>
        <button type="button" class="btn btn-dark block" id="gSend">Оформить сертификат</button>
        <p class="hint" style="margin:0">Флорист свяжется с вами для оплаты. После оплаты придёт ссылка на сертификат — её можно переслать. Действует 12 месяцев, тратится частями.</p>
      </div>`;
    const own = $("#gOwn"), prev = () => $("#gPrev").innerHTML = card(amount, $("#gTo").value.trim(), $("#gFrom").value.trim());
    $$("[data-sum]").forEach(b => b.onclick = () => {
      $$("[data-sum]").forEach(x => x.setAttribute("aria-pressed", x === b));
      $("#gOwnF").hidden = !!b.dataset.sum;
      amount = b.dataset.sum ? +b.dataset.sum : (+own.value || 0);
      if (!b.dataset.sum) own.focus();
      prev();
    });
    own.oninput = () => { amount = +own.value || 0; prev(); };
    ["#gTo", "#gFrom"].forEach(id => $(id).oninput = prev);
    $("#gSend").onclick = async () => {
      const n = $("#gName"), p = $("#gPhone");
      if (!(amount >= 1000 && amount <= 50000)) { toast("Сумма сертификата — от 1 000 до 50 000 ₽"); $("#gOwnF").hidden = false; own.focus(); return; }
      if (!validName(n) | !validPhone(p)) { toast("Проверьте имя и телефон"); return; }
      const btn = $("#gSend"); btn.disabled = true; btn.textContent = "Отправляем…";
      const d = { amount, to: $("#gTo").value.trim(), from: $("#gFrom").value.trim(), note: $("#gNote").value.trim(), name: n.value.trim(), phone: p.value.trim() };
      const r = await api("gift/request", d);
      btn.disabled = false; btn.textContent = "Оформить сертификат";
      if (r.error && r.error !== "net" && r.error !== "club_off") { toast(r.message || "Не получилось, попробуйте ещё раз"); return; }
      done(d, r.ref || "");
      Track.event("gift_request", { value: amount });
    };
    prev();
  }
  function done(d, ref) {
    const msg = [`Здравствуйте! Хочу подарочный сертификат «${CONFIG.shop}».`, ref && `Заявка ${ref}`, `Сумма: ${rub(d.amount)}`, d.to && `Кому: ${d.to}`, d.from && `От кого: ${d.from}`, d.note && `Пожелание: ${d.note}`, "", `Имя: ${d.name}`, `Телефон: ${d.phone}`].filter(Boolean).join("\n");
    $("#giftBody").innerHTML = `
      ${card(d.amount, d.to, d.from)}
      <div class="panel glass" style="margin-top:16px">
        <h3>${ref ? `Заявка ${esc(ref)} принята` : "Почти готово"}</h3>
        <p>${ref ? "Флорист уже получил её и скоро свяжется для оплаты. Чтобы быстрее — напишите сами:" : "Отправьте заявку флористу, он подскажет, как оплатить:"}</p>
        <div class="btn-row" style="margin-top:12px">
          <button class="btn btn-wa" type="button" data-gsend="wa"><svg class="ic-msg" aria-hidden="true"><use href="#i-wa"/></svg>WhatsApp</button>
          <button class="btn btn-tg" type="button" data-gsend="tg"><svg class="ic-msg" aria-hidden="true"><use href="#i-tg"/></svg>Telegram</button>
        </div>
      </div>`;
    $$("[data-gsend]").forEach(b => b.onclick = () => sendTo(b.dataset.gsend, msg));
  }

  async function view(raw) {
    const code = norm(raw); if (!code) return;
    $("#giftTitle").textContent = "Вам подарок";
    $("#giftBody").innerHTML = `<p class="muted">Открываем сертификат…</p>`; Sheets.open("giftSheet");
    const g = await api("gift/view", { code });
    if (g.error || !g.code) { $("#giftBody").innerHTML = `<div class="panel glass"><h3>Сертификат не найден</h3><p>${esc(g.message || "Проверьте ссылку")}. Если его только что купили, флорист активирует его после оплаты.</p></div>`; return; }
    const exp = g.expires ? new Date(g.expires).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }).replace(/\s*г\.$/, "") : "";
    const live = g.status === "active" && g.balance > 0;
    if (live) { applied = { code: g.code, balance: g.balance }; store.set("gift", applied); }
    const link = location.origin + location.pathname + "?gift=" + g.code;
    $("#giftBody").innerHTML = `
      ${card(g.amount, g.to, g.from)}
      ${g.note ? `<p style="font-family:var(--serif);font-size:20px;line-height:1.3;margin:18px 2px 0">«${esc(g.note)}»</p>` : ""}
      <div class="fields" style="margin-top:16px">
        <div class="gift-code"><span>Код <b>${esc(g.code)}</b></span><button type="button" class="btn btn-line btn-sm" id="gCopy">Скопировать</button></div>
        <p class="hint" style="margin:0">${live ? `Остаток <b>${rub(g.balance)}</b>${g.balance < g.amount ? ` из ${rub(g.amount)}` : ""}${exp ? `, действует до ${exp}` : ""}. Код уже подставлен в корзину — просто выберите букет.` : g.status === "expired" ? "Срок действия сертификата закончился." : "Сертификат полностью использован."}</p>
        ${live ? `<button type="button" class="btn btn-dark block" id="gPick">Выбрать букет</button>` : ""}
        <button type="button" class="btn btn-line block" id="gShare">Переслать сертификат</button>
      </div>`;
    $("#gCopy").onclick = async () => toast(await copyText(g.code) ? "Код скопирован" : g.code);
    const pick = $("#gPick"); if (pick) pick.onclick = () => { Sheets.close(); location.hash = "#catalog"; toast("Выберите букет — сертификат применится в корзине"); };
    $("#gShare").onclick = async () => {
      const text = `Подарочный сертификат «${CONFIG.shop}» на ${rub(g.amount)}`;
      if (navigator.share) { try { await navigator.share({ title: text, text, url: link }); return; } catch (e) { if (e && e.name === "AbortError") return; } }
      toast(await copyText(link) ? "Ссылка скопирована" : link);
    };
    Track.event("gift_view");
  }

  /* поле в корзине */
  const msgEl = () => $("#giftMsg");
  function showApplied() {
    const m = msgEl(); if (!m) return;
    m.className = "gift-msg" + (applied ? " ok" : ""); m.textContent = applied ? `Сертификат применён: доступно ${rub(applied.balance)}` : "";
    $("#giftApply").textContent = applied ? "Убрать" : "Применить";
  }
  async function apply() {
    if (applied) { clear(); $("#o-gift").value = ""; Order.render(); return; }
    const code = norm($("#o-gift").value), m = msgEl();
    if (code.length < 6) { m.className = "gift-msg bad"; m.textContent = "Введите код с сертификата"; return; }
    m.className = "gift-msg"; m.textContent = "Проверяем…";
    const g = await api("gift/view", { code });
    if (g.error || !g.code) { m.className = "gift-msg bad"; m.textContent = g.message || "Сертификат не найден"; return; }
    if (g.status !== "active" || g.balance <= 0) { m.className = "gift-msg bad"; m.textContent = g.status === "expired" ? "Срок действия сертификата закончился" : "На сертификате не осталось средств"; return; }
    applied = { code: g.code, balance: g.balance }; store.set("gift", applied);
    $("#o-gift").value = g.code; showApplied(); Order.render();
  }
  function fill() { const i = $("#o-gift"); if (i) i.value = applied ? applied.code : ""; showApplied(); }
  function clear() { applied = null; store.set("gift", null); showApplied(); }
  $("#giftApply").onclick = apply;
  $("#o-gift").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); apply(); } });
  $("#giftOpen").onclick = () => { buy(); Sheets.open("giftSheet"); Track.event("gift_open"); };
  return { buy, view, fill, clear, get applied() { return applied; } };
})();

/* ==========================================================
   8. КАТАЛОГ, НАЛИЧИЕ, ОТЗЫВЫ, ИЗБРАННОЕ И «НАМЕКНУТЬ»
   ========================================================== */
/* Наличие и отзывы — открытые данные с сервера. Флорист отмечает в боте (/stock), каких цветов нет,
   и букеты с ними помечаются «под заказ». Отзывы — только от покупателей с выполненным заказом, после проверки флористом. */
const Shop = (() => {
  const FLOWER_STOCK = { rose_pink: "rose", rose_white: "rose", rose_dark: "rose", rose_peach: "rose", peony: "peony", hydrangea: "hydrangea", eucalyptus: "eucalyptus", poppy: "poppy", lisianthus: "lisianthus", gypsophila: "gypsophila", tulip: "tulip", ranunculus: "ranunculus", delphinium: "delphinium", garden: "garden" };
  const F3D = { rose: "rose", peony: "peony", tulip: "tulip", hydr: "hydrangea", euc: "eucalyptus", gyps: "gypsophila" };
  let out = store.get("stockOut", []), reviews = [], rating = null, warned = {};
  const missing = b => b && b.flowers ? [...new Set(b.flowers.map(f => FLOWER_STOCK[f]).filter(k => k && out.includes(k)))] : [];
  const out3d = k => out.includes(F3D[k]);
  async function load() {
    if (!CONFIG.aiEndpoint) return;
    try {
      const r = await fetch(CONFIG.aiEndpoint.replace(/\/$/, "") + "/api/public", { cache: "no-store" });
      if (!r.ok) return;
      const j = await r.json();
      const changed = JSON.stringify(j.out || []) !== JSON.stringify(out);
      out = Array.isArray(j.out) ? j.out : []; reviews = Array.isArray(j.reviews) ? j.reviews : []; rating = j.rating || null;
      store.set("stockOut", out);
      if (changed) { renderCatalog(); Builder.markStock(); }
      renderReviews();
    } catch {}
  }
  function renderReviews() {
    const sec = $("#reviewsSec"); if (!sec) return;
    sec.hidden = !reviews.length; if (!reviews.length) return;
    $("#revAvg").textContent = rating ? `★ ${String(rating.avg).replace(".", ",")} · ${rating.count} ${plural(rating.count, "отзыв", "отзыва", "отзывов")}` : "";
    $("#reviews").innerHTML = reviews.map(r => `<article class="rev glass">${r.photo && /^https:\/\//.test(r.photo) ? `<img src="${esc(r.photo)}" alt="Фото букета от покупателя" loading="lazy" decoding="async">` : ""}<div class="st" role="img" aria-label="Оценка ${+r.rating} из 5">${"★".repeat(+r.rating)}${"☆".repeat(5 - +r.rating)}</div>${r.text ? `<p>${esc(r.text)}</p>` : ""}<small>${esc(r.name)}, ${new Date(r.at).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</small></article>`).join("");
    $$("#reviews img").forEach(i => i.onerror = () => i.remove());
  }
  function warn3d(k) { if (!out3d(k) || warned[k]) return; warned[k] = 1; toast(`${FLOWERS3D[k].name} сейчас под заказ: привезём за 1–2 дня или флорист предложит замену`); }
  return { load, missing, out3d, warn3d, get out() { return out; } };
})();

/* Избранное и «Намекнуть»: ссылка с выбранными букетами, которую можно отправить близкому человеку */
const Fav = (() => {
  const known = id => BOUQUETS.some(b => b.id === id);
  let ids = store.get("fav", []).filter(known);
  const has = id => ids.includes(id);
  function bar() { const b = $("#favBar"); if (!b) return; b.hidden = !ids.length; $("#favCount").textContent = ids.length; }
  function toggle(id) {
    if (!known(id)) return;
    ids = has(id) ? ids.filter(x => x !== id) : [...ids, id].slice(-12);
    store.set("fav", ids); bar();
    $$(`[data-fav="${id}"]`).forEach(b => b.setAttribute("aria-pressed", has(id)));
    if (has(id)) { Track.event("fav_add", { item: id }); toast("Добавлено в избранное", { label: "Намекнуть", fn: openShare }); }
    if (Sheets.current === "hintSheet" && mode === "send") openShare();
  }
  const base = () => location.protocol.startsWith("http") ? location.origin + location.pathname : "https://ваш-сайт.ru/";
  function link(name, note) {
    const enc = v => encodeURIComponent(v).replace(/%20/g, "+");
    return `${base()}?hint=${ids.join(",")}${name ? "&from=" + enc(name) : ""}${note ? "&note=" + enc(note) : ""}`;
  }
  const item = (b, rm) => `<div class="hint-item glass"><img src="${IMG(b.img, 280)}" alt="" loading="lazy"><b>${esc(b.name)}</b><div class="row"><span>${rub(b.price)}</span>${rm ? `<button class="unfav" data-unfav="${b.id}" type="button" aria-label="Убрать «${esc(b.name)}» из избранного">×</button>` : `<button class="add" data-order="${b.id}" aria-label="В корзину «${esc(b.name)}»"><svg aria-hidden="true"><use href="#i-plus"/></svg></button>`}</div>${Shop.missing(b).length ? `<small class="muted" style="padding:0 4px">под заказ, 1–2 дня</small>` : ""}</div>`;
  let mode = "send";
  function openShare() {
    mode = "send";
    $("#hintTitle").textContent = "Намекнуть";
    const list = ids.map(id => BOUQUETS.find(b => b.id === id)).filter(Boolean);
    const myName = (Loyalty.me && Loyalty.me.user.name.split(" ")[0]) || store.get("lastName", "");
    $("#hintBody").innerHTML = !list.length ? `<p class="muted" style="margin-top:8px">Отметьте сердечком букеты, которые вам нравятся, — и отправьте подсказку тому, кто захочет вас порадовать.</p><a class="btn btn-dark block" href="#catalog" style="margin-top:14px" data-close-hint>Перейти в каталог</a>` : `
      <p class="muted" style="margin-top:4px">Отправьте ссылку близкому человеку: он увидит эти букеты и сможет заказать любой в пару нажатий. Вы сами ничего не платите.</p>
      <div class="hint-list">${list.map(b => item(b, true)).join("")}</div>
      <div class="fields">
        <div class="field"><label for="h-name">Ваше имя</label><input id="h-name" maxlength="40" autocomplete="given-name" placeholder="Анна" value="${esc(myName)}"></div>
        <div class="field"><label for="h-note">Подсказка (необязательно)</label><input id="h-note" maxlength="120" placeholder="Скоро мой день рождения 😉"></div>
        <button class="btn btn-dark block" id="hintSend" type="button">Отправить намёк</button>
        <button class="btn btn-line block" id="hintCopy" type="button">Скопировать ссылку</button>
      </div>`;
    $$("[data-unfav]", $("#hintBody")).forEach(b => b.onclick = () => toggle(b.dataset.unfav));
    const cl = $("[data-close-hint]"); if (cl) cl.onclick = () => Sheets.close();
    const get = () => link($("#h-name").value.trim(), $("#h-note").value.trim());
    const hs = $("#hintSend"); if (hs) hs.onclick = async () => {
      const url = get(), name = $("#h-name").value.trim(); Track.event("hint_share");
      const data = { title: CONFIG.shop, text: `${name ? name + " намекает" : "Намёк"}: вот букеты, которые очень нравятся 💐`, url };
      if (navigator.share) { try { await navigator.share(data); return; } catch (e) { if (e && e.name === "AbortError") return; } }
      toast(await copyText(url) ? "Ссылка скопирована — отправьте её в мессенджере" : "Не удалось скопировать ссылку");
    };
    const hc = $("#hintCopy"); if (hc) hc.onclick = async () => { Track.event("hint_share"); toast(await copyText(get()) ? "Ссылка скопирована" : "Не удалось скопировать ссылку"); };
    if (Sheets.current !== "hintSheet") Sheets.open("hintSheet");
  }
  function openReceived(list, from, note) {
    mode = "receive"; Track.event("hint_open");
    const bs = list.map(id => BOUQUETS.find(b => b.id === id)).filter(Boolean); if (!bs.length) return;
    $("#hintTitle").textContent = `${from ? from + " намекает" : "Вам намекают"} 💐`;
    $("#hintBody").innerHTML = `
      <p class="muted" style="margin-top:4px">${bs.length > 1 ? "Вот букеты, которые очень нравятся." : "Вот букет, который очень нравится."} Остаётся выбрать и порадовать.</p>
      ${note ? `<p style="margin:12px 0 0;padding:12px 14px;border-radius:16px;background:var(--blush);font-size:15px">«${esc(note)}»</p>` : ""}
      <div class="hint-list">${bs.map(b => item(b, false)).join("")}</div>
      <button class="btn btn-dark block" id="hintCart" type="button">Перейти в корзину</button>
      <p class="muted" style="font-size:13px;margin-top:10px">Плюс добавляет букет в корзину. Получатель не увидит, что вы заказали, пока курьер не позвонит в дверь.</p>`;
    $("#hintCart").onclick = () => { Sheets.close(); setTimeout(() => Order.open(), 350); };
    Sheets.open("hintSheet");
  }
  return { has, toggle, bar, openShare, openReceived };
})();

const cardHtml = b => {
  const miss = Shop.missing(b);
  return `
  <article class="card glass" data-cats="${b.cats.join(" ")}">
    <div class="ph"><img src="${IMG(b.img)}" alt="Букет «${esc(b.name)}»" loading="lazy" decoding="async" width="480" height="600">${b.tag ? `<span class="tag">${b.tag}</span>` : ""}<button class="b3d" data-3d="${b.id}" aria-label="Открыть «${esc(b.name)}» в 3D">3D</button><button class="fav" type="button" data-fav="${b.id}" aria-pressed="${Fav.has(b.id)}" aria-label="В избранное: «${esc(b.name)}»"><svg aria-hidden="true"><use href="#i-heart"/></svg></button>${miss.length ? `<span class="stock-off">Под заказ · 1–2 дня</span>` : ""}</div>
    <div class="body"><h3>${esc(b.name)}</h3><p>${esc(b.desc)}</p>
    <div class="row"><span class="price">${rub(b.price)}</span><button class="add" data-order="${b.id}" aria-label="Заказать «${esc(b.name)}»"><svg aria-hidden="true"><use href="#i-plus"/></svg></button></div></div>
  </article>`;
};
function applyFilter(f) { $$("#grid .card").forEach(c => c.hidden = !(f === "all" || c.dataset.cats.split(" ").includes(f))); }
function renderCatalog() {
  $("#grid").innerHTML = BOUQUETS.map(cardHtml).join("");
  $("#hits").innerHTML = BOUQUETS.slice(0, 5).map(cardHtml).join("");
  const cur = $(".chip[aria-pressed='true']"); applyFilter(cur ? cur.dataset.f : "all");
}
renderCatalog(); Fav.bar();
$$(".chip").forEach(ch => ch.onclick = () => {
  $$(".chip").forEach(c => c.setAttribute("aria-pressed", c === ch));
  applyFilter(ch.dataset.f);
});
$("#hintOpen").onclick = () => Fav.openShare();
document.addEventListener("click", e => {
  const fv = e.target.closest("[data-fav]"); if (fv) { Fav.toggle(fv.dataset.fav); return; }
  const o = e.target.closest("[data-order]"); if (o) {
    Track.event("add_bouquet", { item: o.dataset.order }); Cart.addBouquet(o.dataset.order);
    o.classList.remove("added"); void o.offsetWidth; o.classList.add("added");
    const b = BOUQUETS.find(x => x.id === o.dataset.order);
    toast(`«${b.name}» в корзине`, { label: "Оформить", fn: () => Order.open() }); return;
  }
  const d = e.target.closest("[data-3d]"); if (d) { Track.event("open_3d"); Builder.loadBouquet(d.dataset["3d"]); }
});
const gal = GALLERY.map(id => `<img src="${IMG(id, 360)}" alt="" loading="lazy" decoding="async">`).join("");
$("#strip").innerHTML = gal + gal;

/* ==========================================================
   9. 3D-КОНСТРУКТОР И ПРИМЕРКА В КОМНАТЕ (AR)
   ========================================================== */
const Builder = (() => {
  let api = null, loading = null, items = [], base = "paper", color = PALETTE3D[0].c, pendingRecipe = null, fromBouquet = null;
  let loadMsg = "", masterAsked = false;
  const hint = () => { const h = $("#stageHint"); h.textContent = loadMsg || "Перетащите цветок сюда"; h.style.opacity = loadMsg || !items.length ? 1 : 0; };
  const stage = $("#stage");
  $("#tray").innerHTML = Object.entries(FLOWERS3D).map(([k, f]) => `<button class="fl glass" data-fl="${k}" aria-label="Добавить: ${f.name}, ${f.price} ₽"><span class="fi" style="color:${f.colored ? color : f.tint}"><svg aria-hidden="true"><use href="#${f.icon}"/></svg></span><b>${f.name}</b><small>${f.price} ₽</small></button>`).join("");
  $("#palette").innerHTML = PALETTE3D.map((p, i) => `<div class="sw"><input type="radio" name="pc" id="pc${i}" value="${p.c}" ${i ? "" : "checked"}><label for="pc${i}"><i style="background:${p.c}"></i>${p.n}</label></div>`).join("");
  $("#bases").innerHTML = Object.entries(BASES3D).map(([k, b]) => `<input type="radio" name="bb" id="bb-${k}" value="${k}" ${k === base ? "checked" : ""}><label for="bb-${k}">${b.name}<small>${b.note}</small></label>`).join("");
  $("#palette").onchange = e => { color = e.target.value; $$(".fl").forEach(f => { const t = FLOWERS3D[f.dataset.fl]; if (t.colored) f.querySelector(".fi").style.color = color; }); };
  $("#bases").onchange = e => { base = e.target.value; if (api) api.setBase(base); else update(); };

  async function ensure() {
    if (api) return api; if (loading) return loading;
    loading = (async () => {
      try {
        if (!window.createBuilder3D) await new Promise((res, rej) => { addEventListener("builder3d-ready", res, { once: true }); setTimeout(() => rej(new Error("no module")), 8000); });
        api = await window.createBuilder3D(stage, { onChange: (list, b) => { items = list; base = b; update(); }, onStatus: s => { loadMsg = s; hint(); } });
        $("#stageLoad").remove(); api.setBase(base);
        if (pendingRecipe) { api.load(pendingRecipe); pendingRecipe = null; }
      } catch (err) {
        $("#stageLoad").innerHTML = `<div>3D не запустился на этом устройстве.<br>Можно собирать букет кнопками ниже, цена посчитается.</div>`;
        api = fallbackApi();
      }
      return api;
    })();
    return loading;
  }
  function fallbackApi() {
    return {
      add(t, c) { items.push({ type: t, color: c }); update(); Shop.warn3d(t); }, undo() { items.pop(); update(); }, clear() { items = []; update(); },
      removeLast(t, c) { for (let i = items.length - 1; i >= 0; i--) if (items[i].type === t && (items[i].color || null) === (c || null)) { items.splice(i, 1); break; } update(); },
      setBase(b) { base = b; update(); }, load(r) { items = []; base = r.base; r.items.forEach(([t, c, n]) => { for (let i = 0; i < n; i++) items.push({ type: t, color: c }); }); $("#bb-" + base).checked = true; update(); },
      exportGLB: null
    };
  }
  /* лента цветов: свайп вбок — листает, движение вверх к вазе или долгое нажатие — берёт цветок */
  let drag = null, suppressClick = false;
  const tray = $("#tray");
  const overStage = (x, y) => { const r = stage.getBoundingClientRect(); return x > r.left && x < r.right && y > r.top && y < r.bottom; };
  function startDrag(d, x, y) {
    const f = FLOWERS3D[d.type];
    d.ghost = document.createElement("div"); d.ghost.className = "ghost";
    d.ghost.innerHTML = `<svg style="color:${f.colored ? color : f.tint}"><use href="#${f.icon}"/></svg>`; document.body.appendChild(d.ghost);
    d.el.classList.remove("hold"); tray.classList.add("dragging");
    if (navigator.vibrate) try { navigator.vibrate(12); } catch {}
    moveDrag(d, x, y);
  }
  function moveDrag(d, x, y) { d.ghost.style.left = x + "px"; d.ghost.style.top = y + "px"; stage.classList.toggle("drop", overStage(x, y)); }
  async function endDrag(d, x, y) {
    clearTimeout(d.timer); d.el.classList.remove("hold"); tray.classList.remove("dragging"); stage.classList.remove("drop");
    if (!d.ghost) return;
    d.ghost.remove(); suppressClick = true; setTimeout(() => suppressClick = false, 350);
    if (overStage(x, y)) { const a = await ensure(); a.add(d.type, FLOWERS3D[d.type].colored ? color : null, x, y); }
    else toast("Отпустите цветок над вазой");
  }
  /* сенсорный экран */
  tray.addEventListener("touchstart", e => {
    const t = e.target.closest(".fl"); if (!t || e.touches.length > 1) return;
    const p = e.touches[0];
    drag = { type: t.dataset.fl, x: p.clientX, y: p.clientY, lx: p.clientX, ly: p.clientY, ghost: null, el: t, mode: null, armed: false };
    drag.timer = setTimeout(() => { if (drag && !drag.mode) { drag.armed = true; t.classList.add("hold"); if (navigator.vibrate) try { navigator.vibrate(8); } catch {} } }, 260);
  }, { passive: true });
  tray.addEventListener("touchmove", e => {
    if (!drag) return;
    const p = e.touches[0], dx = p.clientX - drag.x, dy = p.clientY - drag.y;
    drag.lx = p.clientX; drag.ly = p.clientY;
    if (!drag.mode) {
      if (drag.armed || (dy < -10 && Math.abs(dy) > Math.abs(dx) * 1.1)) { drag.mode = "drag"; clearTimeout(drag.timer); startDrag(drag, p.clientX, p.clientY); }
      else if (Math.abs(dx) > 8 || Math.abs(dy) > 8) { drag.mode = "scroll"; clearTimeout(drag.timer); drag.el.classList.remove("hold"); }
    }
    if (drag.mode === "drag") { e.preventDefault(); moveDrag(drag, p.clientX, p.clientY); }
  }, { passive: false });
  const touchEnd = e => {
    if (!drag) return;
    const d = drag; drag = null;
    if (d.mode === "drag") { e.preventDefault(); endDrag(d, d.lx, d.ly); }
    else { clearTimeout(d.timer); d.el.classList.remove("hold"); if (d.mode === "scroll") { suppressClick = true; setTimeout(() => suppressClick = false, 350); } }
  };
  tray.addEventListener("touchend", touchEnd, { passive: false });
  tray.addEventListener("touchcancel", e => { if (drag) { if (drag.ghost) drag.ghost.remove(); clearTimeout(drag.timer); drag.el.classList.remove("hold"); tray.classList.remove("dragging"); stage.classList.remove("drop"); drag = null; } });
  /* мышь на компьютере */
  let mdrag = null;
  tray.addEventListener("pointerdown", e => {
    if (e.pointerType === "touch") return;
    const t = e.target.closest(".fl"); if (!t) return;
    mdrag = { type: t.dataset.fl, x: e.clientX, y: e.clientY, ghost: null, el: t };
  });
  addEventListener("pointermove", e => {
    if (!mdrag || e.pointerType === "touch") return;
    if (!mdrag.ghost && Math.hypot(e.clientX - mdrag.x, e.clientY - mdrag.y) > 8) startDrag(mdrag, e.clientX, e.clientY);
    else if (mdrag.ghost) moveDrag(mdrag, e.clientX, e.clientY);
  });
  addEventListener("pointerup", e => { if (!mdrag || e.pointerType === "touch") return; const d = mdrag; mdrag = null; endDrag(d, e.clientX, e.clientY); });
  $("#tray").addEventListener("click", async e => {
    const t = e.target.closest(".fl"); if (!t || suppressClick) return;
    const a = await ensure(); a.add(t.dataset.fl, FLOWERS3D[t.dataset.fl].colored ? color : null);
  });
  $("#bUndo").onclick = async () => (await ensure()).undo();
  $("#bClear").onclick = async () => { (await ensure()).clear(); fromBouquet = null; };

  /* гармония: игровая оценка букета */
  function harmony() {
    const heads = items.filter(i => !FLOWERS3D[i.type].green && !FLOWERS3D[i.type].filler);
    const greens = items.filter(i => FLOWERS3D[i.type].green || FLOWERS3D[i.type].filler);
    if (!items.length) return { score: 0, tip: "Добавьте первые цветы" };
    let score = 0; const tips = [];
    if (heads.length >= 5) score += 25; else { score += heads.length * 5; tips.push("Добавьте ещё цветов: от пяти букет выглядит щедро"); }
    const ratio = greens.length / items.length;
    if (ratio >= .12 && ratio <= .4) score += 25; else tips.push(ratio < .12 ? "Добавьте эвкалипт или гипсофилу для воздушности" : "Зелени многовато, добавьте цветов");
    if (heads.length % 2 === 1) score += 15; else tips.push("Сделайте нечётное число цветов: так дарят к радости");
    const types = new Set(heads.map(h => h.type)).size; if (types >= 2 && types <= 3) score += 15; else if (types === 1 && heads.length >= 9) score += 15; else tips.push("Сочетайте 2–3 вида цветов");
    const cols = new Set(heads.map(h => h.color)).size; if (cols <= 3) score += 20; else tips.push("Оставьте не больше трёх оттенков");
    return { score: Math.min(100, score), tip: tips[0] || "Идеальный баланс. Букет мастера!" };
  }
  let prevTotal = 0;
  function price() {
    const stems = items.reduce((a, i) => a + FLOWERS3D[i.type].price, 0);
    return { stems, total: items.length ? stems + BASES3D[base].price : 0 };
  }
  function update() {
    const counts = {}; items.forEach(i => { const k = i.type + "|" + (i.color || ""); counts[k] = (counts[k] || 0) + 1; });
    $("#compo").innerHTML = Object.keys(counts).length ? Object.entries(counts).map(([k, n]) => { const [t, c] = k.split("|"); const nm = PALETTE3D.find(p => p.c === c); return `<span>${FLOWERS3D[t].name}${nm ? ", " + nm.n.toLowerCase() : ""} ×${n}<button type="button" data-rm="${k}" aria-label="Убрать один">−</button></span>`; }).join("") : `<span class="empty">Пока пусто. Перетащите цветы в вазу или нажмите на них.</span>`;
    $$("#compo [data-rm]").forEach(b => b.onclick = async () => { const [t, c] = b.dataset.rm.split("|"); (await ensure()).removeLast(t, c || null); });
    $("#stemCount").textContent = `${items.length} ${plural(items.length, "стебель", "стебля", "стеблей")}`;
    const p = price(); const tot = $("#bTotal"); tot.textContent = rub(p.total);
    if (p.total !== prevTotal) { tot.classList.remove("bump"); void tot.offsetWidth; tot.classList.add("bump"); }
    prevTotal = p.total;
    $("#dockNote").textContent = items.length ? `${items.length} ${plural(items.length, "стебель", "стебля", "стеблей")}, ${BASES3D[base].name.toLowerCase()}` : "Цена на ленте";
    const h = harmony(); $("#hScore").textContent = h.score; $("#hRing").style.strokeDashoffset = 113 - 113 * h.score / 100;
    $("#hRing").style.stroke = h.score >= 90 ? "var(--ok)" : h.score >= 60 ? "var(--sage-deep)" : "var(--rose)";
    $("#hText").innerHTML = `<b>Гармония ${h.score}%</b>${esc(h.tip)}`;
    hint();
    if (h.score >= 90 && Loyalty.me && !Loyalty.me.flags.master && !masterAsked) { masterAsked = true; Loyalty.bonus("master").then(r => { if (r.granted) toast(`Букет мастера! +${r.amount} баллов`); }); }
  }
  function describe() {
    const counts = {}; items.forEach(i => { const nm = (FLOWERS3D[i.type].name + (i.color ? " " + (PALETTE3D.find(p => p.c === i.color) || {}).n.toLowerCase() : "")); counts[nm] = (counts[nm] || 0) + 1; });
    return `3D-букет: ${Object.entries(counts).map(([k, n]) => `${k.toLowerCase()} ×${n}`).join(", ")}; ${BASES3D[base].name.toLowerCase()}`;
  }
  $("#bOrder").onclick = () => {
    if (!items.length) { toast("Добавьте в букет хотя бы один цветок"); return; }
    const p = price(); Cart.add({ id: "3d-" + Date.now(), name: describe(), price: p.total }); Track.event("builder_done", { price: p.total }); Order.open();
  };
  /* AR: экспорт модели и примерка через камеру */
  let mvLoaded = null;
  $("#bAR").onclick = async () => {
    if (!items.length) { toast("Сначала соберите букет, потом примерим его в комнате"); return; }
    const a = await ensure(); if (!a.exportGLB) { toast("Примерка недоступна на этом устройстве"); return; }
    Track.event("ar_open");
    $("#arHost").innerHTML = `<div class="stage-load" style="position:static;height:56svh"><div><i></i>Готовим модель букета</div></div>`;
    Sheets.open("arSheet");
    try {
      mvLoaded = mvLoaded || import("https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js");
      const [blob] = await Promise.all([a.exportGLB(), mvLoaded]);
      const url = URL.createObjectURL(blob);
      $("#arHost").innerHTML = `<model-viewer src="${url}" alt="Ваш букет в 3D" ar ar-modes="webxr scene-viewer quick-look" ar-scale="fixed" ar-placement="floor" camera-controls auto-rotate shadow-intensity="1" environment-image="neutral" exposure="1.05"><button slot="ar-button" class="btn btn-dark ar-cta"><svg aria-hidden="true"><use href="#i-ar"/></svg>Поставить на стол</button></model-viewer>`;
      const mv = $("#arHost model-viewer");
      mv.addEventListener("load", () => {
        $("#arNote").textContent = mv.canActivateAR ? "Нажмите «Поставить на стол», наведите камеру на поверхность и коснитесь её. Букет появится в реальном размере." : "Примерка через камеру работает на смартфонах (Android с ARCore и iPhone). Здесь букет можно покрутить в 3D.";
      });
      mv.addEventListener("ar-status", ev => { if (ev.detail.status === "failed") toast("Камера не запустилась. Попробуйте в Chrome на Android или Safari на iPhone"); });
    } catch { $("#arHost").innerHTML = `<p class="muted" style="padding:20px 0">Не удалось загрузить примерку. Проверьте интернет и попробуйте снова.</p>`; }
  };
  return {
    ensure,
    loadBouquet(id) {
      const b = BOUQUETS.find(x => x.id === id); if (!b) return; fromBouquet = b;
      base = b.recipe.base; const r = $("#bb-" + base); if (r) r.checked = true;
      if (api) api.load(b.recipe); else pendingRecipe = b.recipe;
      location.hash = "#build"; toast(`«${b.name}» в 3D. Можно изменить и примерить в комнате`);
    },
    update,
    /* наличие: цветы, которых сейчас нет, помечаются в ленте «под заказ» */
    markStock() {
      $$("#tray .fl").forEach(el => { const k = el.dataset.fl, off = Shop.out3d(k); el.classList.toggle("out", off); const sm = el.querySelector("small"); if (sm) sm.textContent = off ? "под заказ" : FLOWERS3D[k].price + " ₽"; });
    }
  };
})();
Builder.markStock();

/* ==========================================================
   10. КВИЗ → контакты за бонус
   ========================================================== */
const Quiz = (() => {
  const Q = [
    { k: "occ", t: "Какой повод?", a: [["День рождения","день рожд"],["Любимой","любим"],["Маме или бабушке","мам"],["Знакомство с родителями","знакомств"],["Коллеге","коллег"],["Без повода","без повод"]] },
    { k: "color", t: "Какие цвета ближе?", a: [["Нежные, пастельные","пастел","#EBC4BE"],["Белые, светлые","бел","#FBF8F3"],["Глубокие, тёмные","темн","#7A2234"],["Яркие, солнечные","ярк","#F1DC9A"]] },
    { k: "style", t: "В чём подарить?", a: [["Букет в бумаге","bouquet"],["Цветы в вазе","vase"],["Не важно","any"]] },
    { k: "budget", t: "Какой бюджет?", a: [["До 5 000 ₽","5000"],["5 000 – 8 000 ₽","8000"],["8 000 – 12 000 ₽","12000"],["Не важно","99999"]] }
  ];
  let step = 0, ans = {};
  const root = $("#quiz");
  function pick() {
    const lim = +ans.budget || 99999;
    return BOUQUETS.map(b => {
      let s = 0;
      if (b.occ.some(o => o.includes(ans.occ) || ans.occ.includes(o))) s += 3;
      if (b.colors.some(c => c.startsWith(ans.color.slice(0, 4)))) s += 3;
      if (ans.style === "vase" && b.cats.includes("vase")) s += 2;
      if (ans.style === "bouquet" && !b.cats.includes("vase")) s += 1;
      if (b.price <= lim) s += 2; else s -= 5;
      return { b, s };
    }).sort((x, y) => y.s - x.s).slice(0, 2).map(x => x.b);
  }
  function render() {
    if (step < Q.length) {
      const q = Q[step];
      root.innerHTML = `
        <div class="q-top"><button class="q-back" ${step ? "" : "hidden"} id="qBack">Назад</button><span>${step + 1} из ${Q.length}</span></div>
        <div class="q-progress"><i style="width:${step / Q.length * 100}%"></i></div>
        <p class="muted" style="font-size:14px">Подберём букет за 30 секунд и подарим ${CONFIG.loyalty.quizGift} баллов и −${CONFIG.loyalty.quizDiscount}%</p>
        <div class="q-body q-anim">
          <h2 class="q-title">${q.t}</h2>
          <div class="q-answers">${q.a.map(a => `<button class="q-ans glass ${ans[q.k] === a[1] ? "sel" : ""}" data-v="${a[1]}">${a[2] ? `<span class="dot" style="background:${a[2]}"></span>` : `<span class="e"><svg aria-hidden="true"><use href="#i-flower"/></svg></span>`}${a[0]}</button>`).join("")}</div>
        </div>`;
      requestAnimationFrame(() => requestAnimationFrame(() => { const i = $(".q-progress i", root); if (i) i.style.width = (step + 1) / Q.length * 100 + "%"; }));
      $$(".q-ans", root).forEach(b => b.onclick = () => { b.classList.add("sel"); ans[q.k] = b.dataset.v; setTimeout(() => { step++; render(); }, 240); });
      const back = $("#qBack"); if (back) back.onclick = () => { step--; render(); };
    } else {
      Track.event("quiz_done");
      const res = pick(), lp = Loyalty.state, got = lp.flags && lp.flags.quiz, L = CONFIG.loyalty;
      root.innerHTML = `
        <div class="q-progress"><i style="width:100%"></i></div>
        <div class="q-anim">
          <h2 class="q-title" style="margin-bottom:8px">Ваши букеты</h2>
          <p class="muted" style="margin-bottom:16px">Подобрали по поводу, палитре и бюджету.</p>
          <div class="q-res">${res.map(cardHtml).join("")}</div>
          ${got ? `<div class="q-gift"><h3>Бонус уже ваш</h3><p>Скидка и баллы — в кабинете. Бонус за подбор дарим один раз.</p></div>` : lp.user ? `
          <div class="q-gift"><h3>Заберите −${L.quizDiscount}% и ${L.quizGift} баллов</h3><p>Скидка применится к следующему заказу, баллы сразу на счёт. Один раз на участника клуба.</p><button class="btn btn-dark block" id="qClaim" type="button">Забрать бонус</button></div>` : `
          <div class="q-gift"><h3>−${L.quizDiscount}% и ${L.quizGift} баллов за подбор</h3><p>Бонус получают участники клуба. Вход через Telegram займёт полминуты, подборка сохранится.</p><button class="btn btn-tg block" id="qJoin" type="button"><svg aria-hidden="true"><use href="#i-tg"/></svg>Вступить и забрать</button></div>`}
          <form class="q-gift" id="qLead" novalidate>
            <h3>Отправить подборку флористу</h3>
            <p>Флорист посмотрит выбранные букеты и ответит в мессенджере.</p>
            <div class="fields">
              <div class="field"><label for="q-name">Имя</label><input id="q-name" autocomplete="name" value="${esc(lp.user ? lp.user.name : "")}"><span class="err">Укажите имя</span></div>
              <div class="field"><label for="q-phone">Телефон</label><input id="q-phone" type="tel" inputmode="tel" autocomplete="tel" value="${esc(lp.user ? lp.user.phone : "")}"><span class="err">Нужно 10+ цифр</span></div>
              <div class="btn-row"><button class="btn btn-wa" data-ch="wa"><svg aria-hidden="true"><use href="#i-wa"/></svg>WhatsApp</button><button class="btn btn-tg" data-ch="tg"><svg aria-hidden="true"><use href="#i-tg"/></svg>Telegram</button></div>
            </div>
          </form>
          <button class="btn btn-line block" id="qAgain" style="margin-top:12px">Пройти заново</button>
        </div>`;
      $("#qAgain").onclick = () => { step = 0; ans = {}; render(); };
      const claim = async () => { const r = await Loyalty.bonus("quiz"); toast(r.granted ? `+${r.amount} баллов и скидка ${L.quizDiscount}% в вашем кабинете` : "Бонус за подбор уже был получен"); render(); };
      const qc = $("#qClaim"); if (qc) qc.onclick = claim;
      const qj = $("#qJoin"); if (qj) qj.onclick = () => Loyalty.login({ then: async () => { location.hash = "#quiz"; await claim(); } });
      const form = $("#qLead");
      if (form) form.addEventListener("submit", e => {
        e.preventDefault();
        const n = $("#q-name"), p = $("#q-phone"); if (!validName(n) | !validPhone(p)) return;
        const ch = (e.submitter && e.submitter.dataset.ch) || "wa", u = Loyalty.state.user, pr = Loyalty.promo();
        Track.event("quiz_lead");
        const lbl = k => (Q.find(q => q.k === k).a.find(a => a[1] === ans[k]) || [""])[0];
        const msg = [`Здравствуйте! Прошёл(ла) подбор букета на сайте.`, "", `Повод: ${lbl("occ")}`, `Цвета: ${lbl("color")}`, `Формат: ${lbl("style")}`, `Бюджет: ${lbl("budget")}`, `Понравились: ${res.map(b => b.name).join(", ")}`, "", `Имя: ${n.value.trim()}`, `Телефон: ${p.value.trim()}`, pr && pr.kind === "quiz" ? `Скидка за подбор: −${pr.percent}% (проверяется по карте клуба)` : null, u ? `Карта клуба: ${u.code}` : null].filter(x => x !== null).join("\n") + "\n" + Track.report();
        sendTo(ch, msg);
        render();
      });
    }
  }
  render();
  return {};
})();

/* ==========================================================
   11. ИИ-ПОМОЩНИК (общий вызов посредника worker.js)
   ========================================================== */
async function callAI(payload, timeout = 20000) {
  if (!CONFIG.aiEndpoint) throw new Error("ИИ не подключён");
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(CONFIG.aiEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: ctl.signal });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}
const AI_CONTEXT = () => ({
  shop: CONFIG.shop, delivery: CONFIG.delivery, hours: CONFIG.hours, address: CONFIG.address,
  catalog: BOUQUETS.map(b => ({ id: b.id, name: b.name, desc: b.desc, price: b.price, flowers: b.flowers.map(f => MEANING[f]), ...(Shop.missing(b).length ? { stock: "под заказ, 1-2 дня" } : {}) })),
  extras: EXTRAS, loyalty: CONFIG.loyalty, faq: KB.map(k => k.a())
});

/* ==========================================================
   12. ГЕНЕРАТОР ОТКРЫТОК
   ========================================================== */
const CardGen = (() => {
  const WHO = { mama:["Маме","t"], love:["Любимой","t"], loveM:["Любимому","t"], friend:["Подруге","t"], grandma:["Бабушке","t"], colleague:["Коллеге","v"], teacher:["Учителю","v"], partnerMom:["Маме партнёра","v"] };
  const OCC = { birthday:"День рождения", march8:"8 Марта", anniversary:"Годовщина", meet:"Знакомство", thanks:"Благодарность", sorry:"Извинение", noreason:"Без повода", wedding:"Свадьба" };
  const TRAITS = ["нежная", "строгая", "с юмором", "романтичная", "деловая", "творческая", "заботливая"];
  const TONES = { touch:"Трогательно", fun:"Забавно", short:"Коротко" };
  const st = { who: "mama", traits: new Set(), tone: "touch", photo: null };
  $("#cg-who").innerHTML = Object.entries(WHO).map(([k, v]) => `<button type="button" data-k="${k}" aria-pressed="${k === st.who}">${v[0]}</button>`).join("");
  $("#cg-occ").innerHTML = Object.entries(OCC).map(([k, v]) => `<option value="${k}">${v}</option>`).join("");
  $("#cg-char").innerHTML = TRAITS.map(t => `<button type="button" data-t="${t}" aria-pressed="false">${t}</button>`).join("");
  $("#cg-tone").innerHTML = Object.entries(TONES).map(([k, v], i) => `<input type="radio" name="tone" id="tn-${k}" value="${k}" ${i ? "" : "checked"}><label for="tn-${k}">${v}</label>`).join("");
  $("#cg-who").onclick = e => { const b = e.target.closest("button"); if (!b) return; st.who = b.dataset.k; $$("#cg-who button").forEach(x => x.setAttribute("aria-pressed", x === b)); if (st.who === "partnerMom") $("#cg-occ").value = "meet"; };
  $("#cg-char").onclick = e => { const b = e.target.closest("button"); if (!b) return; const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", on); on ? st.traits.add(b.dataset.t) : st.traits.delete(b.dataset.t); };
  $("#cg-tone").onchange = e => st.tone = e.target.value;
  $("#cg-photo").onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    st.photo = await shrink(f, 768);
    $("#cg-photo-t").textContent = CONFIG.aiEndpoint ? "Фото добавлено, ИИ учтёт его" : "Фото добавлено. Анализ фото заработает после подключения ИИ";
    const prev = $("#cg-photo-l img") || document.createElement("img"); prev.src = "data:" + st.photo.mime + ";base64," + st.photo.data; $("#cg-photo-l").prepend(prev);
  };
  function shrink(file, max) {
    return new Promise((res, rej) => {
      const img = new Image(); img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement("canvas"); c.width = img.width * k; c.height = img.height * k;
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); res({ mime: "image/jpeg", data: c.toDataURL("image/jpeg", .82).split(",")[1] }); URL.revokeObjectURL(img.src);
      }; img.onerror = rej; img.src = URL.createObjectURL(file);
    });
  }
  /* локальный генератор: работает без ИИ и бесплатно */
  const T = (t, v) => ({ t, v });
  const OPEN = {
    birthday: { touch:[T("С днём рождения! Пусть этот год будет самым тёплым.","С днём рождения! Пусть этот год будет для вас самым тёплым."),T("Сегодня твой день, и пусть он запомнится светом и улыбками.","Пусть этот день запомнится вам светом и улыбками.")], fun:[T("С днём рождения! Свечей на торте больше, но и сияния тоже.","С днём рождения! Свечей на торте всё больше, но и обаяния тоже."),T("Поздравляю! Возраст — это просто количество поводов дарить тебе цветы.","Поздравляю! Возраст — лишь количество поводов дарить вам цветы.")], short:[T("С днём рождения!","С днём рождения!"),T("Счастья в новом году жизни!","Счастья вам в новом году жизни!")] },
    march8: { touch:[T("С 8 Марта! Пусть весна начинается с улыбки.","С 8 Марта! Пусть весна для вас начинается с улыбки."),T("С праздником весны и нежности!","С праздником весны и нежности!")], fun:[T("С 8 Марта! Эти цветы — официальное доказательство, что ты лучшая.","С 8 Марта! Эти цветы — официальное признание вашего обаяния."),T("Весна пришла, и начала она с тебя.","Весна пришла, и начала она с вас.")], short:[T("С 8 Марта!","С 8 Марта!"),T("С весной и праздником!","С весной и праздником!")] },
    anniversary: { touch:[T("С годовщиной! Каждый год рядом с тобой — подарок.","С годовщиной! Пусть каждый год будет счастливее предыдущего."),T("Ещё один год вместе, и я снова выбираю тебя.","Ещё один год вместе — это прекрасно.")], fun:[T("С годовщиной! Спасибо, что всё ещё смеёшься над моими шутками.","С годовщиной! Пусть шутки остаются смешными, а чувства — тёплыми."),T("С годовщиной! Официально продлеваю наш договор на счастье.","С годовщиной! Продлеваем договор на счастье.")], short:[T("С годовщиной!","С годовщиной!"),T("Люблю. С нашим днём!","С годовщиной!")] },
    meet: { touch:[T("Очень приятно наконец познакомиться.","Очень приятно наконец с вами познакомиться."),T("Спасибо за тёплую встречу.","Благодарю за тёплый приём.")], fun:[T("Приятно познакомиться! Обещаю, цветы — только начало.","Приятно познакомиться! Обещаю, цветы — только начало."),T("Немного волнуюсь, поэтому пусть за меня скажут цветы.","Немного волнуюсь, поэтому пусть за меня скажут цветы.")], short:[T("Приятно познакомиться!","Очень приятно познакомиться!"),T("С теплом и уважением!","С теплом и уважением!")] },
    thanks: { touch:[T("Спасибо тебе за всё.","Хочу сказать вам большое спасибо."),T("Слов мало, поэтому пусть благодарят цветы.","Слов мало, поэтому пусть благодарят цветы.")], fun:[T("Спасибо! Ты заслуживаешь целую оранжерею, но пока вот букет.","Спасибо! Вы заслуживаете целую оранжерею, но начнём с букета."),T("Благодарность размером с этот букет. Даже больше.","Благодарность размером с этот букет. Даже больше.")], short:[T("Спасибо!","Спасибо вам!"),T("С благодарностью.","С благодарностью.")] },
    sorry: { touch:[T("Прости меня. Ты очень мне дорог(а).","Простите, пожалуйста. Мне правда жаль."),T("Мне жаль. Пусть эти цветы скажут то, что я не смог(ла).","Мне жаль. Пусть цветы скажут то, что не получилось словами.")], fun:[T("Цветы — это официальная просьба о мире. Подпишешь?","Цветы — официальная просьба о мире."),T("Я был(а) неправ(а). Записал(а) в календарь, чтобы запомнить.","Признаю ошибку. С цветами это проще.")], short:[T("Прости.","Простите."),T("Мир?","Прошу прощения.")] },
    noreason: { touch:[T("Просто так. Потому что ты есть.","Просто так, чтобы сделать день немного светлее."),T("Без повода — значит от всего сердца.","Без повода — значит от всего сердца.")], fun:[T("Повода нет. Есть ты, и этого достаточно.","Повода нет, но цветам он и не нужен."),T("Это букет «просто так». Самый честный вид букетов.","Это букет «просто так». Самый честный вид букетов.")], short:[T("Просто так.","Хорошего дня!"),T("Думаю о тебе.","С теплом!")] },
    wedding: { touch:[T("С днём свадьбы! Пусть любовь растёт, как этот сад.","Поздравляем с днём свадьбы! Пусть любовь только крепнет."),T("Пусть каждый день будет таким же счастливым, как сегодня.","Пусть каждый день будет таким же счастливым, как сегодня.")], fun:[T("С днём свадьбы! Теперь официально: вы — команда мечты.","С днём свадьбы! Теперь официально: вы — команда мечты."),T("Пусть ссоры будут только за последний кусочек торта.","Пусть ссоры будут только за последний кусочек торта.")], short:[T("С днём свадьбы!","С днём свадьбы!"),T("Совет да любовь!","Совет да любовь!")] }
  };
  const HEART = {
    mama:["Мама, спасибо за всё, что ты для меня делаешь.","Мамочка, ты самый тёплый человек в моей жизни."], love:["Ты делаешь мой мир красивее любого букета.","Каждый день с тобой — мой любимый."], loveM:["Ты моя опора и моя радость.","С тобой мне спокойно и счастливо."],
    friend:["Спасибо, что ты есть, моя дорогая.","С тобой даже обычный вторник становится праздником."], grandma:["Бабуля, спасибо за твою бесконечную любовь.","Твои объятия — самые уютные на свете."],
    colleague:["Работать с вами — настоящее удовольствие.","Спасибо за поддержку и профессионализм."], teacher:["Спасибо за ваше терпение, знания и веру в нас.","Вы учите не только предмету, но и жизни."], partnerMom:["Спасибо, что вырастили такого замечательного человека.","Надеюсь, это начало доброй дружбы."]
  };
  const TRAIT = {
    "нежная":T("Пусть рядом всегда будет столько же нежности, сколько ты даришь другим.","Пусть вас окружает та же нежность, которую вы дарите другим."),
    "строгая":T("Ты ценишь настоящее, поэтому здесь только искренние слова.","Вы цените вкус и сдержанность, поэтому эти цветы выбраны с особым вниманием."),
    "с юмором":T("Пусть поводов смеяться будет больше, чем лепестков в этом букете.","Пусть поводов улыбаться будет больше, чем лепестков в этом букете."),
    "романтичная":T("Пусть каждый день немного похож на красивое кино.","Пусть в жизни будет больше красивых моментов."),
    "деловая":T("Пусть все планы сбываются, а на отдых тоже находится время.","Пусть все планы сбываются, а на отдых всегда находится время."),
    "творческая":T("Пусть вдохновение приходит так же легко, как весна.","Пусть вдохновение приходит к вам так же легко, как весна."),
    "заботливая":T("Ты всегда заботишься о других. Сегодня наша очередь заботиться о тебе.","Вы всегда заботитесь о других. Сегодня наша очередь.")
  };
  const CLOSE = { touch:T("Обнимаю крепко.","С уважением и теплом."), fun:T("Твой самый преданный поклонник.","С улыбкой и наилучшими пожеланиями."), short:T("","") };
  function local(o) {
    const form = WHO[o.who][1]; const pickT = x => x[form];
    const op = (OPEN[o.occ] || OPEN.birthday)[o.tone]; const hearts = HEART[o.who] || HEART.mama;
    const traits = [...o.traits].map(t => TRAIT[t]).filter(Boolean).map(pickT);
    const name = o.name ? o.name.trim() + ", " : "";
    const cap = s => name ? s.charAt(0).toLowerCase() + s.slice(1) : s;
    const sign = o.from ? `\n— ${o.from.trim()}` : "";
    const close = pickT(CLOSE[o.tone]);
    const out = [];
    out.push(name + cap(pickT(op[0])) + " " + hearts[0] + (traits[0] ? " " + traits[0] : "") + (close ? " " + close : "") + sign);
    out.push(name + cap(pickT(op[1])) + (traits[1] || traits[0] ? " " + (traits[1] || traits[0]) : "") + " " + hearts[1] + sign);
    out.push(name + cap(pickT(op[0])) + " " + hearts[1] + (o.tone !== "short" && close ? " " + close : "") + sign);
    return [...new Set(out.map(s => s.replace(/\s+/g, " ").replace(/ \n/g, "\n").trim()))];
  }
  async function generate() {
    const o = { who: st.who, whoLabel: WHO[st.who][0], occ: $("#cg-occ").value, occLabel: OCC[$("#cg-occ").value], traits: st.traits, tone: st.tone, toneLabel: TONES[st.tone], name: $("#cg-name").value, from: $("#cg-from").value, extra: $("#cg-extra").value };
    const out = $("#cg-out"); const btn = $("#cg-go");
    btn.disabled = true; btn.innerHTML = `<svg aria-hidden="true"><use href="#i-spark"/></svg>Пишем…`;
    let variants = null;
    if (CONFIG.aiEndpoint) {
      try {
        const r = await callAI({ mode: "card", who: o.whoLabel, occasion: o.occLabel, traits: [...o.traits], tone: o.toneLabel, name: o.name, from: o.from, extra: o.extra, image: st.photo });
        if (r && Array.isArray(r.variants) && r.variants.length) variants = r.variants.slice(0, 3).map(String);
      } catch {}
    }
    if (!variants) variants = local(o);
    Track.event("card_ai");
    out.innerHTML = variants.map((v, i) => `<div class="variant">${esc(v).replace(/\n/g, "<br>")}<button type="button" class="btn btn-dark btn-sm" data-use="${i}">Взять этот текст</button></div>`).join("");
    $$("[data-use]", out).forEach(b => b.onclick = () => { $("#o-note").value = variants[+b.dataset.use]; Sheets.open("orderSheet"); toast("Текст добавлен в открытку"); });
    btn.disabled = false; btn.innerHTML = `<svg aria-hidden="true"><use href="#i-spark"/></svg>Ещё варианты`;
  }
  $("#cg-go").onclick = generate;
  return { open() { Sheets.open("cardSheet"); } };
})();

/* ==========================================================
   13. ЧАТ: ИИ-ФЛОРИСТ (Cloudflare Workers AI через worker.js) + встроенный консультант
   ========================================================== */
const KB = [
  { k: ["доставк","привез","курьер","сколько ехать","зона","район"], a: () => `Доставляем по городу за 2 часа. Стоимость ${rub(CONFIG.delivery.price)}, ко времени ${rub(CONFIG.delivery.onTime)}, а от ${rub(CONFIG.delivery.freeFrom)} бесплатно. Букет едет в воде и коробке.` },
  { k: ["оплат","карт","налич","перевод","сбп","счет"], a: () => "Оплатить можно переводом по СБП, картой по ссылке или наличными курьеру. Для компаний выставляем счёт." },
  { k: ["работа","график","часы","открыт","во сколько","режим"], a: () => `Работаем ${CONFIG.hours}. Заявки в мессенджерах принимаем круглосуточно.` },
  { k: ["адрес","где вы","самовывоз","забрать","находит"], a: () => `Самовывоз: ${CONFIG.address}, ${CONFIG.hours}. Букет будет готов через час после подтверждения.` },
  { k: ["уход","стоял","завял","вода","продлить"], a: () => "Чтобы букет простоял дольше: подрежьте стебли наискосок на 1–2 см, меняйте воду каждый день и держите вазу подальше от батареи и фруктов. Наши букеты стоят от 7 дней." },
  { k: ["фото","посмотр","увидеть"], a: () => "Перед отправкой присылаем фото готового букета. Если что-то не понравится, пересоберём бесплатно." },
  { k: ["возврат","не понрав","жалоб","плохо","испорт","брак","замен"], a: () => "Мне очень жаль, если что-то пошло не так. Пришлите фото букета в WhatsApp или Telegram: в течение суток заменим букет или вернём деньги." },
  { k: ["открытк","подпис","записк","поздравлен","текст"], a: () => "Открытку подписываем от руки бесплатно. При оформлении заказа нажмите «Написать с ИИ», и я помогу придумать текст под характер получателя.", chips: ["Придумать текст открытки"] },
  { k: ["балл","бонус","кэшб","кешб","лояльн","клуб","скидк","уров"], a: () => { const L = CONFIG.loyalty; return `В клубе ${L.welcome} баллов за вступление и кэшбэк ${L.levels.map(l => l.cashback + "%").join(" / ")} по уровням ${L.levels.map(l => l.name).join(", ")}. Баллами можно оплатить до ${L.maxSpendPercent}% заказа, а за подбор букета дарим −${L.quizDiscount}%. Вступить можно в кабинете: вход через Telegram, без паролей и SMS.`; }, chips: ["Открыть кабинет"] },
  { k: ["друг","реферал","пригла","ссылк"], a: () => `Поделитесь ссылкой из кабинета: друг получит ${CONFIG.loyalty.friendGift} баллов, а вы ${CONFIG.loyalty.friendGift} баллов после его первого заказа.`, chips: ["Открыть кабинет"] },
  { k: ["календар","напомн","важн дат","не забыть"], a: () => `В кабинете есть календарь заботы: отметьте дни рождения и годовщины, и за 3 дня мы напомним и предложим букет со скидкой ${CONFIG.loyalty.careDiscount}%.`, chips: ["Открыть кабинет"] },
  { k: ["3d","конструкт","сам собрать","свой букет","ar","пример","в комнате","камер"], a: () => "В разделе 3D можно собрать букет из отдельных цветов, увидеть цену и примерить его на своём столе через камеру телефона.", chips: ["Открыть 3D"] },
  { k: ["свадьб","мероприят","оформлен","декор","корпорат","офис"], a: () => "Оформляем свадьбы и мероприятия. Напишите дату и формат, флорист подготовит смету." },
  { k: ["аллерг","без запах"], a: () => "При аллергии соберём букет из цветов без пыльцы и сильного аромата: розы, тюльпаны, гортензия, эустома. Укажите это в пожеланиях." },
  { k: ["срочн","быстр","через час"], a: () => "Можем собрать срочно: букет из наличия будет готов за 30–40 минут, доставка в течение 2 часов." },
  { k: ["привет","здравств","добр","хай","hello"], a: () => "Здравствуйте! Расскажите, кому букет, какой человек и повод, какие цвета и бюджет. Я подберу и объясню, что означают цветы." },
  { k: ["спасиб","благодар"], a: () => "Всегда рада помочь! Если появятся вопросы, я здесь." },
  { k: ["статус","где мой заказ","где заказ","отслед","когда привез","фото букет"], a: () => "Участникам клуба статус заказа приходит в Telegram-бот: «Собираем», «В пути», «Доставлен», а перед отправкой флорист присылает фото готового букета. Всё это видно и в кабинете.", chips: ["Открыть кабинет"] },
  { k: ["намекн","намек","избранн","вишлист","подсказать"], a: () => "Отметьте сердечком понравившиеся букеты в каталоге и нажмите «Намекнуть»: получится ссылка, которую можно отправить тому, кто захочет вас порадовать." },
  { k: ["отзыв","оценк","рейтинг"], a: () => "Отзывы на сайте оставляют только покупатели, чей заказ мы доставили: после доставки бот просит оценить букет и прислать фото." },
  { k: ["человек","менеджер","оператор","позвон","живой"], a: () => `Конечно: WhatsApp и Telegram ${CONFIG.phoneText}. Флорист ответит в течение 10 минут.`, chips: ["Написать в WhatsApp","Написать в Telegram"] }
];

const Chat = (() => {
  const log = $("#chatLog"); let started = false, flow = null; const history = [];
  if (CONFIG.aiEndpoint) $("#botMode").textContent = "ИИ подбирает по смыслу, отвечает сразу";
  const has = (t, keys) => keys.some(k => t.includes(norm(k)));
  const scroll = () => requestAnimationFrame(() => log.scrollTop = log.scrollHeight);
  function bubble(text, who = "bot", cls = "") { const d = document.createElement("div"); d.className = `msg ${who} ${cls}`; d.textContent = text; log.appendChild(d); scroll(); if (who !== "sys") history.push({ role: who === "me" ? "user" : "model", text }); if (history.length > 16) history.shift(); return d; }
  function chips(list) { const d = document.createElement("div"); d.className = "quick"; d.innerHTML = list.map(c => `<button type="button">${esc(c)}</button>`).join(""); d.onclick = e => { const b = e.target.closest("button"); if (b) { d.remove(); handle(b.textContent); } }; log.appendChild(d); scroll(); }
  function cards(list) { const d = document.createElement("div"); d.className = "chat-cards"; d.innerHTML = list.map(b => `<div class="chat-card"><img src="${IMG(b.img, 300)}" alt="" loading="lazy"><div><b>${esc(b.name)}</b><span>${rub(b.price)}</span><button type="button" data-chat-order="${b.id}">Выбрать</button></div></div>`).join(""); log.appendChild(d); scroll(); }
  function meaningBox(b, text) { const d = document.createElement("div"); d.className = "msg bot meaning"; d.innerHTML = `<b>Язык цветов</b>${esc(text || b.flowers.map(f => MEANING[f]).join("; "))}.`; log.appendChild(d); scroll(); }
  function basketBox(b, extras) {
    const ex = extras.map(id => EXTRAS.find(e => e.id === id)).filter(Boolean);
    const total = b.price + ex.reduce((a, e) => a + e.price, 0);
    const d = document.createElement("div"); d.className = "basket";
    d.innerHTML = `<h4>Готовая корзина</h4><div class="r"><span>${esc(b.name)}</span><span>${rub(b.price)}</span></div>${ex.map(e => `<div class="r"><span>${esc(e.name)}</span><span>${rub(e.price)}</span></div>`).join("")}<div class="r t"><span>Итого</span><span>${rub(total)}</span></div><button type="button" class="btn btn-dark block">Оформить корзину</button>`;
    d.querySelector("button").onclick = () => { Cart.addBouquet(b.id); ex.forEach(e => Cart.add({ id: "extra-" + e.id, name: e.name, price: e.price })); Order.open(); };
    log.appendChild(d); scroll();
  }
  function bot(text, extra) {
    const t = document.createElement("div"); t.className = "msg bot typing"; t.innerHTML = "<i></i><i></i><i></i>"; log.appendChild(t); scroll();
    setTimeout(() => { t.remove(); bubble(text); if (extra) extra(); }, Math.min(1100, 350 + text.length * 5));
  }
  function budgetOf(t) {
    let n = null; const k = t.match(/(\d+)\s*(к|тыс|тысяч)/); if (k) n = +k[1] * 1000;
    if (!n) { const m = t.match(/(\d[\d\s]{2,6})/); if (m) n = +m[1].replace(/\s/g, ""); }
    if (!n && /недорог|дешев|бюджетн/.test(t)) n = 5000;
    return n && n >= 1000 ? n : null;
  }
  /* понимание контекста без ИИ: повод, кому, характер, палитра, бюджет */
  function context(t) {
    const c = { budget: budgetOf(t), strict: /строг|сдержан|консерват|серьезн|элегант/.test(t), pastel: /пастел|постел|нежн|пудр|спокойн/.test(t), dark: /темн|бордо|глубок|страст/.test(t), bright: /ярк|солнеч|желт|оранж/.test(t), white: /бел|светл/.test(t),
      meet: /знакомит|знакомств|идем знаком|идём знаком/.test(t), partnerMom: /мам\S* (парн|муж|жених|девушк|жен)|свекров|тещ|родител/.test(t), mom: /мам|бабушк/.test(t), love: /любим|девушк|жене|жена|свидан/.test(t), colleague: /коллег|начальн|офис/.test(t) };
    return c;
  }
  function recommend(t) {
    const c = context(t);
    const scored = BOUQUETS.map(b => {
      let s = 0;
      b.occ.forEach(o => { if (t.includes(norm(o))) s += 3; });
      b.colors.forEach(col => { if (t.includes(norm(col))) s += 3; });
      if ((c.meet || c.partnerMom) && b.occ.some(o => /знакомств|мама парн|строг|сдержан/.test(o))) s += 5;
      if (c.strict && (b.colors.includes("бел") || b.colors.includes("пастел")) && !b.colors.includes("ярк")) s += 2;
      if (c.strict && b.colors.includes("ярк")) s -= 3;
      if (/роз/.test(t) && b.cats.includes("roses")) s += 2;
      if (/пион/.test(t) && b.cats.includes("peony")) s += 2;
      if (/тюльпан/.test(t) && b.id === "tulips") s += 4;
      if (/мак/.test(t) && b.id === "poppies") s += 4;
      if (/ваз/.test(t) && b.cats.includes("vase")) s += 2;
      if (/дорог|роскош|премиум|шикарн/.test(t) && b.price >= 9000) s += 3;
      if (c.budget) s += b.price <= c.budget ? 3 : -8;
      return { b, s };
    }).sort((a, x) => x.s - a.s);
    let list = scored.filter(x => x.s > 0).slice(0, 3).map(x => x.b);
    if (!list.length && c.budget) list = BOUQUETS.filter(b => b.price <= c.budget).sort((a, b) => b.price - a.price).slice(0, 3);
    return { list, c };
  }
  function explain(b, c) {
    const why = [];
    if (c.meet || c.partnerMom) why.push("для первого знакомства лучше сдержанная, благородная композиция без кричащих цветов");
    if (c.strict) why.push("строгому человеку понравится спокойная палитра и аккуратная форма");
    if (c.pastel) why.push("пастельные оттенки выглядят деликатно и дорого");
    if (c.dark) why.push("глубокие тона говорят о сильном чувстве");
    if (c.bright) why.push("яркие цветы сразу поднимают настроение");
    return `Советую «${b.name}», ${rub(b.price)}: ${b.desc.toLowerCase()}.${why.length ? " " + why.join(", ").replace(/^./, s => s.toUpperCase()) + "." : ""}`;
  }
  const WANT = ["подбер","посовет","порекоменд","какой букет","что подарить","что выбрать","букет для","букет на","букет маме","хочу букет","нужен букет","нужны цветы","цветы для","подар","роз","пион","тюльпан","мак","бюджет","недорог","ваз","мам","любим","знаком","коллег","строг","пастел","постел"];
  const ORDER = ["заказ","оформ","куп","беру","доставьте"];

  async function handle(raw) {
    const text = raw.trim(); if (!text) return;
    bubble(text, "me"); const t = norm(text);
    if (flow) return flowStep(text, t);
    const cmd = { "открыть кабинет": "#cabinet", "открыть 3d": "#build", "собрать свой букет": "#build" };
    if (cmd[t]) { Sheets.close(); location.hash = cmd[t]; return; }
    if (t === "придумать текст открытки") { CardGen.open(); return; }
    if (t === "написать в whatsapp") { openUrl(waLink("Здравствуйте! Вопрос с сайта.")); return; }
    if (t === "написать в telegram") { openUrl(tgLink()); return; }
    if (t === "показать все букеты") return bot("Вот вся коллекция:", () => cards(BOUQUETS));
    if (t === "подобрать букет") return bot("Расскажите своими словами: кому букет, какой это человек, повод, любимые цвета и бюджет. Например: «маме парня, идём знакомиться, она строгая, любит пастельные тона, до 5000».", () => chips(["Маме, нежные, до 8000","Любимой на годовщину","Коллеге до 5000"]));
    if (t === "оформить заказ" || t === "показать корзину") return startOrder();
    if (t === "открыть корзину") { Sheets.close(); return Order.open(); }
    /* «где мой заказ», «статус заказа» — это вопрос о доставке, а не новый заказ */
    if (/(где|статус|отслед|когда (при|до)вез|когда будет)/.test(t) && /(заказ|букет|курьер)/.test(t)) {
      const k = KB.find(x => x.k.includes("статус")); return bot(k.a(), () => chips(k.chips || []));
    }
    const w = wantCount(t);
    if ((has(t, ORDER) || w || (MORE.test(t) && /букет/.test(t))) && !has(t, ["доставк","оплат"])) {
      const r = has(t, WANT) ? recommend(t) : { list: [] };
      if (w && w > 1) return startOrder(null, w, has(t, WANT) ? t : "");
      return r.list.length === 1 ? startOrder(r.list[0]) : startOrder(null, 1, r.list.length ? t : "");
    }

    /* свободный текст: сначала ИИ (если подключён), иначе встроенная логика */
    if (CONFIG.aiEndpoint && text.split(" ").length > 2) {
      const typing = document.createElement("div"); typing.className = "msg bot typing"; typing.innerHTML = "<i></i><i></i><i></i>"; log.appendChild(typing); scroll();
      try {
        Track.event("chat_ai");
        const r = await callAI({ mode: "chat", messages: history.slice(-12), context: AI_CONTEXT() });
        typing.remove();
        if (r && r.reply) {
          bubble(r.reply);
          const ids = (r.bouquet_ids || []).filter(id => BOUQUETS.some(b => b.id === id));
          if (ids.length) cards(ids.map(id => BOUQUETS.find(b => b.id === id)));
          if (r.meaning) { const d = document.createElement("div"); d.className = "msg bot meaning"; d.innerHTML = `<b>Язык цветов</b>${esc(r.meaning)}`; log.appendChild(d); }
          if (r.basket && BOUQUETS.some(b => b.id === r.basket.bouquet_id)) basketBox(BOUQUETS.find(b => b.id === r.basket.bouquet_id), r.basket.extras || []);
          if (r.card_text) { const d = document.createElement("div"); d.className = "msg bot"; d.textContent = "Текст для открытки: " + r.card_text; log.appendChild(d); $("#o-note").value = r.card_text; }
          chips(ids.length ? ["Оформить заказ","Показать все букеты"] : ["Подобрать букет","Связаться с человеком"]);
          return;
        }
      } catch { typing.remove(); }
    }
    if (has(t, WANT)) {
      const r = recommend(t);
      if (r.list.length) {
        const b = r.list[0];
        const extras = r.c.budget && b.price + 250 <= r.c.budget ? ["card"] : [];
        return bot(explain(b, r.c), () => { meaningBox(b); basketBox(b, extras); if (r.list.length > 1) { bubble("Ещё варианты:", "sys"); cards(r.list.slice(1)); } chips(["Придумать текст открытки","Показать все букеты"]); });
      }
      return bot("Подберу! Уточните, пожалуйста, повод, цвета или бюджет.", () => chips(["Маме, нежные","Любимой, тёмные","До 5000"]));
    }
    let best = null, bs = 0;
    KB.forEach(item => { const s = item.k.filter(k => t.includes(norm(k))).length; if (s > bs) { bs = s; best = item; } });
    if (best) return bot(best.a(), () => chips(best.chips || ["Подобрать букет","Оформить заказ"]));
    bot("Я могу подобрать букет по поводу и характеру человека, рассказать о доставке, оплате и бонусах или соединить с флористом.", () => chips(["Подобрать букет","Доставка","Оплата","Связаться с человеком"]));
  }
  /* ---- заказ в чате: несколько букетов, общая корзина с сайтом ---- */
  const NUMW = { "один": 1, "одн": 1, "два": 2, "две": 2, "пар": 2, "три": 3, "четыре": 4, "пять": 5, "шесть": 6 };
  function wantCount(t) {
    const d = t.match(/(\d+)\s*(букет|штук|шт)/); if (d) return Math.min(20, +d[1]);
    const m = t.match(/(один|одн|два|две|пару|пара|три|четыре|пять|шесть)\S*\s+(\S+\s+)?(букет|разн|штук)/); return m ? NUMW[m[1].startsWith("пар") ? "пар" : m[1]] || null : null;
  }
  const MORE = /(ещ[её]|еще|втор|трет|друг(ой|ого)|добав|один букет|одного|плюс один|не один|несколько)/;
  const SAME = /(так(ой|их) же|такой-же|этот же|тот же|два таких|ещ[её] так)/;
  const DONE = /^(оформ|вс[её]|хватит|достаточно|больше не|нет|дальше|продолж|готово|это вс)/;
  const NOT_NAME = /(букет|заказ|хочу|нужен|нужна|нужно|ещ[её]|цвет|роз|пион|тюльпан|доставк|корзин|можно|сколько|\d)/;
  const lastAdded = () => { const it = Cart.items.filter(i => BOUQUETS.some(b => b.id === i.id)); return it.length ? BOUQUETS.find(b => b.id === it[it.length - 1].id) : null; };
  const cartLine = () => `В корзине ${Cart.count()} ${plural(Cart.count(), "букет", "букета", "букетов")} на ${rub(Cart.sum())}`;
  function askItem(msg) {
    flow.step = "item";
    const r = flow.hint ? recommend(flow.hint) : { list: [] };
    bot(msg, () => { cards(r.list.length ? r.list : BOUQUETS); chips(Cart.count() ? ["Оформить то, что выбрано","Показать корзину"] : ["Показать все букеты"]); });
  }
  function startOrder(b, want, hint) {
    const had = Cart.count();
    flow = { step: "item", want: (want || 1) + had, hint: hint || "" }; Track.event("chat_order");
    if (b) return addItem(b);
    if (want > 1) return askItem(`Соберём ${want} ${plural(want, "букет", "букета", "букетов")}. Какой будет первым? Нажмите «Выбрать» или опишите, кому он.`);
    if (had) return bot(`${cartLine()}:\n${Cart.lines().join("\n")}\n\nДобавим ещё букет или оформляем?`, () => chips(["Оформить","Добавить ещё букет"]));
    askItem("Какой букет оформляем? Нажмите «Выбрать» под букетом или опишите, кому он.");
  }
  function addItem(b, qty = 1) {
    Cart.addBouquet(b.id, qty); flow.step = "more";
    const n = Cart.count(), left = flow.want - n;
    if (left > 0) return askItem(`«${b.name}» в корзине, ${n} из ${flow.want}. Какой ${n === 1 ? "второй" : "следующий"} букет? Можно такой же, а можно другой.`);
    bot(`«${b.name}», ${rub(b.price)}${qty > 1 ? " ×" + qty : ""} в корзине. ${cartLine()}. Добавим ещё или оформляем?`, () => chips(["Оформить","Добавить ещё букет","Ещё такой же"]));
  }
  /* следующий незаполненный шаг; уже введённые данные не спрашиваем повторно */
  function proceed() {
    if (!Cart.count()) return askItem("Корзина пока пуста. Какой букет добавить?");
    const u = Loyalty.state.user; if (u) { flow.name = flow.name || u.name; flow.phone = flow.phone || u.phone; }
    if (!flow.name) { flow.step = "name"; return bot(`${cartLine()}. Оформляем! Как вас зовут?`); }
    if (!flow.phone) { flow.step = "phone"; return bot(`${flow.name}, ваш телефон для связи?`); }
    if (!flow.when) { flow.step = "when"; return bot("Куда и когда доставить? Например: «ул. Ленина 5, завтра к 18:00». Или «самовывоз». Если букеты едут по разным адресам, напишите оба."); }
    if (flow.card === undefined) { flow.step = "card"; return bot(Cart.count() > 1 ? "Тексты для открыток? Напишите их или «без открытки»." : "Текст для открытки? Напишите его или «без открытки».", () => chips(["Без открытки"])); }
    flow.step = "send";
    bot(`Проверьте заказ:\n${Cart.lines().join("\n")}\nИтого за букеты: ${rub(Cart.sum())}\nДоставка: ${flow.when}\n${flow.card ? "Открытка: " + flow.card + "\n" : ""}${flow.name}, ${flow.phone}\n\nКуда отправить заявку?`, () => {
      const d = document.createElement("div"); d.className = "btn-row"; d.style.alignSelf = "stretch";
      d.innerHTML = `<button class="btn btn-wa" data-c="wa"><svg aria-hidden="true"><use href="#i-wa"/></svg>WhatsApp</button><button class="btn btn-tg" data-c="tg"><svg aria-hidden="true"><use href="#i-tg"/></svg>Telegram</button>`;
      d.onclick = e => { const btn = e.target.closest("button"); if (btn && flow) finish(btn.dataset.c); }; log.appendChild(d); scroll();
      chips(["Добавить ещё букет","Показать корзину"]);
    });
  }
  function flowStep(text, t) {
    if (/^(отмена|стоп|не надо|передумал)/.test(t)) { flow = null; return bot(Cart.count() ? "Хорошо, остановила оформление. Корзина сохранилась, к ней можно вернуться в любой момент." : "Хорошо, отменила. Чем ещё помочь?", () => chips(["Подобрать букет","Доставка","Оплата"])); }
    if (/показать корзин|открыть корзин|что в корзин/.test(t)) return Cart.count() ? bot(`${cartLine()}:\n${Cart.lines().join("\n")}\n\nКоличество можно поменять в окне корзины.`, () => chips(["Оформить","Добавить ещё букет","Открыть корзину"])) : askItem("Корзина пуста. Какой букет добавить?");
    if (t === "открыть корзину") { Sheets.close(); return Order.open(); }
    /* название букета в любой момент: добавляем */
    const named = BOUQUETS.find(x => t.includes(norm(x.name)));
    if (named && flow.step !== "card") return addItem(named);
    /* «такой же» / «ещё такой же» */
    if (SAME.test(t) && lastAdded()) return addItem(lastAdded(), wantCount(t) || 1);
    /* «нужен ещё один букет», «добавить второй», «хочу два» — на любом шаге, кроме текста открытки */
    const more = flow.step !== "card" && (MORE.test(t) || wantCount(t)) && /(букет|ещ[её]|еще|втор|друг|добав|один|такой|штук)/.test(t) && !DONE.test(t);
    if (more) {
      const w = wantCount(t); if (w && w > 1 && /(всего|итого|нужно|нужн|хочу)/.test(t) && !MORE.test(t)) flow.want = w; else flow.want = Math.max(flow.want, Cart.count() + (w && MORE.test(t) ? w : 1));
      flow.hint = has(t, WANT) ? t : ""; flow.back = flow.step;
      const left = flow.want - Cart.count();
      return askItem(left > 1 ? `Добавим ещё ${left} ${plural(left, "букет", "букета", "букетов")}. Какой выбираете?` : "Конечно! Какой ещё букет добавить? Выберите ниже или опишите, кому он, и я подберу.");
    }
    if (flow.step === "item" || flow.step === "more") {
      if (DONE.test(t) || t === "оформить то, что выбрано") return proceed();
      if (has(t, WANT) || budgetOf(t)) { const r = recommend(t); if (r.list.length) { flow.step = "item"; return bot(explain(r.list[0], r.c), () => { cards(r.list); chips(Cart.count() ? ["Оформить то, что выбрано"] : ["Показать все букеты"]); }); } }
      if (/^(да|ага|конечно|хочу|давай)/.test(t) && flow.step === "more") return askItem("Какой ещё букет добавить?");
      return bot(flow.step === "more" ? "Добавим ещё букет или оформляем?" : "Нажмите «Выбрать» под букетом, напишите его название или опишите, кому он.", () => chips(Cart.count() ? ["Оформить","Добавить ещё букет"] : ["Показать все букеты"]));
    }
    if (flow.step === "name") {
      if (text.length < 2 || text.split(/\s+/).length > 3 || NOT_NAME.test(t)) return bot("Не поняла, это имя? Напишите, пожалуйста, как к вам обращаться. Если хотите добавить букет, так и напишите: «добавить ещё букет».", () => chips(["Добавить ещё букет"]));
      flow.name = text.replace(/^(меня зовут|я)\s+/i, ""); return proceed();
    }
    if (flow.step === "phone") { if (text.replace(/\D/g, "").length < 10) return bot("В номере не хватает цифр. Формат: +7 900 000-00-00."); flow.phone = text; return proceed(); }
    if (flow.step === "when") { flow.when = text; return proceed(); }
    if (flow.step === "card") { flow.card = /без открыт/.test(t) ? "" : text; return proceed(); }
    if (flow.step === "send") return bot("Нажмите WhatsApp или Telegram выше. Можно ещё добавить букет или написать «отмена».", () => chips(["Добавить ещё букет"]));
  }
  function finish(ch) {
    const lp = Loyalty.state, ref = lp.user ? null : store.get("referrer", null), sum = Cart.sum();
    const orderNo = lp.user && sum ? Loyalty.onOrder({ base: sum, items: Cart.lines().join("\n"), channel: ch }) : null;
    const msg = [`Здравствуйте! Заказ через чат на сайте «${CONFIG.shop}».`, "", "Букеты:", ...Cart.lines(), `Итого за букеты: ${rub(sum)}`, "", `Доставка: ${flow.when}`, flow.card && `Открытка: ${flow.card}`, "", `Имя: ${flow.name}`, `Телефон: ${flow.phone}`, lp.user && `Карта клуба: ${lp.user.code}`, orderNo && `Номер заказа в клубе: ${orderNo}`, ref && `Пригласил друг: ${ref}`].filter(x => x !== false && x !== null && x !== undefined).join("\n").replace(/\n{3,}/g, "\n\n") + "\n" + Track.report();
    Track.purchase(sum, Cart.items.map(i => i.name).join(", "));
    sendTo(ch, msg); flow = null; Cart.clear();
    bot("Готово! Флорист ответит в течение 10 минут и пришлёт фото букетов перед отправкой.");
  }
  log.addEventListener("click", e => { const b = e.target.closest("[data-chat-order]"); if (!b) return; const item = BOUQUETS.find(x => x.id === b.dataset.chatOrder); bubble(item.name, "me"); if (flow) return addItem(item); startOrder(item); });
  $("#chatForm").addEventListener("submit", e => { e.preventDefault(); const i = $("#chatInput"); const v = i.value; i.value = ""; handle(v); });
  function open() {
    Sheets.open("chatSheet"); $("#chatDot").style.display = "none"; Track.event("chat_open");
    if (!started) { started = true; const u = Loyalty.state.user; bot(`${u ? u.name + ", здравствуйте" : "Здравствуйте"}! Я Вера, флорист «${CONFIG.shop}». Опишите человека и повод своими словами, и я соберу букет, объясню язык цветов и оформлю заказ.`, () => chips(["Подобрать букет","Оформить заказ","Доставка","Бонусы"])); }
  }
  $("#chatFab").onclick = open;
  return { open };
})();

/* ==========================================================
   14. НАВИГАЦИЯ, КОНТАКТЫ, ЖИВОЙ ГЕРОЙ
   ========================================================== */
$$(".js-wa").forEach(a => a.href = waLink("Здравствуйте! Хочу заказать букет."));
$$(".js-tg").forEach(a => a.href = tgLink());
$$(".js-phone").forEach(e => e.textContent = CONFIG.phoneText);
$$(".js-tgname").forEach(e => e.textContent = "@" + CONFIG.telegram);
$$(".js-address").forEach(e => e.innerHTML = `${esc(CONFIG.address)}<small>Самовывоз, ${esc(CONFIG.hours)}</small>`);
$("#year").textContent = new Date().getFullYear();

/* лепестки, плавно падающие в первом экране */
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const host = $("#petals"); const cols = ["#F4D9D4", "#FBF3EE", "#E9C1BA"];
  host.innerHTML = Array.from({ length: 7 }, (_, i) => `<svg class="petal" viewBox="0 0 18 22" style="left:${8 + i * 13}%;animation-duration:${9 + (i % 4) * 2.5}s;animation-delay:-${i * 1.7}s"><path fill="${cols[i % 3]}" d="M9 1C4 5 1 10 3 16c1 3 4 5 6 5s5-2 6-5C17 10 14 5 9 1Z"/></svg>`).join("");
}
/* лёгкий параллакс фото от движения пальца/мыши */
const hp = $("#heroPhoto");
if (hp && matchMedia("(pointer:fine)").matches) {
  hp.addEventListener("pointermove", e => { const r = hp.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; hp.style.transform = `perspective(900px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`; });
  hp.addEventListener("pointerleave", () => { hp.style.transition = "transform .8s cubic-bezier(.34,1.4,.64,1)"; hp.style.transform = ""; setTimeout(() => hp.style.transition = "", 800); });
}

const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); } }), { threshold: .12 }) : null;
const observe = scope => $$(".rv:not(.on)", scope).forEach(el => io ? io.observe(el) : el.classList.add("on"));

const VIEWS = ["home", "catalog", "build", "quiz", "cabinet"];
/* ссылки из бота: ?v=catalog — открыть нужный раздел (hash в мини-приложении занят данными Telegram) */
let bootView = new URLSearchParams(location.search).get("v");
function route() {
  const v = (location.hash || "#home").slice(1).split(/[?&]/)[0];
  const view = VIEWS.includes(v) ? v : VIEWS.includes(bootView) ? bootView : "home";
  bootView = null;
  $$(".view").forEach(s => s.classList.toggle("active", s.dataset.view === view));
  $$(".tab").forEach(t => { const on = t.dataset.tab === view; t.classList.toggle("active", on); on ? t.setAttribute("aria-current", "page") : t.removeAttribute("aria-current"); });
  document.body.classList.toggle("no-fab", view === "build");
  window.scrollTo(0, 0);
  Track.event("view_" + view);
  observe($("#v-" + view));
  if (view === "build") Builder.ensure();
  if (Sheets.current) Sheets.close();
}
addEventListener("hashchange", route);
Loyalty.render(); Care.banner(); Builder.update(); route();
setTimeout(() => Care.notifyDue(), 2500);
if (store.get("referrer", null) && !Loyalty.state.user && new URLSearchParams(location.search).get("ref")) setTimeout(() => toast(`Друг дарит вам ${CONFIG.loyalty.friendGift} баллов. Вступите в клуб, чтобы забрать`), 1200);

/* Открытые данные (наличие, отзывы), ссылки-намёки и переход из напоминания бота.
   Наличие перепроверяем каждые 30 секунд и при возвращении на вкладку, чтобы отметки флориста в боте появлялись почти сразу */
Shop.load();
setInterval(() => { if (!document.hidden) Shop.load(); }, 30e3);
document.addEventListener("visibilitychange", () => { if (!document.hidden) Shop.load(); });
(() => {
  const qs = new URLSearchParams(location.search);
  const hint = qs.get("hint"), care = qs.get("care"), cart = qs.get("cart"), gift = qs.get("gift");
  if (cart) setTimeout(async () => { await Loyalty.ready; await Loyalty.refresh(); Order.open(); }, 400);
  if (gift) setTimeout(() => Gift.view(gift), 500);
  if (hint) {
    const ids = hint.split(",").map(x => x.trim()).filter(id => BOUQUETS.some(b => b.id === id)).slice(0, 12);
    const from = (qs.get("from") || "").trim().slice(0, 40), note = (qs.get("note") || "").trim().slice(0, 160);
    if (ids.length) setTimeout(() => Fav.openReceived(ids, from, note), 600);
  }
  if (care && /^[A-Z0-9]{6,20}$/i.test(care)) {
    const go = async () => {
      await Loyalty.ready; await Loyalty.refresh();
      if (!Loyalty.me) { Loyalty.login({ then: go }); toast("Войдите в клуб, чтобы применить скидку к дате"); return; }
      if (!Care.offerById(care)) toast("Эта дата больше не найдена в календаре");
    };
    setTimeout(go, 500);
  }
  // убираем служебные параметры из адреса, чтобы при обновлении страницы окно не открывалось снова
  if (hint || care || cart || gift || qs.has("v")) {
    ["hint", "from", "note", "care", "cart", "gift", "v"].forEach(k => qs.delete(k));
    try { history.replaceState(null, "", location.pathname + (qs.toString() ? "?" + qs : "") + location.hash); } catch {}
  }
})();
/* пока открыт кабинет, обновляем статусы заказов раз в минуту */
setInterval(() => {
  const busy = document.activeElement && document.activeElement.closest && document.activeElement.closest("#cabinet input, #cabinet select, #cabinet textarea");
  if (!document.hidden && !busy && !Sheets.current && Loyalty.me && location.hash === "#cabinet") Loyalty.refresh(true);
}, 60e3);

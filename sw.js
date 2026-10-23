/* Service Worker «Дом Пиона»: мгновенная загрузка, работа без сети, уведомления */
const VERSION = "dp-v13";
const SHELL = ["./", "./index.html", "./app.js", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Страница: сначала сеть (свежий контент), без сети — из кэша
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put("./index.html", copy)); return res; })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Файлы самого сайта (app.js, иконки): сначала сеть, чтобы обновления видны сразу; без сети — из кэша
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(req).then(res => { if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return res; })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Фото и шрифты: из кэша сразу, в фоне обновляем
  /* фото, шрифты, 3D-библиотеки и 3D-сканы цветов: второй раз открываются мгновенно */
  if (["images.unsplash.com", "cdn.jsdelivr.net", "unpkg.com", "dl.polyhaven.org", "huggingface.co"].includes(url.hostname) || /hf\.co$|xethub|fonts\.g/.test(url.hostname) ) {
    e.respondWith(
      caches.open(VERSION).then(async cache => {
        const cached = await cache.match(req);
        const network = fetch(req).then(res => {
          if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    );
  }
});

/* Push-уведомления от сервера (когда подключите рассылку) */
self.addEventListener("push", e => {
  let data = { title: "Дом Пиона", body: "У нас новости для вас", url: "./" };
  try { data = Object.assign(data, e.data.json()); } catch (_) { if (e.data) data.body = e.data.text(); }
  e.waitUntil(self.registration.showNotification(data.title, {
    body: data.body, icon: "icons/icon-192.png", badge: "icons/icon-192.png", data: { url: data.url }
  }));
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || "./";
  e.waitUntil(clients.matchAll({ type: "window" }).then(list => {
    for (const c of list) { if ("focus" in c) { c.navigate(target); return c.focus(); } }
    return clients.openWindow(target);
  }));
});

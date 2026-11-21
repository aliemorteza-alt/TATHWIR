/* Tathwir: service worker sederhana.
   Halaman selalu diambil dari jaringan lebih dulu (jadi pembaruan langsung terlihat),
   salinan tersimpan hanya dipakai kalau sedang offline.
   Permintaan ke Apps Script dan situs lain tidak pernah disimpan. */
var CACHE = "tathwir-v1";
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});
self.addEventListener("fetch", function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== self.location.origin) return;
  e.respondWith(
    fetch(r).then(function (res) {
      if (res && res.ok) { var c = res.clone(); caches.open(CACHE).then(function (ch) { ch.put(r, c); }); }
      return res;
    }).catch(function () {
      return caches.match(r).then(function (m) { return m || caches.match("/app") || caches.match("/"); });
    })
  );
});

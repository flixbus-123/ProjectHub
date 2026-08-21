const CACHE_NAME = "projecthub-v2";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icon.png"
];


/* ================================
   INSTALL
================================ */

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(
                    FILES_TO_CACHE
                );

            })

    );

    self.skipWaiting();

});


/* ================================
   ACTIVATE
================================ */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(keys => {

                return Promise.all(

                    keys
                        .filter(
                            key =>
                                key !== CACHE_NAME
                        )
                        .map(
                            key =>
                                caches.delete(key)
                        )

                );

            })

    );

    self.clients.claim();

});


/* ================================
   FETCH
================================ */

self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)
            .then(cachedResponse => {

                if(cachedResponse){

                    return cachedResponse;

                }


                return fetch(event.request)
                    .then(response => {

                        /*
                         Nur erfolgreiche
                         GET-Anfragen speichern.
                        */

                        if(
                            event.request.method ===
                            "GET" &&
                            response.status === 200
                        ){

                            const copy =
                                response.clone();


                            caches.open(
                                CACHE_NAME
                            )
                            .then(cache => {

                                cache.put(
                                    event.request,
                                    copy
                                );

                            });

                        }


                        return response;

                    })
                    .catch(() => {

                        /*
                         Offline und Datei
                         nicht im Cache.
                        */

                        return new Response(
                            `
                            <!DOCTYPE html>
                            <html lang="de">
                            <body style="
                                background:#070a10;
                                color:white;
                                font-family:Arial;
                                text-align:center;
                                padding:50px;
                            ">

                            <h1>📴 Offline</h1>

                            <p>
                                Diese Seite ist momentan
                                nicht verfügbar.
                            </p>

                            </body>
                            </html>
                            `,
                            {
                                headers:{
                                    "Content-Type":
                                    "text/html; charset=utf-8"
                                }
                            }
                        );

                    });

            })

    );

});
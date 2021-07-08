let handleRequest = require("./handleRequest.js")

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

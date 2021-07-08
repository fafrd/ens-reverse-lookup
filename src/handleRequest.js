const ethers = require("ethers");

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

export async function handleRequest(request) {
  const provider = new ethers.providers.JsonRpcProvider("https://cloudflare-eth.com");

  let n = await provider.getNetwork()

  return new Response(
    "hello world", {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    }
  });
}

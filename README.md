# ENS reverse lookup as a service

[ENS (Ethereum Name Service) domains](https://docs.ens.domains/) are a way to connect a human-readable domain (such as kian.eth) to an address on the Ethereum blockchain (such as 0x5295b474F3A0bB39418456c96D6FCf13901A4aA1).

This repo contains a [Cloudflare Worker](https://developers.cloudflare.com/workers/) script that will perform the reverse-lookup: that is, given an ethereum address, return the ENS domain.

This API is publicly accessible at https://ens.fafrd.workers.dev/; however due to Cloudflare free tier limits you may get an HTTP 429, so you should deploy this yourself using the instructions below.

## examples

My address, which owns 2 ENS domains and has the reverse record set to 'kian.eth':

**request: https://ens.fafrd.workers.dev/ens/0x5295b474F3A0bB39418456c96D6FCf13901A4aA1**
```
{
  "reverseRecord": "kian.eth",
  "domains": [
    "kian.eth",
    "бутерин.eth"
  ]
}
```

An address which owns 3 ENS but does not have a reverse record set:

**request: https://ens.fafrd.workers.dev/ens/0xd035a780deccf7808875c6a555937b7c44299f45**
```
{
  "reverseRecord": null,
  "domains": [
    "whiskey.dcl.eth",
    "coins.dcl.eth",
    "don.dcl.eth"
  ]
}
```

## developing

- Install cloudflare's 'wrangler' cli tool: https://developers.cloudflare.com/workers/cli-wrangler/install-update
- authenticate with cloudflare: `wrangler login`
- open `wrangler.toml` and set the account_id value based on the output of the previous command
- open `src/config.ts`, and link to your node address.
- develop interactively with `wrangler dev`
- publish the application: `wrangler publish`

### Setting your ethereum node

Don't forget to set your ethereum node in `src/config.ts`! **Your node must be served from port 80 or 443**- this is a limitation with Cloudflare, they don't seem to support reaching out to nonstandard ports.

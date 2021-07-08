# ENS reverse lookup as a service

[ENS (Ethereum Name Service) domains](https://docs.ens.domains/) are a way to connect a human-readable domain (such as kian.eth) to an address on the Ethereum blockchain (such as 0x5295b474F3A0bB39418456c96D6FCf13901A4aA1).

This repo contains a [Cloudflare Worker](https://developers.cloudflare.com/workers/) script that will perform the reverse-lookup: that is, given an ethereum address, return the ENS domain.


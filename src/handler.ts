addEventListener("fetch", (event) => {
  event.respondWith(
    handleRequest(event.request).catch(
      (err) => new Response(err.stack, { status: 500 })
    )
  );
});

async function queryGraph(endpoint: string, query: string): Promise<any> {
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({query})
   });

  return resp.json();
}

async function fetchEns(address: string): Promise<Array<string>> {
  console.debug("fetching ens for account " + JSON.stringify(address));

  const endpoint = "https://api.thegraph.com/subgraphs/name/ensdomains/ens";
  const query = `{
    domains(where:{owner:"${address.toLowerCase()}"}) {
      name
    }
  }`;

  console.debug("query: \n" + query);

  const res = await queryGraph(endpoint, query);
  console.debug(JSON.stringify(res));

  return res.data.domains.map((d: any) => d.name);
}

export async function handleRequest(request: Request): Promise<Response> {
  const { pathname } = new URL(request.url);

  try {
    if (pathname.startsWith("/ens")) {

      let start = pathname.indexOf("/0x");
      if (start == -1)
        throw "No ethereum address provided.";
      if (pathname.length <= 42 + start) {
        throw "Invalid ethereum address provided.";
      }
      const address = pathname.substring(start + 1, start + 43).toLowerCase();
      console.log("address: " + address);

      // First, fetch all domains owned by this address.
      // Second, fetch the reverse record domain for this address.
      // Third, if reverse record is set, validate addr owns this domain.

      let allDomains = await fetchEns(address);
      console.log(allDomains);

      // TODO

      let resp = {
        "reverseRecord": null,
        "domains": allDomains
      };

      return new Response(JSON.stringify(resp), {
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    return new Response(
      "Error: " + e + "\n\nUsage: \n/ens/0x5295b474F3A0bB39418456c96D6FCf13901A4aA1",
      {
        status: 400,
        headers: {
          "content-type": "text/html;charset=UTF-8",
        }
    });
  }

  return new Response(
    "Usage: /ens/0x5295b474F3A0bB39418456c96D6FCf13901A4aA1", {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    }
  });
}

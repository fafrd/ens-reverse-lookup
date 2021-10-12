import { ethers } from "ethers";
import { NODE_ADDRESS } from "./config";

const abi = [{"inputs":[{"internalType":"contract ENS","name":"_ens","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address[]","name":"addresses","type":"address[]"}],"name":"getNames","outputs":[{"internalType":"string[]","name":"r","type":"string[]"}],"stateMutability":"view","type":"function"}];
const iface = new ethers.utils.Interface(abi);


addEventListener("fetch", (event) => {
  event.respondWith(
    handleRequest(event.request).catch(
      (err) => new Response(err.stack, { status: 500 })
    )
  );
});

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

      let reverseRecord: (string | null) = null;
      let res: string = "";
      try {
        res = await queryReverseEns(address);
        reverseRecord = await res;
        const res_parsed = JSON.parse(res).result;
        console.log(res)
        let rr = ethers.utils.defaultAbiCoder.decode([ethers.utils.ParamType.from("string[]")], res_parsed);
        console.log("reverseRecord: " + JSON.stringify(rr));
        reverseRecord = rr[0][0];
      } catch (e) {
        console.error(e);
        throw "Error contacting ethereum node. \nCause: '" + e + "'. \nResponse: " + res;
      }

      let allDomains = await fetchEns(address);
      console.log("all domains owned: " + JSON.stringify(allDomains));

      if (reverseRecord == "") {
        reverseRecord = null;
      }

      // if reverse record is set, validate addr owns this domain.
      if (reverseRecord != null && !allDomains.includes(reverseRecord)) {
        console.warn("Failed to validate! Reverse record set to " + reverseRecord + ", but user does not own this name.");
        reverseRecord = null;
      }

      let resp = {
        "reverseRecord": reverseRecord,
        "domains": allDomains
      };

      return new Response(
        JSON.stringify(resp),
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*"
          },
      });
    }
  } catch (e) {
    return new Response(
      "Error: " + e,
      {
        status: 400,
        headers: {
          "Content-Type": "text/raw;charset=UTF-8",
          "Access-Control-Allow-Origin": "*"
        }
    });
  }

  return new Response(
    "Usage: /ens/0x5295b474F3A0bB39418456c96D6FCf13901A4aA1", {
    headers: {
      "Content-Type": "text/html;charset=UTF-8",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

async function queryReverseEns(address: string): Promise<any> {
  console.log("calling node...")
  const data = iface.encodeFunctionData("getNames", [[ address.substring(2) ]]);

  const resp = await fetch(NODE_ADDRESS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: "1",
      method: "eth_call",
      params: [{"to": "0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C", "data": data}, "latest"],
    })
  });

  return resp.text();
}

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
  const endpoint = "https://api.thegraph.com/subgraphs/name/ensdomains/ens";
  const query = `{
    domains(where:{owner:"${address.toLowerCase()}"}) {
      name
    }
  }`;

  //console.debug("query: \n" + query);

  const res = await queryGraph(endpoint, query);
  //console.debug(JSON.stringify(res));

  return res.data.domains.map((d: any) => d.name);
}

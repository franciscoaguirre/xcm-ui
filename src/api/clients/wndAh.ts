import { wndAh as descriptors } from "@polkadot-api/descriptors";
import { createClient } from "polkadot-api";
import { getSmProvider } from "polkadot-api/sm-provider";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { wndRelayChain } from "./wnd";
import { smoldot } from "./smoldot";

const smoldotParachain = Promise.all([
  wndRelayChain,
  import("polkadot-api/chains/westend2_asset_hub"),
]).then(([relayChain, { chainSpec }]) =>
  smoldot.addChain({ chainSpec, potentialRelayChains: [relayChain] })
);

export const wndAhClient = createClient(getSmProvider(smoldotParachain));
export const wndAhWsClient = createClient(getWsProvider("wss://westend-asset-hub-rpc.polkadot.io"));
export const wndAhApi = wndAhWsClient.getTypedApi(descriptors);

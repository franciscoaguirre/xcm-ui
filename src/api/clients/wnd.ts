import { wnd as descriptors } from "@polkadot-api/descriptors";
import { createClient } from "polkadot-api";
import { getSmProvider } from "polkadot-api/sm-provider";
import { smoldot } from "./smoldot";
import { getWsProvider } from "polkadot-api/ws-provider/web";

export const wndRelayChain = import("polkadot-api/chains/westend2").then(({ chainSpec }) =>
  smoldot.addChain({ chainSpec })
);

// export const wndClient = createClient(getSmProvider(wndRelayChain));
export const wndWsClient = createClient(getWsProvider("wss://westend-rpc.polkadot.io"));
export const wndApi = wndWsClient.getTypedApi(descriptors);

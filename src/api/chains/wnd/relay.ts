import { XcmV3Junctions, XcmVersionedLocation } from "@polkadot-api/descriptors";
import { wndApi, wndWsClient } from "../../clients/wnd";
import { Chain } from "../types";

const wnd: Chain = {
  slug: "wnd",
  name: "Westend",
  client: wndWsClient,
  possibleDestinations: [
    {
      slug: "wndAh",
      name: "Westend Asset Hub",
      location: XcmVersionedLocation.V4({
        parents: 0,
        interior: {
          type: "X1" as const,
          value: [{ type: "Parachain" as const, value: 1000 }],
        },
      }),
    },
  ],
  nativeAssetId: {
    parents: 0,
    interior: XcmV3Junctions.Here(),
  },
  transferCall: (...args) =>
    wndApi.tx.XcmPallet.transfer_assets(...args),
}

export default [wnd];

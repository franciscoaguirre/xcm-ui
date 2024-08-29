import { XcmV3Junctions, XcmVersionedLocation } from "@polkadot-api/descriptors";
import { wndAhApi } from "../../clients/wndAh";
import { Chain } from "../types";

const wndAh: Chain = {
  slug: "wndAh",
  name: "Westend Asset Hub",
  api: wndAhApi,
  possibleDestinations: [
    {
      slug: "wnd",
      name: "Westend",
      location: XcmVersionedLocation.V4({
        parents: 1,
        interior: {
          type: "Here" as const,
          value: undefined,
        },
      }),
    },
  ],
  nativeAssetId: {
    parents: 1,
    interior: XcmV3Junctions.Here(),
  },
}

export default [wndAh];

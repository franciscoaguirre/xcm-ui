import { TypedApi } from "polkadot-api";
import { wnd, wndAh, XcmV3Junctions, XcmVersionedLocation } from "@polkadot-api/descriptors";

export type ChainId = "wnd" | "wndAh";

interface Destination {
  slug: ChainId,
  name: string,
  location: XcmVersionedLocation,
}

export interface Chain {
  slug: ChainId,
  name: string,
  api: TypedApi<typeof wnd | typeof wndAh>,
  possibleDestinations: Destination[],
  nativeAssetId: { parents: number, interior: XcmV3Junctions },
}

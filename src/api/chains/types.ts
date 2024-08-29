import { PolkadotClient, Transaction } from "polkadot-api";
import { XcmV3Junctions, XcmV3WeightLimit, XcmVersionedAssets, XcmVersionedLocation } from "@polkadot-api/descriptors";

export type ChainId = "wnd" | "wndAh";

interface Destination {
  slug: ChainId,
  name: string,
  location: XcmVersionedLocation,
}

interface TransferAssetsCallArgs {
  dest: XcmVersionedLocation,
  beneficiary: XcmVersionedLocation,
  weight_limit: XcmV3WeightLimit,
  assets: XcmVersionedAssets,
  fee_asset_item: number,
}

type TransferAssetsCall = (args: TransferAssetsCallArgs) => Transaction<any, any, any, any>;

export interface Chain {
  slug: ChainId,
  name: string,
  client: PolkadotClient,
  transferCall: TransferAssetsCall,
  possibleDestinations: Destination[],
  nativeAssetId: { parents: number, interior: XcmV3Junctions },
}

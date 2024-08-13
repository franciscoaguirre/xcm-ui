import { TypedApi } from "polkadot-api";
import { wndApi } from "./clients/wnd";
import { wndAhApi } from "./clients/wndAh";
import { wndAh, XcmV3Junctions, XcmVersionedLocation } from "@polkadot-api/descriptors";

export type ChainId = "wnd" | "wndAh";

export const chains = new Map<ChainId, any>;

[["wnd" as const, wndApi] as const, ["wndAh" as const, wndAhApi] as const].forEach(([chainId, api]) => {
  if (!chains.has(chainId)) {
    chains.set(chainId, api);
  }
});

export const chainIdsToNames = {
  wnd: "Westend",
  wndAh: "Westend Asset Hub",
};

export const possibleDestinations: { [K in ChainId]: ChainId[] } = {
  wnd: ["wndAh"],
  wndAh: ["wnd"],
};

const wndToWndAh: XcmVersionedLocation = {
  type: "V4",
  value: {
    parents: 0,
    interior: {
      type: "X1" as const,
      value: [{ type: "Parachain" as const, value: 1000 }],
    },
  },
};

const wndAhToWnd: XcmVersionedLocation = {
  type: "V4",
  value: {
    parents: 1,
    interior: {
      type: "Here" as const,
      value: undefined,
    },
  },
};

// Given a sender and a destination, returns the location of the
// destination relative to the sender.
export const senderToDestination: { [K in ChainId]: { [K2 in Exclude<ChainId, K>]: XcmVersionedLocation } }  = {
  wnd: {
    wndAh: wndToWndAh,
  },
  wndAh: {
    wnd: wndAhToWnd,
  },
};

export const chainToNativeAsset: { [K in ChainId]: { parents: number, interior: XcmV3Junctions } } = {
  wnd: { parents: 0, interior: XcmV3Junctions.Here() },
  wndAh: { parents: 1, interior: XcmV3Junctions.Here() }
};

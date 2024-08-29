import { Chain, ChainId } from "./types";
import wnd from "./wnd";

export const chains = new Map<ChainId, Chain>;

const allChains = [...wnd];
allChains.forEach((chain) => {
  const { slug } = chain;
  chains.set(slug, chain);
});

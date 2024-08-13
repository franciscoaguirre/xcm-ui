import styles from "./CrossChainTransfers.module.css";
import { useSelectedAccount } from "../../context";
import { Component, createEffect, createSignal, For, Show } from "solid-js"
import { DryRunButton } from "../DryRunButton";
import { Select } from "../Select";
import { ChainId, chainIdsToNames, chains, possibleDestinations } from "../../api/chains";
import { useBalance } from "../../api/common";
import { FormatBalance } from "../FormatBalance";

export const CrossChainTransfers: Component = () => {
  const [selectedAccount, _] = useSelectedAccount()!;
  const [sender, setSender] = createSignal<ChainId>("wnd");
  const senderBalance = useBalance(sender);
  const [destination, setDestination] = createSignal<ChainId>("wndAh");
  const destinationBalance = useBalance(destination);

  const onChangeSender = (chainId: ChainId) => {
    setSender(chainId);
    setDestination(possibleDestinations[chainId][0]);
  };

  const fromChains = [...chains.keys()]
  const chainToSelectorLabel = (chain: ChainId) => chainIdsToNames[chain];

  return (
    <Show when={selectedAccount() !== undefined}>
      <div class={styles.Dialog}>
        <Select label="From" setValue={onChangeSender}>
          <For each={fromChains}>
            {(chainId) => (
              <option value={chainId}>{chainToSelectorLabel(chainId)}</option>
            )}
          </For>
        </Select>
        <FormatBalance label="Balance" balance={senderBalance() ?? 0n} />
        <Select label="To" setValue={(value) => setDestination(value)}>
          <For each={possibleDestinations[sender()]}>
            {(chainId) => (
              <option value={chainId}>{chainToSelectorLabel(chainId)}</option>
            )}
          </For>
        </Select>
        <FormatBalance label="Balance" balance={destinationBalance() ?? 0n} />
        <DryRunButton sender={sender} destination={destination} />
      </div>
    </Show>
  );
}

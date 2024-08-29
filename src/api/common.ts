import { wndAh } from "@polkadot-api/descriptors";
import { SS58String, TypedApi } from "polkadot-api";
import { map } from "rxjs";
import { ChainId, chains } from "./chains";
import { useSelectedAccount } from "../context";
import { Accessor, createEffect, createSignal } from "solid-js";

type GenericApi = TypedApi<typeof wndAh>;

export const watchAccountNativeFreeBalance =
  (api: {
    query: {
      System: {
        Account: {
          watchValue: GenericApi["query"]["System"]["Account"]["watchValue"]
        }
      }
    }
  }) =>
  (account: SS58String) =>
    api.query.System.Account.watchValue(account, "best").pipe(
      map(({ data }) => data.free - data.frozen),
    );

export const useBalance = (chainId: Accessor<ChainId>) => {
  const [account, _] = useSelectedAccount()!;
  const [balance, setBalance] = createSignal<bigint>(0n);

  createEffect(() => {
    setBalance(0n);

    if (account()) {
      const subscription = watchAccountNativeFreeBalance(chains.get(chainId())!.api)(account()!.address).subscribe(setBalance);
      return () => {
        subscription.unsubscribe();
      }
    }
  });

  return balance;
}

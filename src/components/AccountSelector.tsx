import { wnd as descriptors } from '@polkadot-api/descriptors';
import { InjectedPolkadotAccount, connectInjectedExtension, getInjectedExtensions } from 'polkadot-api/pjs-signer';
import { createSignal, type Component, Show, For, createEffect } from 'solid-js';
import { map } from "rxjs";
import { FormatBalance } from './FormatBalance';
import { useSelectedAccount, useSelectedExtension } from '../context';
import { wndAhWsClient } from '../api/clients';

const api = wndAhWsClient.getTypedApi(descriptors);

export const AccountSelector: Component = () => {
  const [account, setAccount] = useSelectedAccount()!;
  const [extensions, _] = createSignal(getInjectedExtensions());
  const [selectedExtension, setSelectedExtension] = useSelectedExtension();
  const [balance, setBalance] = createSignal(0n);

  createEffect(() => {
    if (account()) {
      const subscription = api
        .query
        .System
        .Account
        .watchValue(account()!.address, "best")
        .pipe(map(({ data }) => data.free - data.frozen))
        .subscribe(setBalance);

      return () => {
        subscription.unsubscribe();
      }
    }
  });

  const onClickExtension = async (extension: string) => {
    setSelectedExtension(await connectInjectedExtension(extension));
  };

  const onClickAccount = (account: InjectedPolkadotAccount) => {
    setAccount(account);
  };

  return (
    <div>
      <span>Connect extension:</span>
      <ul class="extension-list">
        <For each={extensions()}>{(extension) =>
          <button onClick={() => onClickExtension(extension)}>{extension}</button>
        }</For>
      </ul>
      <Show
        when={selectedExtension() !== undefined}
        fallback={<p>No extension selected!</p>}
      >
        <p>Choose an account:</p>
        <ul class="account-list">
          <For each={selectedExtension()!.getAccounts()}>{(account) =>
            <button onClick={() => onClickAccount(account)}>{account.name ?? account.address}</button>
          }</For>
        </ul>
        <Show
          when={account() !== undefined}
          fallback={<p>No account selected!</p>}
        >
          <p>Account: {account()!.name ?? account()!.address}</p>
          <FormatBalance label="Balance" balance={balance()} />
        </Show>
      </Show>
    </div>
  );
}

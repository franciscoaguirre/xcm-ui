import { wnd } from '@polkadot-api/descriptors';
import { TypedApi } from 'polkadot-api';
import { InjectedExtension, InjectedPolkadotAccount, connectInjectedExtension, getInjectedExtensions } from 'polkadot-api/pjs-signer';
import { createSignal, type Component, Show, For, createEffect, Setter, Accessor } from 'solid-js';
import { map } from "rxjs";
import { FormatBalance } from './FormatBalance';

export interface AccountInfoProps {
  api: TypedApi<typeof wnd>;
  account: Accessor<InjectedPolkadotAccount | undefined>;
  setAccount: Setter<InjectedPolkadotAccount | undefined>;
}

export const AccountInfo: Component<AccountInfoProps> = (props) => {
  const [extensions, _] = createSignal(getInjectedExtensions());
  const [selectedExtension, setSelectedExtension] = createSignal<InjectedExtension | undefined>();
  const [balance, setBalance] = createSignal(0n);

  createEffect(() => {
    if (props.account()) {
      const subscription = props.api
        .query
        .System
        .Account
        .watchValue(props.account()!.address, "best")
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
    props.setAccount(account);
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
          when={props.account() !== undefined}
          fallback={<p>No account selected!</p>}
        >
          <p>Account: {props.account()!.name ?? props.account()!.address}</p>
          <FormatBalance balance={balance()} />
        </Show>
      </Show>
    </div>
  );
}

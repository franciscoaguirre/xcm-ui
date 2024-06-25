import { createSignal, type Component, Show } from 'solid-js';

import { createClient } from 'polkadot-api';
import { WebSocketProvider } from 'polkadot-api/ws-provider/web';

import logo from './logo.png';
import styles from './App.module.css';
import { AccountInfo } from './components/AccountInfo';
import { DryRunButton } from './components/DryRunButton';
import { wnd } from '@polkadot-api/descriptors';
import { InjectedPolkadotAccount } from 'polkadot-api/pjs-signer';

const client = createClient(
  WebSocketProvider("wss://westend-rpc.polkadot.io")
);
const wndApi = client.getTypedApi(wnd);

const App: Component = () => {
  const [selectedAccount, setSelectedAccount] = createSignal<InjectedPolkadotAccount | undefined>();

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <img src={logo} class={styles.logo} alt="logo" />
        <AccountInfo api={wndApi} account={selectedAccount} setAccount={setSelectedAccount} />
      </header>
      <Show when={selectedAccount() !== undefined}>
        <DryRunButton api={wndApi} account={selectedAccount()!} />
      </Show>
    </div>
  );
};

export default App;

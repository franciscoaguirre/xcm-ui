import { onMount, type Component } from 'solid-js';

import { local } from '@polkadot-api/descriptors';
import { createClient } from 'polkadot-api';
import { WebSocketProvider } from 'polkadot-api/ws-provider/web';

import logo from './logo.svg';
import styles from './App.module.css';

const App: Component = () => {
  onMount(() => {
    const client = createClient(
      WebSocketProvider("ws://127.0.0.1:8000"),
    );
    client.finalizedBlock$.subscribe((finalizedBlock) => {
      console.log(`New block ${finalizedBlock.number}: ${finalizedBlock.hash}`);
    });
  });

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <img src={logo} class={styles.logo} alt="logo" />
        <p>
          Hola
        </p>
      </header>
    </div>
  );
};

export default App;

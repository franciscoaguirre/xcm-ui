import { type Component } from 'solid-js';

import styles from './App.module.css';
import { HeaderBar } from './components/HeaderBar';
import { AccountProvider, ExtensionProvider } from './context';
import { CrossChainTransfers } from './components/CrossChainTransfers';

const App: Component = () => {
  return (
    <ExtensionProvider>
      <AccountProvider>
        <div class={styles.App}>
          <HeaderBar />
          <div class={styles.main}>
            <CrossChainTransfers />
          </div>
        </div>
      </AccountProvider>
    </ExtensionProvider>
  );
};

export default App;

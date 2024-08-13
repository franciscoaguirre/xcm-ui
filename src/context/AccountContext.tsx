import { type InjectedPolkadotAccount } from "polkadot-api/pjs-signer";
import { Component, JSXElement, Signal, createContext, createSignal, useContext } from "solid-js";

const SelectedAccountContext = createContext<Signal<InjectedPolkadotAccount | undefined>>();
export const useSelectedAccount = () => useContext(SelectedAccountContext);

export interface AccountProviderProps {
  children: JSXElement,
}

export const AccountProvider: Component<AccountProviderProps> = (props) => {
  const [selectedAccount, setSelectedAccount] = createSignal<InjectedPolkadotAccount | undefined>();

  return (
    <SelectedAccountContext.Provider value={[selectedAccount, setSelectedAccount]}>
      {props.children}
    </SelectedAccountContext.Provider>
  );
}

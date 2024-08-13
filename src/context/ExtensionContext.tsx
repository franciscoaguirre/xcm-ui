import { InjectedExtension, getInjectedExtensions } from "polkadot-api/pjs-signer";
import { Component, JSXElement, Signal, createContext, createSignal, onCleanup, onMount, useContext } from "solid-js";

export const useAvailableExtensions = (): string[] => {
  const [extensions, setExtensions] = createSignal(getInjectedExtensions() ?? []);

  let timeoutId: any;
  onMount(() => {
    const updateExtensions = () => {
      const injectedExtensions = getInjectedExtensions();
      setExtensions(injectedExtensions ?? []);
      timeoutId = setTimeout(updateExtensions, injectedExtensions ? 2_000 : 100);
    };
    updateExtensions();
  });

  onCleanup(() => clearTimeout(timeoutId));

  return extensions();
}

export const ExtensionContext = createContext<Signal<InjectedExtension | undefined>>();
export const useSelectedExtension = () => useContext(ExtensionContext)!;

export interface ExtensionProviderProps {
  children: JSXElement,
}

export const ExtensionProvider: Component<ExtensionProviderProps> = (props) => {
  const [selectedExtension, setSelectedExtension] = createSignal<InjectedExtension | undefined>();
  
  return (
    <ExtensionContext.Provider value={[selectedExtension, setSelectedExtension]}>
      {props.children}
    </ExtensionContext.Provider>
  );
}

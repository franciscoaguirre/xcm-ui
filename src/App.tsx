import { createSignal, type Component } from 'solid-js';

import { DispatchRawOrigin, WestendRuntimeOriginCaller, XcmV3MultiassetFungibility, XcmV3WeightLimit, XcmV4Junction, XcmV4Junctions, XcmVersionedAssets, XcmVersionedLocation, local } from '@polkadot-api/descriptors';
import { AccountId, Binary, createClient } from 'polkadot-api';
import { WebSocketProvider } from 'polkadot-api/ws-provider/web';
import { getInjectedExtensions, connectInjectedExtension } from 'polkadot-api/pjs-signer';

import logo from './logo.png';
import styles from './App.module.css';

const client = createClient(WebSocketProvider('ws://127.0.0.1:51138'));
const localApi = client.getTypedApi(local);
const encodeAccount = AccountId().enc;

const formatAmount = (amount: bigint): number => {
  const decimals = BigInt(1_000_000_000_000);
  const precision = 1_000_000;
  return Number(amount * BigInt(precision) / decimals) / precision;
}

const App: Component = () => {
  const [deliveryFees, setDeliveryFees] = createSignal(0);

  const dryRun = async () => {
    const extensions = getInjectedExtensions()!;
    console.log('Getting extensions...');
    const selectedExtension = await connectInjectedExtension(extensions[0]);
    const accounts = selectedExtension.getAccounts();
    console.log('Building call...');
    const call = localApi.tx.XcmPallet.transfer_assets({
      dest: XcmVersionedLocation.V4({ parents: 0, interior: XcmV4Junctions.X1(XcmV4Junction.Parachain(1000)) }),
      beneficiary: XcmVersionedLocation.V4({ parents: 0, interior: XcmV4Junctions.X1(XcmV4Junction.AccountId32({ network: undefined, id: Binary.fromBytes(encodeAccount(accounts[0].address)) })) }),
      weight_limit: XcmV3WeightLimit.Unlimited(),
      assets: XcmVersionedAssets.V4([{
        id: { parents: 0, interior: XcmV4Junctions.Here() },
        fun: XcmV3MultiassetFungibility.Fungible(1_000_000_000_000n) }
      ]),
      fee_asset_item: 0,
    });
    console.log('Calling runtime api...');
    const result = await localApi.apis.XcmDryRunApi.dry_run_call(
      WestendRuntimeOriginCaller.system(DispatchRawOrigin.Signed(accounts[0].address)),
      call.decodedCall
    );
    if (result.success && result.value.execution_result.success) {
      console.dir({ result: result.value });
      // We find the forwarded XCM we want.
      const xcmsToAssetHub = result.value.forwarded_xcms.find(([location, _]) => (
        location.type === "V4" &&
          location.value.parents === 0 &&
          location.value.interior.type === "X1"
          && location.value.interior.value.type === "Parachain"
          && location.value.interior.value.value === 1000
      ))!;
      console.dir({ xcmsToAssetHub });

      const deliveryFeesQuery = await localApi.apis.XcmPaymentApi.query_delivery_fees(xcmsToAssetHub[0], xcmsToAssetHub[1][0]);

      if (deliveryFeesQuery.success) {
        const amount = deliveryFeesQuery.value.type === "V4" && deliveryFeesQuery.value.value[0].fun.type === "Fungible" && deliveryFeesQuery.value.value[0].fun.value.valueOf() || 0n;
        setDeliveryFees(formatAmount(BigInt(amount)));
      }
    }
  };

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <img src={logo} class={styles.logo} alt="logo" />
        <button onClick={dryRun}>Dry Run</button>
        <p>
          Delivery fees: {deliveryFees()}
        </p>
      </header>
    </div>
  );
};

export default App;

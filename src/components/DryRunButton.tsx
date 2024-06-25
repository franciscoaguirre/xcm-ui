import { TypedApi, Binary, AccountId } from 'polkadot-api';
import { createSignal, type Component } from 'solid-js';
import {
  DispatchRawOrigin,
  WestendRuntimeOriginCaller,
  XcmV3MultiassetFungibility,
  XcmV3WeightLimit,
  XcmV4Junction,
  XcmV4Junctions,
  XcmVersionedAssets,
  XcmVersionedLocation,
  wnd,
} from '@polkadot-api/descriptors';
import { InjectedPolkadotAccount } from 'polkadot-api/pjs-signer';
import { FormatBalance } from './FormatBalance';

export interface DryRunButtonProps {
  api: TypedApi<typeof wnd>;
  account: InjectedPolkadotAccount;
}

const encodeAccount = AccountId().enc;

export const DryRunButton: Component<DryRunButtonProps> = (props) => {
  const [deliveryFees, setDeliveryFees] = createSignal(0n);

  const dryRun = async () => {
    const call = props.api.tx.XcmPallet.transfer_assets({
      dest: XcmVersionedLocation.V4({ parents: 0, interior: XcmV4Junctions.X1(XcmV4Junction.Parachain(1000)) }),
      beneficiary: XcmVersionedLocation.V4({ parents: 0, interior: XcmV4Junctions.X1(XcmV4Junction.AccountId32({ network: undefined, id: Binary.fromBytes(encodeAccount(props.account.address)) })) }),
      weight_limit: XcmV3WeightLimit.Unlimited(),
      assets: XcmVersionedAssets.V4([{
        id: { parents: 0, interior: XcmV4Junctions.Here() },
        fun: XcmV3MultiassetFungibility.Fungible(1_000_000_000_000n) }
      ]),
      fee_asset_item: 0,
    });
    console.log('Calling runtime api...');
    const result = await props.api.apis.DryRunApi.dry_run_call(
      WestendRuntimeOriginCaller.system(DispatchRawOrigin.Signed(props.account.address)),
      call.decodedCall
    );
    console.log('Finished');
    console.dir({ result });
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

      const deliveryFeesQuery = await props.api.apis.XcmPaymentApi.query_delivery_fees(xcmsToAssetHub[0], xcmsToAssetHub[1][0]);

      if (deliveryFeesQuery.success) {
        const amount = deliveryFeesQuery.value.type === "V4" && deliveryFeesQuery.value.value[0].fun.type === "Fungible" && deliveryFeesQuery.value.value[0].fun.value.valueOf() || 0n;
        setDeliveryFees(amount);
      }
    }
  };

  return (
    <div>
      <button onClick={dryRun}>Dry run</button>
      <FormatBalance balance={deliveryFees()} />
    </div>
  );
}

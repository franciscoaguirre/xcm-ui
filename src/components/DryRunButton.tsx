import { Binary, AccountId } from 'polkadot-api';
import { Accessor, createSignal, type Component } from 'solid-js';
import {
  DispatchRawOrigin,
  WestendRuntimeOriginCaller,
  wnd,
  XcmV3MultiassetFungibility,
  XcmV3WeightLimit,
  XcmVersionedAssets,
} from '@polkadot-api/descriptors';
import { FormatBalance } from './FormatBalance';
import { useSelectedAccount } from '../context';
import { ChainId } from '../api/chains/types';
import { chains } from '../api/chains';

const encodeAccount = AccountId().enc;

export interface DryRunButtonProps {
  sender: Accessor<ChainId>;
  destination: Accessor<ChainId>;
}

export const DryRunButton: Component<DryRunButtonProps> = (props) => {
  const [executionFees, setExecutionFees] = createSignal(0n);
  const [deliveryFees, setDeliveryFees] = createSignal(0n);
  const [account, _] = useSelectedAccount()!;
  const api = chains.get(props.sender())!.client.getTypedApi(wnd);

  const dryRun = async () => {
    const call = chains.get(props.sender())!.transferCall({
      dest: chains.get(props.sender())!.possibleDestinations.find((destination) => destination.slug === props.destination())!.location,
      beneficiary: { type: "V4", value: { parents: 0, interior: { type: "X1" as const, value: [{ type: "AccountId32" as const, value: { network: undefined, id: Binary.fromBytes(encodeAccount(account()!.address)) } }] } } },
      weight_limit: XcmV3WeightLimit.Unlimited(),
      assets: XcmVersionedAssets.V4([{
        id: chains.get(props.sender())!.nativeAssetId,
        fun: XcmV3MultiassetFungibility.Fungible(1_000_000_000_000n) }
      ]),
      fee_asset_item: 0,
    });
    setExecutionFees(await call.getEstimatedFees(account()!.address));
    console.log('Calling runtime api...');
    console.dir({ call: (await call.getEncodedData()).asHex() });
    const result = await api.apis.DryRunApi.dry_run_call(
      WestendRuntimeOriginCaller.system(DispatchRawOrigin.Signed(account()!.address)),
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
          && location.value.interior.value[0].type === "Parachain"
          && location.value.interior.value[0].value === 1000
      ))!;
      console.dir({ xcmsToAssetHub });

      const deliveryFeesQuery = await api.apis.XcmPaymentApi.query_delivery_fees(xcmsToAssetHub[0], xcmsToAssetHub[1][0]);

      if (deliveryFeesQuery.success) {
        const amount = deliveryFeesQuery.value.type === "V4" && deliveryFeesQuery.value.value[0].fun.type === "Fungible" && deliveryFeesQuery.value.value[0].fun.value.valueOf() || 0n;
        setDeliveryFees(amount);
      }
    }
  };

  return (
    <div>
      <button onClick={dryRun}>Dry run</button>
      <FormatBalance label="Execution fees" balance={executionFees()} />
      <FormatBalance label="Delivery fees" balance={deliveryFees()} />
    </div>
  );
}

import { XcmV4Instruction, XcmV3Junctions, DispatchRawOrigin, XcmV3MultiassetFungibility, XcmV3Junction, XcmV3WeightLimit, XcmV2OriginKind, wndAh, wnd } from "@polkadot-api/descriptors"
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { Binary, createClient, Enum, type PolkadotClient } from "polkadot-api";
import { createSignal,  createResource, Show, For, Component, createEffect } from "solid-js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { TextField, TextFieldInput, TextFieldLabel } from "./ui/text-field";
import { Card } from "./ui/card";
import {
    getInjectedExtensions,
    connectInjectedExtension,
    InjectedExtension,
    InjectedPolkadotAccount,
  } from "polkadot-api/pjs-signer"
import { createStore } from "solid-js/store";
import { NumberField, NumberFieldInput, NumberFieldLabel } from "./ui/number-field";

type AssetId = 'WND' | 'USDT' | 'USDC';
type Asset = { id: AssetId, amount: bigint };
type Location = { parents: number, interior: XcmV3Junctions };
type Chain = 'Relay' | 'Hydration' | 'Coretime';

export type PreItem = Instruction | SuperInstruction;
type Instruction = 'WithdrawAsset' | 'InitiateTransfer' | 'DepositAsset' | 'Transact' | 'ReportError';
export type SuperInstruction = typeof v5SuperInstructions[number];
export const superInstructions = ['RemoteTransact' as const];
export const v5SuperInstructions = ['TeleportTransact' as const];
type Item = { type: 'WithdrawAsset', value: Asset[] }
    | { type: 'TeleportTransact', value: { destination: Chain, assets: Asset[], call: string } };
type Action = ['send', Chain] | 'execute';

const provider = getWsProvider("ws://localhost:8000");
const client: PolkadotClient = createClient(provider);
const wndAhApi = client.getTypedApi(wndAh);

const [store, setStore] = createStore<Item[]>([]);
const [whatever, setWhatever] = createSignal(0);

const stringify = (obj: any): string => JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2);

createEffect(() => {
    const _ = whatever();

    console.log(stringify(store));
});

export const appendItem = (preItem: PreItem) => {
    switch (preItem) {
        case 'WithdrawAsset':
            setStore([...store, { type: 'WithdrawAsset', value: [{ id: 'WND', amount: 0n }] }]);
            setWhatever(1);
            break;
        case 'TeleportTransact':
            setStore([...store, {
                type: 'TeleportTransact',
                value: {
                    destination: 'Relay',
                    assets: [{ id: 'WND', amount: 0n }],
                    call: Binary.fromHex("")
                }
            }]);
            break;
    }
}

const withdrawSymbolToLocation: Record<'westendAssetHub', Record<string, Location>> = {
    "westendAssetHub": {
        "WND": { parents: 1, interior: XcmV3Junctions.Here() },
        "USDC": { parents: 0, interior: XcmV3Junctions.X2([XcmV3Junction.PalletInstance(50), XcmV3Junction.GeneralIndex(1337n)]) },
        "USDT": { parents: 0, interior: XcmV3Junctions.X2([XcmV3Junction.PalletInstance(50), XcmV3Junction.GeneralIndex(1984n)]) },
    }
}

const transferNameToLocation: Record<'westendAssetHub', Record<Chain, Location>> = {
    "westendAssetHub": {
        "Relay": { parents: 1, interior: XcmV3Junctions.Here() },
        "Hydration": { parents: 1, interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(2034)) },
        "Coretime": { parents: 1, interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(1005)) },
    }
}

const chainToWs: Record<'westendAssetHub', Record<Chain, string>> = {
    'westendAssetHub': {
        'Relay': 'wss://paseo.rpc.amforc.com',
        'Coretime': '',
        'Hydration': '',
    }
}

const [loading, setLoading] = createSignal(false);
const [success, setSuccess] = createSignal(false);

const transformer = (items: Item[]) => {
    const instructions = items.flatMap((item) => {
        if (item.type === 'WithdrawAsset') {
            return {
                type: 'WithdrawAsset' as const,
                value: item.value.map((asset) => assetTransformer(asset))
            }
        } else if (item.type === 'TeleportTransact') {
            return [
                XcmV4Instruction.WithdrawAsset(item.value.assets.map((asset) => assetTransformer(asset))),
                Enum('PayFees', { asset: { ...assetTransformer(item.value.assets[0]), fun: XcmV3MultiassetFungibility.Fungible(2_000_000_000_000n) } }),
                Enum('InitiateTransfer', {
                    destination: transferNameToLocation['westendAssetHub'][item.value.destination],
                    remote_fees: {
                        type: 'Teleport',
                        value: {
                            type: 'Wild',
                            value: {
                                type: 'All',
                                value: undefined,
                            },
                        },
                    },
                    preserve_origin: true,
                    assets: [],
                    remote_xcm: [
                        {
                            type: 'Transact',
                            value: {
                                origin_kind: XcmV2OriginKind.SovereignAccount(),
                                call: Binary.fromHex(item.value.call),
                            },
                        },
                    ],
                }),
            ];
        }
    });
    const filteredInstructions = instructions.filter((item) => item !== undefined);
    return filteredInstructions;
}

const assetTransformer = (asset: Asset): { id: Location, fun: XcmV3MultiassetFungibility } => {
    return {
        id: withdrawSymbolToLocation['westendAssetHub'][asset.id],
        fun: XcmV3MultiassetFungibility.Fungible(asset.amount * 10n ** 12n)
    }
}

const ItemCard: Component<{ index: number, item: Item }> = (props) => {
    let Element;
    if (props.item.type === 'WithdrawAsset') {
        Element = <WithdrawAssetCard index={props.index} />;
    } else if (props.item.type === 'TeleportTransact') {
        Element = <InitiateTransferCard index={props.index} />;
    }

    return (
        <Card class="w-[500px] mx-auto py-4 my-4">
            <h2>{props.item.type}</h2>
            {Element}
        </Card>
    );
};

const WithdrawAssetCard: Component<{ index: number }> = (props) => {
    return <div class="w-2/3 mx-auto">
        <Select 
            placeholder="Select the asset"
            options={["WND", "USDC", "USDT"]}
            itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
            onChange={(asset: string | null) => {
                setStore(
                    (_, index) => index === props.index,
                    'value',
                    0,
                    'id',
                    asset as AssetId
                );
                setWhatever(1);
            }}
        >
            <SelectTrigger>
                <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
            </SelectTrigger>
            <SelectContent />
        </Select>
        <NumberField>
            <NumberFieldLabel>Amount</NumberFieldLabel>
            <NumberFieldInput onChange={(e) => {
                setStore(
                    (_, index) => index === props.index,
                    'value',
                    0,
                    'amount',
                    BigInt(e.currentTarget.value)
                );
                setWhatever(2);
            }} />
        </NumberField>
    </div>;
};

const InitiateTransferCard: Component<{ index: number }> = (props) => {
    return (
        <div class="mx-auto w-2/3">
            <Select 
                class="mb-4"
                placeholder="Select the destination chain"
                options={["Relay", "Hydration", "Coretime"]}
                itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
                onChange={(option: string | null) => {
                    setStore(
                        (item, index) => index === props.index && item.type === 'TeleportTransact',
                        'value',
                        'destination',
                        option as Chain
                    );
                    setWhatever(3);
                }}
            >
                <SelectTrigger>
                    <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
                </SelectTrigger>
                <SelectContent />
            </Select>
            <Select
                placeholder="Select the asset"
                options={["WND", "USDC", "USDT"]}
                itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
                onChange={(option: string | null) => {
                    setStore(
                        (item, index) => index === props.index && item.type === 'TeleportTransact',
                        'value',
                        'assets',
                        0,
                        'id',
                        option as AssetId
                    );
                    setWhatever(3);
                }}
            >
                <SelectTrigger>
                    <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
                </SelectTrigger>
                <SelectContent />
            </Select>
            <NumberField>
                <NumberFieldLabel>Amount</NumberFieldLabel>
                <NumberFieldInput onChange={(e) => {
                    setStore(
                        (_, index) => index === props.index,
                        'value',
                        'assets',
                        0,
                        'amount',
                        BigInt(e.currentTarget.value)
                    );
                    setWhatever(2);
                }} />
            </NumberField>
            <TextField class="mx-auto w-[240px]">
                <TextFieldLabel>Call</TextFieldLabel>
                <TextFieldInput onChange={(event) => {
                    setStore(
                        (item, index) => index === props.index && item.type === 'TeleportTransact',
                        'value',
                        'call',
                        event.currentTarget.value
                    );
                    setWhatever(4);
                }} />
            </TextField>
        </div>
    );
}

const TransactCard: Component<{ index: number }> = (props) => {
    return (
        <TextField class="mx-auto w-[240px]">
            <TextFieldLabel>Calldata</TextFieldLabel>
            <TextFieldInput />
        </TextField>
    );
}

const [signer, setSigner] = createSignal<InjectedPolkadotAccount | undefined>(undefined);
// const [encodedData, setEncodedData] = createSignal('');

const connectWallet = async () => {
    // Get the list of installed extensions
    const extensions: string[] = getInjectedExtensions()
    console.log(extensions)
    // Connect to an extension
    const selectedExtension: InjectedExtension = await connectInjectedExtension(
        extensions[1],
    )
    console.log(selectedExtension)
    // Get accounts registered in the extension
    const accounts: InjectedPolkadotAccount[] = selectedExtension.getAccounts()
    console.log(accounts)
    // The signer for each account is in the `polkadotSigner` property of `InjectedPolkadotAccount`
    setSigner(accounts[0])
}

const fetchBlockNumber = async (client: PolkadotClient) => {
    const finalizedBlock = await client.getFinalizedBlock();
    return finalizedBlock.number
}

export const [chainName, setChainName] = createSignal('');
const fetchChainName = async (client: PolkadotClient) => {
    const chainSpecData = await client.getChainSpecData()
    setChainName(chainSpecData.name)
    return chainSpecData.name
}

const submitXcm = async () => {
    const message = transformer(store);
	const weight = await wndAhApi.apis.XcmPaymentApi.query_xcm_weight({ type: 'V5', value: message });
    const wndAhToWnd = wndAhApi.tx.PolkadotXcm.execute({
        message: { type: 'V5', value: message },
        max_weight: weight.success ? weight.value : { ref_time: 0n, proof_size: 0n },
    });
    setLoading(true);
    const tx = await wndAhToWnd.signAndSubmit(signer()!.polkadotSigner)
    console.log(tx)

    const provider = "ws://localhost:8001";
    const client = createClient(getWsProvider(provider));
    const remoteApi = client.getTypedApi(wnd);

    remoteApi.event.MessageQueue.Processed.watch().subscribe((event) => {
        if (event.payload.success) {
            setLoading(false);
            setSuccess(true);
        }
    });
}

const [fees, setFees] = createSignal(0n);

const dryRun = async () => {
    const message = transformer(store);
    const weight = await wndAhApi.apis.XcmPaymentApi.query_xcm_weight({ type: 'V5', value: message });
    const tx = wndAhApi.tx.PolkadotXcm.execute({
        message: { type: 'V5', value: message },
        max_weight: weight.success ? weight.value : { ref_time: 0n, proof_size: 0n },
    });
    const result = await wndAhApi.apis.DryRunApi.dry_run_call(
        Enum('system', DispatchRawOrigin.Signed('1NVBaamj5qNQSLTJVvTvDDh3mKZDYxpvVYzZWQh8XFghGUW')),
        tx.decodedCall
    );
    if (result.success) {
        const { forwarded_xcms: forwardedXcms } = result.value;
        const [remoteLocation, remoteMessages] = forwardedXcms[0];
        if (remoteMessages.length > 0) {
            const remoteMessage = remoteMessages[0];
            const provider = "ws://localhost:8001";
            const client = createClient(getWsProvider(provider));
            const remoteApi = client.getTypedApi(wnd);
            const dryRunResult = await remoteApi.apis.DryRunApi.dry_run_xcm(
                { type: 'V5', value: { parents: 0, interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(1000)) } },
                remoteMessage
            );
            console.log(stringify(dryRunResult));
            const feesResult = await tx.getEstimatedFees('1NVBaamj5qNQSLTJVvTvDDh3mKZDYxpvVYzZWQh8XFghGUW');
            // const weight = await dotApi.apis.XcmPaymentApi.query_xcm_weight(remoteMessage);
            // const assetId = { parents: 1, interior: XcmV3Junctions.Here() };
            // const remoteFee = await dotApi.apis.XcmPaymentApi.query_weight_to_asset_fee(weight, assetId);
            setFees(feesResult);
        }
    }
}

export const ChainInfo = () => {
    const [chainName] = createResource(client, fetchChainName);
    // const [finalizedBlockNumber] = createResource(client, fetchBlockNumber);

    return (
        <div class="mx-auto mt-4">
            {/* Change the chain
            <div> 
                <Select
                    value={}
                    onChange={setChain(chains[props.item])}
                    options={["Polkadot Relay Chain", "Polkadot Asset Hub", "Hydration"]}
                    placeholder="Select the chain you want to connect"
                    itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
                >
                    <SelectTrigger aria-label="XCM Version">
                        <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
                    </SelectTrigger>
                    <SelectContent />
                </Select>
            </div>
            */}
            <Show when={chainName()} fallback={<div>Loading...</div>} keyed>
                <div>
                    <div>Connected to: {chainName()}</div>
                    {/* <div>Finalized block: {finalizedBlockNumber()}</div> */}
                </div>
                <div class="my-4">
                    <Show when={signer()} fallback={(<button 
                        onclick={connectWallet}
                        class="bg-pink-500 text-white py-2 px-4 rounded"
                    >
                        Connect Wallet
                    </button>)} keyed>
                        <p>{signer()?.address }</p>
                    </Show>
                </div>
                <For each={store} fallback={<div class="py-2">Add your first XCM instruction</ div>}>{(item, index) => (
                    <ItemCard item={item} index={index()} />
                )}</For>
                <Show when={fees().toString() !== "0"} fallback={""} keyed>
                    <div class="mt-2 text-sm">
                        Estimated fees: <span class="font-light">{fees().toString()}</span>
                    </div>
                </Show>
                <Show when={store.length > 0} fallback={""} keyed>
                    <div class="flex flex-auto mx-auto justify-center py-2">
                        <button class="bg-red-500 px-2 py-1 rounded mx-2" on:click={() => submitXcm()}>Submit</button>
                        <button class="bg-gray-400 px-2 py-1 rounded" on:click={dryRun}>Dry run</button>
                    </div>
                    {loading() && <p>Loading</p>}
                    {success() && <p>Success!</p>}
                    {/* <div>Encoded data: {encodedData()}</div> */}
                </Show>
            </Show>
        </div>
    )
}
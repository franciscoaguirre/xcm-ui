import { pah, wndah, XcmVersionedXcm, XcmVersionedLocation, XcmV2MultilocationJunctions, XcmV4Instruction, XcmV3Junctions, XcmV3MultiassetMultiAssetFilter, XcmV3MultiassetWildMultiAsset, XcmV4AssetWildAsset, XcmV4AssetAssetFilter, PolkadotRuntimeOriginCaller, DispatchRawOrigin, XcmV3MultiassetFungibility, XcmV3WeightLimit, XcmV3Junction } from "@polkadot-api/descriptors"
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { Binary, createClient, Enum, PolkadotSigner, Transaction, type PolkadotClient } from "polkadot-api";
import { createSignal,  createResource, Show, For } from "solid-js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { TextField, TextFieldInput, TextFieldLabel } from "./ui/text-field";
import { Card } from "./ui/card";
import {
    getInjectedExtensions,
    connectInjectedExtension,
    InjectedExtension,
    InjectedPolkadotAccount,
  } from "polkadot-api/pjs-signer"

type Instruction = 'WithdrawAsset' | 'InitiateTransfer';
type V4Instruction = 'WithdrawAsset' | "InitiateReserveWithdraw" | 'InitiateTeleport';

export const [currentInstructions, setAppendedInstruction] = createSignal<Instruction[]>([]);
export const [currentInstructionsAsString, setAppendedInstructionAsString] = createSignal<string[]>([]);
export const [transferType, setTransferType] = createSignal('');

const [signer, setSigner] = createSignal<PolkadotSigner | undefined>(undefined);
const [encodedData, setEncodedData] = createSignal('');

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
    setSigner(accounts[0].polkadotSigner)
}

export const appendInstruction = (newInstruction: string) => {
    // let actualInstruction: XcmV4Instruction;
    
    // // TODO: Handle inputs & other instructions
    // if (newInstruction === 'WithdrawAsset') {
    //     actualInstruction = XcmV4Instruction.WithdrawAsset([]);
    // } 
    // else if (newInstruction === "InitiateTeleport") {
    //     actualInstruction = XcmV4Instruction.InitiateTeleport({
    //         assets: XcmV4AssetAssetFilter.Wild(XcmV4AssetWildAsset.All()),
    //         dest: { parents: 1, interior: XcmV3Junctions.Here() },
    //         xcm: []
    //     })
    // } 
    // else if (newInstruction === "InitiateReserveWithdraw") {
    //     actualInstruction = XcmV4Instruction.InitiateReserveWithdraw({
    //         assets: XcmV4AssetAssetFilter.Wild(XcmV4AssetWildAsset.All()),
    //         reserve: { parents: 1, interior: XcmV3Junctions.Here() },
    //         xcm: []
    //     })
    // }
    // else if (newInstruction === "InitiateTransfer") {
    //     actualInstruction = Enum("InitiateTransfer", {}),
    // }

    setAppendedInstructionAsString((prev) => [...prev, newInstruction]);
};

const provider = getWsProvider("wss://westend-asset-hub-rpc.polkadot.io");
const client: PolkadotClient = createClient(provider);
// const dotApi = client.getTypedApi(dot)
const wndAhApi = client.getTypedApi(wndah)

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
    const msg = Enum("V5", [
		XcmV4Instruction.WithdrawAsset([{
			id: {
                parents: 1,
                interior: XcmV3Junctions.Here()
            },
			// fun: XcmV3MultiassetFungibility.Fungible(withdrawAssetParams().amount),
			fun: XcmV3MultiassetFungibility.Fungible(5_000_000_000_000n),
		}]),
		Enum('PayFees', {
			asset: {
				id: {
					parents: 1,
					interior: XcmV3Junctions.Here(),
				},
				fun: XcmV3MultiassetFungibility.Fungible(1_500_000_000_000n),
			}
		}),
		Enum('InitiateTransfer', {
			destination: {
				parents: 1,
				interior: XcmV3Junctions.Here(),
			},
			remote_fees: Enum('Teleport', {
				type: 'Definite',
				value: [{
					id: {
						parents: 1,
						interior: XcmV3Junctions.Here(),
					},
					// here need to put the cost/weight of remote xcm message.
					fun: XcmV3MultiassetFungibility.Fungible(500_000_000_000n),
				}],
			}),
			preserve_origin: false,
			assets: [Enum('Teleport', {
				type: 'Wild',
				value: {
					type: 'All',
					value: undefined,
				},
			})],
			remote_xcm: [
				// XcmV4Instruction.DepositAsset({
				// 	assets: XcmV4AssetAssetFilter.Definite([{
				// 		id: { parents: 0, interior: XcmV3Junctions.Here() },
				// 		fun: XcmV3MultiassetFungibility.Fungible(1_000_000_000_000n),
				// 	}]),
				// 	beneficiary: {
				// 		parents: 0,
				// 		interior: XcmV3Junctions.X1(XcmV3Junction.AccountId32({
				// 			network: undefined,
				// 			id: Binary.fromBytes(signer()!.publicKey),
				// 		})),
				// 	},
				// }),
			],
		}),
	]);
    
	// const weight = await wndAHApi.apis.XcmPaymentApi.query_xcm_weight(msg);
	const wndAhToWnd = wndAhApi.tx.PolkadotXcm.execute({
			message: msg,
			// max_weight: { ref_time: weight.value.ref_time, proof_size: weight.value.proof_size },
			max_weight: { ref_time: 72551079000n, proof_size: 629389n },
		},
	);
    
    const tx = await wndAhToWnd.signAndSubmit(signer()!)
    console.log(tx)

    // const result = await wndAHApi.apis.DryRunApi.dry_run_call(
    //     PolkadotRuntimeOriginCaller.system(DispatchRawOrigin.Signed('5CSC3FKhsJZtxuKwLrsTn4PYC9KuXFQgqzpWQDRLaSEAWhaz')),
    //     ahToWnd.decodedCall
    // );
    // const stringify = (obj: any): string => JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2);
    // console.log(stringify(result));

    // const transaction = dotApi.tx.XcmPallet.execute({
    //     message: XcmVersionedXcm.V4(currentInstructions().map((instruction) => instruction[1])),
    //     max_weight: { ref_time: 1_000_000_000_000n, proof_size: 100_000n },
    // });
    // const transaction = wndAhApi.tx.PolkadotXcm.execute({
    //     message: Enum('V5', []),
    // });
       
    // const encodedData = await transaction.getEncodedData()
    // setEncodedData(encodedData.asHex());
}

const [fees, setFees] = createSignal(0n);

const dryRun = async () => {
    const transaction = dotApi.tx.XcmPallet.execute({
        message: XcmVersionedXcm.V4(currentInstructions().map((instruction) => instruction[1])),
        max_weight: { ref_time: 1_000_000_000_000n, proof_size: 100_000n },
    });
    const result = await dotApi.apis.DryRunApi.dry_run_call(
        PolkadotRuntimeOriginCaller.system(DispatchRawOrigin.Signed('5CSC3FKhsJZtxuKwLrsTn4PYC9KuXFQgqzpWQDRLaSEAWhaz')),
        transaction.decodedCall
    );
    const stringify = (obj: any): string => JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2);
    console.log(stringify(result));
    const feesResult = await transaction.getEstimatedFees('5CSC3FKhsJZtxuKwLrsTn4PYC9KuXFQgqzpWQDRLaSEAWhaz');
    // const weight = await dotApi.apis.XcmPaymentApi.query_xcm_weight(remoteMessage);
    // const assetId = { parents: 1, interior: XcmV3Junctions.Here() };
    // const remoteFee = await dotApi.apis.XcmPaymentApi.query_weight_to_asset_fee(weight, assetId);
    setFees(feesResult);
}

const chains = {
    "Polkadot Relay Chain": "polkadotrc",
    "Polkadot Asset Hub": "polkadotah",
    "Westend Relay Chain": "westendrc",
    "Westend Asset Hub": "westendah",
}

const withdrawSymbolToLocation: Record<string, Record<string, string>> = {
    "westendah": {
        "DOT": `{"parents":"1","interior":"Here"}`,
        "USDC": `{"parents":"0","interior":"Here"}`,
        "USDT": `{"parents":"0","interior":"Here"}`,
    }
}
const mapWithdrawSymbolToLocation = (symbol: string) => {
    withdrawAssetParams().asset = withdrawSymbolToLocation["westendah"][symbol]
}
type WithdrawAssetParams = {
    asset: string,
    amount: string
}
export const [withdrawAssetParams, setWithdrawAssetParams] = createSignal<WithdrawAssetParams>({asset: "", amount: ""});

const transferNameToLocation: Record<string, Record<string, string>> = {
    "westendah": {
        "Polkadot Relay Chain": `{"parents":"1","interior":"Here"}`,
        "Hydration": `{"parents":"1","interior":"Here"}`,
        "Moonbeam": `{"parents":"1","interior":"Here"}`,
    }
}
const mapTransferNameToLocation = (name: string) => {
    initiateTransferParams().dest = transferNameToLocation["westendah"][name]
}
type InitiateTransferParams = {
    dest: string
}
export const [initiateTransferParams, setInitiateTransferParams] = createSignal<InitiateTransferParams>({ dest: "" });

type TransactParams = {
    calldata: string
}
export const [transactParams, setTransactParams] = createSignal<TransactParams>({ calldata: "" });

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
                    <button 
                        onclick={connectWallet}
                        class="bg-pink-500 text-white py-2 px-4 rounded"
                    >
                        Connect Wallet
                    </button>
                </div>
                <Card class="w-[500px] mx-auto py-4 my-4">
                    <ul class="list-none">
                        <For each={currentInstructionsAsString()} fallback={<div class="py-2">Add your first XCM instruction</ div>}>
                            {(instruction) => {
                                return (
                                <li class="py-2 rounded">
                                    <div class="mx-auto">
                                        <span>{`${instruction}`}</span>
                                        {instruction === "WithdrawAsset" ? (
                                            <TextField class="mx-auto w-[320px]">
                                                {/* <TextFieldLabel>Asset ID</TextFieldLabel> */}
                                                <Select 
                                                    placeholder="Select the asset"
                                                    options={["DOT", "USDC", "USDT"]}
                                                    itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
                                                    onChange={mapWithdrawSymbolToLocation}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent />
                                                </Select>
                                                <div>
                                                    <TextFieldLabel>Amount</TextFieldLabel>
                                                    <TextFieldInput />
                                                </div>
                                            </TextField>
                                        ) : instruction === "InitiateTransfer" ? (
                                            <TextField class="mx-auto w-[240px]">
                                                <TextFieldLabel class="text-gray-400">{`(${transferType()})`}</TextFieldLabel>
                                                <Select 
                                                    placeholder="Select the destination chain"
                                                    options={["Polkadot Relay Chain", "Hydration", "Moonbeam"]}
                                                    itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
                                                    onChange={mapTransferNameToLocation}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent />
                                                </Select>
                                            </TextField>
                                        ) : instruction === "InitiateTeleport" ? (
                                            <TextField class="mx-auto w-[240px]">
                                                <Select 
                                                    placeholder="Select the destination chain"
                                                    options={["Polkadot Relay Chain", "Hydration", "Moonbeam"]}
                                                    itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
                                                    onChange={mapTransferNameToLocation}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent />
                                                </Select>
                                            </TextField>
                                        ) : instruction === "Transact" ? (
                                            <TextField class="mx-auto w-[240px]">
                                                <TextFieldLabel>Calldata</TextFieldLabel>
                                                <TextFieldInput />
                                            </TextField>
                                        ) : ""}
                                    </div>
                                </li>)
                                }}
                        </For>
                    </ul>
                    <Show when={fees().toString() !== "0"} fallback={""} keyed>
                        <div class="mt-2 text-sm">
                            Estimated fees: <span class="font-light">{fees().toString()}</span>
                        </div>
                    </Show>
                </Card>
                <div class="flex flex-auto mx-auto justify-center py-2">
                    <button class="bg-red-500 px-2 py-1 rounded mx-2" on:click={() => submitXcm()}>Submit</button>
                    <button class="bg-gray-400 px-2 py-1 rounded" on:click={dryRun}>Dry run</button>
                </div>
                <div>Encoded data: {encodedData()}</div>
            </Show>
        </div>
    )
}
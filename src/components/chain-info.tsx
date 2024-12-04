import { dot, wndah, XcmVersionedXcm, XcmVersionedLocation, XcmV2MultilocationJunctions, XcmV4Instruction, XcmV3Junctions, XcmV3MultiassetMultiAssetFilter, XcmV3MultiassetWildMultiAsset, XcmV4AssetWildAsset, XcmV4AssetAssetFilter, PolkadotRuntimeOriginCaller, DispatchRawOrigin, XcmV3MultiassetFungibility } from "@polkadot-api/descriptors"
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { createClient, Transaction, type PolkadotClient } from "polkadot-api";
import { createSignal,  createResource, Show, For } from "solid-js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { TextField, TextFieldInput, TextFieldLabel } from "./ui/text-field";
import { Card } from "./ui/card";
import { xcmVersion } from "./app-sidebar";



type Instruction = 'WithdrawAsset' | 'InitiateTransfer';
type V4Instruction = 'WithdrawAsset' | "InitiateReserveWithdraw" | 'InitiateTeleport';

export const [currentInstructions, setAppendedInstruction] = createSignal<[Instruction, XcmV4Instruction][]>([]);

const [encodedData, setEncodedData] = createSignal('');

export const [transferType, setTransferType] = createSignal('');

export const appendInstruction = (newInstruction: Instruction) => {
    let actualInstruction: XcmV4Instruction;
    
    // TODO: Handle inputs & other instructions
    if (newInstruction === 'WithdrawAsset') {
        actualInstruction = XcmV4Instruction.WithdrawAsset([]);
    } 
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
    //     // actualInstruction = { type: 'InitiateTransfer', value: { ... } };
    // }

    setAppendedInstruction((prev) => [...prev, [newInstruction, actualInstruction]]);
};

const provider = getWsProvider("wss://westend-asset-hub-rpc.polkadot.io");
const client: PolkadotClient = createClient(provider);
const dotApi = client.getTypedApi(dot)

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
    const transaction = dotApi.tx.XcmPallet.execute({
        message: XcmVersionedXcm.V4(currentInstructions().map((instruction) => instruction[1])),
        max_weight: { ref_time: 1_000_000_000_000n, proof_size: 100_000n },
    });

    // const transaction = wndAhApi.tx.PolkadotXcm.execute({
    //     message: Enum('V5', [
    //         XcmV4Instruction.WithdrawAsset -> { type: 'WithdrawAsset', value: ... }
    //         Enum('InitiateTransfer', ...) -> { type: 'InitiateTra nsfe', ... }
    //         { type: 'IntiitateF' }
    //     ]),
    // });
       
    const encodedData = await transaction.getEncodedData()

    setEncodedData(encodedData.asHex());
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

export const ChainInfo = () => {
    const [chainName] = createResource(client, fetchChainName);
    const [finalizedBlockNumber] = createResource(client, fetchBlockNumber);

    return (
        <div>
            <div>
            {/* <Select
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
                </Select> */}
            </div>
            <Show when={chainName() && finalizedBlockNumber()} fallback={<div>Loading...</div>} keyed>
                <div>
                    <div>Connected to: {chainName()}</div>
                    <div>Finalized block: {finalizedBlockNumber()}</div>
                </div>
                <Card class="w-[500px] mx-auto py-4 my-4">
                    <ul class="list-none">
                        <For each={currentInstructions()} fallback={<div class="py-2">Add your first XCM instruction</ div>}>
                            {(instruction, i) => {
                                return (
                                <li class="py-2 rounded">
                                    <div class="mx-auto">
                                        <span>{`${instruction[0]}`}</span>
                                        {instruction[0] === "WithdrawAsset" ? (
                                            <TextField class="mx-auto w-[320px]">
                                                {/* <TextFieldLabel>Asset ID</TextFieldLabel> */}
                                                <Select 
                                                    placeholder="Select the asset"
                                                    options={["DOT", "USDC", "USDT"]}
                                                    itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent />
                                                </Select>
                                                <TextFieldLabel>Amount</TextFieldLabel>
                                                <TextFieldInput />
                                            </TextField>
                                        ) : instruction[0] === "InitiateTransfer" ? (
                                            <TextField class="mx-auto w-[240px]">
                                                <TextFieldLabel class="text-gray-400">{`(${transferType()})`}</TextFieldLabel>
                                                <Select 
                                                    placeholder="Select the destination chain"
                                                    options={["Polkadot Relay Chain", "Hydration", "Moonbeam"]}
                                                    itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent />
                                                </Select>
                                            </TextField>
                                        ) : instruction[0] === "Transact" ? (
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
import { dot, ksm, XcmVersionedXcm, XcmVersionedLocation, XcmV2MultilocationJunctions, XcmV4Instruction } from "@polkadot-api/descriptors"
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { createClient, type PolkadotClient } from "polkadot-api";
import { createSignal,  createResource, Show, For } from "solid-js";


export const [currentInstructions, setAppendedInstruction] = createSignal<string[]>([]);

export const appendInstruction = (newInstruction: string) => {
    setAppendedInstruction((prev) => [...prev, newInstruction]);
};

const provider = getWsProvider("wss://rpc.polkadot.io");

const fetchBlockNumber = async (client: PolkadotClient) => {
    const finalizedBlock = await client.getFinalizedBlock();
    return finalizedBlock.number
}

const fetchChainName = async (client: PolkadotClient) => {
    const chainSpecData = await client.getChainSpecData()
    return chainSpecData.name
}

const constructXcm = async (client: PolkadotClient) => {
    const dotApi = client.getTypedApi(dot)

    const xcmSendTx = dotApi.tx.XcmPallet.send({
        dest: XcmVersionedLocation.V2({
          parents: 0,
          interior: XcmV2MultilocationJunctions.Here(),
        }),
        message: XcmVersionedXcm.V2([XcmV4Instruction.ClearOrigin()]),
      })
       
      const encodedData = await xcmSendTx.getEncodedData()

      return encodedData
}

export const ChainInfo = () => {
    const client: PolkadotClient = createClient(provider);

    const [chainName] = createResource(client, fetchChainName);
    const [finalizedBlockNumber]  = createResource(client, fetchBlockNumber);

    return (
        <Show when={chainName() && finalizedBlockNumber()} fallback={<div>Loading...</div>} keyed>
            <div>
                <div>Connected to: {chainName()}</div>
                <div>Finalized block: {finalizedBlockNumber()}</div>
            </div>
            <div>
            <For each={currentInstructions()} fallback={<div class="py-2">Add your first XCM instruction</ div>}>
                {(instruction, i) => <div class="py-2 rounded">{`${i() + 1}. ${instruction}`}</ div>}
            </For>
            </div>
        </Show>
    )
}
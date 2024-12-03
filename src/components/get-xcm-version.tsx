// import { dot, ksm, XcmVersionedXcm, XcmVersionedLocation, XcmV2MultilocationJunctions, XcmV4Instruction } from "@polkadot-api/descriptors"
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { createClient, type PolkadotClient } from "polkadot-api";
import { createResource, Show } from "solid-js";

const provider = getWsProvider("wss://rpc.polkadot.io");

const getClient = () => {
    const client: PolkadotClient = createClient(provider);
    return client
}

const fetchBlock = async () => {
    const client = getClient()
    const finalizedBlock = await client.getFinalizedBlock();
    return finalizedBlock.number
}

const fetchChainName = async () => {
    const client = getClient()
    const chainSpecData = await client.getChainSpecData()
    return chainSpecData.name
}

export const XcmVersion = () => {
    const [chainSpecData] = createResource(fetchChainName);
    const [finalizedBlock]  = createResource(fetchBlock);

    return (
        <Show when={chainSpecData() && finalizedBlock()} fallback={<div>Loading...</div>} keyed>
            <div>
                <div>Connected to: {chainSpecData()}</div>
                <div>Finalized block: {finalizedBlock()}</div>
                {/* <div>XCM Version: {xcmVersionDOT.getValue()}</div> */}
            </div>
        </Show>
    )
}
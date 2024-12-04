import { createSignal, For, Show } from "solid-js"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuItem } from "./ui/sidebar"
import { DropdownMenu, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuContent } from "./ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { appendInstruction, chainName, setTransferType } from "./chain-info";
import { Separator } from "./ui/separator";

type XcmVersion = `V${3 | 4 | 5}`;

export const [chain, setChain] = createSignal("westendah")
export const [xcmVersion, setXcmVersion] = createSignal<XcmVersion>('V5')

export const AppSidebar = () => {
    const instructions: Record<'V3' | 'V4' | 'V5', string[]> = {
        // TODO: Add all instructions
        'V3': ['WithdrawAsset', 'InitiateReserveWithdraw', 'InitiateTeleport', 'DepositAsset', 'Transact'],
        'V4': ['WithdrawAsset', 'InitiateReserveWithdraw', 'InitiateTeleport', 'DepositAsset', 'Transact'],
        'V5': ['WithdrawAsset', 'InitiateTransfer', 'DepositAsset', 'Transact']
    }

    const useCases: Record<string, string[]> = {
        polkadotrc: ['Teleport and Deposit', 'Teleport and Transact', "Reserve", "Close XCM channel"],
        poladkotah: ['Teleport DOT', 'Reserve-backed transfer'],
        westendrc: [],
        westendah: ['Teleport and Deposit', 'Teleport and Transact', "Reserve", "Close XCM channel"],
        hydration: [],
        moonbeam: [],
        // etc
    }

    const useCase: Record<XcmVersion, Record<string, string[]>> = {
        "V3": { 
            "Teleport and Deposit": ["WithdrawAsset", "InitiateTeleport", "DepositAsset"],
            "Teleport and Transact": ["WithdrawAsset", "InitiateTeleport", "Transact"],
            "Reserve": [],
            "Close XCM channel": []
        },
        "V4": { 
            "Teleport and Deposit": ["WithdrawAsset", "InitiateTeleport", "DepositAsset"],
            "Teleport and Transact": ["WithdrawAsset", "InitiateTeleport", "Transact"],
            "Reserve": [],
            "Close XCM channel": []
        },
        "V5": { 
            "Teleport and Deposit": ["WithdrawAsset", "InitiateTransfer", "DepositAsset"],
            "Teleport and Transact": ["WithdrawAsset", "InitiateTransfer", "Transact"],
            "Reserve": [],
            "Close XCM channel": []
        },
    }

    return (
        <Sidebar>
            <SidebarHeader>
                {/* <Show when={chainName()} fallback={<div>Loading...</div>} keyed>
                    <SidebarGroupLabel class="text-gray-500 mx-auto font-extralight text-[0.65rem]">
                        Currently connected to {chainName()}
                    </SidebarGroupLabel>
                </Show> */}
                <SidebarGroupLabel class="-mb-2 -mt-1">
                    XCM Version
                </SidebarGroupLabel>
                <Select
                    value={xcmVersion()}
                    onChange={setXcmVersion}
                    options={["V3", "V4", "V5"]}
                    placeholder="Select the XCM Version"
                    itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
                >
                    <SelectTrigger aria-label="XCM Version">
                        <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
                    </SelectTrigger>
                    <SelectContent />
                </Select>
            </ SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel class="mb-1">
                        Use cases
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <For 
                                each={useCases[chain()]} 
                                fallback={<div class="py-2 bg-red-200 rounded">No use cases were found</div>}
                            >
                                {(item) => <SidebarMenuItem onclick={() => {
                                    useCase[xcmVersion()][item].forEach((instruction) => {
                                        if (item.includes("Teleport")) {
                                            setTransferType("Teleport")
                                        } else if (item.includes("Reserve")) {
                                            setTransferType("Reserve")
                                        }
                                        appendInstruction(instruction)
                                    })
                                }} 
                                class="py-2 rounded hover:bg-gray-100 hover:bg-opacity-50 hover:cursor-pointer">{item}</SidebarMenuItem>}
                            </For>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </ SidebarGroup>
                <Separator/>
                <SidebarGroup>
                    <SidebarGroupLabel class="mb-1">
                        Instructions
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <For each={instructions[xcmVersion()]} fallback={<div class="py-2 bg-red-200 rounded">No instructions were found</div>}>
                                {(item) => <SidebarMenuItem onclick={() => appendInstruction(item)} class="py-2 rounded hover:bg-gray-100 hover:bg-opacity-50 hover:cursor-pointer"><span>{item}</span></SidebarMenuItem>}
                            </For>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </ SidebarGroup>    
            </ SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                Documentation
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel><button>Wiki Docs</button></DropdownMenuLabel>
                                <DropdownMenuLabel><button>XCM Spec</button></DropdownMenuLabel>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </ SidebarMenu>
            </ SidebarFooter>
        </ Sidebar>
    )
}
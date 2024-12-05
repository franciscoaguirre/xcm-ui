import { createSignal, For } from "solid-js"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuItem } from "./ui/sidebar"
import { DropdownMenu, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuContent } from "./ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { appendItem, PreItem, SuperInstruction, v5SuperInstructions } from "./chain-info";
import { Separator } from "./ui/separator";

type XcmVersion = `V${3 | 4 | 5}`;

export const [chain, setChain] = createSignal("westendah")
export const [xcmVersion, setXcmVersion] = createSignal<XcmVersion>('V5')

export const AppSidebar = () => {
    const instructions: Record<XcmVersion, PreItem[]> = {
        // TODO: Add all instructions
        // 'V3': ['WithdrawAsset', 'InitiateReserveWithdraw', 'InitiateTeleport', 'DepositAsset', 'Transact'],
        'V3': [],
        'V4': ['WithdrawAsset'],
        // 'V5': [],
        'V5': ['WithdrawAsset', 'InitiateTransfer', 'DepositAsset', 'Transact', 'ReportError']
    }

    const useCases: Record<XcmVersion, SuperInstruction[]> = {
        "V3": [],
        "V4": [],
        "V5": v5SuperInstructions,
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
                    onChange={(val) => {
                        setXcmVersion(val as XcmVersion)
                    }}
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
                                each={useCases[xcmVersion()]} 
                                fallback={<div class="py-2 bg-red-200 rounded">No use cases were found</div>}
                            >
                                {(instruction) => <SidebarMenuItem onclick={() => {
                                    appendItem(instruction)
                                }}
                                class="py-2 rounded hover:bg-gray-100 hover:bg-opacity-50 hover:cursor-pointer">{instruction}</SidebarMenuItem>}
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
                                {(item) => <
                                    SidebarMenuItem
                                        onclick={() => appendItem(item)}
                                        class="py-2 rounded hover:bg-gray-100 hover:bg-opacity-50 hover:cursor-pointer"
                                    >
                                        <span>{item}</span>
                                    </SidebarMenuItem>
                                }
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
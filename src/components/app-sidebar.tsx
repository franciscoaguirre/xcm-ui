import { createSignal, For } from "solid-js"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuItem } from "./ui/sidebar"
import { DropdownMenu, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuContent } from "./ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

type XcmVersion = `V${3 | 4 | 5}`;

export const AppSidebar = () => {
    const [chain, setChain] = createSignal("relaychain")
    const [xcmVersion, setXcmVersion] = createSignal<XcmVersion>('V5')

    const instructions: Record<'V3' | 'V4' | 'V5', string[]> = {
        // TODO: Add all instructions
        'V3': ['WithdrawAsset', 'InitiateReserveWithdraw', 'InitiateTeleport'],
        'V4': ['WithdrawAsset', 'InitiateReserveWithdraw', 'InitiateTeleport'],
        'V5': ['WithdrawAsset', 'InitiateTransfer']
    }

    const templates: Record<string, string[]> = {
        relaychain: ['Teleport', 'Reserve-backed transfer'],
        assethub: ['Teleport DOT', 'Reserve-backed transfer'],
        hydration: [],
        moonbeam: [],
        // etc
    }

    return (
        <Sidebar>
            <SidebarHeader>
            <Select
                value={xcmVersion()}
                onChange={setXcmVersion}
                options={["V3", "V4", "V5"]}
                placeholder="Select the XCM Version"
                itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
            >
                <SelectTrigger aria-label="XCM Version" class="w-[180px]">
                    <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
                </SelectTrigger>
                <SelectContent />
            </Select>
            </ SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel class="mb-1">
                        Templates
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <For each={templates[chain()]} fallback={<div class="py-2 bg-red-200 rounded">No templates were found</div>}>
                                {(item) => <SidebarMenuItem class="py-2 rounded hover:bg-gray-100 hover:bg-opacity-50 hover:cursor-pointer">{item}</SidebarMenuItem>}
                            </For>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </ SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel class="mb-1">
                        Instructions
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <For each={instructions[xcmVersion()]} fallback={<div class="py-2 bg-red-200 rounded">No instructions were found</div>}>
                                {(item) => <SidebarMenuItem class="py-2 rounded hover:bg-gray-100 hover:bg-opacity-50 hover:cursor-pointer"><span>{item}</span></SidebarMenuItem>}
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
                            <DropdownMenuContent class="w-full">
                                <DropdownMenuLabel><span>Wiki Docs</span></DropdownMenuLabel>
                                <DropdownMenuLabel><span>XCM Spec</span></DropdownMenuLabel>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </ SidebarMenu>
            </ SidebarFooter>
        </ Sidebar>
    )
}
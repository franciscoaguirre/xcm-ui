import { createSignal, For } from "solid-js"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu } from "./ui/sidebar"

export const AppSidebar = () => {

    const [chain, setChain] = createSignal("relaychain")
    const [xcmVersion, setXcmVersion] = createSignal(5)

    const instructions: Record<number, string[]> = {
        // TODO: Add all instructions
        3: ['WithdrawAsset', 'InitiateReserveWithdraw', 'InitiateTeleport'],
        4: ['WithdrawAsset', 'InitiateReserveWithdraw', 'InitiateTeleport'],
        5: ['WithdrawAsset', 'InitiateTransfer']
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
            <SidebarHeader />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel class="mb-1">
                        Templates
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <For each={templates[chain()]} fallback={<div class="py-2 bg-red-200 rounded">No templates were found</div>}>
                                {(item) => <div class="py-2 hover:bg-gray-100 hover:bg-opacity-50 rounded">{item}</div>}
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
                                {(item) => <div class="py-2 hover:bg-gray-100 hover:bg-opacity-50 rounded">{item}</div>}
                            </For>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </ SidebarGroup>    
            </ SidebarContent>
            <SidebarFooter />
        </ Sidebar>
    )
}
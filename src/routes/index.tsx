import { AppSidebar } from "~/components/app-sidebar";
import { ChainInfo } from "~/components/chain-info";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";

export default function Home() {
  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <ChainInfo />
      <SidebarProvider>
        <AppSidebar />
        <main>
          <SidebarTrigger />
        </main>
      </SidebarProvider>
    </main>
  );
}

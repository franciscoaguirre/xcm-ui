import { AppSidebar } from "~/components/app-sidebar";
import { XcmVersion } from "~/components/get-xcm-version";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";

export default function Home() {
  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <XcmVersion />
      <SidebarProvider>
        <AppSidebar />
        <main>
          <SidebarTrigger />
        </main>
      </SidebarProvider>
    </main>
  );
}

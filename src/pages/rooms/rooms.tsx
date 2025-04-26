import { Sidebar } from "@/pages/rooms/components/sidebar/sidebar.tsx";
import Background from "@/pages/background.tsx";
import { OrganizationsConfigurator } from "@/pages/rooms/components/organizations-configurator.tsx";
import { Navbar } from "@/pages/rooms/components/navbar.tsx";
import Dashboard from "@/pages/rooms/components/dashboard.tsx";


export default function RoomsPage() {
  return (
    <section>
      <Background />
      <Sidebar />
      <div className="pl-16 h-full">
        <div className="flex gap-x-3 h-full ">
          <OrganizationsConfigurator />
          <div className="h-full flex-auto">
            <Navbar />
            <Dashboard />
          </div>
        </div>
      </div>
    </section>
  );
}

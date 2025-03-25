import { OrganizationNew } from "@/pages/rooms/components/sidebar/organization-new.tsx";
import { OrganizationsList } from "@/pages/rooms/components/sidebar/organization-list.tsx";

export const Sidebar = () => {
  return (
    <aside
      className={`fixed left-0 h-full w-16 flex flex-col gap-y-4 border-r p-3 items-center dark:bg-black dark:border-b-pink-300 bg-white border-b-violet-800`}
    >
      <OrganizationsList />
      <OrganizationNew />
    </aside>
  );
};

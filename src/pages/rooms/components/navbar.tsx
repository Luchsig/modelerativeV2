"use client";

import {
  OrganizationSwitcher,
  SignedIn,
  useOrganization,
  UserButton,
} from "@clerk/clerk-react";

import SearchInput from "./navbar/search-input";

import { ThemeSwitch } from "@/components/theme-switch.tsx";
import { InviteButton } from "@/pages/rooms/components/navbar/invite-button.tsx";

export const Navbar = () => {
  const { organization } = useOrganization();

  return (
    <div
      className={"flex flex-row bg-none align-middle justify-center h-16 p-5"}
    >
      <div className="hidden lg:flex lg:flex-1 align-middle items-center">
        <SearchInput />
      </div>
      <div className="flex lg:hidden flex-1 align-middle items-center">
        <OrganizationSwitcher
          hidePersonal
          appearance={{
            elements: {
              rootBox: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              },
              organizationSwitcherTrigger: {
                padding: "6px",
                width: "100%",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                justifyContent: "space-between",
                backgroundColor: "white",
              },
            },
          }}
        />
      </div>
      <div className="flex justify-end align-middle items-center space-x-3">
        {organization && <InviteButton />}
        <ThemeSwitch />
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
};

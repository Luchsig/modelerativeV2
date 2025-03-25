"use client";

import { OrganizationSwitcher } from "@clerk/clerk-react";
import { LayoutDashboard, Star } from "lucide-react";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Logo } from "@/components/icons.tsx";

export const OrganizationsConfigurator = () => {
  const [searchParams] = useSearchParams();
  const favorites = searchParams.get("favorites");
  const navigate = useNavigate();

  return (
    <div className="h-full">
      <div className="h-full hidden items-center lg:flex flex-col space-y-6 w-60 pl-5 pt-5">
        <Link
          className={"w-full flex justify-center space-x-2"}
          color={"foreground"}
          href={"/"}
        >
          <Logo />
          <span className="font-bold text-inherit pl-1">MODELERATIVE</span>
        </Link>
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
                height: "40px",
              },
            },
          }}
        />
        <div className={"space-y-1 w-full"}>
          <Button
            className={`justify-start px-2 w-full border-none hover:shadow-none ${
              favorites ? "" : "bg-white dark:bg-purple-800"
            }`}
            size={"lg"}
            variant={favorites ? "ghost" : "solid"}
            onPress={() => navigate("/rooms")}
          >
            <LayoutDashboard className={"h-4 w-4 mr-2"} />
            Team Rooms
          </Button>
          <Button
            className={`justify-start px-2 w-full border-none hover:shadow-none ${
              favorites ? "bg-white dark:bg-purple-800" : ""
            }`}
            size={"lg"}
            variant={favorites ? "solid" : "ghost"}
            onPress={() => navigate("/rooms?favorites=true")}
          >
            <Star className={"h-4 w-4 mr-2"} />
            Favorite Rooms
          </Button>
        </div>
      </div>
    </div>
  );
};

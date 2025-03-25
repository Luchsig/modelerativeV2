"use client";
import { Card } from "@heroui/react";
import { useOrganization } from "@clerk/clerk-react";
import { useLocation } from "react-router-dom";

import EmptyOrganization from "@/pages/rooms/components/dashboard/empty-organization.tsx";
import RoomList from "@/pages/rooms/components/dashboard/room-list.tsx";

const Dashboard = () => {
  const { organization } = useOrganization();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const search = searchParams.get("search") || "";
  const favorites = searchParams.get("favorites") || "";

  return (
    <div className={"relative flex-1 h-[calc(100vh-64px)] p-6"}>
      <Card
        className={
          "absolute inset-0 h-full w-full opacity-70 pointer-events-none -z-10"
        }
      />
      {!organization ? (
        <EmptyOrganization />
      ) : (
        <RoomList
          organizationId={organization.id}
          query={{ search, favorites }}
        />
      )}
    </div>
  );
};

export default Dashboard;

"use client";

import { useOrganizationList } from "@clerk/clerk-react";

import { OrganizationListItem } from "@/pages/rooms/components/sidebar/organization-list-item.tsx";

export const OrganizationsList = () => {
  const { userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  if (!userMemberships.data?.length) return null;

  return (
    <ul className={"space-y-4"}>
      {userMemberships.data.map((org) => (
        <OrganizationListItem
          key={org.organization.id}
          id={org.organization.id}
          imageUrl={org.organization.imageUrl}
          name={org.organization.name}
        />
      ))}
    </ul>
  );
};

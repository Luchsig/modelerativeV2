"use client";

import { Image } from "@heroui/image";
import { useOrganization, useOrganizationList } from "@clerk/clerk-react";
import { cn } from "@heroui/theme";
import { Tooltip } from "@heroui/react";
interface ItemProps {
  id: string;
  name: string;
  imageUrl: string;
}

export const OrganizationListItem = ({ id, name, imageUrl }: ItemProps) => {
  const { organization } = useOrganization();
  const { setActive } = useOrganizationList();

  const isActive = organization?.id === id;

  const onClick = () => {
    if (!setActive) return;

    setActive({ organization: id });
  };

  return (
    <Tooltip content={organization?.name} placement="top">
      <div
        className={"aspect-square relative flex items-center justify-center"}
      >
        <Tooltip content={name} placement="right">
          <Image
            alt={name}
            className={cn(
              "rounded-md cursor-pointer opacity-75 hover:opacity-100 transition",
              isActive && "opacity-100",
            )}
            src={imageUrl}
            onClick={onClick}
          />
        </Tooltip>
      </div>
    </Tooltip>
  );
};

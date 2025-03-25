import { Modal, ModalBody, ModalContent, useDisclosure } from "@heroui/react";
import { Plus } from "lucide-react";
import { OrganizationProfile } from "@clerk/clerk-react";
import { Button } from "@heroui/button";

export const InviteButton = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button
        className={
          "justify-start px-2 w-full border-none hover:shadow-none max-w-[180px]"
        }
        size={"lg"}
        variant={"bordered"}
        onPress={() => onOpen()}
      >
        <Plus className={"h-4 w-4 mr-2"} />
        Invite Members
      </Button>
      <Modal backdrop="opaque" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent className="p-0 bg-transparent border-none max-w-[880px]">
          <ModalBody className="p-0 bg-transparent border-none">
            <OrganizationProfile />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

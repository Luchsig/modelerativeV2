import {
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
  Tooltip,
} from "@heroui/react";
import { CreateOrganization } from "@clerk/clerk-react";
import { PlusIcon } from "lucide-react";

export function OrganizationNew({}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Tooltip content={"Create Organization"} placement="right">
        <button
          className={
            "aspect-square size-10 bg-violet-800 text-white rounded-full flex items-center justify-center"
          }
          onClick={onOpen}
        >
          <PlusIcon />
        </button>
      </Tooltip>
      <Modal backdrop="opaque" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent className="p-0 bg-transparent border-none max-w-md">
          <ModalBody className="p-0 bg-transparent border-none max-w-md">
            <CreateOrganization afterCreateOrganizationUrl={"/rooms"} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

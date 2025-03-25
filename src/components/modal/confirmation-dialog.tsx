import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  disabled?: boolean;
  header?: string;
  description?: string;
}

export const ConfirmationDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  disabled,
  header,
  description,
}: ConfirmationDialogProps) => {
  return (
    <Modal backdrop="opaque" isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>{header}</ModalHeader>
        <ModalBody>{description}</ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            variant="light"
            onPress={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button color="secondary" disabled={disabled} onPress={onConfirm}>
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

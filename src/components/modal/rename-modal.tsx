"use client";

import {
  Form,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { FormEventHandler, useEffect, useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";

import { useApiMutation } from "../../../hooks/use-api-mutation.ts";
import { api } from "../../../convex/_generated/api";

import { useRenameModal } from "@/store/use-rename-modal";

export const RenameModal = () => {
  const { isOpen, onClose, initialValues } = useRenameModal();
  const [title, setTitle] = useState(initialValues.title);

  const { mutate, pending } = useApiMutation(api.room.update);

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    mutate({
      id: initialValues.id,
      title: title,
    })
      .then(() => {
        addToast({
          title: "Title changed to " + title,
          variant: "bordered",
          color: "success",
        });
        onClose();
      })
      .catch(() =>
        addToast({
          title: "Something went wrong",
          description: "please try again later...",
          variant: "bordered",
          color: "warning",
        }),
      );
  };

  useEffect(() => {
    setTitle(initialValues.title);
  }, [initialValues]);

  return (
    <Modal isOpen={isOpen} title="Rename Room" onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Edit Room Title</ModalHeader>
            <ModalBody>Enter a new title for the room</ModalBody>
            <Form onSubmit={onSubmit}>
              <Input
                className={"pl-5 pr-5"}
                disabled={pending}
                maxLength={60}
                placeholder="Room Title"
                required={true}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <ModalFooter className={"w-full"}>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="secondary" type="submit" disabled={pending}>
                  Save
                </Button>
              </ModalFooter>
            </Form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

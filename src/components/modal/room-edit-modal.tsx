"use client";

import {
  Form,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { FormEventHandler, useEffect, useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";

import { api } from "../../../convex/_generated/api";

import { useApiMutation } from "@/hooks/use-api-mutation";
import { useRoomEditModal } from "@/store/use-room-edit-modal.ts";

export const RoomEditModal = () => {
  const { isOpen, onClose, initialValues } = useRoomEditModal();
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
          title: "Saved changes in room " + title,
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
            <ModalHeader>Edit room name</ModalHeader>
            <Form className={"pl-6 pr-6 space-y-2"} onSubmit={onSubmit}>
              <p>Enter a new title for the room</p>
              <Input
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
                <Button color="secondary" disabled={pending} type="submit">
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

"use client";

import {
  Divider,
  Form,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import {
  ChangeEvent,
  FormEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import Ajv, { ValidateFunction } from "ajv";

import { api } from "../../../convex/_generated/api";

import { useApiMutation } from "@/hooks/use-api-mutation";
import { useRoomCreationModal } from "@/store/use-room-creation-modal.ts";
import { MultipleImageUpload } from "@/components/multiple-image-upload.tsx";

export const RoomCreationModal = () => {
  const { isOpen, onClose, initialValues } = useRoomCreationModal();
  const [title, setTitle] = useState(initialValues.title);
  const [components, setComponents] = useState("");
  const [validate, setValidate] = useState<ValidateFunction | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate, pending } = useApiMutation(api.room.update);

  const ajv = new Ajv();

  useEffect(() => {
    fetch("/component_schema.json")
      .then((response) => response.json())
      .then((data) => {
        setValidate(() => ajv.compile(data));
      })
      .catch((error) => {
        addToast({
          title: "Schema Load Failed",
          description: error.message,
          variant: "bordered",
          color: "danger",
        });
      });
  }, []);

  const handleSchemaUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);

          if (!validate) {
            addToast({
              title: "Upload Failed",
              description: "Schema not yet loaded",
              variant: "bordered",
              color: "warning",
            });

            return;
          }

          if (!validate(json)) {
            addToast({
              title: "Upload Failed",
              description:
                "Invalid JSON Schema: " +
                JSON.stringify(validate.errors, null, 2),
              variant: "bordered",
              color: "danger",
            });

            return;
          }

          setComponents(e.target?.result as string);
          addToast({
            title: "Upload Complete",
            description: "JSON is valid!",
            variant: "bordered",
            color: "success",
          });
        } catch {
          addToast({
            title: "Upload Failed",
            description: "Error parsing JSON",
            variant: "bordered",
            color: "danger",
          });
        }
      };

      reader.readAsText(file);
    }
  };

  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      await mutate({
        id: initialValues.id,
        title: title,
        components: components,
      });

      addToast({
        title: "Saved changes in room " + title,
        variant: "bordered",
        color: "success",
      });

      // Cleanup
      useRoomCreationModal.getState().reset();
      fileInputRef.current!.value = "";
      onClose();
    } catch (error) {
      addToast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Try again later...",
        variant: "bordered",
        color: "warning",
      });
    }
  };

  useEffect(() => {
    setTitle(initialValues.title);
  }, [initialValues]);

  return (
    <Modal isOpen={isOpen} title="Rename Room" onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Edit Room Properties</ModalHeader>
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
              <Divider />
              <p>Upload Component Definition</p>
              <Input
                ref={fileInputRef}
                accept=".json"
                type="file"
                onChange={handleSchemaUpload}
              />
              <p>Upload Images</p>
              <MultipleImageUpload />
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

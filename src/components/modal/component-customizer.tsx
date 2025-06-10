"use client";

import {
  Accordion,
  AccordionItem,
  Card,
  Checkbox,
  Divider,
  Form,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
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
import { Layer, Stage } from "react-konva";
import { addToast } from "@heroui/toast";
import { ColorPicker, useColor } from "react-color-palette";
import { NumberInput } from "@heroui/number-input";
import { UploadIcon } from "lucide-react";

import { api } from "../../../convex/_generated/api";

import SidebarTemplate from "@/pages/canvas/components/nodes/sidebar-template";
import { SchemaShape, ShapeType } from "@/types/canvas";
import { useComponentCustomizer } from "@/store/use-component-customizer.ts";
import { useApiMutation } from "@/hooks/use-api-mutation.ts";
import "react-color-palette/css";
import { useRoomStore } from "@/store/use-room-store.ts";

import { Spinner } from "@heroui/spinner";

import { useImageCreator } from "@/hooks/use-image-creator.ts";

const ComponentCustomizer = () => {
  const { isOpen, onClose, initialValues } = useComponentCustomizer();
  const [shape, setShape] = useState<SchemaShape | null>(null);
  const { mutate } = useApiMutation(api.room.updateComponents);
  const [color, setColor] = useColor("#8888ff");
  const [expanded, setExpanded] = useState(false);
  const [expandedImages, setExpandedImages] = useState(false);
  const { roomImages } = useRoomStore();
  const previewStageSize = { width: 350, height: 300 };
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const defaultShape: SchemaShape = {
      shape: ShapeType.Rectangle,
      id: crypto.randomUUID(),
      size: {
        width: 180,
        height: 100,
        radius: 60,
      },
      color: "#8888ff",
      typeName: "",
      typeDescription: "",
      connectableTypes: "",
      isTextEnabled: true,
      text: "",
      imageProps: {
        src: "",
        width: 30,
        height: 30,
        imagePosition: "TL", // Top Left
      },
    };

    setShape(defaultShape);
  }, [initialValues]);

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    mutate({
      id: initialValues.id,
      component: JSON.stringify(shape),
    })
      .then(() => {
        addToast({
          title: "Added Component",
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

  const handleChange = (
    key: keyof Omit<SchemaShape, "size" | "imageProps">,
    value: any,
  ) => {
    setShape((prev) => prev && { ...prev, [key]: value });
  };

  const handleSizeChange = (key: keyof SchemaShape["size"], value: number) => {
    setShape(
      (prev) => prev && { ...prev, size: { ...prev.size, [key]: value } },
    );
  };

  const handleImagePropsChange = (
    key: keyof NonNullable<SchemaShape["imageProps"]>,
    value: any,
  ) => {
    setShape(
      (prev) =>
        prev && { ...prev, imageProps: { ...prev.imageProps!, [key]: value } },
    );
  };

  const { createAndUploadImages } = useImageCreator(initialValues.id);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!initialValues.id) return;

    const newImage = event.target.files?.[0];

    if (!newImage) return;

    // Prüfung, ob Bild bereits existiert
    if (
      roomImages.some(
        (img) => img.name === newImage.name && img.size === newImage.size,
      )
    ) {
      addToast({
        title: "Image already exists",
        description: "This image is already uploaded.",
        variant: "bordered",
        color: "warning",
      });

      return;
    }

    setUploading(true);
    await createAndUploadImages([newImage]);
    setUploading(false);

    event.target.value = "";
  };

  if (!shape) return null;

  const imageOptions = roomImages.map((img) => ({
    key: img.name,
    label: img.name,
  }));

  imageOptions.unshift({ key: "none", label: "None" });

  return (
    <Modal isOpen={isOpen} title="Customize Component" onClose={onClose}>
      <ModalContent className="w-[75vw] max-w-[75vw]">
        {(onClose) => (
          <>
            <ModalHeader>Design New Component</ModalHeader>
            <Form className="px-6 space-y-4" onSubmit={onSubmit}>
              <div className="flex gap-6 w-full">
                <div className="w-[70%] space-y-4">
                  <Divider orientation={"horizontal"} />
                  <div className={"flex flex-row gap-4"}>
                    <Input
                      isRequired
                      label="Name"
                      value={shape.typeName}
                      onValueChange={(val) => handleChange("typeName", val)}
                    />
                    <Select
                      isRequired
                      disallowEmptySelection={true}
                      label="Shape"
                      selectedKeys={new Set([shape.shape])}
                      selectionMode="single"
                      onSelectionChange={(keys) => {
                        const val = Array.from(keys)[0] as ShapeType;

                        if (val === ShapeType.Custom) {
                          setExpandedImages(true);
                        } else {
                          setExpandedImages(false);
                        }
                        handleChange("shape", val);
                      }}
                    >
                      <SelectItem key={ShapeType.Rectangle}>
                        Rectangle
                      </SelectItem>
                      <SelectItem key={ShapeType.Circle}>Circle</SelectItem>
                      <SelectItem key={ShapeType.Custom}>Custom</SelectItem>
                    </Select>
                  </div>
                  <div className={"flex flex-row gap-4"}>
                    <Input
                      label="Description"
                      value={shape.typeDescription}
                      onValueChange={(val) =>
                        handleChange("typeDescription", val)
                      }
                    />
                    <Input
                      disabled={true}
                      label="Connectable Components TBD"
                      value={shape.connectableTypes}
                      onValueChange={(val) =>
                        handleChange("connectableTypes", val)
                      }
                    />
                  </div>

                  <div className={"flex flex-row gap-4"}>
                    {shape?.shape !== ShapeType.Circle ? (
                      <>
                        <NumberInput
                          hideStepper
                          isRequired
                          defaultValue={180}
                          label="Width"
                          type="number"
                          value={shape.size.width}
                          onValueChange={(val) =>
                            handleSizeChange("width", Number(val))
                          }
                        />
                        <NumberInput
                          hideStepper
                          isRequired
                          defaultValue={100}
                          label="Height"
                          type="number"
                          value={shape.size.height}
                          onValueChange={(val) =>
                            handleSizeChange("height", Number(val))
                          }
                        />
                      </>
                    ) : (
                      <>
                        <NumberInput
                          hideStepper
                          isRequired
                          defaultValue={60}
                          disabled={shape.shape !== ShapeType.Circle}
                          label="Radius"
                          value={shape.size.radius}
                          onValueChange={(val: number) =>
                            handleSizeChange("radius", val)
                          }
                        />
                        <div className={"w-full"} />
                      </>
                    )}
                  </div>
                  <div className={"flex flex-row gap-4"}>
                    <Accordion
                      className="w-full max-w-[50%] overflow-y-auto"
                      selectedKeys={expanded ? ["color"] : []}
                      selectionMode="single"
                      onSelectionChange={(keys) => {
                        const isOpen =
                          keys === "all" ? true : keys.has("color");

                        setExpanded(isOpen);
                      }}
                    >
                      <AccordionItem key="color" title="Color">
                        <ColorPicker
                          color={color}
                          height={100}
                          hideAlpha={true}
                          hideInput={["rgb", "hsv"]}
                          onChange={(c) => {
                            setColor(c);
                            handleChange("color", c.hex);
                          }}
                        />
                      </AccordionItem>
                    </Accordion>
                    <Checkbox
                      defaultChecked={true}
                      isSelected={shape.isTextEnabled}
                      onChange={(e) =>
                        handleChange("isTextEnabled", e.target.checked)
                      }
                    >
                      Enable Text
                    </Checkbox>
                  </div>

                  <Divider orientation={"horizontal"} />

                  <Accordion
                    className="w-full overflow-y-auto"
                    selectedKeys={
                      expandedImages ? new Set(["images"]) : new Set()
                    }
                    selectionMode="single"
                    onSelectionChange={(keys) => {
                      setExpandedImages(
                        keys === "all"
                          ? true
                          : (keys as Set<string>).has("images"),
                      );
                    }}
                  >
                    <AccordionItem key="images" title="Images">
                      <div className={"flex flex-row gap-4 pb-4"}>
                        <Select
                          className="max-w-xs"
                          items={imageOptions}
                          label="Image"
                          labelPlacement="inside"
                          selectedKeys={
                            new Set([shape.imageProps?.src ?? "none"])
                          }
                          selectionMode="single"
                          onSelectionChange={(keys) => {
                            const selectedKey = Array.from(keys)[0] as string;
                            const selectedOption = imageOptions.find(
                              (opt) => opt.key === selectedKey,
                            );
                            const newValue = selectedOption?.label ?? "";

                            handleImagePropsChange(
                              "src",
                              newValue === "None" ? "" : newValue,
                            );
                          }}
                        >
                          {(item) => (
                            <SelectItem key={item.key}>{item.label}</SelectItem>
                          )}
                        </Select>
                        <div className="flex justify-center items-center h-full py-2">
                          <Button
                            isIconOnly
                            aria-label="Upload"
                            className="border-none"
                            color="secondary"
                            size="sm"
                            variant="bordered"
                            onPress={() => imageInputRef.current?.click()}
                          >
                            <UploadIcon className="h-6 w-6" />
                          </Button>
                        </div>
                        {uploading && <Spinner className="ml-2" size="sm" />}
                        <Input
                          ref={imageInputRef}
                          accept=".png,.jpg,.jpeg,.svg"
                          className="hidden"
                          type="file"
                          onChange={handleImageUpload}
                        />
                      </div>

                      {shape?.shape !== ShapeType.Custom &&
                        shape.imageProps?.src && (
                          <div className={"flex flex-row gap-4"}>
                            <div className="flex flex-row gap-4">
                              <NumberInput
                                hideStepper
                                isRequired={!!shape.imageProps?.src}
                                label="Image Width"
                                labelPlacement="inside"
                                placeholder="Enter image width"
                                value={shape.imageProps?.width ?? 30}
                                onValueChange={(v) =>
                                  handleImagePropsChange("width", Number(v))
                                }
                              />
                              <NumberInput
                                hideStepper
                                isRequired={!!shape.imageProps?.src}
                                label="Image Height"
                                labelPlacement="inside"
                                placeholder="Enter image height"
                                value={shape.imageProps?.height ?? 30}
                                onValueChange={(v) =>
                                  handleImagePropsChange("height", Number(v))
                                }
                              />
                            </div>
                            <Select
                              disallowEmptySelection
                              className="max-w-xs"
                              isRequired={!!shape.imageProps?.src}
                              label="Image Position"
                              labelPlacement="inside"
                              selectedKeys={
                                new Set([
                                  shape.imageProps?.imagePosition
                                    ? shape.imageProps.imagePosition
                                    : "TL", // Standardwert
                                ])
                              }
                              selectionMode="single"
                              onSelectionChange={(keys) => {
                                const pos = Array.from(keys)[0] as string;

                                handleImagePropsChange("imagePosition", pos);
                              }}
                            >
                              <SelectItem key="TL">Top Left</SelectItem>
                              <SelectItem key="TR">Top Right</SelectItem>
                              <SelectItem key="BL">Bottom Left</SelectItem>
                              <SelectItem key="BR">Bottom Right</SelectItem>
                            </Select>
                          </div>
                        )}
                    </AccordionItem>
                  </Accordion>
                </div>

                <div className="w-1/3 flex justify-center">
                  <Card className="self-center p-4">
                    <div className="flex justify-center items-center">
                      <Stage {...previewStageSize}>
                        <Layer>
                          <SidebarTemplate
                            {...shape}
                            miniature={false}
                            previewStageSize={previewStageSize}
                          />
                        </Layer>
                      </Stage>
                    </div>
                  </Card>
                </div>
              </div>
              <ModalFooter className="w-full pt-4">
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="secondary" type="submit">
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

export default ComponentCustomizer;

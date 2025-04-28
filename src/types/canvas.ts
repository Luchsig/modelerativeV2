// types/layout.ts

import { Id } from "../../convex/_generated/dataModel";

export interface ImageProps {
  src: string;
  width?: number;
  height?: number;
  imagePosition?: "TL" | "TR" | "BL" | "BR";
}

export enum ShapeType {
  Custom = "custom",
  Rectangle = "rectangle",
  Circle = "circle",
}

export interface SchemaShape {
  id?: string;
  shape: ShapeType;
  imageProps?: ImageProps;
  size: { width?: number; height?: number; radius?: number };
  color?: string;
  typeName: string;
  typeDescription: string;
  connectableTypes: string;
  text?: string;
  isTextEnabled: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface ShapeData {
  id: string;
  position: Position;
  shape: SchemaShape;
}

export interface ShapeTemplateProps {
  shapeData: ShapeData;
  isSelected?: boolean;
  onSelect?: () => void;
  onChange?: (newAttrs: ShapeData) => void;
}

export enum AnchorName {
  Top = "top",
  Right = "right",
  Bottom = "bottom",
  Left = "left",
}

export interface Edge {
  id: string;
  from: string;
  to: string;
  text?: string;
}

export interface RoomData {
  _id: Id<"rooms">;
  _creationTime: number;
  title: string;
  organizationId: string;
  authorId: string;
  authorName: string;
  imageUrl: string;
  stateEdges: string;
  stateNodes: string;
  components: string;
}

export interface RoomImage {
  id: Id<"roomImages">;
  name: string;
  size: number;
  type: string;
  url?: string;
  status: "created" | "uploading" | "uploaded" | "errored";
  progress?: number;
  message?: string;
}

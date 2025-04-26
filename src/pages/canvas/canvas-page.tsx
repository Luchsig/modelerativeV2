// src/pages/canvas/canvas-page.tsx
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { Spinner } from "@heroui/react";

import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

import { InfoBar } from "@/pages/canvas/layout/info-bar";
import { ComponentSelector } from "@/pages/canvas/layout/component-selector";
import { Toolbar } from "@/pages/canvas/layout/toolbar";
import { useRoomStore } from "@/store/use-room-store";
import Canvas from "@/pages/canvas/layout/canvas";

export const CanvasPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const isInitialized = useRef(false);

  // Room-Daten laden
  const roomData = useQuery(
    api.room.get,
    { id: roomId as Id<"rooms"> },
  );

  // Bilder laden
  const nodeImages = useQuery(
    api.images.list,
    { roomId: roomId as Id<"rooms"> },
  );

  const setRoomData = useRoomStore((state) => state.setRoomData);
  const initYjsSync = useRoomStore((state) => state.initYjsSync);

  useEffect(() => {
    if (
      roomData &&
      nodeImages &&
      roomId &&
      !isInitialized.current
    ) {
      // Initial-Daten in den Store packen
      setRoomData(roomData, nodeImages);

      // Yjs-Sync starten
      const shapes = roomData.stateNodes
        ? JSON.parse(roomData.stateNodes)
        : [];
      const edges = roomData.stateEdges
        ? JSON.parse(roomData.stateEdges)
        : [];

      initYjsSync(roomId as Id<"rooms">, { nodes: shapes, edges });
      isInitialized.current = true;
    }
  }, [roomData, nodeImages, roomId, setRoomData, initYjsSync]);

  // Ladezustand / fehlende Params
  if (!roomId || !roomData || !nodeImages) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white dark:bg-black">
        <Spinner
          classNames={{ label: "mt-8" }}
          color="secondary"
          label="Loading..."
          labelColor="secondary"
          size="lg"
        />
      </div>
    );
  }

  return (
    <>
      <InfoBar />
      <ComponentSelector />
      <Toolbar />
      <Canvas />
    </>
  );
};
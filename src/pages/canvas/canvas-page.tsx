// src/pages/canvas/canvas-page.tsx
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { Spinner } from "@heroui/react";
import { useAuth } from "@clerk/clerk-react";

import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

import { InfoBar } from "@/pages/canvas/layout/info-bar";
import { ComponentSelector } from "@/pages/canvas/layout/component-selector";
import { Toolbar } from "@/pages/canvas/layout/toolbar";
import { useRoomStore } from "@/store/use-room-store";
import Canvas from "@/pages/canvas/layout/canvas";
import { useAutoSaveRoom } from "@/hooks/use-save-room.ts";

export const CanvasPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const isInitialized = useRef(false);
  const { isLoaded, isSignedIn } = useAuth();

  useAutoSaveRoom(5000);

  // Room-Daten laden
  const roomData = useQuery(
    api.room.get,
    isLoaded && isSignedIn && roomId ? { id: roomId as Id<"rooms"> } : "skip",
  );

  // Bilder laden
  const nodeImages = useQuery(
    api.images.list,
    isLoaded && isSignedIn && roomId
      ? { roomId: roomId as Id<"rooms"> }
      : "skip",
  );
  const setRoomData = useRoomStore((state) => state.setRoomData);
  const initYjsSync = useRoomStore((state) => state.initYjsSync);

  useEffect(() => {
    if (roomData && nodeImages && roomId && !isInitialized.current) {
      const shapes = roomData.stateNodes ? JSON.parse(roomData.stateNodes) : [];
      const edges = roomData.stateEdges ? JSON.parse(roomData.stateEdges) : [];

      const normalizedRoomData = {
        ...roomData,
        stateNodes: shapes,
        stateEdges: edges,
        version: roomData.stateVersion ?? 0,
      };

      setRoomData(normalizedRoomData, nodeImages);

      initYjsSync(roomId as Id<"rooms">, { nodes: shapes, edges });
      isInitialized.current = true;
    }
  }, [roomData, nodeImages, roomId, setRoomData, initYjsSync]);

  // Ladezustand / fehlende Params
  if (!isLoaded || !roomId || !roomData || !nodeImages) {
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

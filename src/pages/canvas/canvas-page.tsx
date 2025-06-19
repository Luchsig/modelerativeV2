// src/pages/canvas/canvas-page.tsx
import {useEffect, useRef} from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { Spinner } from "@heroui/react";
import {useUser} from "@clerk/clerk-react";

import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

import { InfoBar } from "@/pages/canvas/layout/info-bar";
import { ComponentSelector } from "@/pages/canvas/layout/component-selector";
import { Toolbar } from "@/pages/canvas/layout/toolbar";
import { useRoomStore } from "@/store/use-room-store";
import Canvas from "@/pages/canvas/layout/canvas";
import { useAutoSaveRoom } from "@/hooks/use-save-room.ts";
import Konva from "konva";

export const CanvasPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { isLoaded, isSignedIn, user } = useUser();
  const stageRef = useRef<Konva.Stage>(null);
  const displayName = user?.fullName || user?.firstName || "Anonymous";

  const handleExportImage = () => {
    const stage = stageRef.current;
    if (!stage) return;

    const uri = stage.toDataURL({
      pixelRatio: 2,
      mimeType: "image/png",
      quality: 1,
    });

    const link = document.createElement("a");
    // @ts-ignore
    link.download = `${roomData.title || "modelerative_canvas"}.png`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
  const setDisplayName = useRoomStore((state) => state.setDisplayName);
  const initYjsSync = useRoomStore((state) => state.initYjsSync);

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (displayName) {
      setDisplayName(displayName);
    }
  }, [displayName, setDisplayName]);

  useEffect(() => {
    hasInitialized.current = false;
    useRoomStore.getState().disconnectYjsIfAlone();
  }, [roomId]);

  useEffect(() => {
    if (!hasInitialized.current && roomData && nodeImages && roomId) {
      const nodes = roomData.stateNodes ? JSON.parse(roomData.stateNodes) : [];
      const edges = roomData.stateEdges ? JSON.parse(roomData.stateEdges) : [];

      initYjsSync(roomId as Id<"rooms">, { nodes, edges });
      hasInitialized.current = true;
    }
  }, [roomData, nodeImages, roomId, initYjsSync]);

  useEffect(() => {
    if (roomData && nodeImages && roomId) {
      const nodes = roomData.stateNodes ? JSON.parse(roomData.stateNodes) : [];
      const edges = roomData.stateEdges ? JSON.parse(roomData.stateEdges) : [];

      const normalizedRoomData = {
        ...roomData,
        stateNodes: nodes,
        stateEdges: edges,
        version: roomData.stateVersion ?? 0,
      };

      setRoomData(normalizedRoomData, nodeImages);
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
      <Toolbar handleExportImage={handleExportImage} />
      <Canvas stageRef={stageRef}/>
    </>
  );
};

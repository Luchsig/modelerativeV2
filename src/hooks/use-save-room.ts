// src/hooks/use-save-room.ts
import { useMutation } from "convex/react";
import { useEffect } from "react";

import { api } from "@/../convex/_generated/api";
import { useRoomStore } from "@/store/use-room-store";

export const useSaveRoom = () => {
  const updateStates = useMutation(api.room.updateStates);
  const { nodes, edges, roomData, setVersion } = useRoomStore();

  return async () => {
    if (!roomData || roomData.version === undefined) return;
    try {
      await updateStates({
        id: roomData._id,
        stateNodes: JSON.stringify(nodes),
        stateEdges: JSON.stringify(edges),
        clientVersion: roomData.version,
      });
      setVersion(roomData.version + 1);
    } catch (err: any) {
      if (err.message.includes("Version mismatch")) {
      } else {
        console.log("Update through other client", err);
      }
    }
  };
};

export const useAutoSaveRoom = (intervalMs = 5000) => {
  const saveRoom = useSaveRoom();

  useEffect(() => {
    const interval = setInterval(() => {
      saveRoom();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [saveRoom, intervalMs]);
};

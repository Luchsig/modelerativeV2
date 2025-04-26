import { useMutation } from "convex/react";

import { api } from "@/../convex/_generated/api";
import { useRoomStore } from "@/store/use-room-store";

export const useSaveRoom = () => {
  const updateState = useMutation(api.room.updateStates);
  const { yNodes, yEdges, roomData } = useRoomStore();

  return async () => {
    if (!roomData) return;
    await updateState({
      id: roomData._id,
      stateNodes: JSON.stringify(yNodes.toArray()),
      stateEdges: JSON.stringify(yEdges.toArray()),
    });
  };
};

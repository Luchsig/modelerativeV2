import { create } from "zustand";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

import { Id } from "@/../convex/_generated/dataModel";
import {
  ShapeData,
  Edge,
  RoomData,
  SchemaShape,
  RoomImage,
} from "@/types/canvas";

interface RoomStore {
  roomData: RoomData | null;
  roomImages: RoomImage[];
  setRoomData: (room: RoomData, roomImages: RoomImage[]) => void;

  ydoc: Y.Doc;
  yNodes: Y.Array<ShapeData>;
  yEdges: Y.Array<Edge>;
  undoManager: Y.UndoManager;

  nodes: ShapeData[];
  edges: Edge[];

  setNodes: (nodes: ShapeData[]) => void;
  setEdges: (edges: Edge[]) => void;

  updateNode: (id: string, shapeData: Partial<SchemaShape>) => void;

  addEdge: (edge: Edge) => void;
  removeEdge: (id: string) => void;

  removeNode: (id: string) => void;

  undo: () => void;
  redo: () => void;

  initYjsSync: (
    roomId: Id<"rooms">,
    initialState?: {
      nodes?: ShapeData[];
      edges?: Edge[];
    },
  ) => Promise<void>;
}

export const useRoomStore = create<RoomStore>((set, get) => {
  const ydoc = new Y.Doc();
  const yNodes = ydoc.getArray<ShapeData>("shapes");
  const yEdges = ydoc.getArray<Edge>("edges");
  const undoManager = new Y.UndoManager([yNodes, yEdges]);

  const syncYjsToZustand = () => {
    set({
      nodes: yNodes.toArray(),
      edges: yEdges.toArray(),
    });
  };

  yNodes.observe(syncYjsToZustand);
  yEdges.observe(syncYjsToZustand);

  return {
    roomData: null,
    roomImages: [],

    setRoomData: (room, roomImages) => set({ roomData: room, roomImages }),

    ydoc,
    yNodes,
    yEdges,
    undoManager,

    nodes: [],
    edges: [],

    setNodes: (nodes) => {
      ydoc.transact(() => {
        yNodes.delete(0, yNodes.length);
        yNodes.push(nodes);
      });
    },

    setEdges: (edges) => {
      ydoc.transact(() => {
        yEdges.delete(0, yEdges.length);
        yEdges.push(edges);
      });
    },

    updateNode: (id, partialShapeData) => {
      const index = yNodes.toArray().findIndex((el) => el.id === id);

      if (index !== -1) {
        ydoc.transact(() => {
          const original = yNodes.get(index);
          const updated = {
            ...original,
            shape: {
              ...original.shape,
              ...partialShapeData,
            },
          };

          yNodes.delete(index);
          yNodes.insert(index, [updated]);
        });
      }
    },

    removeNode: (id) => {
      ydoc.transact(() => {
        const remainingNodes = yNodes
          .toArray()
          .filter((node) => node.id !== id);
        const remainingEdges = yEdges
          .toArray()
          .filter((edge) => edge.from !== id && edge.to !== id);

        yNodes.delete(0, yNodes.length);
        yNodes.push(remainingNodes);

        yEdges.delete(0, yEdges.length);
        yEdges.push(remainingEdges);
      });
    },

    addEdge: (edge) => {
      yEdges.push([edge]);
    },

    removeEdge: (id) => {
      ydoc.transact(() => {
        const remainingEdges = yEdges
          .toArray()
          .filter((edge) => edge.id !== id);

        yEdges.delete(0, yEdges.length);
        yEdges.push(remainingEdges);
      });
    },

    undo: () => undoManager.undo(),
    redo: () => undoManager.redo(),

    initYjsSync: async (roomId, initialState) => {
      const ydoc = get().ydoc;
      const yNodes = get().yNodes;
      const yEdges = get().yEdges;

      const provider = new WebsocketProvider(
        "ws://localhost:1234",
        roomId,
        ydoc,
      );

      let initialized = false;

      provider.on("sync", (isSynced: boolean) => {
        if (!isSynced || initialized) return;

        initialized = true;

        const isEmpty = yNodes.length === 0 && yEdges.length === 0;

        if (isEmpty && initialState) {
          ydoc.transact(() => {
            if (initialState.nodes?.length) {
              yNodes.push(initialState.nodes);
            }
            if (initialState.edges?.length) {
              yEdges.push(initialState.edges);
            }
          });
        }
      });

      provider.on("status", ({ status }) => {
        console.log(`🧠 Yjs Provider status: ${status}`);
      });
    },
  };
});

// src/store/use-room-store.ts

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

export interface RoomStore {
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
  removeNode: (id: string) => void;

  /** Fügt eine Kante hinzu, wenn zwischen from/to noch keine existiert */
  addEdge: (edge: Edge) => void;
  removeEdge: (id: string) => void;
  updateEdge: (id: string, edge: Partial<Edge>) => void;

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
          const original = yNodes.get(index)!;
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
        const remainingNodes = yNodes.toArray().filter((n) => n.id !== id);
        const remainingEdges = yEdges
          .toArray()
          .filter((e) => e.from !== id && e.to !== id);

        yNodes.delete(0, yNodes.length);
        yNodes.push(remainingNodes);

        yEdges.delete(0, yEdges.length);
        yEdges.push(remainingEdges);
      });
    },

    addEdge: (edge) => {
      // Prüfen, ob bereits eine Kante zwischen from und to existiert (egal ob Richtung)
      const exists = get().edges.some(
        (e) =>
          (e.from === edge.from && e.to === edge.to) ||
          (e.from === edge.to && e.to === edge.from),
      );

      if (!exists) {
        yEdges.push([edge]);
      }
    },

    removeEdge: (id) => {
      ydoc.transact(() => {
        const remainingEdges = yEdges.toArray().filter((e) => e.id !== id);

        yEdges.delete(0, yEdges.length);
        yEdges.push(remainingEdges);
      });
    },

    updateEdge: (id, partialEdge) => {
      const index = yEdges.toArray().findIndex((e) => e.id === id);

      if (index !== -1) {
        ydoc.transact(() => {
          const original = yEdges.get(index)!;
          const updated: Edge = { ...original, ...partialEdge };

          yEdges.delete(index);
          yEdges.insert(index, [updated]);
        });
      }
    },

    undo: () => undoManager.undo(),
    redo: () => undoManager.redo(),

    initYjsSync: async (roomId, initialState) => {
      const provider = new WebsocketProvider(
        "ws://localhost:1234",
        roomId,
        ydoc,
      );
      let initialized = false;

      provider.on("sync", (isSynced) => {
        if (!isSynced || initialized) return;
        initialized = true;
        if (yNodes.length === 0 && yEdges.length === 0 && initialState) {
          ydoc.transact(() => {
            if (initialState.nodes) yNodes.push(initialState.nodes);
            if (initialState.edges) yEdges.push(initialState.edges);
          });
        }
      });
      provider.on("status", ({ status }) => {
        console.log(`🧠 Yjs Provider status: ${status}`);
      });
    },
  };
});

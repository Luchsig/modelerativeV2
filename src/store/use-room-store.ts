// src/store/use-room-store.ts

import { create } from "zustand";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

import { Id } from "@/../convex/_generated/dataModel";
import {
  ShapeData,
  Edge,
  RoomData,
  RoomImage,
  Position,
  SchemaShape,
  AwarenessInfo,
} from "@/types/canvas";

export interface RoomStore {
  roomData: RoomData | null;
  roomImages: RoomImage[];
  setRoomData: (room: RoomData, roomImages: RoomImage[]) => void;
  awarenessInfo: AwarenessInfo[];
  provider: WebsocketProvider | null;
  ownClientId: number;
  displayName?: string;

  setVersion: (version: number) => void;

  ydoc: Y.Doc;
  yNodes: Y.Map<ShapeData>;
  yEdges: Y.Map<Edge>;
  undoManager: Y.UndoManager;

  nodes: ShapeData[];
  edges: Edge[];

  addNode: (node: ShapeData) => void;
  moveNodes: (positions: { id: string; position: Position }[]) => void;
  updateNode: (
    id: string,
    shapeData: { position?: Position; shape?: Partial<SchemaShape> },
  ) => void;
  removeNode: (id: string) => void;

  addEdge: (edge: Edge) => void;
  updateEdge: (id: string, edge: Partial<Edge>) => void;
  removeEdge: (id: string) => void;

  undo: () => void;
  redo: () => void;

  initYjsSync: (
    roomId: Id<"rooms">,
    initialState?: { nodes?: ShapeData[]; edges?: Edge[] },
  ) => Promise<() => void>;

  disconnectYjsIfAlone: () => void;

  setDisplayName: (name: string) => void;
}

export const useRoomStore = create<RoomStore>((set, get) => {
  const ydoc = new Y.Doc();
  const yNodes = ydoc.getMap<ShapeData>("shapes");
  const yEdges = ydoc.getMap<Edge>("edges");

  // nur lokale Transaktionen tracken
  const undoManager = new Y.UndoManager([yNodes, yEdges], {
    trackedOrigins: new Set([ydoc.clientID]),
  });

  // sync Yjs → Zustand (map → array)
  const syncYjsToZustand = () => {
    set({
      nodes: Array.from(yNodes.values()),
      edges: Array.from(yEdges.values()),
    });
  };

  const isLastClient = () => {
    if (!provider) return true;
    const states = Array.from(provider.awareness.getStates().values());

    return states.length <= 1;
  };

  // optional: batch mehrere Transaktionen kurz zusammen
  let syncScheduled = false;

  ydoc.on("afterTransaction", () => {
    if (!syncScheduled) {
      syncScheduled = true;
      Promise.resolve().then(() => {
        syncYjsToZustand();
        syncScheduled = false;
      });
    }
  });

  let provider: WebsocketProvider | null = null;

  return {
    roomData: null,
    roomImages: [],
    awarenessInfo: [],
    provider,
    ownClientId: -1,

    setVersion: (version: number) => {
      set((state) => ({
        roomData: state.roomData ? { ...state.roomData, version } : null,
      }));
    },

    setDisplayName: (name: string) => {
      set({ displayName: name });
    },

    setRoomData: (room, roomImages) => set({ roomData: room, roomImages }),

    ydoc,
    yNodes,
    yEdges,
    undoManager,

    nodes: [],
    edges: [],

    // --- NODE-Methoden über Y.Map ---

    addNode: (node) => {
      ydoc.transact(() => {
        yNodes.set(node.id, node);
      }, ydoc.clientID);
    },

    moveNodes: (positions) => {
      ydoc.transact(() => {
        positions.forEach(({ id, position }) => {
          const orig = yNodes.get(id);

          if (!orig) {
            // console.warn(`Skipping move für nicht-existierende Node ${id}`);

            return;
          }
          yNodes.set(id, {
            ...orig,
            position: { ...orig.position, ...position },
          });
        });
      }, ydoc.clientID);
    },

    updateNode: (id, partial) => {
      const orig = yNodes.get(id);

      if (!orig) {
        // console.warn(`Skipping update für nicht-existierende Node ${id}`);

        return;
      }
      ydoc.transact(() => {
        yNodes.set(id, {
          ...orig,
          position: { ...orig.position, ...(partial.position ?? {}) },
          shape: { ...orig.shape, ...(partial.shape ?? {}) },
        });
      }, ydoc.clientID);
    },

    removeNode: (id) => {
      ydoc.transact(() => {
        // Node löschen
        yNodes.delete(id);
        // alle Kanten, die darauf zeigen, löschen
        for (const [edgeId, edge] of yEdges) {
          if (edge.from === id || edge.to === id) {
            yEdges.delete(edgeId);
          }
        }
      }, ydoc.clientID);
    },

    // --- EDGE-Methoden über Y.Map ---
    addEdge: (edge) => {
      const exists = Array.from(yEdges.values()).some(
        (e) =>
          (e.from === edge.from && e.to === edge.to) ||
          (e.from === edge.to && e.to === edge.from),
      );

      if (exists) return; // Kante zwischen from–to existiert bereits

      ydoc.transact(() => {
        yEdges.set(edge.id, edge);
      }, ydoc.clientID);
    },

    updateEdge: (id, partial) => {
      const orig = yEdges.get(id);

      if (!orig) return;
      ydoc.transact(() => {
        yEdges.set(id, { ...orig, ...partial });
      }, ydoc.clientID);
    },

    removeEdge: (id) => {
      ydoc.transact(() => {
        yEdges.delete(id);
      }, ydoc.clientID);
    },

    // --- UNDO / REDO ---
    undo: () => {
      get().undoManager.undo();
    },
    redo: () => {
      get().undoManager.redo();
    },

    disconnectYjsIfAlone: () => {
      if (isLastClient() && provider) {
        provider.destroy();
        provider = null;

        ydoc.transact(() => {
          yNodes.clear();
          yEdges.clear();
        }, ydoc.clientID);

        get().undoManager.clear();
        set({ nodes: [], edges: [] });
      }
    },

    // --- INITIAL SYNC ---
    initYjsSync: async (roomId, initialState) => {
      provider = new WebsocketProvider(
        import.meta.env.VITE_YJS_WS_URL,
        roomId,
        ydoc,
      );

      provider.awareness.setLocalStateField("user", {
        name: get().displayName || "Anonymous",
        color: "#" + Math.random().toString(16).substr(-6),
      });

      set({
        provider,
        ownClientId: provider.awareness.clientID,
      });

      let initialized = false;

      provider.on("sync", (isSynced) => {
        if (!isSynced || initialized) return;
        initialized = true;
        // bei leerem Map initial befüllen
        if (yNodes.size === 0 && yEdges.size === 0 && initialState) {
          ydoc.transact(() => {
            initialState.nodes?.forEach((n) => yNodes.set(n.id, n));
            initialState.edges?.forEach((e) => yEdges.set(e.id, e));
          }, ydoc.clientID);
        }
      });

      provider.awareness.on("change", () => {
        if (!provider) return;
        const infos: AwarenessInfo[] = Array.from(
          provider.awareness.getStates().entries(),
        ).map(([clientID, state]) => ({
          clientID: Number(clientID),
          name: state.user?.name ?? "Anonymous",
          color: state.user?.color ?? "#000",
          cursor: state.cursor,
        }));

        set({ awarenessInfo: infos });
      });

      provider.on("status", ({ status }) => {
        console.debug(`Yjs Provider status: ${status}`);
      });

      return () => {
        // console.log("Cleaning up Yjs provider...");
        provider?.destroy();
        provider = null;
      };
    },
  };
});

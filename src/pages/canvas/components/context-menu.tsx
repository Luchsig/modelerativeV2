// src/pages/layout/components/layout/ContextMenu.tsx

import React, { useRef } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@heroui/button";
import { Card } from "@heroui/react";

export type MenuTarget = {
  type: "node" | "edge";
  isTextEnabled: boolean;
  id: string;
};

interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  target: MenuTarget | null;
  onRename: (target: MenuTarget) => void;
  onDelete: (target: MenuTarget) => void;
  onClose: () => void;
}

const MENU_WIDTH = 140;
const MENU_ITEM_HEIGHT = 36;
const MENU_HEIGHT = MENU_ITEM_HEIGHT * 2;
const MARGIN = 8;

const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  x,
  y,
  target,
  onRename,
  onDelete,
  onClose,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  if (!visible || !target) return null;

  // Entscheide, ob Menü nach links/rechts und oben/unten öffnen soll
  const vpw = window.innerWidth;
  const vph = window.innerHeight;
  const openLeft = x > vpw / 2;
  const openAbove = y > vph / 2;
  const calcLeft = openLeft ? x - MENU_WIDTH - MARGIN : x + MARGIN;
  const calcTop = openAbove ? y - MENU_HEIGHT - MARGIN : y + MARGIN;
  const left = Math.min(Math.max(MARGIN, calcLeft), vpw - MENU_WIDTH - MARGIN);
  const top = Math.min(Math.max(MARGIN, calcTop), vph - MENU_HEIGHT - MARGIN);

  return (
    <Card
      ref={ref}
      className="absolute z-50 p-0"
      style={{
        top: top,
        left: left,
      }}
    >
      {(target.type === "edge" || target.isTextEnabled) && (
        <Button
          className="w-full justify-start border-none"
          startContent={<Edit size={16} />}
          variant="ghost"
          onPress={() => {
            onRename(target);
            onClose();
          }}
        >
          Umbenennen
        </Button>
      )}
      <Button
        className="w-full justify-start border-none"
        color="danger"
        startContent={<Trash2 size={16} />}
        variant="ghost"
        onPress={() => {
          onDelete(target);
          onClose();
        }}
      >
        Löschen
      </Button>
    </Card>
  );
};

export default React.memo(ContextMenu);

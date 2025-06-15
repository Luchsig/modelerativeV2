// src/pages/layout/components/layout/ContextMenu.tsx
import React, { useRef, useState, useEffect } from "react";
import { Edit, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@heroui/button";
import { Card, Select, SelectItem } from "@heroui/react";
import { Image } from "@heroui/image";

import { ArrowStyle, LineStyle, MenuTarget } from "@/types/canvas.ts";

const arrowOptions = [
  { key: "filled", label: "filled", src: "/arrow_filled.svg" },
  { key: "outline", label: "outlined", src: "/arrow_outlined.svg" },
  { key: "none", label: "none", src: "/strich.svg" },
];

const dashOptions = [
  { key: "solid", label: "solid", src: "/strich.svg" },
  { key: "dashed", label: "dashed", src: "/strich_gestrichelt.svg" },
];

function getSelectedIcon(
  key: string,
  options: { key: string; label: string; src: string }[],
) {
  const sel = options.find((o) => o.key === key);

  if (!sel) return null;

  return (
    <Image
      alt={sel.label}
      height={20}
      src={sel.src}
      title={sel.label} // Tooltip bei Hover
      width={20}
    />
  );
}

interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  target: MenuTarget | null;
  onRename: (target: MenuTarget) => void;
  onDelete: (target: MenuTarget) => void;
  onArrowStyleChange: (
    id: string,
    styles: {
      startStyle: ArrowStyle;
      lineStyle: LineStyle;
      endStyle: ArrowStyle;
    },
  ) => void;
  onClose: () => void;
}

const MENU_WIDTH = 300;
const MENU_ITEM_HEIGHT = 36;
const MENU_HEIGHT = MENU_ITEM_HEIGHT * 3 + 16;
const MARGIN = 8;

const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  x,
  y,
  target,
  onRename,
  onDelete,
  onArrowStyleChange,
  onClose,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [startStyle, setStartStyle] = useState<ArrowStyle>("none");
  const [lineStyle, setLineStyle] = useState<LineStyle>("solid");
  const [endStyle, setEndStyle] = useState<ArrowStyle>("filled");

  useEffect(() => {
    if (target && target.type === "edge") {
      setStartStyle(target.edgeStart as ArrowStyle);
      setLineStyle(target.edgeLine as LineStyle);
      setEndStyle(target.edgeEnd as ArrowStyle);
    }
  }, [target]);

  useEffect(() => {
    if (!target || target.type !== "edge") return;

    const prev = { startStyle, lineStyle, endStyle };

    if (
      prev.startStyle !== target.edgeStart ||
      prev.lineStyle !== target.edgeLine ||
      prev.endStyle !== target.edgeEnd
    ) {
      onArrowStyleChange(target.id, {
        startStyle,
        lineStyle,
        endStyle,
      });
    }
  }, [startStyle, lineStyle, endStyle]);

  if (!visible || !target) return null;

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
      className="absolute z-50 p-2 w-[300px] space-y-2"
      style={{ top, left }}
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
          Rename
        </Button>
      )}

      {target.type === "edge" && (
        <div className="flex flex-row m-3 justify-between items-center space-x-2">
          <Select
            aria-label={"Select Start Style"}
            renderValue={() => getSelectedIcon(startStyle, arrowOptions)}
            selectedKeys={new Set([startStyle])}
            selectionMode="single"
            selectorIcon={<ChevronDown />}
            onSelectionChange={(keys) =>
              setStartStyle(Array.from(keys)[0] as ArrowStyle)
            }
          >
            {arrowOptions.map((opt) => (
              <SelectItem key={opt.key} aria-label={opt.label}>
                <Image
                  alt={opt.label}
                  height={20}
                  src={opt.src}
                  title={opt.label}
                  width={20}
                />
              </SelectItem>
            ))}
          </Select>

          <Select
            aria-label={"Select Line Style"}
            renderValue={() => getSelectedIcon(lineStyle, dashOptions)}
            selectedKeys={new Set([lineStyle])}
            selectionMode="single"
            selectorIcon={<ChevronDown />}
            onSelectionChange={(keys) =>
              setLineStyle(Array.from(keys)[0] as LineStyle)
            }
          >
            {dashOptions.map((opt) => (
              <SelectItem key={opt.key} aria-label={opt.label}>
                <Image
                  alt={opt.label}
                  height={20}
                  src={opt.src}
                  title={opt.label}
                  width={20}
                />
              </SelectItem>
            ))}
          </Select>

          <Select
            aria-label={"Select Start Style"}
            renderValue={() => getSelectedIcon(endStyle, arrowOptions)}
            selectedKeys={new Set([endStyle])}
            selectionMode="single"
            selectorIcon={<ChevronDown />}
            onSelectionChange={(keys) =>
              setEndStyle(Array.from(keys)[0] as ArrowStyle)
            }
          >
            {arrowOptions.map((opt) => (
              <SelectItem key={opt.key} aria-label={opt.label}>
                <Image
                  alt={opt.label}
                  height={20}
                  src={opt.src}
                  title={opt.label}
                  width={20}
                />
              </SelectItem>
            ))}
          </Select>
        </div>
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
        Delete
      </Button>
    </Card>
  );
};

export default React.memo(ContextMenu);

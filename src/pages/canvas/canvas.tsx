import { useEffect, useRef, useState, useCallback } from "react";
import { Stage, Layer, Rect, Circle } from "react-konva";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import Konva from "konva";

import { ComponentSelector } from "@/pages/canvas/components/component-selector.tsx";
import { Toolbar } from "@/pages/canvas/components/toolbar.tsx";
import ResizableTemplate, {
  Position,
  ShapeData,
  ShapeTemplateProps,
} from "@/pages/canvas/components/resizable-template.tsx";

const Canvas = () => {
  const [elements, setElements] = useState<ShapeTemplateProps[]>([]);
  const [history, setHistory] = useState<ShapeTemplateProps[][]>([]);
  const [redoStack, setRedoStack] = useState<ShapeTemplateProps[][]>([]);
  const [gridPoints, setGridPoints] = useState<{ x: number; y: number }[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const stageRef = useRef<Konva.Stage>(null);
  const ydoc = useRef(new Y.Doc());
  const yArray = ydoc.current.getArray<ShapeTemplateProps>("elements");
  // Grid Functions
  const snapToGrid = useCallback(
    (pos: { x: number; y: number }, gridSize = 20) => ({
      x: Math.round(pos.x / gridSize) * gridSize,
      y: Math.round(pos.y / gridSize) * gridSize,
    }),
    [],
  );

  const renderGridPoints = useCallback(() => {
    return gridPoints.map((point, index) => (
      <Circle
        key={`point-${index}`}
        fill="#ccc"
        radius={1}
        x={point.x}
        y={point.y}
      />
    ));
  }, [gridPoints]);

  // multiselect box
  const renderSelectionBox = () => {
    if (!selectionBox) return null;

    const box = getNormalizedBox(selectionBox);

    return (
      <Rect
        fill="rgba(0, 123, 255, 0.3)"
        height={box.height}
        listening={false}
        stroke="darkblue"
        strokeWidth={1}
        width={box.width}
        x={box.x}
        y={box.y}
      />
    );
  };

  const handleMouseDownCanvas = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target !== e.target.getStage()) return;
    setIsSelecting(true);

    const stage = stageRef.current;

    if (!stage) return;
    const pointerPosition = stage.getPointerPosition();

    if (!pointerPosition) return;

    setSelectionBox({
      x: pointerPosition.x,
      y: pointerPosition.y,
      width: 0,
      height: 0,
    });

    setSelectedIds([]);
  };

  const handleMouseMoveCanvas = () => {
    if (!isSelecting || !selectionBox) return;

    const stage = stageRef.current;

    if (!stage) return;
    const pointerPosition = stage.getPointerPosition();

    if (!pointerPosition) return;

    setSelectionBox((prevBox) => {
      if (!prevBox) return null;

      return {
        ...prevBox,
        width: pointerPosition.x - prevBox.x,
        height: pointerPosition.y - prevBox.y,
      };
    });
  };

  const handleMouseUpCanvas = () => {
    if (!isSelecting) return;

    const box = getNormalizedBox(selectionBox!);
    const selected = elements
      .filter((el) => isElementInsideBox(el, box))
      .map((el) => el.id);

    setSelectionBox(null);
    setIsSelecting(false);

    if (selected.length > 0) {
      commitToHistory(elements);
      setSelectedIds(selected);
    }
  };

  const getNormalizedBox = (box: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => {
    const { x, y, width, height } = box;

    return {
      x: Math.min(x, x + width),
      y: Math.min(y, y + height),
      width: Math.abs(width),
      height: Math.abs(height),
    };
  };

  const isElementInsideBox = (
    element: ShapeTemplateProps,
    box: { x: number; y: number; width: number; height: number },
  ) => {
    const elLeft = element.shapeData.position.x;
    const elRight =
      element.shapeData.position.x +
      (element.shapeData.size.width || (element.shapeData.size.width ?? 0) * 2);
    const elTop = element.shapeData.position.y;
    const elBottom =
      element.shapeData.position.y +
      (element.shapeData.size.height ||
        (element.shapeData.size.width ?? 0) * 2);

    const boxLeft = box.x;
    const boxRight = box.x + box.width;
    const boxTop = box.y;
    const boxBottom = box.y + box.height;

    return (
      elRight >= boxLeft &&
      elLeft <= boxRight &&
      elBottom >= boxTop &&
      elTop <= boxBottom
    );
  };

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const data = event.dataTransfer.getData("component");

      if (!data) return;

      const component = JSON.parse(data);
      const canvasRect = event.currentTarget.getBoundingClientRect();

      const snappedPosition = snapToGrid({
        x: event.clientX - canvasRect.left,
        y: event.clientY - canvasRect.top,
      });

      const newElement = {
        id: crypto.randomUUID(),
        shapeData: {
          ...component,
          position: snappedPosition,
        },
      };

      const updatedElements = [...elements, newElement];

      yArray.delete(0, yArray.length);
      yArray.push(updatedElements);

      commitToHistory(updatedElements);
      setElements(updatedElements);
    },
    [snapToGrid, elements, yArray],
  );

  const commitToHistory = (newState: ShapeTemplateProps[]) => {
    if (JSON.stringify(newState) === JSON.stringify(elements)) return;

    setHistory((prev) => [...prev, [...elements]]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;

    const previousState = history[history.length - 1];

    setHistory((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [[...elements], ...prev]);

    yArray.delete(0, yArray.length);
    yArray.push(previousState);

    setSelectedIds([]);
    setElements(previousState);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;

    const nextState = redoStack[0];

    setRedoStack((prev) => prev.slice(1));
    setHistory((prev) => [[...elements], ...prev]);

    yArray.delete(0, yArray.length);
    yArray.push(nextState);

    setSelectedIds([]);
    setElements(nextState);
  };

  const handleDelete = useCallback(() => {
    if (selectedIds.length === 0) return;

    const updatedElements = elements.filter(
      (el) => !selectedIds.includes(el.id),
    );

    commitToHistory([...elements]);

    yArray.delete(0, yArray.length);
    yArray.push(updatedElements);

    setSelectedIds([]);
    setElements(updatedElements);
  }, [selectedIds, elements, yArray]);

  const updateElement = (
    id: string,
    position: Position,
    newProps?: ShapeData,
  ) => {
    const updatedElements = elements.map((el) =>
      el.id === id
        ? { ...el, shapeData: { ...el.shapeData, ...newProps, position } }
        : el,
    );

    if (JSON.stringify(updatedElements) === JSON.stringify(elements)) return;

    yArray.delete(0, yArray.length);
    yArray.push(updatedElements);
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, id: string) => {
    commitToHistory(elements);
    updateElement(
      id,
      snapToGrid({ x: e.target.x(), y: e.target.y() }, undefined),
    );
  };

  const handleTransformEnd = (id: string, newProps: ShapeData) => {
    const snappedProps = snapToGrid({
      x: newProps.position.x,
      y: newProps.position.y,
    });

    commitToHistory(elements);
    updateElement(id, snappedProps, newProps);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) =>
    event.preventDefault();

  const renderElement = useCallback(
    (element: ShapeTemplateProps) => {
      const commonProps = {
        id: element.id,
        shapeData: element.shapeData,
        isSelected: selectedIds.includes(element.id),
        onSelect: () => setSelectedIds([element.id]),
        onChange: (newProps: ShapeData) =>
          handleTransformEnd(element.id, newProps),
        onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) =>
          handleDragEnd(e, element.id),
      };

      return <ResizableTemplate {...commonProps} />;
    },
    [handleDragEnd, handleTransformEnd, selectedIds],
  );

  useEffect(() => {
    const provider = new WebrtcProvider("modelling-room", ydoc.current);

    if (yArray.length === 0) {
      yArray.push([...elements]);
    }

    const observer = () =>
      setElements([...(yArray.toArray() as ShapeTemplateProps[])]);

    yArray.observe(observer);

    return () => {
      provider.destroy();
      yArray.unobserve(observer);
    };
  }, [elements, yArray]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "a" && event.metaKey) {
        event.preventDefault();
        const allIds = elements.map((el) => el.id);

        setSelectedIds(allIds);
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        handleDelete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [elements, handleDelete]);

  useEffect(() => {
    const updateGrid = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const points = [];
      const gridSize = 20;

      for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
          points.push({ x, y });
        }
      }
      setGridPoints(points);
    };

    updateGrid();
    window.addEventListener("resize", updateGrid);

    return () => window.removeEventListener("resize", updateGrid);
  }, []);

  return (
    <div
      className="bg-white dark:bg-stone-800"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ComponentSelector />
      <Toolbar onExport={undefined} onRedo={handleRedo} onUndo={handleUndo} />
      <Stage
        ref={stageRef}
        height={window.innerHeight}
        width={window.innerWidth}
        onClick={(e) => {
          if (e.target === e.target.getStage()) {
            commitToHistory(elements);
            setSelectedIds([]);
          }
        }}
        onMouseDown={handleMouseDownCanvas}
        onMouseMove={handleMouseMoveCanvas}
        onMouseUp={handleMouseUpCanvas}
      >
        <Layer>{renderGridPoints()}</Layer>
        <Layer>{renderSelectionBox()}</Layer>
        <Layer>{elements.map(renderElement)}</Layer>
      </Stage>
    </div>
  );
};

export default Canvas;

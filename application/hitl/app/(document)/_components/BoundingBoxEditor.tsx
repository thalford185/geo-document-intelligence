"use client";

import SvgBoundingBox from "@/app/(document)/_components/SvgBoundingBox";
import { Button } from "@/app/(document)/_components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/(document)/_components/ui/tooltip";
import { getMouseEventPositionWithinSVGViewBox } from "@/app/(document)/_lib/svg";
import { BoundingBox, Dimension, Point } from "@/document/core/model";
import { Check, CircleSlash } from "lucide-react";
import { useState } from "react";

interface DragSelect {
  start: Point;
  end: Point;
}

function getDragSelectBounds(dragSelect: DragSelect): BoundingBox {
  return [
    Math.min(dragSelect.start[0], dragSelect.end[0]),
    Math.min(dragSelect.start[1], dragSelect.end[1]),
    Math.max(dragSelect.start[0], dragSelect.end[0]),
    Math.max(dragSelect.start[1], dragSelect.end[1]),
  ];
}

interface BoundingBoxEditorProps {
  dimension: Dimension;
  className?: string;
  onCancel: () => void;
  onDone: (value: BoundingBox) => void;
}

export default function BoundingBoxEditor(props: BoundingBoxEditorProps) {
  const { dimension, className, onCancel, onDone } = props;
  const [value, setValue] = useState<BoundingBox | null>(null);
  const [dragSelect, setDragSelect] = useState<DragSelect | null>(null);
  const dragSelectBoundingBox = dragSelect
    ? getDragSelectBounds(dragSelect)
    : null;
  return (
    <div className="relative" role="presentation">
      <svg
        role="img"
        aria-label="boundingBoxEditorViewer"
        cursor="crosshair"
        className={`${className || ""}`}
        viewBox={`0 0 ${dimension.width} ${dimension.height}`}
        onMouseDown={(e) => {
          const start = getMouseEventPositionWithinSVGViewBox(e);
          const end = start;
          setDragSelect({
            start,
            end,
          });
        }}
        onMouseUp={() => {
          setValue(dragSelectBoundingBox);
          setDragSelect(null);
        }}
        onMouseMove={(e) => {
          if (dragSelect) {
            const end = getMouseEventPositionWithinSVGViewBox(e);
            setDragSelect({ ...dragSelect, end });
          }
        }}
      >
        {value !== null && (
          <SvgBoundingBox dimension={dimension} value={value} />
        )}
        {dragSelectBoundingBox !== null && (
          <rect
            x={dragSelectBoundingBox[0]}
            y={dragSelectBoundingBox[1]}
            width={dragSelectBoundingBox[2] - dragSelectBoundingBox[0]}
            height={dragSelectBoundingBox[3] - dragSelectBoundingBox[1]}
            className="fill-none stroke-blue-950"
            strokeDasharray="2,2"
            strokeWidth={0.5}
            data-testid="drag-select"
          />
        )}
      </svg>
      <div className="absolute top-8 -left-16">
        <TooltipProvider>
          <ul
            role="menubar"
            className="flex flex-col gap-2 bg-white shadow-sm p-2"
          >
            <li role="presentation">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    role="menuitem"
                    aria-label="cancel"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setValue(null);
                      onCancel();
                    }}
                  >
                    <CircleSlash aria-hidden />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cancel bounding box selection</p>
                </TooltipContent>
              </Tooltip>
            </li>
            <li role="presentation">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    role="menuitem"
                    aria-label="done"
                    variant="default"
                    size="icon"
                    disabled={value === null && dragSelect === null}
                    onClick={() => value !== null && onDone(value)}
                  >
                    <Check aria-hidden />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Confirm bounding box selection</p>
                </TooltipContent>
              </Tooltip>
            </li>
          </ul>
        </TooltipProvider>
      </div>
    </div>
  );
}

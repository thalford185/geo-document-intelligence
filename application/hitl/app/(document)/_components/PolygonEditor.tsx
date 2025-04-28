"use client";

import SvgPolygon from "@/app/(document)/_components/SvgPolygon";
import { Button } from "@/app/(document)/_components/ui/button";
import { Separator } from "@/app/(document)/_components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/(document)/_components/ui/tooltip";
import { getMouseEventPositionWithinSVGViewBox } from "@/app/(document)/_lib/svg";
import { Dimension, Point } from "@/document/core/model";
import { Check, CirclePlus, CircleSlash, WandSparkles } from "lucide-react";
import { useState } from "react";

interface PolygonEditorProps {
  dimension: Dimension;
  className?: string;
  suggestedVertices: Point[];
  onUpdateSuggestedVertices: (vertices: Point[]) => void;
  onInput: (vertices: Point[]) => void;
  onCancel: () => void;
  onDone: (vertices: Point[]) => void;
}

export default function PolygonEditor(props: PolygonEditorProps) {
  const {
    dimension,
    className,
    onInput,
    suggestedVertices,
    onUpdateSuggestedVertices,
    onCancel,
    onDone,
  } = props;
  const [inputVertices, setInputVertices] = useState<Point[]>([]);
  return (
    <div className="relative">
      <svg
        role="img"
        aria-label="polygonEditorViewer"
        cursor="crosshair"
        viewBox={`0 0 ${dimension.width} ${dimension.height}`}
        className={`${className || ""}`}
        onClick={(e) => {
          const updatedVertices = [
            ...inputVertices,
            getMouseEventPositionWithinSVGViewBox(e),
          ];
          setInputVertices(updatedVertices);
          onInput(updatedVertices);
        }}
      >
        <SvgPolygon data-testid="input-polygon" vertices={inputVertices} />
        {suggestedVertices.length > 0 && (
          <SvgPolygon
            data-testid="suggested-polygon"
            vertices={suggestedVertices}
            color="fuchsia"
            filled={false}
            dashed={true}
          />
        )}
      </svg>
      <div className="absolute top-8 -left-16">
        <TooltipProvider>
          <ul
            role="menubar"
            className="flex flex-col gap-2 bg-white shadow-sm p-2"
          >
            <li role="none">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={
                      suggestedVertices.length < 2 || inputVertices.length === 0
                    }
                    onClick={() => {
                      if (suggestedVertices.length < 2) {
                        throw Error(
                          "Cannot accept next from zero-length suggestion",
                        );
                      }
                      setInputVertices([
                        ...inputVertices,
                        suggestedVertices[1],
                      ]);
                      onUpdateSuggestedVertices(suggestedVertices.slice(1));
                    }}
                    aria-label="acceptNext"
                    role="menuitem"
                  >
                    <CirclePlus aria-hidden />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Accept the next suggested vertex</p>
                </TooltipContent>
              </Tooltip>
            </li>
            <li role="none">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={suggestedVertices.length === 0}
                    onClick={() => {
                      if (suggestedVertices.length === 0) {
                        throw Error("Cannot accept all from empty suggestion");
                      }
                      setInputVertices([
                        ...inputVertices,
                        ...suggestedVertices,
                      ]);
                      onUpdateSuggestedVertices([]);
                    }}
                    aria-label="acceptAll"
                    role="menuitem"
                  >
                    <WandSparkles aria-hidden />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Accept all suggested vertices</p>
                </TooltipContent>
              </Tooltip>
            </li>
            <li role="none">
              <Separator orientation="vertical" />
            </li>
            <li role="none">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setInputVertices([]);
                      onCancel();
                    }}
                    aria-label="cancel"
                    role="menuitem"
                  >
                    <CircleSlash aria-hidden />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cancel polygon selection</p>
                </TooltipContent>
              </Tooltip>
            </li>
            <li role="none">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="icon"
                    disabled={inputVertices.length === 0}
                    onClick={() =>
                      inputVertices.length !== 0 && onDone(inputVertices)
                    }
                    aria-label="done"
                    role="menuitem"
                  >
                    <Check aria-hidden />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Confirm polygon selection</p>
                </TooltipContent>
              </Tooltip>
            </li>
          </ul>
        </TooltipProvider>
      </div>
    </div>
  );
}

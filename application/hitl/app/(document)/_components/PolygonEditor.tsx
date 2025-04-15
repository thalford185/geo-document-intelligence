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
  updateSuggestedVertices: (vertices: Point[]) => void;
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
    updateSuggestedVertices,
    onCancel,
    onDone,
  } = props;
  const [vertices, setVertices] = useState<Point[]>([]);
  return (
    <div className="relative">
      <svg
        cursor="crosshair"
        viewBox={`0 0 ${dimension.width} ${dimension.height}`}
        className={`${className || ""}`}
        onClick={(e) => {
          const updatedVertices = [
            ...vertices,
            getMouseEventPositionWithinSVGViewBox(e),
          ];
          setVertices(updatedVertices);
          onInput(updatedVertices);
        }}
      >
        <SvgPolygon vertices={vertices} />
        {suggestedVertices.length > 0 && (
          <SvgPolygon
            vertices={suggestedVertices}
            color="fuchsia"
            filled={false}
            strokeDash={[2, 2]}
          />
        )}
      </svg>
      <div className="absolute top-8 -left-32 p-8">
        <div className="bg-white shadow-sm flex flex-col gap-4 p-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={
                    suggestedVertices.length < 2 || vertices.length === 0
                  }
                  onClick={() => {
                    if (suggestedVertices.length < 2) {
                      throw Error(
                        "Cannot accept next from zero-length suggestion"
                      );
                    }
                    setVertices([...vertices, suggestedVertices[1]]);
                    updateSuggestedVertices(suggestedVertices.slice(1));
                  }}
                >
                  <CirclePlus />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Accept the next suggested vertex</p>
              </TooltipContent>
            </Tooltip>
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
                    setVertices([...vertices, ...suggestedVertices]);
                    updateSuggestedVertices([]);
                  }}
                >
                  <WandSparkles />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Accept all suggested vertices</p>
              </TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setVertices([]);
                    onCancel();
                  }}
                >
                  <CircleSlash />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Cancel polygon selection</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="icon"
                  disabled={vertices.length === 0}
                  onClick={() => vertices.length !== 0 && onDone(vertices)}
                >
                  <Check />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Confirm polygon selection</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}

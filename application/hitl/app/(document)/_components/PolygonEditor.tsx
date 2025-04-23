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
import { useId, useState } from "react";

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
    onUpdateSuggestedVertices: updateSuggestedVertices,
    onCancel,
    onDone,
  } = props;
  const [inputVertices, setInputVertices] = useState<Point[]>([]);
  const acceptNextButtonDescriptionId = useId();
  const acceptAllButtonDescriptionId = useId();
  const cancelButtonDescriptionId = useId();
  const doneButtonDescriptionId = useId();
  return (
    <div aria-label="polygonEditor" className="relative">
      <svg
        role="img"
        aria-label="PolygonEditorViewer"
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
      <div className="absolute top-8 -left-32 p-8">
        <menu
          role="menu"
          aria-label="polygonEditorMenu"
          className="bg-white shadow-sm flex flex-col gap-4 p-4"
        >
          <TooltipProvider>
            <li role="presentation">
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
                          "Cannot accept next from zero-length suggestion"
                        );
                      }
                      setInputVertices([
                        ...inputVertices,
                        suggestedVertices[1],
                      ]);
                      updateSuggestedVertices(suggestedVertices.slice(1));
                    }}
                    aria-label="acceptNext"
                    aria-describedby={acceptNextButtonDescriptionId}
                  >
                    <CirclePlus aria-hidden />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p id={acceptNextButtonDescriptionId}>
                    Accept the next suggested vertex
                  </p>
                </TooltipContent>
              </Tooltip>
            </li>
            <li role="presentation">
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
                      updateSuggestedVertices([]);
                    }}
                    aria-label="acceptAll"
                    aria-describedby={acceptAllButtonDescriptionId}
                  >
                    <WandSparkles aria-hidden />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p id={acceptAllButtonDescriptionId}>
                    Accept all suggested vertices
                  </p>
                </TooltipContent>
              </Tooltip>
            </li>
            <li role="presentation">
              <Separator orientation="vertical" />
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
                    aria-describedby={cancelButtonDescriptionId}
                  >
                    <CircleSlash aria-hidden />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p id={cancelButtonDescriptionId}>Cancel polygon selection</p>
                </TooltipContent>
              </Tooltip>
            </li>
            <li role="presentation">
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
                    aria-describedby={doneButtonDescriptionId}
                  >
                    <Check aria-hidden />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p id={doneButtonDescriptionId}>Confirm polygon selection</p>
                </TooltipContent>
              </Tooltip>
            </li>
          </TooltipProvider>
        </menu>
      </div>
    </div>
  );
}

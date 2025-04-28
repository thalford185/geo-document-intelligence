import { serializeSvgPolygonPoints } from "@/app/(document)/_lib/svg";
import { cn } from "@/app/(document)/_lib/utils";
import { Point } from "@/document/core/model";

type Color = "fuchsia" | "blue";

const colorFillClassName: Record<Color, string> = {
  blue: "fill-blue-900",
  fuchsia: "fill-fuchsia-900",
};
const colorStrokeClassName: Record<Color, string> = {
  blue: "stroke-blue-900",
  fuchsia: "stroke-fuchsia-900",
};

interface SvgPolygonProps {
  vertices: Point[];
  color?: Color;
  filled?: boolean;
  dashed?: boolean;
}
export default function SvgPolygon(props: SvgPolygonProps) {
  const { vertices, color, filled, dashed } = props;
  const colorOrDefault = color || "blue";
  return (
    <>
      <polyline
        points={serializeSvgPolygonPoints(vertices)}
        className={cn(
          (filled ?? true) ? colorFillClassName[colorOrDefault] : "fill-none",
          colorStrokeClassName[colorOrDefault],
        )}
        fillOpacity="0.1"
        strokeWidth="2"
        strokeDasharray={(dashed ?? false) ? "2 2" : undefined}
        data-testid="polygon-polyline"
      />
      {vertices.map(([x, y], i) => (
        <circle
          key={`point-${i}-${x}-${y}`}
          cx={x}
          cy={y}
          r="2"
          className={colorFillClassName[colorOrDefault]}
          data-testid="polygon-circle"
        />
      ))}
    </>
  );
}

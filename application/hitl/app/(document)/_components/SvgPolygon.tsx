import { serializeSvgPolygonPoints } from "@/app/(document)/_lib/svg";
import { cn } from "@/app/(document)/_lib/utils";
import { Point } from "@/document/core/model";

interface SvgPolygonProps {
  vertices: Point[];
  strokeDash?: [number, number];
  color?: "fuchsia" | "blue";
  filled?: boolean;
}
export default function SvgPolygon(props: SvgPolygonProps) {
  const { vertices, strokeDash, color, filled } = props;
  const colorOrDefault = color || "blue";
  const filledOrDefault = filled || true;
  const strokeDasharray =
    strokeDash === undefined ? undefined : `${strokeDash[0]} ${strokeDash[1]}`;
  return (
    <>
      <polyline
        points={serializeSvgPolygonPoints(vertices)}
        className={cn(
          filledOrDefault ? (colorOrDefault === "fuchsia" ? "fill-fuchsia-900" : "fill-blue-900") : "fill-none",
          colorOrDefault === "fuchsia" ? "stroke-fuchsia-900" : "stroke-blue-900"
        )}
        fillOpacity="0.1"
        strokeWidth="2"
        strokeDasharray={strokeDasharray}
      />
      {vertices.map(([x, y], i) => (
        <circle
          key={`point-${i}-${x}-${y}`}
          cx={x}
          cy={y}
          r="2"
          className={colorOrDefault === "fuchsia" ? "fill-fuchsia-900" : "fill-blue-900"}
        />
      ))}
    </>
  );
}

import { Point } from "@/document/core/model";

export function getMouseEventPositionWithinSVGViewBox(
  e: React.MouseEvent<SVGSVGElement, MouseEvent>
): Point {
  return [
    (e.clientX - e.currentTarget.getBoundingClientRect().left) *
      (e.currentTarget.viewBox.baseVal.width /
        e.currentTarget.getBoundingClientRect().width),
    (e.clientY - e.currentTarget.getBoundingClientRect().top) *
      (e.currentTarget.viewBox.baseVal.height /
        e.currentTarget.getBoundingClientRect().height),
  ];
}

export function serializeSvgPolygonPoints(points: Point[]): string {
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}

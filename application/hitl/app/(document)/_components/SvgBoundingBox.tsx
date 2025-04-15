import { BoundingBox, Dimension } from "@/document/core/model";
import { useId } from "react";

interface SvgBoundingBoxProps {
  value: BoundingBox;
  dimension: Dimension;
}
export default function SvgBoundingBox(props: SvgBoundingBoxProps) {
  const { value, dimension } = props;
  const maskId = useId();
  return (
    <>
      <mask id={maskId}>
        <rect
          x="0"
          y="0"
          width={dimension.width}
          height={dimension.height}
          fill="white"
        />
        <rect
          x={value[0]}
          y={value[1]}
          width={value[2] - value[0]}
          height={value[3] - value[1]}
          fill="black"
        />
      </mask>
      <rect
        x="0"
        y="0"
        width={dimension.width}
        height={dimension.height}
        className="fill-blue-900"
        fillOpacity={0.1}
        mask={`url(#${maskId})`}
      />
      <rect
        x={value[0]}
        y={value[1]}
        width={value[2] - value[0]}
        height={value[3] - value[1]}
        className="fill-none stroke-blue-900"
        strokeWidth={0.5}
      />
    </>
  );
}

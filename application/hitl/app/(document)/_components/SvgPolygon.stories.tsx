import type { Meta, StoryObj } from "@storybook/react";

import SvgPolygon from "@/app/(document)/_components/SvgPolygon";

const meta: Meta<typeof SvgPolygon> = {
  component: SvgPolygon,
  args: {
    vertices: [
      [25, 25],
      [225, 25],
      [125, 175],
    ],
  },
  decorators: [
    (Story) => (
      <svg
        height="512px"
        width="512px"
        viewBox="0 0 256 256"
        style={{ borderColor: "#FF00FF", borderWidth: 2 }}
      >
        <Story />
      </svg>
    ),
  ],
};

type SvgPolygonStory = StoryObj<typeof SvgPolygon>;

export const Primary: SvgPolygonStory = {};
export const Suggested: SvgPolygonStory = {
  args: {
    color: "fuchsia",
    dashed: true,
    filled: false,
  },
};

export default meta;

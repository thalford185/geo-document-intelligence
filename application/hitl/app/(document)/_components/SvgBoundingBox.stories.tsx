import type { Meta, StoryObj } from "@storybook/react";

import SvgBoundingBoxStory from "@/app/(document)/_components/SvgBoundingBox";

const meta: Meta<typeof SvgBoundingBoxStory> = {
  component: SvgBoundingBoxStory,
  args: {
    value: [32, 32, 224, 224],
    dimension: { width: 256, height: 256 },
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

type SvgBoundingBoxStory = StoryObj<typeof SvgBoundingBoxStory>;

export const Primary: SvgBoundingBoxStory = {};

export default meta;

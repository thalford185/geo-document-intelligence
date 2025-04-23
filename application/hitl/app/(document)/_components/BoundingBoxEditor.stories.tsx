import BoundingBoxEditor from "@/app/(document)/_components/BoundingBoxEditor";
import type { Meta, StoryObj } from "@storybook/react";
import { fn, userEvent, within } from "@storybook/test";

const meta: Meta<typeof BoundingBoxEditor> = {
  component: BoundingBoxEditor,
  args: {
    onCancel: fn(),
    onDone: fn(),
    dimension: { width: 256, height: 256 },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: "512px",
          height: "512px",
          borderColor: "#FF00FF",
          borderWidth: 2,
        }}
      >
        <Story />
      </div>
    ),
  ],
};

type BoundingBoxEditorStory = StoryObj<typeof BoundingBoxEditor>;
export const Primary: BoundingBoxEditorStory = {};
export const WithValue: BoundingBoxEditorStory = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const svgElement = canvas.getByRole("img");
    const svgElementBoundingClientRect = svgElement.getBoundingClientRect();
    await userEvent.pointer([
      {
        keys: "[MouseLeft>]",
        target: svgElement,
        coords: {
          x: svgElementBoundingClientRect.left + 64,
          y: svgElementBoundingClientRect.top + 64,
        },
      },
      {
        coords: {
          x:
            svgElementBoundingClientRect.left +
            svgElementBoundingClientRect.width -
            64,
          y:
            svgElementBoundingClientRect.top +
            svgElementBoundingClientRect.height -
            64,
        },
      },
      {
        keys: "[/MouseLeft]",
      },
    ]);
  },
};

export default meta;

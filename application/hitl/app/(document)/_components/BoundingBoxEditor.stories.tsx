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
    const viewer = canvas.getByRole("img", {
      name: "boundingBoxEditorViewer",
    });
    const viewerBoundingClientRect = viewer.getBoundingClientRect();
    await userEvent.pointer([
      {
        keys: "[MouseLeft>]",
        target: viewer,
        coords: {
          x: viewerBoundingClientRect.left + 64,
          y: viewerBoundingClientRect.top + 64,
        },
      },
      {
        coords: {
          x:
            viewerBoundingClientRect.left + viewerBoundingClientRect.width - 64,
          y:
            viewerBoundingClientRect.top + viewerBoundingClientRect.height - 64,
        },
      },
      {
        keys: "[/MouseLeft]",
      },
    ]);
  },
};

export default meta;

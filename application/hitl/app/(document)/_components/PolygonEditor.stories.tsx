import PolygonEditor from "@/app/(document)/_components/PolygonEditor";
import type { Meta, StoryObj } from "@storybook/react";
import { fn, userEvent, within } from "@storybook/test";

const meta: Meta<typeof PolygonEditor> = {
  component: PolygonEditor,
  args: {
    dimension: { width: 256, height: 256 },
    suggestedVertices: [],
    onUpdateSuggestedVertices: fn(),
    onInput: fn(),
    onCancel: fn(),
    onDone: fn(),
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

type PolygonEditorStory = StoryObj<typeof PolygonEditor>;
export const Primary: PolygonEditorStory = {};

export const WithSuggestion: PolygonEditorStory = {
  args: {
    suggestedVertices: [
      [25, 25],
      [225, 25],
      [125, 175],
    ],
  },
};
export const WithValue: PolygonEditorStory = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const svgElement = canvas.getByRole("img");
    const svgElementBoundingClientRect = svgElement.getBoundingClientRect();
    await userEvent.pointer([
      {
        keys: "[MouseLeft]",
        target: svgElement,
        coords: {
          x: svgElementBoundingClientRect.left + 250,
          y: svgElementBoundingClientRect.top + 350,
        },
      },
      {
        keys: "[MouseLeft]",
        target: svgElement,
        coords: {
          x: svgElementBoundingClientRect.left + 50,
          y: svgElementBoundingClientRect.top + 50,
        },
      },
    ]);
  },
};

export const WithValueAndSuggestion: PolygonEditorStory = {
  ...WithValue,
  ...WithSuggestion,
};
export default meta;

import Meta, {
  Primary as WithoutValueOrSuggestionStory,
  WithSuggestion as WithSuggestionStory,
  WithValueAndSuggestion as WithValueAndSuggestionStory,
  WithValue as WithValueStory,
} from "@/app/(document)/_components/PolygonEditor.stories";
import { Point } from "@/document/core/model";
import { ComposedStoryFn } from "@storybook/core/types";
import { composeStory, ReactRenderer } from "@storybook/react";
import { resetAllMocks } from "@storybook/test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockResizeObserver } from "jsdom-testing-mocks";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

async function clickEnabledMenuItem(name: string) {
  const menuItem = screen.getByRole("menuitem", {
    name,
  });
  expect(menuItem).toHaveProperty("disabled", false);
  await userEvent.click(menuItem);
}

function expectDisabledMenuItem(name: string) {
  const menuItem = screen.getByRole("menuitem", {
    name,
  });
  expect(menuItem).toHaveProperty("disabled", true);
}

async function canBeCancelled(
  Component: ComposedStoryFn<ReactRenderer, { onCancel?: () => void }>
) {
  await clickEnabledMenuItem("cancel");
  expect(Component.args.onCancel).toHaveBeenCalled();
}

async function canBeConfirmed(
  Component: ComposedStoryFn<
    ReactRenderer,
    { onDone?: (vertices: Point[]) => void }
  >
) {
  await clickEnabledMenuItem("done");
  expect(Component.args.onDone).toHaveBeenCalled();
}

async function canAcceptAll(
  Component: ComposedStoryFn<
    ReactRenderer,
    { onUpdateSuggestedVertices?: (vertices: Point[]) => void }
  >
) {
  await clickEnabledMenuItem("acceptAll");
  expect(Component.args.onUpdateSuggestedVertices).toHaveBeenCalled();
}

describe("PolygonEditor", () => {
  beforeAll(() => {
    mockResizeObserver();
  });

  describe("without a value or suggestion", () => {
    const Component = composeStory(WithoutValueOrSuggestionStory, Meta);

    beforeEach(() => {
      render(<Component />);
    });

    it("can be cancelled", async () => await canBeCancelled(Component));

    it("cannot be confirmed", () => expectDisabledMenuItem("done"));

    it("cannot accept all suggested vertices", () =>
      expectDisabledMenuItem("acceptAll"));

    it("cannot accept next suggested vertex", () =>
      expectDisabledMenuItem("acceptNext"));

    afterEach(() => {
      cleanup();
      resetAllMocks();
    });
  });

  describe("with a suggestion", () => {
    const Component = composeStory(WithSuggestionStory, Meta);

    beforeEach(() => {
      render(<Component />);
    });

    it("can be cancelled", async () => await canBeCancelled(Component));

    it("cannot be confirmed", () => expectDisabledMenuItem("done"));

    it("can accept all suggested vertices", async () =>
      await canAcceptAll(Component));

    it("cannot accept next suggested vertex", () =>
      expectDisabledMenuItem("acceptNext"));

    afterEach(() => {
      cleanup();
      resetAllMocks();
    });
  });

  describe("with a value", () => {
    const Component = composeStory(WithValueStory, Meta);
    beforeEach(async () => {
      render(<Component />);
      await Component.play!();
    });

    it("can be cancelled", async () => await canBeCancelled(Component));

    it("can be confirmed", async () => await canBeConfirmed(Component));

    it("cannot accept all suggested vertices", () =>
      expectDisabledMenuItem("acceptAll"));

    it("cannot accept next suggested vertex", () =>
      expectDisabledMenuItem("acceptNext"));

    afterEach(() => {
      cleanup();
      resetAllMocks();
    });
  });

  describe("with a value and suggestion", () => {
    const Component = composeStory(WithValueAndSuggestionStory, Meta);
    beforeEach(async () => {
      render(<Component />);
      await Component.play!();
    });

    it("can be cancelled", async () => await canBeCancelled(Component));

    it("can be confirmed", async () => await canBeConfirmed(Component));

    it("can accept all suggested vertices", async () =>
      await canAcceptAll(Component));

    it("can accept next suggested vertex", async () => {
      await clickEnabledMenuItem("acceptNext");
      expect(Component.args.onUpdateSuggestedVertices).toHaveBeenCalled();
    });

    afterEach(() => {
      cleanup();
      resetAllMocks();
    });
  });
});

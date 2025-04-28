import Meta, {
  Primary as WithoutValueStory,
  WithValue as WithValueStory,
} from "@/app/(document)/_components/BoundingBoxEditor.stories";
import { composeStory } from "@storybook/react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockResizeObserver } from "jsdom-testing-mocks";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

describe("BoundingBoxEditor", () => {
  beforeAll(() => {
    mockResizeObserver();
  });

  describe("without value", () => {
    const Component = composeStory(WithoutValueStory, Meta);

    beforeEach(() => {
      render(<Component />);
    });

    it("cannot be confirmed", async () => {
      const doneMenuItem = screen.getByRole("menuitem", {
        name: "done",
      });
      expect(doneMenuItem).toHaveProperty("disabled", true);
      await userEvent.click(doneMenuItem);
      expect(Component.args.onDone).not.toHaveBeenCalled();
    });

    it("can be cancelled", async () => {
      const cancelMenuItem = screen.getByRole("menuitem", {
        name: "cancel",
      });
      expect(cancelMenuItem).toHaveProperty("disabled", false);
      await userEvent.click(cancelMenuItem);
      expect(Component.args.onCancel).toHaveBeenCalled();
    });

    afterEach(() => {
      cleanup();
    });
  });

  describe("with value", () => {
    const Component = composeStory(WithValueStory, Meta);

    beforeEach(async () => {
      render(<Component />);
      await Component.play!();
    });

    it("can be confirmed", async () => {
      const doneMenuItem = screen.getByRole("menuitem", {
        name: "done",
      });
      expect(doneMenuItem).toHaveProperty("disabled", false);
      await userEvent.click(doneMenuItem);
      expect(Component.args.onDone).toHaveBeenCalled();
    });

    it("can be cancelled", async () => {
      const cancelMenuItem = screen.getByRole("menuitem", {
        name: "cancel",
      });
      expect(cancelMenuItem).toHaveProperty("disabled", false);
      await userEvent.click(cancelMenuItem);
      expect(Component.args.onCancel).toHaveBeenCalled();
    });

    afterEach(() => {
      cleanup();
    });
  });
});

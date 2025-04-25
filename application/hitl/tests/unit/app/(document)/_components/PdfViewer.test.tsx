import Meta, {
  PaginationDisabled as PaginationDisabledStory,
  Primary as PaginationEnabledStory,
} from "@/app/(document)/_components/PdfViewer.stories";
import { composeStory } from "@storybook/react";
import { resetAllMocks } from "@storybook/test";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("PdfViewer", () => {
  describe("with pagination enabled", () => {
    const Component = composeStory(PaginationEnabledStory, Meta, {
      args: {
        pdfDocument: {
          numPages: 2,
        },
      },
    });

    beforeEach(() => {
      render(<Component />);
    });

    it("can change page", async () => {
      const paginationElement = screen.getByRole("navigation", {
        name: "pdfViewerPagination",
      });
      const secondPage = within(paginationElement).getAllByRole("listitem")[1];
      await userEvent.click(secondPage);
      expect(Component.args.onUpdatePageNumber).toBeCalledWith(2);
    });

    afterEach(() => {
      cleanup();
      resetAllMocks();
    });
  });
  describe("with pagination disabled", () => {
    const Component = composeStory(PaginationDisabledStory, Meta, {
      args: {
        pdfDocument: {
          numPages: 2,
        },
      },
    });

    beforeEach(async () => {
      render(<Component />);
    });

    it("cannot change page", async () => {
      const paginationElement = screen.getByRole("navigation", {
        name: "pdfViewerPagination",
      });
      const secondPage = within(paginationElement).getAllByRole("listitem")[1];
      await userEvent.click(secondPage);
      expect(Component.args.onUpdatePageNumber).not.toBeCalled();
    });

    afterEach(() => {
      cleanup();
      vi.resetAllMocks();
      resetAllMocks();
    });
  });
});

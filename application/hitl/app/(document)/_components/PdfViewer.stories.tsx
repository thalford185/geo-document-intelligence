import PdfViewer from "@/app/(document)/_components/PdfViewer";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { getDocument } from "pdfjs-dist";
import "pdfjs-dist/webpack.mjs";

const meta: Meta<typeof PdfViewer> = {
  component: PdfViewer,
  args: {
    renderOverlay: () => <></>,
    onUpdatePageNumber: fn(),
  },
  loaders: [
    async () => {
      const pdfDocument = await getDocument("/sample.pdf").promise;
      const pdfPage = await pdfDocument.getPage(1);
      return { pdfDocument, pdfPage };
    },
  ],
  render: (args, { loaded: { pdfDocument, pdfPage } }) => {
    args.pdfDocument = args.pdfDocument ?? pdfDocument;
    args.pdfPage = args.pdfPage ?? pdfPage;
    return <PdfViewer {...args} />;
  },
  decorators: [
    (Story) => (
      <div style={{ width: "512px" }}>
        <Story />
      </div>
    ),
  ],
};

type PdfViewerStory = StoryObj<typeof PdfViewer>;

export const Primary: PdfViewerStory = {};

export const PaginationDisabled: PdfViewerStory = {
  args: {
    paginationIsEnabled: false,
  },
};

export default meta;

import type { Meta, StoryObj } from "@storybook/react";

import DocumentSkeleton from "@/app/(document)/_components/DocumentSkeleton";

const meta: Meta<typeof DocumentSkeleton> = {
  component: DocumentSkeleton,
};

type DocumentSkeletonStory = StoryObj<typeof DocumentSkeleton>;

export const Primary: DocumentSkeletonStory = {};

export default meta;

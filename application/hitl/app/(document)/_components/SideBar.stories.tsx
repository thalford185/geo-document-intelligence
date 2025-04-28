import type { Meta, StoryObj } from "@storybook/react";

import SideBar, {
  SideBarActions,
  SideBarHeader,
} from "@/app/(document)/_components/SideBar";
import { Button } from "@/app/(document)/_components/ui/button";

const meta: Meta<typeof SideBar> = {
  component: SideBar,
  subcomponents: { SideBarActions, SideBarHeader },
  render: (args) => (
    <SideBar {...args}>
      <SideBarHeader>
        <h1>Sidebar Header</h1>
      </SideBarHeader>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent gravida
      ex et eros vehicula, et varius odio dapibus.
      <SideBarActions>
        <Button variant={"outline"}>Secondary Action</Button>
        <Button>Primary Action</Button>
      </SideBarActions>
    </SideBar>
  ),
};

type SideBarStory = StoryObj<typeof SideBar>;

export const Primary: SideBarStory = {};

export default meta;

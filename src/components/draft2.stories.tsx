import type { Meta, StoryObj } from "@storybook/react";
import {
  ListNote,
  ListResizableNotes,
  Note,
  ResizableNote,
  StackNote,
} from "./Notes";
import { initialNotes } from "@/context";
import { NotesProvider } from "@/provider";

// Storybook Meta
const meta: Meta<typeof Note> = {
  component: Note,
  args: {
    variant: "amber",
  },
  argTypes: {
    variant: {
      control: "radio",
      options: ["amber", "green", "pink", "violet", "cyan", "zinc", "neutral"],
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Draft1: Story = {
  render: ({ variant }) => {
    return (
      <StackNote
        note={initialNotes[0]}
        variant={variant}
        className="w-[220px]"
      />
    );
  },
};

export const Draft2: Story = {
  render: ({ variant }) => {
    return <ResizableNote variant={variant} note={initialNotes[0]} />;
  },
};

export const Draft3: Story = {
  argTypes: {
    variant: {
      control: false,
    },
  },
  parameters: {
    controls: { exclude: ["variant"] },
  },
  render: () => {
    return (
      <NotesProvider>
        <div className="flex">
          <ListNote />
          <ListResizableNotes />
        </div>
      </NotesProvider>
    );
  },
};

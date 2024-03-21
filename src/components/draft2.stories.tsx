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
import { NoteModel } from "@/lib/db";

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
    const note: NoteModel = {
      id: 0,
      content: "",
      open: false,
      color: "amber",
      x: 0,
      y: 0,
      width: 220,
      height: 200,
      createdDate: new Date().toDateString(),
    };
    return <StackNote note={note} variant={variant} className="w-[220px]" />;
  },
};

export const Draft2: Story = {
  render: ({ variant }) => {
    const note: NoteModel = {
      id: 0,
      content: "",
      open: false,
      color: "amber",
      x: 0,
      y: 0,
      width: 220,
      height: 200,
      createdDate: new Date().toDateString(),
    };
    return <ResizableNote variant={variant} note={note} />;
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
};

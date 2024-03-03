import { cn } from "@/lib/util";
import type { Meta, StoryObj } from "@storybook/react";
import { VariantProps, cva } from "class-variance-authority";
import React, { HTMLAttributes, forwardRef } from "react";
import { PiDotsThree } from "react-icons/pi";
const noteVariants = cva(
  "flex flex-col border w-[180px] h-[180px] group/header rounded-md",
  {
    variants: {
      variant: {
        amber: "bg-amber-100",
        fuchsia: "bg-fuchsia-100",
        green: "bg-green-100",
        sky: "bg-sky-100",
      },
      border: {
        amber: "border-amber-200",
        fuchsia: "border-fuchsia-200",
        green: "border-green-200",
        sky: "border-sky-200",
      },
      rounded: {
        true: "rounded-2xl",
        false: "",
      },
      shadow: {
        true: "shadow-md",
        false: "",
      },
      folded: {
        amber: "bg-amber-200/50",
        fuchsia: "bg-fuchsia-200/50",
        green: "bg-green-200/50",
        sky: "bg-sky-200/50",
      },
      hover: {
        amber: "hover:bg-amber-950/5",
        fuchsia: "hover:bg-fuchsia-950/5",
        green: "hover:bg-green-950/5",
        sky: "hover:bg-sky-950/5",
      },
    },
  }
);

interface NoteProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof noteVariants> {
  ref?: React.Ref<HTMLDivElement>;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const Note = forwardRef<HTMLDivElement, NoteProps>(
  (
    {
      header,
      footer,
      border,
      hover,
      variant,
      rounded,
      shadow,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          noteVariants({ className, variant, hover, border, rounded, shadow })
        )}
        {...props}
      >
        {header}
        {children}
        {footer}
      </div>
    );
  }
);

const noteHeaderVariants = cva(
  "flex justify-between w-full h-10 px-1 py-2 transition duration-300 ease-in-out",
  {
    variants: {
      focus: {
        amber:
          "group-focus-within/header:bg-amber-200 has-[:hover]:bg-amber-200",
        fuchsia:
          "group-focus-within/header:bg-fuchsia-200 has-[:hover]:bg-fuchsia-200",
        green:
          "group-focus-within/header:bg-green-200 has-[:hover]:bg-green-200",
        sky: "group-focus-within/header:bg-sky-200 has-[:hover]:bg-sky-200",
      },
    },
  }
);

interface NoteHeaderProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof noteHeaderVariants> {
  ref?: React.Ref<HTMLDivElement>;
}

const NoteHeader = forwardRef<HTMLDivElement, NoteHeaderProps>(
  ({ focus, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(noteHeaderVariants({ className, focus }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const meta: Meta<typeof Note> = {
  component: Note,
  argTypes: {
    variant: {
      control: "radio",
      options: ["amber", "fuchsia", "green", "sky"],
    },
    hover: {
      control: "radio",
      options: ["amber", "fuchsia", "green", "sky"],
    },
    border: {
      control: "radio",
      options: ["amber", "fuchsia", "green", "sky"],
    },
    rounded: {
      control: "boolean",
    },
    shadow: {
      control: "boolean",
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const NoteDraft1: Story = {
  args: {
    variant: "amber",
    hover: "amber",
    border: "amber",
  },
};

export const NoteDraft2: Story = {
  args: {
    variant: "amber",
    hover: "amber",
    border: "amber",
    shadow: true,
    rounded: true,
  },
  render: ({ hover, border, variant, rounded, shadow }) => {
    return (
      <Note
        hover={hover}
        border={border}
        variant={variant}
        rounded={rounded}
        shadow={shadow}
        header={
          <NoteHeader className="justify-end">
            <PiDotsThree className="invisible group-hover/header:visible" />
          </NoteHeader>
        }
      />
    );
  },
};

export const NoteDraft3: Story = {
  args: {
    variant: "amber",
    hover: "amber",
    border: "amber",
    shadow: false,
    rounded: false,
  },
  render: ({ hover, border, variant, shadow, rounded }) => {
    return (
      <Note
        border={border}
        variant={variant}
        shadow={shadow}
        rounded={rounded}
        header={
          <NoteHeader className="justify-end items-center" focus={hover}>
            <PiDotsThree className="h-0 group-focus-within/header:h-4 hover:h-4" />
          </NoteHeader>
        }
      >
        <input type="text" />
      </Note>
    );
  },
};

import { cn } from "@/lib/util";
import type { Meta, StoryObj } from "@storybook/react";
import { VariantProps, cva } from "class-variance-authority";
import React, {
  ButtonHTMLAttributes,
  HTMLAttributes,
  JSXElementConstructor,
  ReactElement,
  forwardRef,
  useState,
} from "react";
import { PiDotsThree } from "react-icons/pi";
import { GoPlus } from "react-icons/go";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import {
  GrBold,
  GrImage,
  GrItalic,
  GrStrikeThrough,
  GrUnderline,
  GrUnorderedList,
} from "react-icons/gr";
import {
  FloatingFocusManager,
  autoPlacement,
  autoUpdate,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { IoOpenOutline } from "react-icons/io5";
import { BsTrash } from "react-icons/bs";
const noteVariants = cva(
  "flex flex-col border border-t-8 w-[180px] h-[180px] group/header shadow-md",
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
      folded: {
        amber: "folded after:folded-amber-after",
        fuchsia: "folded after:folded-fuchsia-after",
        green: "folded after:folded-green-after",
        sky: "folded after:folded-sky-after",
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
const noteShadowVariants = cva("", {
  variants: {
    shadow: {
      true: "",
      false: "",
    },
  },
});

interface NoteProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof noteVariants>,
    VariantProps<typeof noteShadowVariants> {
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
      folded,
      variant,
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
          noteVariants({ className, variant, hover, border, folded })
        )}
        {...props}
      >
        {header}
        <div className="grow">{children}</div>
        {footer}
      </div>
    );
  }
);

const noteHeaderVariants = cva(
  "flex justify-between w-full h-10 px-1 py-2 transition-all",
  {
    variants: {
      variant: {
        amber: "border-t-amber-200",
        fuchsia: "border-t-fuchsia-200",
        sky: "border-t-sky-200",
        green: "border-t-green-200",
      },
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
  ({ variant, focus, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(noteHeaderVariants({ className, variant, focus }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const noteButtonVariants = cva("", {
  variants: {
    variant: {
      amber: "hover:bg-amber-200 hover:ring-2 hover:ring-amber-200",
      fuchsia: "hover:bg-fuchsia-200 hover:ring-2 hover:ring-fuchsia-200",
      green: "hover:bg-green-200 hover:ring-2 hover:ring-green-200",
      sky: "hover:bg-sky-200 hover:ring-2 hover:ring-sky-200",
    },
    hover: {
      true: "invisible group-hover/header:visible",
      false: "",
    },
    focus: {
      true: "h-0 group-focus-within/header:h-4 hover:h-4",
      false: "",
    },
  },
});

interface NoteButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof noteButtonVariants> {
  ref?: React.Ref<HTMLButtonElement>;
}
const NoteButton = forwardRef<HTMLButtonElement, NoteButtonProps>(
  ({ variant, focus, hover, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(noteButtonVariants({ className, variant }))}
        {...props}
      >
        {React.Children.map(
          children as ReactElement<any, string | JSXElementConstructor<any>>,
          (child: ReactElement<any, string | JSXElementConstructor<any>>) => {
            return React.cloneElement(
              child,
              { className: cn(noteButtonVariants({ focus, hover })) },
              null
            );
          }
        )}
      </button>
    );
  }
);

const NoteEditor = () => {
  const extensions = [StarterKit];

  const content = "<p>Hello World!</p>";
  const editor = useEditor({
    extensions,
    content,
    editorProps: {
      attributes: {
        class: "overflow-auto h-[100px] outline-none no-scrollbar p-2",
      },
    },
  });
  return <EditorContent editor={editor} />;
};

interface NoteFooterProps extends HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
}
const NoteFooter = forwardRef<HTMLDivElement, NoteFooterProps>(
  ({ children, ...props }, ref) => {
    return (
      <div className="flex justify-between p-2" ref={ref} {...props}>
        {children}
      </div>
    );
  }
);

const NoteMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [autoPlacement()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);
  return (
    <div className="absolute right-0 z-50">
      <NoteButton ref={refs.setReference} {...getReferenceProps()} hover>
        <PiDotsThree />
      </NoteButton>
      {isOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div
            className="bg-slate-100"
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            <NoteMenuItem onMenuItemClick={() => setIsOpen(false)}>
              <IoOpenOutline />
              <div>Open Note</div>
            </NoteMenuItem>
            <NoteMenuItem onMenuItemClick={() => setIsOpen(false)}>
              <BsTrash />
              <div>Delete Note</div>
            </NoteMenuItem>
          </div>
        </FloatingFocusManager>
      )}
    </div>
  );
};

interface NoteMenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onMenuItemClick?: () => void;
}
const NoteMenuItem = ({ onMenuItemClick, children }: NoteMenuItemProps) => {
  return (
    <button
      className="flex gap-2 justify-between items-center p-2 w-32 hover:bg-slate-200"
      onClick={() => onMenuItemClick && onMenuItemClick()}
    >
      {children}
    </button>
  );
};

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
    folded: {
      control: "radio",
      options: ["amber", "fuchsia", "green", "sky", undefined],
    },
    shadow: {
      control: "boolean",
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const NoteDraft: Story = {
  args: {
    variant: "amber",
    hover: "amber",
    border: "amber",
    shadow: true,
  },
};

export const NoteStackDraft: Story = {
  args: {
    variant: "amber",
    hover: "amber",
    border: "amber",
    folded: "amber",
    shadow: true,
  },
  render: ({ hover, border, variant, folded, shadow }) => {
    return (
      <Note
        hover={hover}
        border={border}
        variant={variant}
        shadow={shadow}
        folded={folded}
        header={
          <NoteHeader
            className="justify-between items-center"
            variant={variant}
          >
            <NoteButton hover>
              <GoPlus />
            </NoteButton>
            <div className="relative flex items-center">
              <NoteMenu />
              <span className="absolute right-1 opacity-60 text-slate-600 text-xs contrast-more:opacity-100 group-hover/header:invisible">
                25/07/66
              </span>
            </div>
          </NoteHeader>
        }
      />
    );
  },
};

export const NoteResizableDraft: Story = {
  args: {
    variant: "amber",
    hover: "amber",
    border: "amber",
    shadow: true,
  },
  render: ({ hover, border, variant, shadow }) => {
    return (
      <Note
        border={border}
        variant={variant}
        shadow={shadow}
        header={
          <NoteHeader
            className="justify-between items-center"
            focus={hover}
            variant={variant}
          >
            <NoteButton focus>
              <GoPlus />
            </NoteButton>
            <NoteButton focus>
              <PiDotsThree />
            </NoteButton>
          </NoteHeader>
        }
        footer={
          <NoteFooter>
            <div className="flex justify-start gap-2">
              <NoteButton variant={variant} focus>
                <GrBold />
              </NoteButton>
              <NoteButton variant={variant} focus>
                <GrItalic />
              </NoteButton>
              <NoteButton variant={variant} focus>
                <GrUnderline />
              </NoteButton>
              <NoteButton variant={variant} focus>
                <GrStrikeThrough />
              </NoteButton>
              <NoteButton variant={variant} focus>
                <GrUnorderedList />
              </NoteButton>
              <NoteButton variant={variant} focus>
                <GrImage />
              </NoteButton>
            </div>
          </NoteFooter>
        }
      >
        <NoteEditor />
      </Note>
    );
  },
};

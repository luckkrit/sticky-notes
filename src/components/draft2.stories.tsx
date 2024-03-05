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
import type { Meta, StoryObj } from "@storybook/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ButtonHTMLAttributes, HTMLAttributes, useState } from "react";
import { BsTrash } from "react-icons/bs";
import {
  GrAdd,
  GrBold,
  GrClose,
  GrImage,
  GrItalic,
  GrStrikeThrough,
  GrUnderline,
  GrUnorderedList,
} from "react-icons/gr";
import { IoOpenOutline } from "react-icons/io5";
import { PiDotsThree } from "react-icons/pi";
const Note = () => {
  return <></>;
};

interface NoteEditorProps extends HTMLAttributes<HTMLElement> {
  editable?: boolean;
}
const NoteEditor = ({ editable = false }: NoteEditorProps) => {
  const extensions = [StarterKit];

  const content = "<p>Hello World!</p>";
  const editor = useEditor({
    extensions,
    content,
    editable,
    editorProps: {
      attributes: {
        class: "overflow-auto h-[100px] outline-none no-scrollbar p-2",
      },
    },
  });
  return <EditorContent editor={editor} />;
};

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
    <>
      <button ref={refs.setReference} {...getReferenceProps()}>
        <PiDotsThree className="invisible group-hover/note:visible" />
      </button>
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
    </>
  );
};

interface NoteMenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onMenuItemClick?: () => void;
}
const NoteMenuItem = ({ onMenuItemClick, children }: NoteMenuItemProps) => {
  return (
    <button
      className="flex gap-2 justify-between items-center p-2 w-32 hover:bg-slate-200 z-50"
      onClick={() => onMenuItemClick && onMenuItemClick()}
    >
      {children}
    </button>
  );
};
const meta: Meta<typeof Note> = {
  component: Note,
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Draft1: Story = {
  render: () => {
    return (
      <div className="group/note w-fit h-fit drop-shadow-md ">
        <div className="flex flex-col bg-amber-100 border-amber-200 w-[220px] h-[200px] group-hover/note:bg-amber-950/10 group-hover/note:shadow-md">
          <div className="flex justify-between border-t-4 border-amber-200 group-hover/note:border-amber-950/5">
            <div></div>
            <div className="pr-2 pt-2 flex items-center">
              <button>
                <PiDotsThree className="invisible group-hover/note:visible" />
              </button>
              <span className="group-hover/note:hidden text-slate-600 text-xs">
                25/05/65
              </span>
            </div>
          </div>
          <div className="fixed top-8 bottom-8 left-1 right-1">
            <NoteEditor />
          </div>
        </div>
      </div>
    );
  },
};

export const Draft2: Story = {
  render: () => {
    return (
      <div className="group/note w-fit h-fit drop-shadow-md ">
        <div className="flex flex-col bg-amber-100 border-amber-200 w-[220px] h-[200px] ">
          <div className="flex justify-between bg-amber-200 h-0 group-focus-within/note:h-8 transition-all has-[:hover]:h-8">
            <div>
              <button className="invisible group-focus-within/note:visible hover:visible hover:bg-zinc-200/60 p-2">
                <GrAdd className="invisible group-focus-within/note:visible hover:visible" />
              </button>
            </div>
            <div>
              <button className="invisible group-focus-within/note:visible hover:visible hover:bg-zinc-200/60 p-2">
                <PiDotsThree className="invisible group-focus-within/note:visible hover:visible" />
              </button>
              <button className="invisible group-focus-within/note:visible hover:visible hover:bg-zinc-200/60 p-2">
                <GrClose className="invisible group-focus-within/note:visible hover:visible" />
              </button>
            </div>
          </div>
          <div className="fixed top-8 bottom-8 left-1 right-1">
            <NoteEditor editable />
          </div>
          <div className="fixed bottom-0 flex justify-between invisible group-focus-within/note:visible transition-all has-[:hover]:visible border-t border-t-stone-200 w-full p-1">
            <div>
              <button className="invisible group-focus-within/note:visible hover:visible hover:bg-zinc-200/60 p-2">
                <GrBold className="invisible group-focus-within/note:visible hover:visible" />
              </button>
              <button className="invisible group-focus-within/note:visible hover:visible hover:bg-zinc-200/60 p-2">
                <GrItalic className="invisible group-focus-within/note:visible hover:visible" />
              </button>
              <button className="invisible group-focus-within/note:visible hover:visible hover:bg-zinc-200/60 p-2">
                <GrUnderline className="invisible group-focus-within/note:visible hover:visible" />
              </button>
              <button className="invisible group-focus-within/note:visible hover:visible hover:bg-zinc-200/60 p-2">
                <GrStrikeThrough className="invisible group-focus-within/note:visible hover:visible" />
              </button>
              <button className="invisible group-focus-within/note:visible hover:visible hover:bg-zinc-200/60 p-2">
                <GrUnorderedList className="invisible group-focus-within/note:visible hover:visible" />
              </button>
              <button className="invisible group-focus-within/note:visible hover:visible hover:bg-zinc-200/60 p-2">
                <GrImage className="invisible group-focus-within/note:visible hover:visible" />
              </button>
            </div>
            <div></div>
          </div>
        </div>
      </div>
    );
  },
};

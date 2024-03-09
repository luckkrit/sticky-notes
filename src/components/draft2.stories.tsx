import { cn } from "@/lib/util";
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
import { VariantProps, cva } from "class-variance-authority";
import React, {
  ButtonHTMLAttributes,
  HTMLAttributes,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
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
import { MdCloseFullscreen } from "react-icons/md";
import { PiDotsThree } from "react-icons/pi";
import { SpringValue, animated, useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";

const Note = () => {
  return <></>;
};

const StackNote = () => {};
interface UseResizableProps {
  x1?: number;
  y1?: number;
  w1?: number;
  h1?: number;
  dragEl: React.RefObject<HTMLDivElement>;
}
const useResizable = ({
  x1 = 0,
  y1 = 0,
  w1 = 220,
  h1 = 220,
  dragEl,
}: UseResizableProps) => {
  const [springs, api] = useSpring(() => ({
    x: x1,
    y: y1,
    width: w1,
    height: h1,
  }));
  const { x, y, width, height } = springs;
  const bind = useDrag(
    (state) => {
      const isResizing = state?.event.target === dragEl.current;
      if (isResizing) {
        if (state.offset[0] < 220 || state.offset[1] < 200) return;
        api.set({
          width: state.offset[0],
          height: state.offset[1],
        });
      } else {
        api.set({
          x: state.offset[0],
          y: state.offset[1],
        });
      }
    },
    {
      from: (event) => {
        const isResizing = event.target === dragEl.current;
        if (isResizing) {
          return [width.get(), height.get()];
        } else {
          return [x.get(), y.get()];
        }
      },
      bounds: (state) => {
        const isResizing = state?.event.target === dragEl.current;
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;
        if (isResizing) {
          return {
            top: 50,
            left: 50,
            right: containerWidth - x.get(),
            bottom: containerHeight - y.get(),
          };
        } else {
          return {
            top: 0,
            left: 0,
            right: containerWidth - width.get(),
            bottom: containerHeight - height.get(),
          };
        }
      },
    }
  );
  return { springs, bind };
};
const resizableNoteVariants = cva("", {
  variants: {},
});
interface ResizableNoteProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof resizableNoteVariants> {
  ref?: React.Ref<HTMLDivElement>;
  onClose?: () => void;
}
const ResizableNote = forwardRef<HTMLDivElement, ResizableNoteProps>(
  ({ className, onClose, ...props }, ref) => {
    const dragEl = useRef<HTMLDivElement | null>(null);
    const { springs, bind } = useResizable({
      x1: 0,
      y1: 0,
      w1: 220,
      h1: 200,
      dragEl,
    });

    return (
      <animated.div
        style={{ ...springs, touchAction: "none" }}
        {...bind()}
        className={cn("group/note w-fit h-fit drop-shadow-md ", className)}
      >
        <div
          className="flex flex-col bg-amber-100 border-amber-200 min-w-[220px] min-h-[200px] w-full h-full"
          {...props}
          ref={ref}
        >
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
              <button
                className="invisible group-focus-within/note:visible hover:visible hover:bg-zinc-200/60 p-2"
                onClick={() => onClose && onClose()}
              >
                <GrClose className="invisible group-focus-within/note:visible hover:visible" />
              </button>
            </div>
          </div>
          <div className="fixed top-8 bottom-8 left-1 right-1">
            <NoteEditor editable springs={springs} />
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
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
          ref={dragEl}
        ></div>
      </animated.div>
    );
  }
);

interface NoteEditorProps extends HTMLAttributes<HTMLElement> {
  editable?: boolean;
  springs?: {
    x: SpringValue<number>;
    y: SpringValue<number>;
    width: SpringValue<number>;
    height: SpringValue<number>;
  };
}
const NoteEditor = ({ editable = false, springs }: NoteEditorProps) => {
  const { width, height } = springs || {
    width: new SpringValue(220),
    height: new SpringValue(160),
  };
  const extensions = [StarterKit];

  const content = "<p>Hello World!</p>";
  const editor = useEditor({
    extensions,
    content,
    editable,
    editorProps: {
      attributes: {
        class: "overflow-auto outline-none no-scrollbar p-2",
        style: `width:${width.get()}px;height:${height.get() - 41}px`,
      },
    },
  });
  useEffect(() => {
    editor?.setOptions({
      editorProps: {
        attributes: {
          class: "overflow-auto min-h-[100px] outline-none no-scrollbar p-2",
          style: `width:${width.get()}px;height:${height.get() - 41}px`,
        },
      },
    });
  }, [width.get(), height.get()]);
  return <EditorContent editor={editor} />;
};
interface NoteMenuProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  open?: boolean;
  hasOpened?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onDelete?: () => void;
}
const NoteMenu = ({
  open = false,
  hasOpened = false,
  onOpen,
  onClose,
  onDelete,
}: NoteMenuProps) => {
  const [isOpen, setIsOpen] = useState(open);
  const [isOpenNote, setIsOpenNote] = useState(hasOpened);
  // useEffect(() => {
  //   if (open === false) {
  //     setIsOpen(() => open);
  //   }
  // }, [open]);
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
            className="bg-slate-100 absolute z-50"
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            <NoteMenuItem
              onMenuItemClick={() => {
                if (!isOpenNote) {
                  onOpen && onOpen();
                } else {
                  onClose && onClose();
                }
                setIsOpen(false);
                setIsOpenNote((isOpenN) => !isOpenN);
              }}
            >
              {isOpenNote ? (
                <>
                  <MdCloseFullscreen />
                  <div>Close Note</div>
                </>
              ) : (
                <>
                  <IoOpenOutline />
                  <div>Open Note</div>
                </>
              )}
            </NoteMenuItem>
            <NoteMenuItem
              onMenuItemClick={() => {
                setIsOpen(false);
                onDelete && onDelete();
              }}
            >
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
    const [count, setCount] = useState(0);
    const [openMenu, setOpenMenu] = useState(false);
    const [isFolded, setIsFolded] = useState(false);

    return (
      <>
        {isFolded && (
          <ResizableNote
            className="absolute top-0 right-0 z-50"
            onClose={() => setIsFolded(false)}
          />
        )}
        <div
          className="group/note w-fit h-fit drop-shadow-md"
          onMouseEnter={() => {
            setCount((o) => o + 1);
            setOpenMenu(() => false);
          }}
          onMouseLeave={() => {
            setCount((o) => o + 1);
            setOpenMenu(() => false);
          }}
        >
          <div
            className={cn(
              "flex flex-col bg-amber-100 border-amber-200 w-[220px] h-[200px] group-hover/note:bg-amber-950/10 group-hover/note:shadow-md",
              isFolded === true ? "folded after:folded-amber-after" : ""
            )}
          >
            <div className="flex justify-between border-t-4 border-amber-200 group-hover/note:border-amber-950/5">
              <div></div>
              <div className="pr-2 pt-2 flex items-center">
                {/* <button>
                <PiDotsThree className="invisible group-hover/note:visible" />
              </button> */}
                <NoteMenu
                  open={openMenu}
                  key={count}
                  onOpen={() => {
                    setIsFolded(() => true);
                  }}
                  onClose={() => {
                    setIsFolded(() => false);
                  }}
                  hasOpened={isFolded}
                />
                <span className="group-hover/note:hidden text-slate-600 text-xs">
                  25/05/65
                </span>
              </div>
            </div>
            <div className="fixed top-8 bottom-8 left-1 right-1">
              <NoteEditor springs={undefined} />
            </div>
          </div>
        </div>
      </>
    );
  },
};

export const Draft2: Story = {
  render: () => {
    return <ResizableNote />;
  },
};

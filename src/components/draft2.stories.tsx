import { canvasPreview, cn, dataUrlToFile } from "@/lib/util";
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
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { VariantProps, cva } from "class-variance-authority";
import React, {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  PropsWithChildren,
  forwardRef,
  memo,
  useEffect,
  useMemo,
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
import { Underline } from "@tiptap/extension-underline";
import { ListItem } from "@tiptap/extension-list-item";
import { TextStyle, TextStyleOptions } from "@tiptap/extension-text-style";
import { Dialog } from "@headlessui/react";
import { Image as TipTapImage } from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

interface useNoteEditorProps {
  content: string;
}
const useNoteEditor = ({ content }: useNoteEditorProps): Editor | null => {
  const extensions = [
    Underline,
    TextStyle.configure({
      types: [ListItem.name],
    } as Partial<TextStyleOptions>),
    StarterKit.configure({
      bulletList: {
        keepMarks: true,
        keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
      },
    }),
    TipTapImage.configure({
      allowBase64: true,
      HTMLAttributes: {
        class: "object-scale-down min-w-52 h-auto",
      },
    }),
    Placeholder.configure({
      placeholder: "Take a note...",
      emptyEditorClass:
        "cursor-text before:content-[attr(data-placeholder)] before:absolute before:top-2 before:left-2 before:text-mauve-11 before:opacity-50 before-pointer-events-none",
    }),
  ];

  const editor = useEditor({
    extensions,
    content,
    editorProps: {
      attributes: {
        class:
          "outline-none p-2 prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none fixed top-0 overflow-auto no-scrollbar",
      },
    },
  });
  useEffect(() => {
    editor?.commands.setContent(content);
  }, [content]);
  return editor;
};

const Note = () => {
  return <></>;
};

const StackNote = () => {
  const [count, setCount] = useState(0);
  const [openMenu, setOpenMenu] = useState(false);
  const [isFolded, setIsFolded] = useState(false);
  const [content, setContent] = useState("");
  const editor = useNoteEditor({ content });
  return (
    <>
      {isFolded && (
        <ResizableNote
          className="absolute z-50"
          onClose={() => setIsFolded(false)}
          content={content}
          setContent={setContent}
        />
      )}
      <div
        className="group/note w-fit h-fit drop-shadow-md"
        onMouseEnter={() => {
          setCount((o) => {
            if (o > 20) o = 0;
            return o + 1;
          });
          setOpenMenu(() => false);
        }}
        onMouseLeave={() => {
          setCount((o) => {
            if (o > 20) o = 0;
            return o + 1;
          });
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
            <NoteEditor editor={editor} footer={0} />
          </div>
        </div>
      </div>
    </>
  );
};
interface UseResizableProps {
  x1?: number;
  y1?: number;
  w1?: number;
  h1?: number;
  dragEl: React.RefObject<HTMLDivElement>;
  onChange: () => void;
}
const useResizable = ({
  x1 = 0,
  y1 = 0,
  w1 = 220,
  h1 = 220,
  dragEl,
  onChange,
}: UseResizableProps) => {
  const [springs, api] = useSpring(() => ({
    x: x1,
    y: y1,
    width: w1,
    height: h1,
    onChange: onChange,
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
      pointer: {
        keys: false,
      },
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
  content?: string;
  setContent?: React.Dispatch<React.SetStateAction<string>>;
}
const ResizableNote = forwardRef<HTMLDivElement, ResizableNoteProps>(
  ({ className, onClose, content = "", setContent, ...props }, ref) => {
    const dragEl = useRef<HTMLDivElement | null>(null);
    const editor = useNoteEditor({ content });
    const [count, setCount] = useState(0);
    const onUpdate = (e) => {
      setContent && setContent(() => e.editor.getHTML());
    };
    useEffect(() => {
      editor?.on("update", onUpdate);
      return () => {
        editor?.off("update", onUpdate);
      };
    }, [editor]);
    const onChange = () => {
      console.log("on change");
      setCount((o) => {
        if (o > 50) o = 0;
        return o + 1;
      });
    };
    const { springs, bind } = useResizable({
      x1: 0,
      y1: 0,
      w1: 220,
      h1: 200,
      dragEl,
      onChange: onChange,
    });
    const [open, setIsOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageMimeType = /image\/(png|jpg|jpeg)/i;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasPreviewRef = useRef<HTMLCanvasElement>(null);
    const [imageData, setImageData] = useState<string | undefined>(undefined);
    const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 });
    useEffect(() => {
      if (open) {
        const image = new Image();
        if (imageData !== null) {
          image.onload = () => {
            const context = canvasRef.current?.getContext("2d");
            if (context !== null && context !== undefined) {
              context.canvas.width = image.width;
              context.canvas.height = image.height;
              context.drawImage(image, 0, 0, image.width, image.height);
              setIsOpen(() => true);
            }
          };
          if (imageData !== undefined) {
            image.src = imageData;
          }
        }
      }
    }, [canvasRef, imageData, open]);

    return (
      <animated.div
        style={{ ...springs, touchAction: "none" }}
        {...(!open ? bind() : {})}
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
          <div
            className="fixed z-0 top-8 bottom-8 overflow-auto no-scrollbar"
            style={{
              width: springs.width.get(),
              height: springs.height.get() - 81,
            }}
          >
            <NoteEditor
              editable
              springs={springs}
              editor={editor}
              key={count}
              style={{
                width: springs.width.get(),
                height: springs.height.get() - 81,
              }}
            />
            <ImagePreviewDialog
              open={open}
              setIsOpen={setIsOpen}
              containerRef={canvasRef}
              setCrop={setCrop}
            >
              <div className="p-4">
                <canvas ref={canvasRef} className="w-full h-full" />
              </div>
              <canvas ref={canvasPreviewRef} className="w-0 h-0" />
              <button
                onClick={() => {
                  const image = new Image();
                  image.onload = async () => {
                    const context = canvasPreviewRef?.current?.getContext("2d");
                    if (
                      context !== null &&
                      context !== undefined &&
                      canvasPreviewRef.current !== null &&
                      canvasRef.current !== null
                    ) {
                      await canvasPreview(
                        image,
                        canvasPreviewRef.current,
                        canvasRef.current,
                        crop
                      );
                      // console.log(canvasPreviewRef.current.toDataURL());
                      editor
                        ?.chain()
                        .focus()
                        .setImage({
                          src: URL.createObjectURL(
                            await dataUrlToFile(
                              canvasPreviewRef.current.toDataURL(
                                "image/jpg",
                                50
                              ),
                              "image.jpg"
                            )
                          ),
                        })
                        .run();
                      setIsOpen(() => false);
                    }
                  };
                  if (imageData !== undefined) {
                    image.src = imageData;
                  }
                }}
              >
                Insert
              </button>
            </ImagePreviewDialog>
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files !== null) {
                  const file = e.target.files[0];
                  if (!file.type.match(imageMimeType)) {
                    return;
                  }
                  const fileReader = new FileReader();
                  fileReader.onload = (e) => {
                    const { result } = e.target as FileReader;
                    if (result?.toString() !== undefined) {
                      setImageData(result?.toString());
                      setIsOpen(() => true);
                      if (fileInputRef.current !== null) {
                        fileInputRef.current.value = "";
                      }
                    }
                  };
                  fileReader.readAsDataURL(file);
                }
              }}
            />
          </div>
          <div className="fixed bg-amber-100 bottom-0 z-30 flex justify-between invisible group-focus-within/note:visible transition-all has-[:hover]:visible border-t border-t-stone-200 w-full p-1">
            <div>
              <NoteCommandButton
                className={`${
                  editor?.isActive("bold") ? "bg-zinc-200/60" : ""
                }`}
                disabled={!editor?.can().chain().focus().toggleBold().run()}
                onClick={() => editor?.chain().focus().toggleBold().run()}
              >
                <GrBold className="invisible group-focus-within/note:visible hover:visible" />
              </NoteCommandButton>
              <NoteCommandButton
                className={`${
                  editor?.isActive("italic") ? "bg-zinc-200/60" : ""
                }`}
                disabled={!editor?.can().chain().focus().toggleItalic().run()}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
              >
                <GrItalic className="invisible group-focus-within/note:visible hover:visible" />
              </NoteCommandButton>
              <NoteCommandButton
                className={`${
                  editor?.isActive("underline") ? "bg-zinc-200/60" : ""
                }`}
                disabled={
                  !editor?.can().chain().focus().toggleUnderline().run()
                }
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
              >
                <GrUnderline className="invisible group-focus-within/note:visible hover:visible" />
              </NoteCommandButton>
              <NoteCommandButton
                className={`${
                  editor?.isActive("strike") ? "bg-zinc-200/60" : ""
                }`}
                disabled={!editor?.can().chain().focus().toggleStrike().run()}
                onClick={() => editor?.chain().focus().toggleStrike().run()}
              >
                <GrStrikeThrough className="invisible group-focus-within/note:visible hover:visible" />
              </NoteCommandButton>
              <NoteCommandButton
                className={`${
                  editor?.isActive("bulletList") ? "bg-zinc-200/60" : ""
                }`}
                disabled={
                  !editor?.can().chain().focus().toggleBulletList().run()
                }
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
              >
                <GrUnorderedList className="invisible group-focus-within/note:visible hover:visible" />
              </NoteCommandButton>
              <NoteCommandButton
                onClick={() => {
                  fileInputRef.current?.click();
                }}
              >
                <GrImage className="invisible group-focus-within/note:visible hover:visible" />
              </NoteCommandButton>
            </div>
            <div></div>
          </div>
        </div>
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50"
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
  editor: Editor | null;
  style?: CSSProperties;
  footer?: number;
}
const NoteEditor = ({
  editable = false,
  springs,
  editor,
  style,
  footer = 81,
}: NoteEditorProps) => {
  const { width, height } = springs || {
    width: new SpringValue(220),
    height: new SpringValue(160),
  };
  useEffect(() => {
    let attributes = editor?.options.editorProps.attributes;
    if (attributes !== undefined) {
      attributes = {
        ...attributes,
        style: `width:${width.get()}px;height:${height.get() - footer}px`,
      };
    }
    editor?.setEditable(editable);
    editor?.setOptions({
      editorProps: {
        attributes,
      },
    });
    // editor?.commands.focus();
  }, [width, height, editor, editable, style]);
  return (
    <EditorContent
      editor={editor}
      className="w-full fixed top-8 bottom-8 overflow-auto no-scrollbar"
      style={style}
    />
  );
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
interface NoteCommandButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void;
}
const NoteCommandButton = ({
  onClick,
  children,
  className,
  ...props
}: NoteCommandButton) => {
  return (
    <button
      className={cn(
        className,
        "invisible group-focus-within/note:visible hover:visible hover:bg-zinc-200/60 p-2"
      )}
      {...props}
      onClick={() => onClick()}
    >
      {children}
    </button>
  );
};

interface ImagePreviewDialogProps {
  open?: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  containerRef?: React.RefObject<HTMLCanvasElement>;
  setCrop?: React.Dispatch<
    React.SetStateAction<{
      x: number;
      y: number;
      width: number;
      height: number;
    }>
  >;
}

const ImagePreviewDialog = ({
  open = false,
  setIsOpen,
  children,
  containerRef,
  setCrop,
}: PropsWithChildren<ImagePreviewDialogProps>) => {
  const [isCropping, setIsCropping] = useState(false);
  useEffect(() => {
    setIsCropping(() => open);
    if (open) {
      setTimeout(() => {
        const rects = containerRef?.current?.getBoundingClientRect();
        if (rects !== undefined) {
          api.set({ x: rects.x, y: rects.y, width: 100, height: 100 });
        }
      }, 500);
    }
  }, [open, containerRef]);
  const [{ x, y, width, height }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  }));
  const dragEl = useRef<HTMLDivElement | null>(null);

  const bind = useDrag(
    (state) => {
      const isResizing = state?.event.target === dragEl.current;
      if (isResizing) {
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
      const rects = containerRef?.current?.getBoundingClientRect();
      if (rects !== undefined) {
        // api.set({ x: rects.x, y: rects.y, width: 100, height: 100 });
        setCrop &&
          setCrop(() => ({
            x: x.get() - rects.x,
            y: y.get() - rects.y,
            width: width.get(),
            height: height.get(),
          }));
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
        const rects = containerRef?.current?.getBoundingClientRect();
        let containerWidth = 0;
        let containerHeight = 0;
        let top = 0;
        let left = 0;
        if (rects !== undefined) {
          containerWidth = rects.width;
          containerHeight = rects.height;
          left = rects.x;
          top = rects.y;
        }
        if (isResizing) {
          return {
            top: 50,
            left: 50,
            right: left + containerWidth - x.get(),
            bottom: top + containerHeight - y.get(),
          };
        } else {
          return {
            top: top,
            left: left,
            right: left + containerWidth - width.get(),
            bottom: top + containerHeight - height.get(),
          };
        }
      },
    }
  );

  return (
    <Dialog
      open={open}
      onClose={() => {
        setIsOpen && setIsOpen(() => false);
      }}
      className="relative z-50"
    >
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen container to center the panel */}
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        {/* The actual dialog panel  */}
        <Dialog.Panel className="mx-auto rounded bg-white max-w-screen-sm ">
          {Boolean(isCropping) && (
            <animated.div
              className="cropped-area"
              style={{ x, y, width, height }}
              {...bind()}
            >
              <div className="resizer" ref={dragEl}></div>
            </animated.div>
          )}
          {children}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

const meta: Meta<typeof Note> = {
  component: Note,
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Draft1: Story = {
  render: () => {
    return <StackNote />;
  },
};

export const Draft2: Story = {
  render: () => {
    return <ResizableNote />;
  },
};

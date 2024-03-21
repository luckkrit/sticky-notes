import ListItem from "@tiptap/extension-list-item";
import TextStyle, { TextStyleOptions } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { canvasPreview, cn, dataUrlToFile, useDebounce } from "@/lib/util";
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
import { EditorContent, useEditor } from "@tiptap/react";
import { VariantProps, cva } from "class-variance-authority";
import React, {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  PropsWithChildren,
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
import { IoCheckmark, IoOpenOutline } from "react-icons/io5";
import { MdCloseFullscreen } from "react-icons/md";
import { PiDotsThree } from "react-icons/pi";
import { SpringValue, animated, useSpring, useTrail } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { Dialog } from "@headlessui/react";
import { Image as TipTapImage } from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { LiaSearchSolid } from "react-icons/lia";
import { stripHtml } from "string-strip-html";
import {
  addNotes,
  deleteNotes,
  NoteModel,
  NoteType,
  updateNotes,
} from "@/lib/db";
import { NoteActionType } from "@/hooks";
import { useNotes, useNotesDispatch } from "@/context";
import { NotesProvider } from "@/provider";
// UI

export const Note = () => {
  return (
    <NotesProvider>
      <div className="flex p-4">
        <ListNote />
        <ListResizableNotes />
      </div>
    </NotesProvider>
  );
};
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
      showOnlyWhenEditable: false,
    }),
  ];

  const editor = useEditor({
    extensions,
    content,
    editorProps: {
      attributes: {
        // class:
        //   "outline-none p-2 prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none fixed top-0 overflow-auto no-scrollbar",
        class:
          "outline-none p-2 prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none overflow-auto no-scrollbar ",
      },
    },
  });
  useEffect(() => {
    editor?.commands.setContent(content);
  }, [content]);
  return editor;
};

interface ListNoteProps {
  // notes: NoteModel[];
}
export const ListNote = () => {
  const [search, setSearch] = useState("");
  const dispatch = useNotesDispatch();
  const notes = useNotes();

  const searchRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let container = containerRef.current;
    let navbar = searchRef.current;
    let header = headerRef.current;
    let oldTop = "";
    if (navbar !== null) {
      oldTop = navbar.style.top;
    }
    let sticky = 0;
    const onScroll = () => {
      if (navbar !== null && header !== null) {
        sticky = header.offsetTop + header.getBoundingClientRect().height;
        if (container !== null) {
          if (container.scrollTop >= sticky) {
            navbar.style.top = container.offsetTop + "px";
            navbar.style.zIndex = "1";
            navbar.style.width = header.getBoundingClientRect().width + "px";
            navbar.classList.remove("relative");
            navbar.classList.remove("w-full");
            navbar.classList.add("absolute");
          } else {
            navbar.classList.remove("absolute");
            navbar.classList.add("relative");
            navbar.classList.add("w-full");
            navbar.style.top = oldTop;
            navbar.style.width = "";
            navbar.style.zIndex = "";
          }
        }
      }
    };
    container?.addEventListener("scroll", onScroll);
    return () => container?.removeEventListener("scroll", onScroll);
  }, [searchRef, containerRef, headerRef]);
  useEffect(() => {
    if (search.length > 0) {
      let filterN = filterNote(search);
      filterN = filterN.length === 0 ? [] : filterN;
      setDisplayNotes(() => filterN);
    } else {
      if (inputRef.current !== null && inputRef.current !== undefined) {
        inputRef.current.value = "";
      }
      setDisplayNotes(() => [...notes]);
    }
  }, [notes]);
  useEffect(() => {
    if (search.length > 0) {
      let filterN = filterNote(search);
      filterN = filterN.length === 0 ? [] : filterN;
      setDisplayNotes(() => filterN);
    } else {
      if (inputRef.current !== null && inputRef.current !== undefined) {
        inputRef.current.value = "";
      }
      setDisplayNotes(() => [...notes]);
    }
  }, [search]);
  const debounce = useDebounce(({ value }) => {
    setSearch(() => value);
  }, 500);
  const [displayNotes, setDisplayNotes] = useState<NoteModel[]>(notes);
  const filterNote = (search: string) => {
    return [...notes].filter((e) => {
      return stripHtml(e.content).result === search;
    });
  };
  const trailSprings = useTrail(displayNotes.length, {
    from: { transform: "translateX(-100px)" },
    to: { transform: "translateX(0px)" },
  });
  return (
    <div
      className="flex flex-col p-4 border border-gray-500 w-80 h-[600px] overflow-auto"
      ref={containerRef}
    >
      <div className="flex justify-between">
        <button
          onClick={async () => {
            const newNote: NoteModel = {
              // id: newNoteIndex(),
              content: "",
              color: randomColors(),
              createdDate: new Date().toDateString(),
              open: false,
              x: 0,
              y: 0,
              width: 220,
              height: 200,
            };
            addNotes(newNote);
            if (dispatch !== null) {
              dispatch({ type: NoteActionType.ADD, payload: newNote });
            }
          }}
        >
          <GrAdd />
        </button>
        {/* <button>
          <GrClose />
        </button> */}
        <div></div>
      </div>
      <div className="font-bold text-xl my-2" ref={headerRef}>
        Sticky Notes
      </div>
      <div className="relative mb-2 w-full bg-white" ref={searchRef}>
        <input
          type="text"
          className="bg-gray-200 w-full outline-none ps-2 py-1 pe-8"
          onKeyUp={(e) => {
            debounce({ value: e.currentTarget.value });
          }}
          defaultValue={search}
          ref={inputRef}
        />
        {search.length > 0 ? (
          <button
            className="absolute right-8 top-2"
            onClick={() => {
              debounce({ value: "" });
            }}
          >
            <GrClose />
          </button>
        ) : null}
        <LiaSearchSolid className="absolute right-2 top-2" />
      </div>
      <div className="grow">
        <div className=" flex flex-col gap-6 h-96 mb-4 ">
          {trailSprings.length > 0 ? (
            trailSprings.map((spring, index) => (
              <animated.div
                key={index}
                style={{
                  ...spring,
                }}
              >
                <StackNote
                  variant={
                    displayNotes[displayNotes.length - (index + 1)].color
                  }
                  className="w-full h-[150px]"
                  note={displayNotes[displayNotes.length - (index + 1)]}
                />
              </animated.div>
            ))
          ) : (
            <div className="font-bold text-xl">No notes found!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ListResizableNotes = () => {
  const notes = useNotes();
  const dispatch = useNotesDispatch();
  return notes.map(
    (note) =>
      note.open && (
        <ResizableNote
          key={note.id}
          note={note}
          variant={note.color}
          onAddNote={async () => {
            if (dispatch !== null) {
              const newNote: NoteModel = {
                // id: newNoteIndex(),
                content: "",
                color: randomColors(),
                createdDate: new Date().toDateString(),
                open: false,
                x: 0,
                y: 0,
                width: 220,
                height: 200,
              };
              await addNotes(newNote);
              dispatch({ type: NoteActionType.ADD, payload: newNote });
            }
          }}
          className="z-50"
        />
      )
  );
};

const stackNoteVariants = cva("", {
  variants: {
    background: {
      amber: "bg-amber-100",
      green: "bg-green-100",
      pink: "bg-pink-100",
      violet: "bg-violet-100",
      cyan: "bg-cyan-100",
      zinc: "bg-zinc-100",
      neutral: "bg-neutral-400",
    },
    borderBackground: {
      amber: "border-amber-200",
      green: "border-green-300",
      pink: "border-pink-300",
      violet: "border-violet-300",
      cyan: "border-cyan-300",
      zinc: "border-zinc-300",
      neutral: "border-neutral-500",
    },
  },
});
interface StackNoteProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackNoteVariants> {
  variant?: "amber" | "green" | "pink" | "violet" | "cyan" | "zinc" | "neutral";
  // content?: string;
  note: NoteModel;
}
export const StackNote = ({ note, className, variant }: StackNoteProps) => {
  useEffect(() => {
    setIsFolded(() => note.open);
    editor?.commands.setContent(note.content);
  }, [note]);
  const [count, setCount] = useState(0);
  const [openMenu, setOpenMenu] = useState(false);
  const [isFolded, setIsFolded] = useState(note.open);
  const editor = useNoteEditor({ content: note.content });
  const dispatch = useNotesDispatch();
  return (
    <div
      className={cn("group/note w-fit h-fit ", className)}
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
          "flex flex-col h-[150px] group-hover/note:bg-amber-950/10 ",
          stackNoteVariants({
            background: variant,
            borderBackground: variant,
          })
        )}
      >
        <div
          className={cn(
            "flex justify-between border-t-1 group-hover/note:border-amber-950/5",
            stackNoteVariants({ borderBackground: variant })
          )}
        >
          <div></div>
          <div className="pr-2 pt-2 flex items-center">
            <StackNoteMenu
              open={openMenu}
              key={count}
              onOpen={async () => {
                setIsFolded(() => true);
                await updateNotes({ ...note, open: true });
                if (dispatch !== null) {
                  dispatch({
                    type: NoteActionType.OPEN,
                    payload: { ...note, open: true },
                  });
                }
              }}
              onClose={async () => {
                setIsFolded(() => false);
                await updateNotes({ ...note, open: false });
                if (dispatch !== null) {
                  dispatch({
                    type: NoteActionType.OPEN,
                    payload: { ...note, open: false },
                  });
                }
              }}
              onDelete={async () => {
                await deleteNotes(note);
                if (dispatch !== null) {
                  dispatch({ type: NoteActionType.DELETE, payload: note });
                }
              }}
              hasOpened={isFolded}
            />
            <span className="group-hover/note:hidden text-slate-600 text-xs">
              {note.createdDate}
            </span>
          </div>
        </div>
        <div className={cn(`top-8 bottom-8 left-1 right-1`)}>
          <NoteEditor editor={editor} footer={20} />
        </div>
      </div>
      <div
        className={cn(
          `w-full h-4 group-hover/note:bg-amber-950/10 mt-0 pt-0`,
          isFolded === true ? "folded after:folded-after" : "",
          stackNoteVariants({ background: variant })
        )}
      ></div>
    </div>
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
  variants: {
    background: {
      amber: "bg-amber-100",
      green: "bg-green-100",
      pink: "bg-pink-100",
      violet: "bg-violet-100",
      cyan: "bg-cyan-100",
      zinc: "bg-zinc-100",
      neutral: "bg-neutral-400",
    },
    borderBackground: {
      amber: "border-amber-200",
      green: "border-green-200",
      pink: "border-pink-200",
      violet: "border-violet-200",
      cyan: "border-cyan-200",
      zinc: "border-zinc-200",
      neutral: "border-neutral-200",
    },
    headerBackground: {
      amber: "bg-amber-200",
      green: "bg-green-200",
      pink: "bg-pink-200",
      violet: "bg-violet-200",
      cyan: "bg-cyan-200",
      zinc: "bg-zinc-200",
      neutral: "bg-neutral-200",
    },
  },
});
interface ResizableNoteProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof resizableNoteVariants> {
  ref?: React.Ref<HTMLDivElement>;
  variant?: NoteType;
  note: NoteModel;
  onAddNote?: () => void;
}
export const ResizableNote = forwardRef<HTMLDivElement, ResizableNoteProps>(
  ({ onAddNote, variant, className, note, ...props }, ref) => {
    const dragEl = useRef<HTMLDivElement | null>(null);
    const editor = useNoteEditor({ content: note.content });
    const [count, setCount] = useState(0);
    const dispatch = useNotesDispatch();
    const debounce = useDebounce(async (e: any) => {
      if (dispatch !== null) {
        if (note.content !== e.editor.getHTML()) {
          note.content = e.editor.getHTML();
          await updateNotes(note);
          dispatch({ type: NoteActionType.UPDATE, payload: note });
        }
      }
    }, 500);
    const debounce2 = useDebounce(async () => {
      if (dispatch !== null) {
        if (
          note.x !== springs.x.get() ||
          note.y !== springs.y.get() ||
          note.width !== springs.width.get() ||
          note.height !== springs.height.get()
        ) {
          //   console.log(
          //     "update ",
          //     note.x,
          //     note.y,
          //     note.width,
          //     note.height,
          //     springs.x.get(),
          //     springs.y.get(),
          //     springs.width.get(),
          //     springs.height.get()
          //   );
          note.x = springs.x.get();
          note.y = springs.y.get();
          note.width = springs.width.get();
          note.height = springs.height.get();
          await updateNotes(note);
          dispatch({ type: NoteActionType.UPDATE, payload: note });
        }
      }
    }, 500);
    const onUpdate = (e: any) => {
      debounce(e);
    };
    useEffect(() => {
      editor?.on("update", onUpdate);
      return () => {
        editor?.off("update", onUpdate);
      };
    }, [editor]);
    const onChange = () => {
      setCount((o) => {
        if (o > 50) o = 0;
        return o + 1;
      });
      debounce2();
    };
    const { springs, bind } = useResizable({
      x1: note.x,
      y1: note.y,
      w1: note.width,
      h1: note.height,
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
    const [showMenu, setShowMenu] = useState(false);
    // const [mouseLeave, setMouseLeave] = useState(false);
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
        className={cn(
          "absolute group/note w-fit h-fit drop-shadow-md ",
          className
        )}
      >
        <div
          // className="flex flex-col bg-amber-100 border-amber-200 min-w-[220px] min-h-[200px] w-full h-full"
          className={cn(
            resizableNoteVariants({
              className,
              background: variant,
              borderBackground: variant,
            }),
            "flex flex-col min-w-[220px] min-h-[200px] w-full h-full"
          )}
          {...props}
          ref={ref}
        >
          <div
            className={cn(
              "flex justify-between h-0 group-focus-within/note:h-8 transition-all has-[:hover]:h-8 w-full",
              resizableNoteVariants({ headerBackground: variant, className })
            )}
          >
            <div>
              <button
                className="invisible group-focus-within/note:visible hover:visible hover:bg-zinc-200/60 p-2"
                onClick={() => {
                  onAddNote && onAddNote();
                }}
              >
                <GrAdd className="invisible group-focus-within/note:visible hover:visible" />
              </button>
            </div>
            <div className="flex">
              <button
                className="invisible group-focus-within/note:visible hover:visible hover:bg-zinc-200/60 p-2"
                onClick={() => {
                  setShowMenu(() => true);
                }}
              >
                <PiDotsThree className="invisible group-focus-within/note:visible hover:visible" />
              </button>
              <button
                className="invisible group-focus-within/note:visible hover:visible hover:bg-zinc-200/60 p-2"
                onClick={async () => {
                  await updateNotes({ ...note, open: false });
                  if (dispatch !== null) {
                    dispatch({
                      type: NoteActionType.OPEN,
                      payload: { ...note, open: false },
                    });
                  }
                }}
              >
                <GrClose className="invisible group-focus-within/note:visible hover:visible" />
              </button>
            </div>
          </div>
          <NoteResizableMenu
            showMenu={showMenu}
            setShowMenu={setShowMenu}
            note={note}
            onDeleteNote={async () => {
              await deleteNotes(note);
              if (dispatch !== null) {
                dispatch({ type: NoteActionType.DELETE, payload: note });
              }
            }}
          />
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
                className="float-right mr-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-none "
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

              <button
                onClick={() => {
                  setIsOpen(() => false);
                }}
                className="float-right mr-4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5"
              >
                Cancel
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
          <div
            className={cn(
              "fixed bottom-0 z-30 flex justify-between invisible group-focus-within/note:visible transition-all has-[:hover]:visible border-t border-t-stone-200 w-full p-1",
              resizableNoteVariants({ className, background: variant })
            )}
          >
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
  className,
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
  }, [width, height, editor, editable, style]);
  return (
    <EditorContent
      editor={editor}
      // className={cn(
      //   "w-full fixed top-8 bottom-8 overflow-auto no-scrollbar",
      //   className
      // )}
      className={cn(" overflow-auto no-scrollbar", className)}
      style={style}
    />
  );
};
interface StackNoteMenuProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  open?: boolean;
  hasOpened?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onDelete?: () => void;
}
const StackNoteMenu = ({
  open = false,
  hasOpened = false,
  onOpen,
  onClose,
  onDelete,
}: StackNoteMenuProps) => {
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
            className="bg-slate-100 shadow-md"
            ref={refs.setFloating}
            style={{ ...floatingStyles, zIndex: 50, position: "fixed" }}
            {...getFloatingProps()}
          >
            <StackNoteMenuItem
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
            </StackNoteMenuItem>
            <StackNoteMenuItem
              onMenuItemClick={() => {
                setIsOpen(false);
                onDelete && onDelete();
              }}
            >
              <BsTrash />
              <div>Delete Note</div>
            </StackNoteMenuItem>
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
};

interface NoteMenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onMenuItemClick?: () => void;
}
const StackNoteMenuItem = ({
  onMenuItemClick,
  children,
}: NoteMenuItemProps) => {
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

interface NoteResizableMenuProps {
  showMenu: boolean;
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
  note: NoteModel;
  onDeleteNote: () => void;
}
const NoteResizableMenu = ({
  note,
  showMenu,
  setShowMenu,
  onDeleteNote,
}: NoteResizableMenuProps) => {
  const dispatch = useNotesDispatch();
  const [mouseLeave, setMouseLeave] = useState(false);
  useEffect(() => {
    const clickOutSide = () => {
      if (mouseLeave && showMenu) {
        setShowMenu(() => false);
        setMouseLeave(() => false);
      }
    };
    document.addEventListener("click", clickOutSide);
    return () => {
      document.removeEventListener("click", clickOutSide);
    };
  }, [showMenu, mouseLeave]);
  useEffect(() => {}, [mouseLeave]);
  return (
    <div
      onMouseLeave={() => {
        setMouseLeave(() => true);
      }}
      className={`fixed z-20 w-full drop-shadow ${showMenu ? "visible" : "hidden"}`}
    >
      <div className="grid grid-cols-7">
        <ColorPaletteButton
          background={"amber"}
          isCheck={"amber" === note.color}
          onUpdateColor={(color) => {
            if (dispatch !== null) {
              dispatch({
                type: NoteActionType.UPDATE,
                payload: { ...note, color },
              });
            }
          }}
        />
        <ColorPaletteButton
          background={"green"}
          isCheck={"green" === note.color}
          onUpdateColor={(color) => {
            if (dispatch !== null) {
              dispatch({
                type: NoteActionType.UPDATE,
                payload: { ...note, color },
              });
            }
          }}
        />
        <ColorPaletteButton
          background={"pink"}
          isCheck={"pink" === note.color}
          onUpdateColor={(color) => {
            if (dispatch !== null) {
              dispatch({
                type: NoteActionType.UPDATE,
                payload: { ...note, color },
              });
            }
          }}
        />
        <ColorPaletteButton
          background={"violet"}
          isCheck={"violet" === note.color}
          onUpdateColor={(color) => {
            if (dispatch !== null) {
              dispatch({
                type: NoteActionType.UPDATE,
                payload: { ...note, color },
              });
            }
          }}
        />
        <ColorPaletteButton
          background={"cyan"}
          isCheck={"cyan" === note.color}
          onUpdateColor={(color) => {
            if (dispatch !== null) {
              dispatch({
                type: NoteActionType.UPDATE,
                payload: { ...note, color },
              });
            }
          }}
        />
        <ColorPaletteButton
          background={"zinc"}
          isCheck={"zinc" === note.color}
          onUpdateColor={(color) => {
            if (dispatch !== null) {
              dispatch({
                type: NoteActionType.UPDATE,
                payload: { ...note, color },
              });
            }
          }}
        />
        <ColorPaletteButton
          background={"neutral"}
          isCheck={"neutral" === note.color}
          onUpdateColor={(color) => {
            if (dispatch !== null) {
              dispatch({
                type: NoteActionType.UPDATE,
                payload: { ...note, color },
              });
            }
          }}
        />
      </div>
      <button
        className="w-full bg-slate-100 text-red-500 p-2 hover:bg-zinc-200"
        onClick={() => {
          onDeleteNote();
        }}
      >
        <div className="flex gap-2 justify-start items-center">
          <BsTrash />
          <div className="ml-2">Delete note</div>
        </div>
      </button>
    </div>
  );
};

const colorPaletteButtonVariants = cva(
  "min-w-2 h-12 grid place-content-center",
  {
    variants: {
      background: {
        amber: "bg-amber-200",
        green: "bg-green-300",
        pink: "bg-pink-300",
        violet: "bg-violet-300",
        cyan: "bg-cyan-300",
        zinc: "bg-zinc-300",
        neutral: "bg-neutral-500",
      },
    },
    defaultVariants: {
      background: "amber",
    },
  }
);

interface ColorPaletteButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof colorPaletteButtonVariants> {
  isCheck: boolean;
  onUpdateColor: (color: NoteType) => void;
}

const ColorPaletteButton = ({
  onUpdateColor,
  isCheck,
  className,
  background,
  ...props
}: ColorPaletteButtonProps) => {
  return (
    <button
      onClick={() => {
        if (
          background === "amber" ||
          background === "cyan" ||
          background === "green" ||
          background === "neutral" ||
          background === "pink" ||
          background === "violet" ||
          background === "zinc"
        ) {
          onUpdateColor(background);
        }
      }}
      className={cn(colorPaletteButtonVariants({ className, background }))}
      {...props}
    >
      {isCheck && <IoCheckmark />}
    </button>
  );
};

const randomColors = (): NoteType => {
  const colors = [
    "amber",
    "green",
    "pink",
    "violet",
    "cyan",
    "zinc",
    "neutral",
  ];
  const index = Math.floor(Math.random() * colors.length);
  if (colors[index] === "amber") return "amber";
  else if (colors[index] === "green") return "green";
  else if (colors[index] === "pink") return "pink";
  else if (colors[index] === "violet") return "violet";
  else if (colors[index] === "cyan") return "cyan";
  else if (colors[index] === "zinc") return "zinc";
  else return "neutral";
};

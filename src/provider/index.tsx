import { initialNotes, NotesContext, NotesDispatchContext } from "@/context";
import { notesReducer } from "@/hooks";
import { getNotes, NoteModel } from "@/lib/db";
import { PropsWithChildren, useEffect, useReducer, useState } from "react";

export const NotesProvider = ({ children }: PropsWithChildren) => {
  const [readNotes, setReadNotes] = useState<NoteModel[]>([]);
  useEffect(() => {
    const initNotes = async () => {
      const n2 = await getNotes();
      setReadNotes(() => n2);
    };
    initNotes();
  }, []);
  const [notes, dispatch] = useReducer(
    notesReducer,
    initialNotes.length === 0 ? readNotes : initialNotes
  );
  return (
    <NotesContext.Provider value={notes}>
      <NotesDispatchContext.Provider value={dispatch}>
        {children}
      </NotesDispatchContext.Provider>
    </NotesContext.Provider>
  );
};

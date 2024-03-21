import { initialNotes, NotesContext, NotesDispatchContext } from "@/context";
import { notesReducer } from "@/hooks";
import { PropsWithChildren, useReducer } from "react";

export const NotesProvider = ({ children }: PropsWithChildren) => {
  const [notes, dispatch] = useReducer(notesReducer, initialNotes);
  return (
    <NotesContext.Provider value={notes}>
      <NotesDispatchContext.Provider value={dispatch}>
        {children}
      </NotesDispatchContext.Provider>
    </NotesContext.Provider>
  );
};

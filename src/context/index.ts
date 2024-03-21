import { NoteAction, notesReducer } from "@/hooks";
import { getNotes, NoteModel } from "@/lib/db";
import React, { createContext, PropsWithChildren, useContext, useReducer } from "react";

export const initialNotes: NoteModel[] = await getNotes();

export const NotesContext = createContext<NoteModel[]>([]);
export const NotesDispatchContext = createContext<React.Dispatch<NoteAction> | null>(
    null
);

export const useNotes = () => useContext(NotesContext);
export const useNotesDispatch = () => useContext(NotesDispatchContext);


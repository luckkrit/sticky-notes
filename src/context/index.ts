import { NoteAction } from "@/hooks";
import { NoteModel } from "@/lib/db";
import React, { createContext, useContext } from "react";

export const initialNotes: NoteModel[] = [];

export const NotesContext = createContext<NoteModel[]>([]);
export const NotesDispatchContext = createContext<React.Dispatch<NoteAction> | null>(
    null
);

export const useNotes = () => useContext(NotesContext);
export const useNotesDispatch = () => useContext(NotesDispatchContext);


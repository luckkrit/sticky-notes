import { NoteModel } from "@/lib/db";

// Context
export enum NoteActionType {
    SELECT = "SELECT",
    ADD = "ADD",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    OPEN = "OPEN",
}


export interface NoteAction {
    type: NoteActionType;
    payload: NoteModel;
    payload2?: NoteModel[];
}
export const notesReducer = (notes: NoteModel[], action: NoteAction) => {
    switch (action.type) {
        case NoteActionType.SELECT:
            if (action.payload2 === undefined) return []
            return action.payload2
        case NoteActionType.ADD:
            return [...notes, action.payload];
        case NoteActionType.UPDATE:
            return notes.map((note) => {
                if (note.id === action.payload.id) {
                    return action.payload;
                } else {
                    return note;
                }
            });
        case NoteActionType.DELETE:
            return notes.filter((t) => t.id !== action.payload.id);
        case NoteActionType.OPEN:
            return notes.map((note) => {
                if (note.id === action.payload.id) {
                    return action.payload;
                } else {
                    return note;
                }
            });
        default:
            throw Error("Unknown action: " + action.type);
    }
};
import { NoteModel } from "@/lib/db";

// Context
export enum NoteActionType {
    ADD = "ADD",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    OPEN = "OPEN",
}


export interface NoteAction {
    type: NoteActionType;
    payload: NoteModel;
}
export const notesReducer = (notes: NoteModel[], action: NoteAction) => {
    switch (action.type) {
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
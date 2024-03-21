import Dexie, { Table } from "dexie";

export type NoteType =
    | "amber"
    | "green"
    | "pink"
    | "violet"
    | "cyan"
    | "zinc"
    | "neutral";
export interface NoteModel {
    id?: number;
    content: string;
    createdDate: string;
    color: NoteType;
    open: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
}
// Dexie
class StickyAppDb extends Dexie {
    notes!: Table<NoteModel>;

    constructor() {
        super("StickyApp");
        this.version(2).stores({
            notes: "++id, content, createdDate, color, open, w, y, width, height", // Primary key and indexed props
        });
    }
}
// init Database
const db = new StickyAppDb();
export const addNotes = async (note: NoteModel) => {
    try {
        const id = await db.notes.add(note);
        console.log("new id = ", id);
    } catch (err) {
        console.log("add error = ", err);
    }
};

export const deleteNotes = async (note: NoteModel) => {
    try {
        if (note.id !== undefined) {
            await db.notes.delete(note.id);
        }
    } catch (err) {
        console.log("delete error = ", err);
    }
};

export const getNotes = async () => {
    return db.notes.toArray();
};

export const updateNotes = async (note: NoteModel) => {
    try {
        if (note.id !== undefined) {
            await db.notes.update(note.id, note);
        }
    } catch (err) {
        console.log("update error = ", err);
    }
};
import {writable} from 'svelte/store';
import type {Note} from "../types";

function createNotesStore() {
    const {subscribe, set, update} = writable<Note[]>([]);

    return {
        subscribe,
        set,

        addNote: (note: Note) => {
            update(notes => [...notes, note])
        },

        updateNote: (updatedNote: Note) => {
            update(notes => notes.map(note => note.id === updatedNote.id ? updatedNote : note))
        },

        deleteNote: (id: number) => {
            update(notes => notes.filter(note => note.id !== id))
        },
    };
}

export const notes = createNotesStore();
import type {SyncMessage, SyncResult} from "../types";

declare const self: Worker;

const API_BASE = '/api';

interface Note {
    id: number;
    title: string;
    content: string;
}

async function updateNote(note: Note): Promise<number> {
    const response = await fetch(`${API_BASE}/notes/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(note)
    });

    if (!response.ok) {
        throw new Error('Failed to update note');
    }

    return response.json();
}

async function findNoteById(id: number): Promise<Note> {
    const response = await fetch(`${API_BASE}/notes/${id}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch note with id ${id}`);
    }

    return response.json();
}

self.onmessage = async (e: MessageEvent<SyncMessage>) => {
    console.log(e);

    if (e.data.type === 'sync') {
        try {
            const noteId = await updateNote(e.data.note);
            const updatedNote = await findNoteById(noteId);

            self.postMessage({
                type: 'syncComplete',
                noteId: e.data.note.id,
                note: updatedNote
            } as SyncResult);
        } catch (error) {
            self.postMessage({
                type: 'syncError',
                noteId: e.data.note.id,
                error: error instanceof Error ? error.message : 'Unknown error'
            } as SyncResult);
        }
    }
};

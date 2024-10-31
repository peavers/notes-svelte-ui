import type {Note, SearchResult} from "../types";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function findAllNotes(): Promise<Note[]> {
    const response = await fetch(`${API_BASE}/notes`);

    if (!response.ok) {
        throw new Error('Failed to fetch notes');
    }

    return response.json();
}

export async function findNoteById(id: number): Promise<Note> {
    const response = await fetch(`${API_BASE}/notes/${id}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch note with id ${id}`);
    }

    return response.json();
}

export async function searchNotes(query: string): Promise<SearchResult> {
    const response = await fetch(
        `${API_BASE}/search?query=${encodeURIComponent(query)}`,
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }
    );

    if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
    }

    return response.json();
}

export async function createNote(note: Omit<Note, 'id'>): Promise<number> {
    const response = await fetch(`${API_BASE}/notes/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(note)
    });

    if (!response.ok) {
        throw new Error('Failed to create note');
    }

    return response.json();
}

export async function updateNote(note: Note): Promise<number> {
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

export async function deleteNote(note: Note): Promise<boolean> {
    const response = await fetch(`${API_BASE}/notes/delete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(note)
    });

    if (!response.ok) {
        throw new Error('Failed to delete note');
    }

    return response.json();
}
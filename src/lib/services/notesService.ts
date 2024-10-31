// src/lib/services/notesService.ts
import type {Note} from '../types';
import {notes} from '../stores/notesStore';
import {createNote, deleteNote, findAllNotes, updateNote} from '../api/notes';

class NotesService {
    async loadNotes(): Promise<Note[]> {
        try {
            const fetchedNotes = await findAllNotes();
            notes.set(fetchedNotes);
            return fetchedNotes;
        } catch (error) {
            throw new Error('Failed to load notes');
        }
    }

    async createNote(): Promise<Note> {
        try {
            const newNote = {
                title: '',
                content: ''
            };

            const id = await createNote(newNote);
            const createdNote = {...newNote, id};
            notes.addNote(createdNote);
            return createdNote;
        } catch (error) {
            throw new Error('Failed to create note');
        }
    }

    async updateNote(noteId: number, updates: Omit<Note, 'id'>): Promise<Note> {
        try {
            const updatedNote = {...updates, id: noteId};
            await updateNote(updatedNote);
            notes.updateNote(updatedNote);
            return updatedNote;
        } catch (error) {
            throw new Error('Failed to update note');
        }
    }

    async deleteNote(note: Note): Promise<void> {
        try {
            await deleteNote(note);
            notes.deleteNote(note.id);
        } catch (error) {
            throw new Error('Failed to delete note');
        }
    }
}

export const notesService = new NotesService();
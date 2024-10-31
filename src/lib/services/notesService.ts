import type {Note} from '../types';
import {notes} from '../stores/notesStore';
import {createNote, deleteNote, findAllNoteTitles, findNoteById, updateNote} from '../api/notes';

class NotesService {
    async loadNoteTitles(): Promise<void> {
        try {
            const titlesList = await findAllNoteTitles();
            notes.set(titlesList);
        } catch (error) {
            throw new Error('Failed to load notes');
        }
    }

    async getNoteById(id: number): Promise<Note> {
        try {
            const fullNote = await findNoteById(id);
            // Update the note in the store with full content
            notes.updateNote(fullNote);
            return fullNote;
        } catch (error) {
            throw new Error(`Failed to fetch note ${id}`);
        }
    }

    async createNote(): Promise<Note> {
        try {
            const newNote = {title: '', content: ''};
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
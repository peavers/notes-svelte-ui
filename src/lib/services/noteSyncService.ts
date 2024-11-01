// noteSyncService.ts
import {get} from 'svelte/store';
import type {Note, SyncMessage, SyncResult} from '../types';
import {bufferStore} from '../stores/bufferStore';
import {syncStore} from '../stores/synStatusStore';

export class NoteSyncService {
    private worker: Worker;
    private syncTimeout: ReturnType<typeof setTimeout> | null = null;
    private currentNoteId: number | null = null;
    private onNoteUpdated: ((note: Note) => void) | null = null;
    private syncInProgress = false;

    constructor() {
        this.worker = new Worker(
            new URL('./worker.ts', import.meta.url),
            {type: 'module'}
        );

        this.worker.onmessage = (e: MessageEvent<SyncResult>) => {
            if (e.data.type === 'syncComplete' && e.data.note) {
                bufferStore.markAsSynced();
                this.onNoteUpdated?.(e.data.note);
                syncStore.setSynced();
                this.syncInProgress = false;

                const buffer = get(bufferStore);
                if (buffer.isDirty) {
                    this.debouncedSync();
                }
            } else if (e.data.type === 'syncError') {
                syncStore.setError();
                console.error('Sync failed:', e.data.error);
                this.syncInProgress = false;
            }
        };
    }

    initialize(note: Note, onNoteUpdated: (note: Note) => void) {
        this.currentNoteId = note.id;
        this.onNoteUpdated = onNoteUpdated;
        bufferStore.reset(note.id, note.content, note.title);
        syncStore.setSynced();
    }

    handleContentChange(content: string, noteId: number) {
        const buffer = get(bufferStore);
        if (buffer.noteId === noteId) {
            bufferStore.updateContent(content);
            if (buffer.isDirty) {
                syncStore.setPending();
                this.debouncedSync();
            } else {
                syncStore.setSynced();
            }
        }
    }

    handleTitleChange(title: string, noteId: number) {
        const buffer = get(bufferStore);
        if (buffer.noteId === noteId) {
            bufferStore.updateTitle(title);
            if (buffer.isDirty) {
                syncStore.setPending();
                this.debouncedSync();
            } else {
                syncStore.setSynced();
            }
        }
    }

    private debouncedSync() {
        if (this.syncTimeout) {
            clearTimeout(this.syncTimeout);
        }
        this.syncTimeout = setTimeout(() => this.sync(), 1000);
    }

    private sync() {
        if (this.syncInProgress) return;

        const currentBuffer = get(bufferStore);
        if (!currentBuffer.isDirty || currentBuffer.noteId !== this.currentNoteId) {
            syncStore.setSynced();
            return;
        }

        this.syncInProgress = true;
        syncStore.setSyncing();

        this.worker.postMessage({
            type: 'sync',
            note: {
                id: currentBuffer.noteId,
                title: currentBuffer.title,
                content: currentBuffer.content
            }
        } as SyncMessage);
    }

    async switchNote(newNote: Note) {
        // Cancel any pending sync
        if (this.syncTimeout) {
            clearTimeout(this.syncTimeout);
        }

        // If there's a sync in progress, wait for it to complete
        if (this.syncInProgress) {
            await new Promise<void>(resolve => {
                const checkSync = () => {
                    if (!this.syncInProgress) {
                        resolve();
                    } else {
                        setTimeout(checkSync, 100);
                    }
                };
                checkSync();
            });
        }

        // Perform final sync if needed
        const currentBuffer = get(bufferStore);
        if (currentBuffer.isDirty && currentBuffer.noteId === this.currentNoteId) {
            await new Promise<void>(resolve => {
                this.sync();
                const checkComplete = () => {
                    if (!this.syncInProgress) {
                        resolve();
                    } else {
                        setTimeout(checkComplete, 100);
                    }
                };
                checkComplete();
            });
        }

        // Switch to new note
        this.currentNoteId = newNote.id;
        bufferStore.reset(newNote.id, newNote.content, newNote.title);
        // Explicitly set synced state after reset
        syncStore.setSynced();
    }

    cleanup() {
        if (this.syncTimeout) {
            clearTimeout(this.syncTimeout);
        }
        this.worker.terminate();
    }
}

export const noteSyncService = new NoteSyncService();
import {writable} from "svelte/store";

interface BufferStore {
    noteId: number;
    content: string;
    title: string;
    isDirty: boolean;
    lastSynced: Date;

    lastSavedContent: string;
    lastSavedTitle: string;
}


function createBufferStore() {
    const {subscribe, set, update} = writable<BufferStore>({
        noteId: -1,
        content: '',
        title: '',
        isDirty: false,
        lastSynced: new Date(),
        lastSavedContent: '',
        lastSavedTitle: ''
    });

    const checkIfDirty = (content: string, title: string, lastSavedContent: string, lastSavedTitle: string): boolean => {
        return content !== lastSavedContent || title !== lastSavedTitle;
    };

    return {
        subscribe,
        updateContent: (content: string) => update(store => ({
            ...store,
            content,
            isDirty: checkIfDirty(content, store.title, store.lastSavedContent, store.lastSavedTitle)
        })),
        updateTitle: (title: string) => update(store => ({
            ...store,
            title,
            isDirty: checkIfDirty(store.content, title, store.lastSavedContent, store.lastSavedTitle)
        })),
        markAsSynced: () => update(store => ({
            ...store,
            isDirty: false,
            lastSynced: new Date(),
            lastSavedContent: store.content,
            lastSavedTitle: store.title
        })),
        reset: (noteId: number, content: string, title: string) => {
            // When resetting with new content, it starts in a clean state
            // with the current content matching the last saved content
            set({
                noteId,
                content,
                title,
                isDirty: false,
                lastSynced: new Date(),
                lastSavedContent: content,  // Initialize last saved state to match current
                lastSavedTitle: title      // Initialize last saved state to match current
            });
        }
    };
}

export const bufferStore = createBufferStore();
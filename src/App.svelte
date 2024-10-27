<script lang="ts">

    import type {Note} from "./lib/types";
    import {createNote, deleteNote, findAllNotes, updateNote} from "./lib/api/notes";
    import {notes} from "./lib/stores/notesStore";
    import {onMount} from "svelte";
    import Sidebar from "./lib/components/Sidebar.svelte";
    import NoteEditor from "./lib/components/NoteEditor.svelte";
    import ActionBar from "./lib/components/ActionBar.svelte";
    import SearchBar from "./lib/components/SearchBar.svelte";

    let selectedNote: Note | null = null;
    let error: string | null = null;

    function handleNoteSelect(note: Note) {
        selectedNote = note;
    }

    async function handleCreate() {
        try {
            // Create a new blank note
            const newNote = {
                title: '',
                content: ''
            };

            const id = await createNote(newNote);
            const createdNote = { ...newNote, id };
            notes.addNote(createdNote);
            selectedNote = createdNote;  // Select the new note
        } catch (e) {
            error = 'Failed to create note';
        }
    }

    async function handleUpdate(event: CustomEvent<Omit<Note, 'id'>>) {
        if (!selectedNote?.id) return;

        try {
            const updatedNote = { ...event.detail, id: selectedNote.id };
            await updateNote(updatedNote);
            notes.updateNote(updatedNote);
            selectedNote = updatedNote; // Update the selected note
        } catch (e) {
            error = 'Failed to update note';
        }
    }

    async function handleDelete(event: CustomEvent<Note>) {
        const note = event.detail;
        if (!note.id) return;

        try {
            await deleteNote(note);
            notes.deleteNote(note.id);
            selectedNote = null;
        } catch (e) {
            error = 'Failed to delete note';
        }
    }

    // Load initial notes
    onMount(async () => {
        try {
            const fetchedNotes = await findAllNotes();
            notes.set(fetchedNotes);
        } catch (e) {
            error = 'Failed to load notes';
        }
    });
</script>


<div class="app-container">
    <Sidebar
            selectedNoteId={selectedNote?.id}
            onNoteSelect={handleNoteSelect}
    />

    <main class="main-content">

        <SearchBar onNoteSelect={handleNoteSelect} />

        {#if error}
            <div class="error" role="alert">
                {error}
                <button on:click={() => error = null}>Dismiss</button>
            </div>
        {/if}

        <div class="content-body">
            {#if selectedNote}
                <NoteEditor
                        note={selectedNote}
                        on:update={handleUpdate}
                        on:delete={handleDelete}
                />
            {:else}
                <div class="empty-state">
                    <p>Select a note from the sidebar or create a new one</p>
                </div>
            {/if}
        </div>
    </main>

    <ActionBar
            {selectedNote}
            on:create={handleCreate}
            on:delete={handleDelete}
    />
</div>

<style>
    .app-container {
        display: flex;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
        background: var(--app-bg, #ffffff);
    }

    .main-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        height: 100vh;
        overflow: hidden;
    }

    .content-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid var(--border-color, #e2e8f0);
    }

    h1 {
        font-size: 1.875rem;
        font-weight: 600;
        color: var(--text-primary, #1e293b);
        margin: 0;
    }

    .create-button {
        background: var(--primary-color, #3b82f6);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        transition: background-color 0.2s ease;
        font-weight: 500;
    }

    .create-button:hover {
        background: var(--primary-dark, #2563eb);
    }

    .content-body {
        flex: 1;
        padding: 1rem;
        overflow: hidden;
    }

    .empty-state {
        text-align: center;
        padding: 3rem;
        color: var(--text-secondary, #64748b);
    }

    .error {
        background: var(--error-bg, #fee2e2);
        color: var(--error-text, #991b1b);
        padding: 1rem;
        border-radius: 6px;
        margin: 0 1.5rem 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
</style>
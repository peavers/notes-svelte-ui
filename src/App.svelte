<script lang="ts">

    import type {Note} from "./lib/types";
    import {createNote, deleteNote, findAllNotes, updateNote} from "./lib/api/notes";
    import {notes} from "./lib/stores/notesStore";
    import {onMount} from "svelte";
    import Sidebar from "./lib/components/SideBar.svelte";
    import NoteEditor from "./lib/components/NoteEditor.svelte";
    import ActionBar from "./lib/components/ActionBar.svelte";

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
            const createdNote = {...newNote, id};
            notes.addNote(createdNote);
            selectedNote = createdNote;  // Select the new note
        } catch (e) {
            error = 'Failed to create note';
        }
    }

    async function handleUpdate(event: CustomEvent<Omit<Note, 'id'>>) {
        if (!selectedNote?.id) return;

        try {
            const updatedNote = {...event.detail, id: selectedNote.id};
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

            // Select the first note if there are notes and none is currently selected
            if (fetchedNotes.length > 0 && !selectedNote) {
                selectedNote = fetchedNotes[0];
            }
        } catch (e) {
            error = 'Failed to load notes';
        }
    });
</script>


<div class="app-container">
    <main class="main-content">
        <div class="app-layout">
            <Sidebar selectedNoteId={selectedNote?.id} onNoteSelect={handleNoteSelect}/>

            <div class="editor-wrapper">
                {#if error}
                    <div class="error" role="alert">
                        {error}
                        <button on:click={() => error = null}>Dismiss</button>
                    </div>
                {/if}

                {#if selectedNote}
                    <NoteEditor note={selectedNote} on:update={handleUpdate} on:delete={handleDelete}/>
                {:else}
                    <div class="empty-state">
                    </div>
                {/if}
            </div>
        </div>
    </main>

    <ActionBar {selectedNote} on:create={handleCreate} on:delete={handleDelete}/>
</div>

<style>
    .app-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        background: var(--app-bg, #ffffff);
    }

    .main-content {
        flex: 1;
    }

    .app-layout {
        display: flex;
        height: 100%;
    }

    .editor-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
        position: relative;
    }

    .empty-state {
        text-align: center;
        padding: 3rem;
        color: var(--text-secondary, #64748b);
    }
</style>
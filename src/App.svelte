<!-- src/lib/App.svelte -->
<script lang="ts">
    import type {Note} from "./lib/types";
    import Sidebar from "./lib/components/SideBar.svelte";
    import NoteEditor from "./lib/components/NoteEditor.svelte";
    import ActionBar from "./lib/components/ActionBar.svelte";

    let selectedNote: Note | null = null;

    function handleNoteSelect(note: Note) {
        selectedNote = note;
    }

    function handleNoteCreated(event: CustomEvent<Note>) {
        selectedNote = event.detail;
    }

    function handleNoteDeleted() {
        selectedNote = null;
    }
</script>

<div class="app-container">
    <main class="main-content">
        <div class="app-layout">
            <Sidebar
                    selectedNoteId={selectedNote?.id}
                    onNoteSelect={handleNoteSelect}
            />

            <div class="editor-wrapper">
                {#if selectedNote}
                    <NoteEditor
                            note={selectedNote}
                            on:noteDeleted={handleNoteDeleted}
                    />
                {:else}
                    <div class="empty-state">
                        Select a note or create a new one to get started
                    </div>
                {/if}
            </div>
        </div>
    </main>

    <ActionBar
            {selectedNote}
            on:noteCreated={handleNoteCreated}
            on:noteDeleted={handleNoteDeleted}
    />
</div>

<style>
    .app-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100vh;
        background: var(--app-bg, #ffffff);
    }

    .main-content {
        flex: 1;
        padding-bottom: 4rem; /* Make room for action bar */
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
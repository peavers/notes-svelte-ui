<!-- src/lib/components/Sidebar.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { notes } from '../stores/notesStore';
    import type { Note } from '../types';
    import SearchBar from "./SearchBar.svelte";
    import { notesService } from '../services/notesService';

    export let selectedNoteId: number | null = null;
    export let onNoteSelect: (note: Note) => void;

    let error: string | null = null;

    function handleNoteSelect(note: Note) {
        onNoteSelect(note);
    }

    onMount(async () => {
        try {
            await notesService.loadNotes();
            // Select first note if none selected
            if ($notes.length > 0 && !selectedNoteId) {
                onNoteSelect($notes[0]);
            }
        } catch (e) {
            error = 'Failed to load notes';
        }
    });
</script>

<aside class="sidebar">
    {#if error}
        <div class="error" role="alert">
            {error}
            <button on:click={() => error = null}>Dismiss</button>
        </div>
    {/if}

    <SearchBar onNoteSelect={handleNoteSelect}/>

    <div class="notes-list">
        {#each $notes as note (note.id)}
            <button
                    class="note-item"
                    class:selected={selectedNoteId === note.id}
                    on:click={() => onNoteSelect(note)}
            >
                <div class="note-item-content">
                    <h3 class="note-title">{note.title || 'Untitled'}</h3>
                    <p class="note-preview"></p>
                </div>
            </button>
        {/each}
    </div>
</aside>

<style>
    .sidebar {
        width: 300px;
        margin-right: 20px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .notes-list {
        flex: 1;
        overflow-y: auto;
        margin-top: 10px;
    }

    .note-item {
        width: 100%;
        padding: 1rem;
        background: white;
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 6px;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s ease;
        margin-bottom: 0.5rem;
    }

    .note-item:hover {
        border-color: var(--primary-color, #3b82f6);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .note-item.selected {
        border-color: var(--primary-color, #3b82f6);
        background: var(--selected-bg, #f8fafc);
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }

    .error {
        padding: 1rem;
        background: #fee2e2;
        color: #991b1b;
        margin-bottom: 1rem;
        border-radius: 0.375rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .error button {
        background: none;
        border: none;
        color: #991b1b;
        cursor: pointer;
        font-weight: 500;
    }
</style>
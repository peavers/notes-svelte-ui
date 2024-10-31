<!-- src/lib/components/SideBar.svelte -->
<script lang="ts">
    import {onMount} from 'svelte';
    import {notes} from '../stores/notesStore';
    import type {Note} from '../types';
    import SearchBar from "./SearchBar.svelte";
    import {notesService} from '../services/notesService';

    export let selectedNoteId: number | null = null;
    export let onNoteSelect: (note: Note) => void;

    let error: string | null = null;
    let isLoading = false;

    async function handleNoteSelect(note: Note) {
        try {
            isLoading = true;
            // Fetch full note content when selected
            const fullNote = await notesService.getNoteById(note.id);
            onNoteSelect(fullNote);
        } catch (e) {
            error = 'Failed to load note content';
            setTimeout(() => error = null, 3000);
        } finally {
            isLoading = false;
        }
    }

    onMount(async () => {
        try {
            isLoading = true;
            await notesService.loadNoteTitles();

            // If there are notes and none is selected, select the first one
            if ($notes.length > 0 && !selectedNoteId) {
                await handleNoteSelect($notes[0]);
            }
        } catch (e) {
            error = 'Failed to load notes';
            setTimeout(() => error = null, 3000);
        } finally {
            isLoading = false;
        }
    });
</script>

<aside class="sidebar">
    {#if error}
        <div class="error" role="alert" transition:fade={{ duration: 200 }}>
            {error}
        </div>
    {/if}

    <SearchBar onNoteSelect={handleNoteSelect}/>

    <div class="notes-list" class:loading={isLoading}>
        {#each $notes as note (note.id)}
            <button
                    class="note-item"
                    class:selected={selectedNoteId === note.id}
                    on:click={() => handleNoteSelect(note)}
                    disabled={isLoading}
            >
                <div class="note-item-content">
                    <h3 class="note-title">{note.title || 'Untitled'}</h3>
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
        opacity: 1;
        transition: opacity 0.2s ease;
    }

    .notes-list.loading {
        opacity: 0.7;
        pointer-events: none;
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

    .note-item:disabled {
        cursor: not-allowed;
        opacity: 0.7;
    }

    .note-item:hover:not(:disabled) {
        border-color: var(--primary-color, #3b82f6);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .note-item.selected {
        border-color: var(--primary-color, #3b82f6);
        background: var(--selected-bg, #f8fafc);
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }

    .note-title {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-primary, #1e293b);
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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
</style>
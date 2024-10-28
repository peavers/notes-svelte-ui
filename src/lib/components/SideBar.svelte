<script lang="ts">
    import {onMount} from 'svelte';
    import {notes} from '../stores/notesStore';
    import {findAllNotes} from '../api/notes';
    import type {Note} from '../types';
    import SearchBar from "./SearchBar.svelte";

    export let selectedNoteId: number | null = null;
    export let onNoteSelect: (note: Note) => void;

    let isLoading = true;
    let error: string | null = null;
    let searchQuery = '';

    // Filtered notes based on search
    $: filteredNotes = searchQuery
        ? $notes.filter(note =>
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : $notes;

    // Format the date to show when note was last modified
    const formatPreview = (content: string) => {
        const maxLength = 60;
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength).trim() + '...';
    };

    async function loadNotes() {
        try {
            isLoading = true;
            error = null;
            const fetchedNotes = await findAllNotes();
            notes.set(fetchedNotes);
        } catch (e) {
            error = 'Failed to load notes';
            console.error('Error loading notes:', e);
        } finally {
            isLoading = false;
        }
    }

    onMount(loadNotes);

    function handleNoteSelect(note: Note) {
        onNoteSelect(note);
    }
</script>

<aside class="sidebar">

    <SearchBar onNoteSelect={handleNoteSelect}/>

    <div class="notes-list">
        {#if isLoading}
            <div class="loading-state">
                <svg class="spinner" viewBox="0 0 50 50">
                    <circle
                            cx="25"
                            cy="25"
                            r="20"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="5"
                            stroke-linecap="round"
                    />
                </svg>
                <span>Loading notes...</span>
            </div>
        {:else if error}
            <div class="error-state">
                <p>{error}</p>
                <button
                        class="retry-button"
                        on:click={loadNotes}
                >
                    Retry
                </button>
            </div>
        {:else if filteredNotes.length === 0}
            <div class="empty-state">
                {#if searchQuery}
                    <p>No notes match your search</p>
                {:else}
                    <p>No notes yet</p>
                {/if}
            </div>
        {:else}
            {#each filteredNotes as note (note.id)}
                <button
                        class="note-item"
                        class:selected={selectedNoteId === note.id}
                        on:click={() => onNoteSelect(note)}
                >
                    <div class="note-item-content">
                        <h3 class="note-title">{note.title || 'Untitled'}</h3>
                        <p class="note-preview">
                            {formatPreview(note.content)}
                        </p>
                    </div>
                </button>
            {/each}
        {/if}
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

    .note-item-content {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
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

    .note-preview {
        font-size: 0.75rem;
        color: var(--text-secondary, #64748b);
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.4;
    }

    .loading-state {
        padding: 2rem;
        text-align: center;
        color: var(--text-secondary, #64748b);
    }

    .spinner {
        width: 2rem;
        height: 2rem;
        animation: spin 1s linear infinite;
        color: var(--primary-color, #3b82f6);
        margin-bottom: 0.5rem;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    .error-state {
        padding: 2rem;
        text-align: center;
        color: var(--error-text, #991b1b);
    }

    .retry-button {
        margin-top: 0.5rem;
        padding: 0.5rem 1rem;
        background: var(--primary-color, #3b82f6);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.875rem;
        transition: background-color 0.2s ease;
    }

    .retry-button:hover {
        background: var(--primary-dark, #2563eb);
    }

    .empty-state {
        padding: 2rem;
        text-align: center;
        color: var(--text-secondary, #64748b);
    }

    circle {
        stroke-dasharray: 128;
        stroke-dashoffset: 82;
        transform-origin: center;
        animation: dash 1.5s ease-in-out infinite;
    }

    @keyframes dash {
        0% {
            stroke-dashoffset: 128;
        }
        50% {
            stroke-dashoffset: 32;
        }
        100% {
            stroke-dashoffset: 128;
        }
    }
</style>
<!-- src/lib/components/ActionBar.svelte -->
<script lang="ts">
    import {createEventDispatcher} from 'svelte';
    import {fade} from 'svelte/transition';
    import type {Note} from '../types';
    import {notesService} from '../services/notesService';

    export let selectedNote: Note | null = null;
    let hoveredAction: string | null = null;
    let error: string | null = null;

    const dispatch = createEventDispatcher<{
        noteCreated: Note;
        noteDeleted: Note;
    }>();

    async function handleCreate() {
        try {
            const newNote = await notesService.createNote();
            dispatch('noteCreated', newNote);
        } catch (e) {
            error = 'Failed to create note';
            setTimeout(() => error = null, 3000); // Auto-dismiss error after 3s
        }
    }

    async function handleDelete() {
        if (!selectedNote) return;

        try {
            await notesService.deleteNote(selectedNote);
            dispatch('noteDeleted', selectedNote);
        } catch (e) {
            error = 'Failed to delete note';
            setTimeout(() => error = null, 3000); // Auto-dismiss error after 3s
        }
    }
</script>

<div class="action-bar-container">
    {#if error}
        <div class="error" role="alert" transition:fade={{ duration: 200 }}>
            {error}
        </div>
    {/if}

    <div class="action-bar">
        <div class="action-group">
            <!-- New Note - Always visible -->
            <button
                    class="action-button primary"
                    on:click={handleCreate}
                    on:mouseenter={() => hoveredAction = 'new'}
                    on:mouseleave={() => hoveredAction = null}
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                {#if hoveredAction === 'new'}
                    <div class="tooltip" transition:fade={{ duration: 100 }}>
                        New Note
                    </div>
                {/if}
            </button>

            {#if selectedNote}
                <button
                        class="action-button danger"
                        on:click={handleDelete}
                        on:mouseenter={() => hoveredAction = 'delete'}
                        on:mouseleave={() => hoveredAction = null}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    {#if hoveredAction === 'delete'}
                        <div class="tooltip" transition:fade={{ duration: 100 }}>
                            Delete Note
                        </div>
                    {/if}
                </button>
            {/if}
        </div>
    </div>
</div>

<style>
    .action-bar-container {
        position: fixed;
        bottom: 50px;
        right: 0;
        transform: translateX(-50%);
        z-index: 100;
    }

    .action-bar {
        display: flex;
        gap: 0.5rem;
        background: white;
        padding: 0.75rem;
        border-radius: 16px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .action-group {
        display: flex;
        gap: 0.75rem;
        position: relative;
    }

    .action-button {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        border: none;
        background: transparent;
        color: var(--text-secondary, #64748b);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        position: relative;
    }

    .action-button:hover:not(:disabled) {
        background: var(--hover-bg, #f1f5f9);
        color: var(--text-primary, #1e293b);
        transform: translateY(-1px);
    }

    .action-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .action-button.primary {
        background: var(--primary-color, #3b82f6);
        color: white;
    }

    .action-button.primary:hover {
        background: var(--primary-dark, #2563eb);
        color: white;
    }

    .action-button.danger:hover {
        background: var(--error-bg, #fee2e2);
        color: var(--error-text, #991b1b);
    }

    .icon {
        width: 20px;
        height: 20px;
    }

    .tooltip {
        position: absolute;
        bottom: calc(100% + 0.75rem);
        left: 50%;
        transform: translateX(-50%);
        background: var(--text-primary, #1e293b);
        color: white;
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        font-size: 0.75rem;
        white-space: nowrap;
        pointer-events: none;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid var(--text-primary, #1e293b);
    }

    .error {
        position: absolute;
        bottom: calc(100% + 1rem);
        left: 50%;
        transform: translateX(-50%);
        background: var(--error-bg, #fee2e2);
        color: var(--error-text, #991b1b);
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-size: 0.875rem;
        white-space: nowrap;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
</style>
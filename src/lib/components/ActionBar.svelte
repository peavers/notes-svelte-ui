<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { fade } from 'svelte/transition';
    import type { Note } from '../types';

    export let selectedNote: Note | null = null;

    const dispatch = createEventDispatcher<{
        create: void;
        delete: Note;
    }>();

    let hoveredAction: string | null = null;
</script>

<div class="action-bar-container">
    <div class="action-bar">
        <div class="action-group">
            <!-- New Note - Always visible -->
            <button
                    class="action-button primary"
                    on:click={() => dispatch('create')}
                    on:mouseenter={() => hoveredAction = 'new'}
                    on:mouseleave={() => hoveredAction = null}
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                {#if hoveredAction === 'new'}
                    <div class="tooltip" transition:fade={{ duration: 100 }}>
                        New Note
                    </div>
                {/if}
            </button>

            <!-- Format - Only enabled when note is selected -->
            <button
                    class="action-button"
                    on:mouseenter={() => hoveredAction = 'format'}
                    on:mouseleave={() => hoveredAction = null}
                    disabled={!selectedNote}
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                {#if hoveredAction === 'format'}
                    <div class="tooltip" transition:fade={{ duration: 100 }}>
                        {selectedNote ? 'Format' : 'Select a note to format'}
                    </div>
                {/if}
            </button>

            <!-- Image - Only enabled when note is selected -->
            <button
                    class="action-button"
                    on:mouseenter={() => hoveredAction = 'image'}
                    on:mouseleave={() => hoveredAction = null}
                    disabled={!selectedNote}
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                {#if hoveredAction === 'image'}
                    <div class="tooltip" transition:fade={{ duration: 100 }}>
                        {selectedNote ? 'Add Image' : 'Select a note to add images'}
                    </div>
                {/if}
            </button>

            <!-- Delete - Only visible when note is selected -->
            {#if selectedNote}
                <button
                        class="action-button danger"
                        on:click={() => dispatch('delete', selectedNote)}
                        on:mouseenter={() => hoveredAction = 'delete'}
                        on:mouseleave={() => hoveredAction = null}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
        bottom: 2rem;
        left: 50%;
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
</style>
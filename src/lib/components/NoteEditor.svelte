<script lang="ts">
    import {createEventDispatcher, onMount} from 'svelte';
    import type {Note} from '../types';
    import {debounce} from '../utils/debounce';

    export let note: Note;

    const dispatch = createEventDispatcher<{
        update: Omit<Note, 'id'>;
        delete: Note;
    }>();

    // Initialize local state
    let title = '';
    let content = '';

    // Update local state when note prop changes
    $: {
        if (note) {
            title = note.title;
            content = note.content;
        }
    }

    // Debounce the update to avoid too many API calls
    const debouncedUpdate = debounce((updatedTitle: string, updatedContent: string) => {
        if (!note) return;

        dispatch('update', {
            title: updatedTitle,
            content: updatedContent
        });
    }, 500);

    $: if (title !== note?.title || content !== note?.content) {
        debouncedUpdate(title, content);
    }
</script>

<div class="note-editor">
    <div class="editor-header">
        <input
                type="text"
                bind:value={title}
                class="title-input"
                placeholder="Note title"
        />
    </div>

    <textarea
            bind:value={content}
            class="content-input"
            placeholder="Start writing..."
            spellcheck="true">
    </textarea>
</div>

<style>
    .note-editor {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: white;
    }

    .editor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid var(--border-color, #e2e8f0);
    }

    .title-input {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary, #1e293b);
        border: none;
        background: transparent;
        width: 100%;
        margin-right: 1rem;
        padding: 0;
    }

    .title-input:focus {
        outline: none;
    }

    .content-input {
        flex: 1;
        width: 100%;
        padding: 1rem;
        border: none;
        resize: none;
        font-size: 1rem;
        line-height: 1.5;
        color: var(--text-primary, #1e293b);
        background: transparent;
    }

    .content-input:focus {
        outline: none;
    }

    .delete-button {
        padding: 0.5rem 1rem;
        border-radius: 6px;
        border: none;
        background: var(--error-bg, #fee2e2);
        color: var(--error-text, #991b1b);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .delete-button:hover {
        background: #fecaca;
    }
</style>
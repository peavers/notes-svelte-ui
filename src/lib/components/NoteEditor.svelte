<script lang="ts">
    import {onDestroy, onMount} from 'svelte';
    import Quill from 'quill';
    import type {Note} from '../types';
    import NoteHeader from './NoteHeader.svelte';
    import {noteSyncService} from '../services/noteSyncService';

    export let note: Note;
    export let onNoteUpdated: (note: Note) => void;

    let quill: Quill;
    let editorElement: HTMLDivElement;
    let isInitialized = false;
    let error: string | null = null;
    let currentNoteId: number | null = null;

    function handleContentChange() {
        if (quill) {
            noteSyncService.handleContentChange(quill.root.innerHTML, note.id);
        }
    }

    function handleTitleUpdate(newTitle: string) {
        noteSyncService.handleTitleChange(newTitle, note.id);
    }

    onMount(() => {
        currentNoteId = note.id;
        noteSyncService.initialize(note, onNoteUpdated);

        const toolbarOptions = [
            [{'font': []}],
            [{'header': [1, 2, 3, 4, 5, 6, false]}],
            ['bold', 'italic', 'underline', 'strike'],
            [{'color': []}, {'background': []}],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            [{'align': []}],
            ['blockquote', 'code-block'],
            ['link', 'image'],
            ['clean']
        ];

        quill = new Quill(editorElement, {
            theme: 'snow',
            placeholder: 'Compose an epic...',
            modules: {
                toolbar: toolbarOptions
            }
        });

        if (note?.content) {
            quill.root.innerHTML = note.content;
        }

        quill.on('text-change', handleContentChange);
        isInitialized = true;
    });

    onDestroy(() => {
        noteSyncService.cleanup();
    });

    // Handle note switching
    $: if (isInitialized && note?.id !== currentNoteId) {
        console.log('Switching note from', currentNoteId, 'to', note.id);
        currentNoteId = note.id;

        noteSyncService.switchNote(note)
            .then(() => {
                if (quill && note.id === currentNoteId) {
                    const selection = quill.getSelection();
                    quill.root.innerHTML = note.content;
                    if (selection) quill.setSelection(selection);
                }
            })
            .catch(err => {
                console.error('Error switching notes:', err);
                error = 'Failed to switch notes';
            });
    }
</script>

{#if error}
    <div class="error" role="alert">
        {error}
        <button on:click={() => error = null}>Dismiss</button>
    </div>
{/if}

<div class="header-parent">
    <div class="flex items-center justify-between px-4 gap-4 max-w-7xl mx-auto">
        <NoteHeader
                {note}
                onTitleUpdate={handleTitleUpdate}
        />
    </div>
</div>

<div class="note-editor">
    <div bind:this={editorElement}></div>
</div>

<style>
    .header-parent {
        position: sticky;
        top: 0;
        z-index: 3;
        background: rgba(255, 255, 255, 0.95);
    }

    .sync-status {
        padding: 8px;
        min-width: 140px; /* Prevents layout shift between different states */
        display: flex;
        justify-content: flex-end;
    }

    .note-editor {
        position: relative;
        max-width: 80vw;
    }

    .sync-status {
        padding: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    :global(.ql-toolbar.ql-snow) {
        top: 87px;
        position: sticky;
        z-index: 3;
        margin-bottom: 20px;
        border-bottom: 1px solid #3b82f6 !important;
        margin-left: 15px;
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
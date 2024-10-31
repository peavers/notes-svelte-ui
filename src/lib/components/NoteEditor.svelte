<!-- src/lib/components/NoteEditor.svelte -->
<script lang="ts">
    import { createEventDispatcher, onDestroy, onMount } from 'svelte';
    import Quill from 'quill';
    import type { Note } from '../types';
    import { debounce } from '../utils/debounce';
    import NoteHeader from './NoteHeader.svelte';
    import { notesService } from '../services/notesService';

    export let note: Note;

    const dispatch = createEventDispatcher<{
        noteUpdated: Note;
        noteDeleted: Note;
    }>();

    let quill: Quill;
    let editorElement: HTMLDivElement;
    let isInitialized = false;
    let error: string | null = null;

    const debouncedUpdate = debounce(async (title: string, content: string) => {
        try {
            const updatedNote = await notesService.updateNote(note.id, { title, content });
            dispatch('noteUpdated', updatedNote);
        } catch (e) {
            error = 'Failed to update note';
        }
    }, 500);

    async function handleTitleUpdate(event: CustomEvent<{ title: string }>) {
        if (quill) {
            await debouncedUpdate(event.detail.title, quill.root.innerHTML);
        }
    }

    async function handleDelete() {
        try {
            await notesService.deleteNote(note);
            dispatch('noteDeleted', note);
        } catch (e) {
            error = 'Failed to delete note';
        }
    }

    onMount(() => {
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

        quill.on('text-change', () => {
            debouncedUpdate(note.title, quill.root.innerHTML);
        });

        isInitialized = true;
    });

    $: if (isInitialized && note) {
        if (quill && note.content !== quill.root.innerHTML) {
            const selection = quill.getSelection();
            quill.root.innerHTML = note.content;
            if (selection) quill.setSelection(selection);
        }
    }

    onDestroy(() => {
        if (quill) {
            quill = null;
        }
    });
</script>

{#if error}
    <div class="error" role="alert">
        {error}
        <button on:click={() => error = null}>Dismiss</button>
    </div>
{/if}

<div class="header-parent">
    <NoteHeader {note} on:update={handleTitleUpdate} on:delete={handleDelete}/>
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

    .note-editor {
        position: relative;
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
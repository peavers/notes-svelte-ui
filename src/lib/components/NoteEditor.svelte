<script lang="ts">
    import {createEventDispatcher, onDestroy, onMount} from 'svelte';
    import Quill from 'quill';
    import type {Note} from '../types';
    import {debounce} from '../utils/debounce';
    import NoteHeader from './NoteHeader.svelte';

    export let note: Note;

    const dispatch = createEventDispatcher<{
        update: Omit<Note, 'id'>;
        delete: Note;
    }>();

    let quill: Quill;
    let editorElement: HTMLDivElement;
    let isInitialized = false;

    const debouncedUpdate = debounce((title: string, content: string) => {
        dispatch('update', {
            title,
            content
        });
    }, 500);

    function handleTitleUpdate(event: CustomEvent<{ title: string }>) {
        if (quill) {
            debouncedUpdate(event.detail.title, quill.root.innerHTML);
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
<div class="header-parent" data-testid="whatever">
    <NoteHeader {note} on:update={handleTitleUpdate}/>
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
</style>
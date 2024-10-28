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

<div class="note-editor">
    <NoteHeader {note} on:update={handleTitleUpdate}/>
    <div bind:this={editorElement}></div>
</div>

<style>
    .note-editor {
        position: relative;
    }
</style>
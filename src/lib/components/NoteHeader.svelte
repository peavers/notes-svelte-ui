<script lang="ts">
    import type {Note} from '../types';
    import {createEventDispatcher} from 'svelte';

    export let note: Note;

    const dispatch = createEventDispatcher<{
        update: { title: string };
    }>();

    let title = note?.title || '';

    function handleTitleChange(newTitle: string) {
        title = newTitle;
        dispatch('update', {title: newTitle});
    }

    $: if (note) {
        title = note.title;
    }
</script>

<header class="note-header">
    <div class="title-container">
        <input
                type="text"
                bind:value={title}
                class="title-input"
                placeholder="Note title"
                on:input={(e) => handleTitleChange(e.currentTarget.value)}
        />
    </div>
</header>

<style>
    .note-header {
        position: sticky;
        background: white;
    }

    .title-container {
        padding: 20px 7px;
    }

    .title-input {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary, #1e293b);
        border: none;
        background: transparent;
        width: 100%;
        padding: 10px;
        border-bottom: 1px solid #eee;
    }

    .title-input:focus {
        outline: none;
    }

    :global(.ql-toolbar.ql-snow) {
        border: none !important;
        padding: 10px 7px !important;
        border-bottom: 1px solid #eee;
        background: white;
    }

    :global(.ql-container.ql-snow) {
        border: none !important;
    }
</style>
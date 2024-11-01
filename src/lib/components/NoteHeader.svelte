<script lang="ts">
    import type {Note} from '../types';
    import {AlertCircle, CheckCircle2, Clock, RefreshCw} from 'lucide-svelte';
    import {syncStore} from "../stores/synStatusStore";

    export let note: Note;
    export let onTitleUpdate: (title: string) => void;

    let title = note?.title || '';

    function handleTitleChange(newTitle: string) {
        title = newTitle;
        onTitleUpdate(newTitle);
    }

    $: if (note) {
        title = note.title;
    }
</script>

<header class="note-header">
    <div class="header-content">
        <div class="title-container">
            <input
                    type="text"
                    bind:value={title}
                    class="title-input"
                    placeholder="Note title"
                    on:input={(e) => handleTitleChange(e.currentTarget.value)}
            />
        </div>
        <div class="sync-status">
            <div class="sync-indicator" class:fade-out={$syncStore === null}>
                {#if $syncStore === 'synced'}
                    <span class="sync-text">Saved</span>
                    <CheckCircle2 size={20} color="#22c55e"/>
                {:else if $syncStore === 'syncing'}
                    <span class="sync-text">Saving...</span>
                    <RefreshCw size={20} color="#3b82f6" class="animate-spin"/>
                {:else if $syncStore === 'error'}
                    <span class="sync-text">Error saving</span>
                    <AlertCircle size={20} color="#ef4444"/>
                {:else if $syncStore === 'pending'}
                    <span class="sync-text">Unsaved changes</span>
                    <Clock size={20} color="#eab308"/>
                {/if}
            </div>
        </div>
    </div>
</header>

<style>
    .note-header {
        position: sticky;
        top: 0;
        z-index: 3;
    }

    .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(255, 255, 255, 0.95);
    }

    .title-container {
        padding: 20px 7px;
        flex-grow: 1;
    }

    .title-input {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary, #1e293b);
        border: none;
        width: 100%;
        padding: 10px;
        border-bottom: 1px solid #eee;
        background: rgba(255, 255, 255, 0.1) !important;
    }

    .title-input:focus {
        outline: none;
    }

    .sync-status {
        padding-right: 24px;
        flex-shrink: 0;
        min-width: 150px;
    }

    .sync-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: flex-end;
        opacity: 1;
        transition: opacity 300ms ease;
    }

    .fade-out {
        opacity: 0.5;
    }

    .sync-text {
        font-size: 0.875rem;
        color: var(--text-secondary, #64748b);
        transition: all 200ms ease;
    }

    :global(.animate-spin) {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    :global(.ql-toolbar.ql-snow) {
        border: none !important;
        padding: 10px 7px !important;
        background: rgba(255, 255, 255, 0.95);
    }

    :global(.ql-container.ql-snow) {
        border: none !important;
    }
</style>
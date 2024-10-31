<!-- src/lib/components/SearchBar.svelte -->
<script lang="ts">
    import {slide} from 'svelte/transition';
    import type {Note, SearchResult} from '../types';
    import {debounce} from "../utils/debounce";
    import {searchNotes} from "../api/notes";

    export let onNoteSelect: (note: Note) => void;

    let searchQuery = '';
    let isLoading = false;
    let isDropdownOpen = false;
    let searchResults: SearchResult | null = null;
    let searchInput: HTMLInputElement;

    async function performSearchRequest(query: string) {
        if (!query.trim()) {
            searchResults = null;
            isDropdownOpen = false;
            return;
        }

        try {
            isLoading = true;
            searchResults = await searchNotes(query);
            isDropdownOpen = searchResults.notes.length > 0;
        } catch (error) {
            console.error('Search error:', error);
            searchResults = null;
            isDropdownOpen = false;
        } finally {
            isLoading = false;
        }
    }

    // Use the utility debounce function
    const debouncedSearch = debounce(performSearchRequest, 300);

    $: if (searchQuery) {
        debouncedSearch(searchQuery);
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closeDropdown();
        }
    }

    function closeDropdown() {
        isDropdownOpen = false;
        searchResults = null;
        searchQuery = '';
    }

    function handleNoteSelect(note: Note) {
        onNoteSelect(note);
        closeDropdown();
    }

    function handleClickOutside(event: MouseEvent) {
        const target = event.target as Node;
        if (isDropdownOpen &&
            searchInput &&
            !searchInput.contains(target) &&
            !(target.closest('.search-dropdown'))) {
            closeDropdown();
        }
    }
</script>

<svelte:window on:click={handleClickOutside}/>

<div class="search-container">
    <div class="search-input-wrapper" role="search">
        <input
                bind:this={searchInput}
                bind:value={searchQuery}
                on:keydown={handleKeyDown}
                type="search"
                placeholder="Search notes..."
                class="search-input"
                aria-label="Search notes"
                aria-expanded={isDropdownOpen}
                aria-controls={isDropdownOpen ? 'search-results' : undefined}
        />

        {#if isLoading}
            <div class="search-icon loading" aria-hidden="true">
                <svg class="spinner" viewBox="0 0 24 24">
                    <circle
                            cx="12"
                            cy="12"
                            r="10"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="3"
                    />
                </svg>
            </div>
        {:else}
            <div class="search-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
            </div>
        {/if}
    </div>

    {#if isDropdownOpen}
        <div
                id="search-results"
                class="search-dropdown"
                class:empty={!searchResults?.notes.length}
                transition:slide={{duration: 200}}
                role="listbox"
        >
            {#if searchResults?.notes.length}
                {#each searchResults.notes as note (note.id)}
                    <button
                            class="search-result"
                            on:click={() => handleNoteSelect(note)}
                            role="option"
                    >
                        <div class="result-title">
                            {@html searchResults.highlights[note.id].titleHighlight || note.title || 'Untitled'}
                        </div>
                        {#if searchResults.highlights[note.id].contentHighlight || note.content}
                            <div class="result-preview">
                                {@html searchResults.highlights[note.id].contentHighlight || note.content.substring(0, 100)}
                            </div>
                        {/if}
                    </button>
                {/each}
            {:else if searchQuery}
                <p class="no-results">No results found</p>
            {/if}
        </div>
    {/if}
</div>

<style>
    .search-container {
        position: relative;
        width: 100%;
        margin: 0 auto;
        z-index: 100;
    }

    .search-input-wrapper {
        position: relative;
        width: 100%;
    }

    .search-input {
        width: 100%;
        padding: 0.75rem 1rem;
        padding-left: 2.75rem;
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 6px;
        font-size: 1rem;
        background: white;
        transition: all 0.2s ease;
    }

    .search-input:focus {
        outline: none;
        border-color: var(--primary-color, #3b82f6);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .search-icon {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        width: 1.25rem;
        height: 1.25rem;
        color: var(--text-secondary, #64748b);
    }

    .search-icon.loading .spinner {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .search-dropdown {
        position: absolute;
        top: calc(100% + 0.5rem);
        left: 0;
        right: 0;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
        max-height: 400px;
        overflow-y: auto;
        border: 1px solid var(--border-color, #e2e8f0);
    }

    .search-result {
        display: block;
        width: 100%;
        padding: 1rem;
        text-align: left;
        border: none;
        background: transparent;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .search-result:hover {
        background: var(--hover-bg, #f8fafc);
    }

    .search-result:not(:last-child) {
        border-bottom: 1px solid var(--border-color, #e2e8f0);
    }

    .result-title {
        font-weight: 500;
        color: var(--text-primary, #1e293b);
        margin-bottom: 0.25rem;
    }

    .result-preview {
        font-size: 0.875rem;
        color: var(--text-secondary, #64748b);
        line-height: 1.4;
    }

    .search-dropdown.empty {
        padding: 2rem;
        text-align: center;
    }

    .no-results {
        color: var(--text-secondary, #64748b);
        text-align: center;
        padding: 2rem;
        margin: 0;
    }

    :global(mark) {
        background: var(--highlight-bg, #fef08a);
        color: var(--text-primary, #1e293b);
        padding: 0.1em 0.2em;
        border-radius: 0.2em;
    }

    @media (max-width: 640px) {
        .search-container {
            max-width: 100%;
            padding: 0 1rem;
        }
    }
</style>
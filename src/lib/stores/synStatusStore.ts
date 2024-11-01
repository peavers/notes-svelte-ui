import {writable} from 'svelte/store';

type SyncStatus = 'synced' | 'syncing' | 'error' | 'pending' | null;

function createSyncStore() {
    const {subscribe, set, update} = writable<SyncStatus>('synced');

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return {
        subscribe,
        setSynced: () => {
            if (timeoutId) clearTimeout(timeoutId);
            set('synced');
        },
        setSyncing: () => {
            if (timeoutId) clearTimeout(timeoutId);
            set('syncing');
        },
        setError: () => {
            if (timeoutId) clearTimeout(timeoutId);
            set('error');
        },
        setPending: () => {
            if (timeoutId) clearTimeout(timeoutId);
            set('pending');
        },
        clear: () => {
            if (timeoutId) clearTimeout(timeoutId);
            set(null);
        }
    };
}

export const syncStore = createSyncStore();
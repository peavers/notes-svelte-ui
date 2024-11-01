export interface Note {
    id: number;
    title: string;
    content: string;
}

export interface SearchResult {
    notes: Note[];
    highlights: Record<number, {
        titleHighlight: string;
        contentHighlight: string;
        rank: number;
    }>;
}

export interface SyncMessage {
    type: 'sync';
    note: Note;
}

export interface SyncResult {
    type: 'syncComplete' | 'syncError';
    noteId: number;
    note?: Note;
    error?: string;
}

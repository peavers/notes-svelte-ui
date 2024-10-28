export interface Note {
    id: number;
    title: string;
    content: string;
    updatedAt: Date;
}

export interface SearchResult {
    notes: Note[];
    highlights: Record<number, {
        titleHighlight: string;
        contentHighlight: string;
        rank: number;
    }>;
}
/* TypeScript types for BrainDeck */

export interface User {
    id: number;
    username: string;
    email: string;
    full_name: string | null;
    created_at: string | null;
}

export interface AuthResponse {
    message: string;
    user: User;
    access_token: string;
    refresh_token: string;
}

export interface Flashcard {
    id: number;
    question: string;
    answer: string;
    deck_id: number | null;
    deck_name?: string | null;
    difficulty: number;
    times_reviewed: number;
    times_correct: number;
    next_review?: string | null;
    created_at: string | null;
}

export interface Deck {
    id: number;
    name: string;
    description: string | null;
    parent_id: number | null;
    card_count: number;
    created_at: string | null;
}

export interface DeckBreadcrumb {
    id: number;
    name: string;
}

export interface DashboardData {
    user: {
        username: string;
        full_name: string | null;
    };
    stats: {
        total_cards: number;
        total_decks: number;
        due_cards: number;
        mastery_rate: number;
    };
    recent_decks: Deck[];
}

export interface GeneratedFlashcard {
    question: string;
    answer: string;
}

export interface ApiError {
    error: string;
    errors?: string[];
}

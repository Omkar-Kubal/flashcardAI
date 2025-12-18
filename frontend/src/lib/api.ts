/* API Client for BrainDeck Backend */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface RequestOptions extends RequestInit {
    token?: string;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { token, ...fetchOptions } = options;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...fetchOptions,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            // Handle both 'error' and 'errors' fields
            const errorMessage = data.error || (data.errors ? data.errors.join(', ') : 'An error occurred');
            throw new Error(errorMessage);
        }

        return data;
    }

    // Auth
    async register(credentials: { username: string; email: string; password: string; full_name?: string }) {
        return this.request('/api/auth/register', { method: 'POST', body: JSON.stringify(credentials) });
    }

    async login(credentials: { username: string; password: string }) {
        return this.request('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
    }

    async logout(token: string) {
        return this.request('/api/auth/logout', { method: 'POST', token });
    }

    async getMe(token: string) {
        return this.request('/api/auth/me', { token });
    }

    // Flashcards
    async getFlashcards(token: string, params?: { deck_id?: number; page?: number }) {
        const searchParams = new URLSearchParams();
        if (params?.deck_id) searchParams.set('deck_id', params.deck_id.toString());
        if (params?.page) searchParams.set('page', params.page.toString());
        const query = searchParams.toString();
        return this.request(`/api/flashcards${query ? `?${query}` : ''}`, { token });
    }

    async createFlashcard(token: string, data: { question: string; answer: string; deck_id?: number }) {
        return this.request('/api/flashcards', { method: 'POST', token, body: JSON.stringify(data) });
    }

    async deleteFlashcard(token: string, id: number) {
        return this.request(`/api/flashcards/${id}`, { method: 'DELETE', token });
    }

    // Decks
    async getDecks(token: string, parentId?: number) {
        const query = parentId ? `?parent_id=${parentId}` : '';
        return this.request(`/api/flashcards/decks${query}`, { token });
    }

    async getDeck(token: string, id: number) {
        return this.request(`/api/flashcards/decks/${id}`, { token });
    }

    async createDeck(token: string, data: { name: string; description?: string; parent_id?: number }) {
        return this.request('/api/flashcards/decks', { method: 'POST', token, body: JSON.stringify(data) });
    }

    async deleteDeck(token: string, id: number) {
        return this.request(`/api/flashcards/decks/${id}`, { method: 'DELETE', token });
    }

    // Study
    async startStudySession(token: string, deckId?: number) {
        const params = new URLSearchParams();
        if (deckId) params.set('deck_id', deckId.toString());
        return this.request(`/api/study/session?${params.toString()}`, { token });
    }

    async submitAnswer(token: string, data: { flashcard_id: number; quality: number }) {
        return this.request('/api/study/answer', { method: 'POST', token, body: JSON.stringify(data) });
    }

    async getStudyStats(token: string, deckId?: number) {
        const query = deckId ? `?deck_id=${deckId}` : '';
        return this.request(`/api/study/stats${query}`, { token });
    }

    // Dashboard
    async getDashboard(token: string) {
        return this.request('/api/users/dashboard', { token });
    }

    // AI
    async generateFlashcards(token: string, data: { text: string; quantity?: number; difficulty?: string }) {
        return this.request('/api/ai/generate', { method: 'POST', token, body: JSON.stringify(data) });
    }

    async searchTopic(token: string, topic: string) {
        return this.request('/api/ai/search-topic', { method: 'POST', token, body: JSON.stringify({ topic }) });
    }

    async saveGeneratedFlashcards(token: string, data: { deck_id?: number; deck_name?: string; flashcards: { question: string; answer: string }[] }) {
        return this.request('/api/ai/save', { method: 'POST', token, body: JSON.stringify(data) });
    }
}

export const api = new ApiClient();
export default api;

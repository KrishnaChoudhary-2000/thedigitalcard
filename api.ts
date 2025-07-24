
import { GoogleGenAI, Type } from "@google/genai";
import { ExecutiveData } from './types';
import { executiveData } from './data/defaultCard';

const DB_KEY = 'savedDigitalCards';
const SLUGS_KEY = 'digitalCardSlugs';
const apiDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

const server = {
  getCards: async (): Promise<ExecutiveData[]> => {
    const storedCards = localStorage.getItem(DB_KEY);
    if (storedCards) {
      const parsed = JSON.parse(storedCards);
      return parsed.map((c: any) => ({ ...executiveData, ...c }));
    }
    localStorage.setItem(DB_KEY, JSON.stringify([executiveData]));
    return [executiveData];
  },
  createCard: async (newCardData: ExecutiveData): Promise<ExecutiveData> => {
    const stored = localStorage.getItem(DB_KEY);
    const cards = stored ? JSON.parse(stored) : [];
    const updatedCards = [...cards, newCardData];
    localStorage.setItem(DB_KEY, JSON.stringify(updatedCards));
    return newCardData;
  },
  updateCard: async (id: string, cardToUpdate: ExecutiveData): Promise<ExecutiveData> => {
    const stored = localStorage.getItem(DB_KEY);
    const cards = stored ? JSON.parse(stored) : [];
    const updatedCards = cards.map((c: ExecutiveData) => c.id === id ? cardToUpdate : c);
    localStorage.setItem(DB_KEY, JSON.stringify(updatedCards));
    return cardToUpdate;
  },
  deleteCard: async (id: string): Promise<{ success: boolean }> => {
    const stored = localStorage.getItem(DB_KEY);
    const cards = stored ? JSON.parse(stored) : [];
    const updatedCards = cards.filter((c: ExecutiveData) => c.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(updatedCards));

    // Also remove any slug associated with this card
    const storedSlugs = localStorage.getItem(SLUGS_KEY);
    const slugs: { [key: string]: string } = storedSlugs ? JSON.parse(storedSlugs) : {};
    const slugToDelete = Object.keys(slugs).find(key => slugs[key] === id);
    if (slugToDelete) {
      delete slugs[slugToDelete];
      localStorage.setItem(SLUGS_KEY, JSON.stringify(slugs));
    }
    
    return { success: true };
  },
  updateOrder: async (orderedIds: string[]): Promise<{ success: boolean }> => {
    const stored = localStorage.getItem(DB_KEY);
    const cards = stored ? JSON.parse(stored) : [];
    const orderedCards = orderedIds.map(id => cards.find((c: ExecutiveData) => c.id === id)).filter(Boolean) as ExecutiveData[];
    localStorage.setItem(DB_KEY, JSON.stringify(orderedCards));
    return { success: true };
  },
  shareCard: async (cardId: string): Promise<{ slug: string }> => {
    const cards = await server.getCards();
    if (!cards.find(c => c.id === cardId)) {
        throw new Error("Card not found");
    }
    
    const storedSlugs = localStorage.getItem(SLUGS_KEY);
    const slugs: { [key: string]: string } = storedSlugs ? JSON.parse(storedSlugs) : {};

    const existingSlug = Object.keys(slugs).find(key => slugs[key] === cardId);
    if (existingSlug) {
      return { slug: existingSlug };
    }

    let newSlug = '';
    do {
      newSlug = Math.random().toString(36).substring(2, 8);
    } while (slugs[newSlug]);

    slugs[newSlug] = cardId;
    localStorage.setItem(SLUGS_KEY, JSON.stringify(slugs));
    return { slug: newSlug };
  },
  getCardBySlug: async (slug: string): Promise<ExecutiveData | null> => {
    const storedSlugs = localStorage.getItem(SLUGS_KEY);
    const slugs = storedSlugs ? JSON.parse(storedSlugs) : {};
    const cardId = slugs[slug];

    if (!cardId) return null;
    
    const cards = await server.getCards();
    return cards.find(c => c.id === cardId) || null;
  },
  getSignedUploadUrl: async (filename: string): Promise<{ uploadUrl: string; key: string }> => {
    const key = `uploads/${Date.now()}-${filename.replace(/\s/g, '-')}`;
    return {
      uploadUrl: `https://fake-s3-bucket.com/${key}?signature=...`,
      key: key,
    };
  },
  uploadFile: async (url: string, file: File): Promise<{ success: true }> => {
    // In a real app, this would be a fetch(url, { method: 'PUT', body: file })
    return { success: true };
  },
};

export const api = {
  async getCards(): Promise<ExecutiveData[]> {
    console.log('FETCH: GET /api/cards');
    await apiDelay(600);
    return server.getCards();
  },
  async createCard(newCardData: ExecutiveData): Promise<ExecutiveData> {
    console.log('FETCH: POST /api/cards');
    await apiDelay(400);
    return server.createCard(newCardData);
  },
  async updateCard(id: string, cardToUpdate: ExecutiveData): Promise<ExecutiveData> {
    console.log(`FETCH: PUT /api/cards/${id}`);
    await apiDelay(400);
    return server.updateCard(id, cardToUpdate);
  },
  async deleteCard(id: string): Promise<{ success: boolean }> {
    console.log(`FETCH: DELETE /api/cards/${id}`);
    await apiDelay(400);
    return server.deleteCard(id);
  },
  async updateOrder(orderedIds: string[]): Promise<{ success: boolean }> {
    console.log('FETCH: POST /api/cards/order');
    await apiDelay(200);
    return server.updateOrder(orderedIds);
  },
  async getSignedUploadUrl(filename: string): Promise<{ uploadUrl: string; key: string }> {
    console.log(`FETCH: GET /api/upload-url?filename=${filename}`);
    await apiDelay(300);
    return server.getSignedUploadUrl(filename);
  },
  async uploadFile(url: string, file: File): Promise<{ success: true }> {
    console.log(`FETCH: PUT ${url.split('?')[0]} with file ${file.name}`);
    await apiDelay(500);
    return server.uploadFile(url, file);
  },
  async shareCard(cardId: string): Promise<{ slug: string }> {
      console.log(`FETCH: POST /api/cards/${cardId}/share`);
      await apiDelay(300);
      return server.shareCard(cardId);
  },
  async getCardBySlug(slug: string): Promise<ExecutiveData | null> {
      console.log(`FETCH: GET /api/c/${slug}`);
      await apiDelay(500);
      return server.getCardBySlug(slug);
  },
  async getAISuggestions(field: 'name' | 'title', context: Partial<ExecutiveData>): Promise<string[]> {
    console.log(`FETCH: AI suggestions for ${field}`);
    
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        throw new Error("AI features are not available. API key is not configured.");
    }

    try {
        const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

        let prompt = '';
        if (field === 'title') {
            prompt = `Based on the following professional details, suggest 5 creative and professional alternative job titles.
            - Name: ${context.name || 'N/A'}
            - Current Title: ${context.title || 'N/A'}
            - Company: ${context.companyName || 'N/A'}
            
            Return only a JSON array of 5 strings. The titles should be concise and impactful.`;
        } else { // field === 'name'
            prompt = `I need suggestions for the "Card Name" field on a digital business card application. This is a friendly name for the card profile itself, not the person's legal name.
            Based on these details:
            - Full Name: ${context.name || 'N/A'}
            - Title: ${context.title || 'N/A'}
            - Company: ${context.companyName || 'N/A'}

            Suggest 5 friendly and professional options for the card's name. For example, for "John Smith", suggestions could be "John's Card", "John Smith - Professional Profile", etc.
            Return only a JSON array of 5 strings.`;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING,
                      description: 'A single suggestion.',
                    },
                  },
            }
        });

        const jsonString = response.text;
        if (!jsonString) {
            console.error("AI response was empty.");
            throw new Error("Received an empty response from the AI.");
        }
        
        const suggestions = JSON.parse(jsonString);

        if (Array.isArray(suggestions) && suggestions.every(s => typeof s === 'string')) {
            return suggestions;
        } else {
            console.error("AI response was not a valid array of strings:", suggestions);
            throw new Error("Received an invalid format from the AI.");
        }
    } catch(e) {
        console.error("Error fetching AI suggestions:", e);
        if (e instanceof Error) {
            if (e.message.includes('API key not valid')) {
                throw new Error("The API key is invalid. Please check your configuration.");
            }
        }
        throw new Error("Failed to get suggestions from AI service.");
    }
  },
};
/**
 * @jest-environment node
 */
import { POST } from '../route';
import { GoogleGenAI } from '@google/genai';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.TextDecoder = TextDecoder as any;

jest.mock('@google/genai', () => {
    const mockGenerateContentStream = jest.fn(); // Mock generateContentStream for this route
    return {
        GoogleGenAI: jest.fn().mockImplementation(() => ({
            models: {
                generateContentStream: mockGenerateContentStream,
                generateContent: jest.fn() // Also mock generateContent to be safe
            }
        }))
    };
});

describe('POST /api/ai/generate-field', () => {
    const mockApiKey = 'TEST_API_KEY';
    let originalEnv: NodeJS.ProcessEnv;

    beforeAll(() => {
        originalEnv = process.env;
        process.env = { ...originalEnv, GEMINI_API_KEY: mockApiKey };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 500 if API key is not set', async () => {
        const originalGeminiApiKey = process.env.GEMINI_API_KEY;
        const originalApiKey = process.env.API_KEY;

        process.env.GEMINI_API_KEY = '';
        process.env.API_KEY = '';

        const req = new Request('http://localhost/api/ai/generate-field', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Test', fieldType: 'userStory' })
        });
        const res = await POST(req);

        process.env.GEMINI_API_KEY = originalGeminiApiKey;
        process.env.API_KEY = originalApiKey;

        expect(res.status).toBe(500);
        const json = await res.json();
        expect(json.error).toBe('GEMINI_API_KEY is not set');
    });

    it('should return 400 if title or fieldType is missing', async () => {
        let req = new Request('http://localhost/api/ai/generate-field', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fieldType: 'userStory' }) // Missing title
        });
        let res = await POST(req);
        expect(res.status).toBe(400);
        let json = await res.json();
        expect(json.error).toBe('Title and Field Type are required');

        req = new Request('http://localhost/api/ai/generate-field', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Test Title' }) // Missing fieldType
        });
        res = await POST(req);
        expect(res.status).toBe(400);
        json = await res.json();
        expect(json.error).toBe('Title and Field Type are required');
    });

    it('should return 400 for invalid field type', async () => {
        const req = new Request('http://localhost/api/ai/generate-field', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Test Title', fieldType: 'invalidType' })
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBe('Invalid field type');
    });

    it('should generate a userStory prompt and stream response', async () => {
        interface MockChunk { text: string; }
        const mockStreamChunks: MockChunk[] = [
            { text: 'As a user, I want to...' },
        ];
        
        const mockGenerateContentStream = jest.fn(async function* () {
            for (const chunk of mockStreamChunks) {
                yield chunk;
            }
        });
        (GoogleGenAI as jest.Mock).mockImplementationOnce(() => ({
            models: { generateContentStream: mockGenerateContentStream }
        }));

        const req = new Request('http://localhost/api/ai/generate-field', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Login', fieldType: 'userStory' })
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        expect(res.headers.get('Content-Type')).toBe('text/event-stream');

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let receivedText = '';
        while (true) {
            const { done, value } = await reader!.read();
            if (done) break;
            receivedText += decoder.decode(value, { stream: true });
        }

        expect(receivedText).toContain('As a user, I want to...');
        
        const expectedPrompt = `You are a QA Expert. Generate a User Story for a test case titled "Login".
            Format: "As a [role], I want to [action], so that [benefit]."
            Keep it concise. Do not add any other text.`;
        expect(mockGenerateContentStream).toHaveBeenCalledWith({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: expectedPrompt }] }],
        });
    });

    it('should generate an acceptanceCriteria prompt and stream response', async () => {
        interface MockChunk { text: string; }
        const mockStreamChunks: MockChunk[] = [
            { text: 'Given a user is logged in...' },
        ];
        
        const mockGenerateContentStream = jest.fn(async function* () {
            for (const chunk of mockStreamChunks) {
                yield chunk;
            }
        });
        (GoogleGenAI as jest.Mock).mockImplementationOnce(() => ({
            models: { generateContentStream: mockGenerateContentStream }
        }));

        const req = new Request('http://localhost/api/ai/generate-field', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Login', fieldType: 'acceptanceCriteria', context: 'User logs in with valid credentials' })
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        expect(res.headers.get('Content-Type')).toBe('text/event-stream');

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let receivedText = '';
        while (true) {
            const { done, value } = await reader!.read();
            if (done) break;
            receivedText += decoder.decode(value, { stream: true });
        }

        expect(receivedText).toContain('Given a user is logged in...');
        
        const expectedPrompt = `You are a QA Expert. Generate Acceptance Criteria for a test case titled "Login".
Description: "User logs in with valid credentials"
            Format: List the criteria in Gherkin syntax (Given/When/Then) or a bulleted list.
            Keep it concise. Do not add any other text.`;
        expect(mockGenerateContentStream).toHaveBeenCalledWith({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: expectedPrompt }] }],
        });
    });

    it('should generate a preconditions prompt and stream response', async () => {
        interface MockChunk { text: string; }
        const mockStreamChunks: MockChunk[] = [
            { text: '• User account exists' },
        ];
        
        const mockGenerateContentStream = jest.fn(async function* () {
            for (const chunk of mockStreamChunks) {
                yield chunk;
            }
        });
        (GoogleGenAI as jest.Mock).mockImplementationOnce(() => ({
            models: { generateContentStream: mockGenerateContentStream }
        }));

        const req = new Request('http://localhost/api/ai/generate-field', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Login', fieldType: 'preconditions', context: 'User logs in' })
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        expect(res.headers.get('Content-Type')).toBe('text/event-stream');

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let receivedText = '';
        while (true) {
            const { done, value } = await reader!.read();
            if (done) break;
            receivedText += decoder.decode(value, { stream: true });
        }

        expect(receivedText).toContain('• User account exists');
        
        const expectedPrompt = `You are a QA Expert. Generate Preconditions for a test case titled "Login".
Description: "User logs in"
            Format: Bulleted list of required state before testing.
            Keep it concise. Do not add any other text.`;
        expect(mockGenerateContentStream).toHaveBeenCalledWith({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: expectedPrompt }] }],
        });
    });

    it('should handle AI generation errors gracefully (via stream)', async () => {
        const mockGenerateContentStream = jest.fn(async function* () {
            yield { text: 'Initial chunk' };
            throw new Error('AI Generation Failed during iteration');
        });
        (GoogleGenAI as jest.Mock).mockImplementationOnce(() => ({
            models: { generateContentStream: mockGenerateContentStream }
        }));

        const req = new Request('http://localhost/api/ai/generate-field', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Test', fieldType: 'userStory' })
        });

        const res = await POST(req);
        expect(res.status).toBe(200); // Expect 200, as the stream is returned
        expect(res.headers.get('Content-Type')).toBe('text/event-stream');

        // Now, try to consume the stream and expect an error
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let receivedText = '';
        let errorEncountered = false;

        try {
            while (true) {
                const { done, value } = await reader!.read();
                if (done) break;
                receivedText += decoder.decode(value, { stream: true });
            }
        } catch (e) {
            errorEncountered = true;
            // Optionally check the error message
            expect(e).toBeInstanceOf(Error);
            expect((e as Error).message).toContain('AI Generation Failed during iteration');
        }
        expect(errorEncountered).toBe(true);
        expect(receivedText).toContain('Initial chunk'); // Should have received the first chunk
    });
});
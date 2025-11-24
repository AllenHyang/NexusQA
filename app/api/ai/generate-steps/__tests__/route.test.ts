/**
 * @jest-environment node
 */
import { POST } from '../route';
import { GoogleGenAI } from '@google/genai'; // Re-add import
import { TextEncoder, TextDecoder } from 'util'; // Polyfill for TextEncoder/Decoder

global.TextEncoder = TextEncoder;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.TextDecoder = TextDecoder as any;

jest.mock('@google/genai', () => {
    const mockGenerateContent = jest.fn(); // Only mock generateContent
    return {
        GoogleGenAI: jest.fn().mockImplementation(() => ({
            models: {
                generateContent: mockGenerateContent // Update to generateContent
            }
        }))
    };
});

describe('POST /api/ai/generate-steps', () => {
    const mockApiKey = 'TEST_API_KEY';
    let originalEnv: NodeJS.ProcessEnv;

    beforeAll(() => {
        // Save original process.env
        originalEnv = process.env;
        // Temporarily set GEMINI_API_KEY for tests
        process.env = { ...originalEnv, GEMINI_API_KEY: mockApiKey };
    });

    afterAll(() => {
        // Restore original process.env
        process.env = originalEnv;
    });

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        // Removed: Reset the mock implementation for generateContentStream for each test
    });

    it('should return 500 if API key is not set', async () => {
        const originalGeminiApiKey = process.env.GEMINI_API_KEY;
        const originalApiKey = process.env.API_KEY;

        // Temporarily unset the API keys
        process.env.GEMINI_API_KEY = '';
        process.env.API_KEY = '';

        const req = new Request('http://localhost/api/ai/generate-steps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Test', description: 'Desc' })
        });
        const res = await POST(req);

        // Restore original process.env values
        process.env.GEMINI_API_KEY = originalGeminiApiKey;
        process.env.API_KEY = originalApiKey;

        expect(res.status).toBe(500);
        const json = await res.json();
        expect(json.error).toBe('GEMINI_API_KEY is not set');
    });

    it('should return 400 if title is missing', async () => {
        const req = new Request('http://localhost/api/ai/generate-steps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: 'Desc' })
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBe('Title is required');
    });

    it('should generate steps and return plain text response', async () => {
        const mockAIResponse = { // Explicit type (GenerateContentResponse) can be added if available
            candidates: [{
                content: {
                    parts: [{ text: '{"action":"Step 1","expected":"Result 1"}\n{"action":"Step 2","expected":"Result 2"}' }]
                }
            }]
        };
        
        const mockGenerateContent = jest.fn().mockResolvedValueOnce(mockAIResponse);

        (GoogleGenAI as jest.Mock).mockImplementationOnce(() => ({
            models: { generateContent: mockGenerateContent }
        }));

        const req = new Request('http://localhost/api/ai/generate-steps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Test Title', description: 'Test Description' })
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        expect(res.headers.get('Content-Type')).toBe('text/plain'); // Changed to text/plain

        const receivedText = await res.text(); // Changed to res.text()

        expect(receivedText).toContain('{"action":"Step 1","expected":"Result 1"}');
        expect(receivedText).toContain('{"action":"Step 2","expected":"Result 2"}');
        
        // Verify the prompt sent to GoogleGenAI
        const expectedPrompt = `
      You are a QA Expert. Create a comprehensive list of test steps for a test case titled: "Test Title".
      Description: "Test Description".
      
      Rules:
      1. Break down the test into logical, sequential steps.
      2. Each step must have a clear Action and an Expected Result.
      3. Keep the steps concise but detailed enough to be reproducible.
      4. If no specific description is provided, infer the most likely positive path scenarios based on the title.
      5. Generate between 3 to 8 steps.
      6. IMPORTANT: Output each test step as a single JSON object on a new line. Do NOT wrap the steps in a JSON array or markdown code block.
         Example:
         {"action": "Perform X", "expected": "See Y"}
         {"action": "Perform A", "expected": "See B"}
    `;
        expect(mockGenerateContent).toHaveBeenCalledWith({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: expectedPrompt }] }],
        });
    });

    it('should handle AI generation errors gracefully', async () => {
        const mockGenerateContent = jest.fn().mockRejectedValueOnce(new Error('AI Generation Failed')); // Changed mock and return type

        (GoogleGenAI as jest.Mock).mockImplementationOnce(() => ({
            models: { generateContent: mockGenerateContent }
        }));

        const req = new Request('http://localhost/api/ai/generate-steps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Test', description: 'Desc' })
        });

        const res = await POST(req);
        expect(res.status).toBe(500);
        const json = await res.json();
        expect(json.error).toBe('Failed to generate steps');
    });
});

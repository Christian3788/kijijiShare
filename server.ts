import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const port = process.env.PORT || 3000;

// Initialize GoogleGenAI server-side with required headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. Multi-turn Chat Endpoint (gemini-3.1-pro-preview, gemini-3.5-flash, gemini-3.1-flash-lite)
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, model = 'gemini-3.5-flash', neighborhood = 'Harbord Village & Elmwood' } = req.body;

    // Supported models per user prompt
    const validModels = ['gemini-3.1-pro-preview', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
    const selectedModel = validModels.includes(model) ? model : 'gemini-3.5-flash';

    const systemInstruction = `You are the KijijiShare Community Concierge and Mutual Aid Mediator for ${neighborhood}.
Your mission is to foster thoughtful neighborly sharing, fair gift distribution, tool care, and compassionate mutual aid without any monetary exchange or barter pressure.
Help neighbors draft clear listings, suggest fair guidelines, answer questions on local pick-ups, mediate disputes peacefully, and celebrate neighborly acts. Keep your tone warm, practical, community-minded, and grounded.`;

    // Format contents from messages
    const contents = (messages || []).map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'I could not generate a response. Please try again.';
    res.json({ reply, modelUsed: selectedModel });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate chat response' });
  }
});

// 2. Google Maps Grounding Endpoint (gemini-3.5-flash with googleMaps tool)
app.post('/api/gemini/maps-grounding', async (req, res) => {
  try {
    const { query, locationContext = 'Harbord Village, Toronto' } = req.body;

    const prompt = `As a hyperlocal safety assistant, find convenient, safe, and public meetup locations (such as public libraries, community recreation centers, well-lit transit hubs, or open park pavilions) near ${locationContext} for neighbors exchanging tools or items.
Query: ${query}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const text = response.text || '';
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata || null;

    res.json({ text, groundingMetadata });
  } catch (error: any) {
    console.error('Maps Grounding error:', error);
    res.status(500).json({ error: error.message || 'Failed to query Google Maps data' });
  }
});

// 3. Veo 3 Video Generation Endpoint (veo-3.1-fast-generate-preview with 16:9 or 9:16)
app.post('/api/gemini/veo-generate', async (req, res) => {
  try {
    const { prompt, aspectRatio = '16:9' } = req.body;

    const validAspectRatios = ['16:9', '9:16'];
    const chosenAspect = validAspectRatios.includes(aspectRatio) ? aspectRatio : '16:9';

    // Call veo-3.1-fast-generate-preview
    const operation = await (ai.models as any).generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || 'A heartwarming community garden tool share in a leafy neighborhood courtyard',
      config: {
        numberOfVideos: 1,
        aspectRatio: chosenAspect,
      },
    });

    res.json({
      operationName: operation.name,
      status: 'PROCESSING',
      message: 'Video generation started with veo-3.1-fast-generate-preview',
    });
  } catch (error: any) {
    console.error('Veo video generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to start video generation' });
  }
});

// Polling Veo 3 operation status
app.get('/api/gemini/veo-status', async (req, res) => {
  try {
    const { operationName } = req.query;
    if (!operationName || typeof operationName !== 'string') {
      return res.status(400).json({ error: 'Missing operationName query parameter' });
    }

    const op = await (ai.operations as any).getVideosOperation({
      name: operationName,
    });

    if (op.done) {
      const videoUri = op.response?.generatedVideos?.[0]?.video?.videoUri || null;
      return res.json({ done: true, videoUri, response: op.response });
    }

    res.json({ done: false, status: 'PROCESSING' });
  } catch (error: any) {
    console.error('Veo status error:', error);
    res.status(500).json({ error: error.message || 'Failed to check video status' });
  }
});

// 4. Voice Conversation (Live API gemini-3.8-live simulation / audio endpoint)
app.post('/api/gemini/voice-conversation', async (req, res) => {
  try {
    const { audioPrompt, textPrompt } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-live',
      contents: textPrompt || 'Hello neighbor! How can I help you share or find aid in the community today?',
      config: {
        systemInstruction: 'You are KijijiShare Voice Assistant. Provide concise, friendly spoken responses for neighbors browsing gifts or needs.',
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Live voice conversation error:', error);
    res.status(500).json({ error: error.message || 'Voice conversation error' });
  }
});

// Mount Vite in dev mode or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`KijijiShare full-stack server running on port ${port}`);
  });
}

startServer();

import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import env from '../../config/env.js';

let openRouterClient = null;
let geminiClient = null;

export const getOpenRouterClient = () => {
  if (!openRouterClient) {
    if (!env.openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is not defined in the environment variables.');
    }
    openRouterClient = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: env.openRouterApiKey,
    });
  }
  return openRouterClient;
};

export const getGeminiClient = () => {
  if (!geminiClient) {
    if (!env.geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not defined in the environment variables.');
    }
    geminiClient = new GoogleGenAI({ apiKey: env.geminiApiKey });
  }
  return geminiClient;
};

let groqClient = null;
export const getGroqClient = () => {
  if (!groqClient) {
    if (!env.groqApiKey) {
      throw new Error('GROQ_API_KEY is not defined in the environment variables.');
    }
    groqClient = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: env.groqApiKey,
    });
  }
  return groqClient;
};

export const handleAiError = (error) => {
  if (error.status === 429) {
    const err = new Error('API rate limit reached. Please try again in a moment.');
    err.statusCode = 429;
    return err;
  }
  if (error.status === 401 || error.status === 403) {
    const err = new Error('API access denied. Check your API key.');
    err.statusCode = 403;
    return err;
  }
  const err = new Error(`AI API error: ${error.message}`);
  err.statusCode = 502;
  return err;
};

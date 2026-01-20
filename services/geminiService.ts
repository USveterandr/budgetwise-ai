import { GoogleGenerativeAI } from "@google/generative-ai";
import Constants from "expo-constants";

// Types for our Gemini service
export interface ChatMessage {
  role: "user" | "model";
  parts: string;
}

export interface ReceiptData {
  merchant: string;
  date: string;
  amount: number;
  category: string;
  items: { name: string; price: number }[];
  rawText: string;
}

export interface BudgetCategory {
  category: string;
  limit: number;
}

const SYSTEM_INSTRUCTION = `
You are BudgetWise AI, a world-class financial advisor and personal finance expert. 
Your goal is to help users manage their budget, categorize expenses, track net worth, and provide investment insights.
Be concise, encouraging, and actionable. 
If asked about specific investment advice, provide general educational information and recommend consulting the human specialist via the 'Consultation' tab.
Format your responses nicely using Markdown.
`;

class GeminiService {
  private genAI?: GoogleGenerativeAI;
  private chatModel: string = "gemini-1.5-pro";
  private visionModel: string = "gemini-1.5-flash";

  constructor() {
    this.init(); // Initialize lazily
  }

  private init() {
    if (this.genAI) return;

    // Initialize with the environment variable
    // Fallback order:
    // 1. process.env (Standard/Web)
    // 2. Constants.expoConfig.extra (Managed Expo)
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || Constants.expoConfig?.extra?.geminiApiKey;
    
    // Debug logging to help troubleshoot
    console.log("BudgetWise - Initializing Gemini Service");
    console.log("BudgetWise - API Key Present:", !!apiKey);
    if (apiKey) {
       console.log("BudgetWise - API Key Length:", apiKey.length);
    } // else { console.log("BudgetWise - Available Keys in Extra:", JSON.stringify(Constants.expoConfig?.extra)); }

    if (!apiKey) {
      console.warn("EXPO_PUBLIC_GEMINI_API_KEY is not set. Gemini features will be disabled.");
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async getFinancialAdvice(
    history: ChatMessage[],
    userContext: string
  ): Promise<string> {
    try {
      this.init();
      if (!this.genAI) {
         return "I'm not configured properly (missing API key). Please restart your app to load the new settings.";
      }

      const model = this.genAI.getGenerativeModel({
        model: this.chatModel,
        systemInstruction: SYSTEM_INSTRUCTION
      });

      // Convert history to the format expected by the API
      const chatHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.parts }]
      }));

      // Add user context to the conversation
      const contextPrompt = `User Context: ${userContext}`;

      const chat = model.startChat({
        history: chatHistory
      });

      const result = await chat.sendMessage(contextPrompt);
      const response = await result.response;

      return response.text() || "I apologize, I couldn't generate a financial insight at this moment.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "I'm having trouble connecting to the financial knowledge base right now. Please try again later.";
    }
  }

  async parseReceiptImage(base64Image: string): Promise<ReceiptData> {
    try {
      this.init();
      if (!this.genAI) {
        throw new Error(
          "Gemini API not initialized. Please ensure EXPO_PUBLIC_GEMINI_API_KEY is set in your .env file, " +
          "and restart your app to load the new settings. If the issue persists, check that your app.config.js " +
          "properly passes the environment variable to the app."
        );
      }

      const model = this.genAI.getGenerativeModel({ model: this.visionModel });

      const prompt = `Perform OCR (Optical Character Recognition) on this receipt image.
      Extract the following data into a strict JSON object:
      - merchant (string): Business name
      - date (string): YYYY-MM-DD format (use today ${new Date().toISOString().split('T')[0]} if not found)
      - amount (number): Total transaction amount
      - category (string): One of [Food, Transport, Utilities, Entertainment, Shopping, Health, Other]
      - items (array): List of {name, price} objects
      
      Return ONLY the JSON object. Do not wrap in code blocks.`;

      const image = {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg"
        }
      };

      const result = await model.generateContent([prompt, image]);
      const response = await result.response;

      const text = response.text();

      if (!text) throw new Error("No response text");

      // Remove code block markers if present and trim
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

      return JSON.parse(jsonStr);


    } catch (error) {
      console.error("Receipt scanning error:", error);
      
      // If it's a specific API key error, re-throw it with more helpful information
      if (error instanceof Error && error.message.includes('not initialized')) {
        throw error;
      }
      
      // Check for specific error types and provide more targeted messages
      let errorMessage = "Failed to process receipt image. ";
      
      if (error instanceof Error) {
        if (error.message.includes('API key') || error.message.includes('400') || error.message.includes('403')) {
          errorMessage += "Invalid or missing API key. Please verify your EXPO_PUBLIC_GEMINI_API_KEY is set correctly.";
        } else if (error.message.includes('429')) {
          errorMessage += "Rate limit exceeded. Please try again later.";
        } else if (error.message.includes('network') || error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
          errorMessage += "Network error occurred. Please check your internet connection and try again.";
        } else {
          errorMessage += "Please ensure your API key is valid and you have internet connection. Check the console logs for more details.";
        }
      } else {
        errorMessage += "Please ensure your API key is valid and you have internet connection. Check the console logs for more details.";
      }
      
      throw new Error(errorMessage);
    }
  }

  async generateBudgetPlan(industry: string, monthlyIncome: number, currency: string): Promise<BudgetCategory[]> {
    try {
      this.init();
      if (!this.genAI) return [];

      const model = this.genAI.getGenerativeModel({ model: this.chatModel });

      const prompt = `
        Create a detailed monthly expense budget for a "${industry}" business with a total monthly income of ${monthlyIncome} ${currency}.
        Identify 5-8 key expense categories specific to this industry (e.g., Fuel/Maintenance for Truck Driver, Tools/Parts for Plumber, Marketing/Software for Insurance Agent).
        Allocate the budget limits realistically so the total expenses are around 60-70% of the income (leaving room for profit/taxes).
        
        Return ONLY a JSON array of objects. Format:
        [
          { "category": "Fuel", "limit": 1200 },
          { "category": "Insurance", "limit": 400 }
        ]
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) return [];

      // Clean up the response to extract JSON
      const jsonStart = text.indexOf('[');
      const jsonEnd = text.lastIndexOf(']') + 1;
      const jsonString = text.substring(jsonStart, jsonEnd);

      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Budget generation error:", error);
      return [];
    }
  }
}

export const geminiService = new GeminiService();
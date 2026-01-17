import { GoogleGenerativeAI } from "@google/generative-ai";

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
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
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
      if (!this.genAI) return "I'm not configured properly (missing API key).";

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
      if (!this.genAI) throw new Error("Gemini API not initialized. Please check that EXPO_PUBLIC_GEMINI_API_KEY is set in your .env file.");

      const model = this.genAI.getGenerativeModel({ model: this.visionModel });

      const prompt = `Perform OCR (Optical Character Recognition) on this receipt image.
      Extract the following data into a strict JSON object:
      - merchant (string): Business name
      - date (string): YYYY-MM-DD format (use today ${new Date().toISOString().split('T')[0]} if not found)
      - amount (number): Total transaction amount
      - category (string): One of [Food, Transport, Utilities, Entertainment, Shopping, Health, Other]
      - items (array): List of {name, price} objects
      
      Return ONLY the JSON object. Do not wrap in markdown code blocks.`;

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
      throw error;
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
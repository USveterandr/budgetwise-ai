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
  private genAI: GoogleGenerativeAI;
  private chatModel: string = "gemini-1.5-pro";
  private visionModel: string = "gemini-1.5-flash";

  constructor() {
    // Initialize with the environment variable
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("EXPO_PUBLIC_GEMINI_API_KEY is not set");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async getFinancialAdvice(
    history: ChatMessage[],
    userContext: string
  ): Promise<string> {
    try {
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
      const model = this.genAI.getGenerativeModel({ model: this.visionModel });
      
      const prompt = `Perform OCR (Optical Character Recognition) on this receipt image to extract all visible text.
      Simultaneously, analyze the content to structure the following data:
      1. Merchant Name
      2. Date (YYYY-MM-DD format)
      3. Total Amount (number only)
      4. Category (Food, Transport, Utilities, Entertainment, Shopping, Health, Other)
      5. List of items purchased (name and price)
      
      Return JSON only with the extracted fields and the full raw OCR text.`;

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
      
      // Clean up the response to extract JSON
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonString = text.substring(jsonStart, jsonEnd);
      
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Receipt scanning error:", error);
      throw error;
    }
  }

  async generateBudgetPlan(industry: string, monthlyIncome: number, currency: string): Promise<BudgetCategory[]> {
    try {
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
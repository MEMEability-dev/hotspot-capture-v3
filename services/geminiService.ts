import { GoogleGenAI } from "@google/genai";
import { Fund, HistoricalDataPoint } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeFund = async (fund: Fund, history: HistoricalDataPoint[]): Promise<string> => {
  try {
    const ai = getClient();
    
    // Prepare a summarized history string to avoid token bloat if history is long
    const historySummary = history
      .filter((_, index) => index % 3 === 0) // Take every 3rd point to save context
      .map(h => `${h.date}: ${h.nav}`)
      .join('\n');

    const prompt = `
      You are a senior financial analyst. Provide a concise, professional analysis for the following fund based on its profile and recent 30-day performance.

      **Fund Profile:**
      - Name: ${fund.name} (${fund.code})
      - Sector: ${fund.sector}
      - Market Cap: $${fund.marketCap}M
      - Risk Level: ${fund.riskLevel}
      - Description: ${fund.description}
      - Current NAV: ${fund.currentNAV}
      - Today's Change: ${fund.dayChangePercent}%

      **Performance Data (Date: NAV):**
      ${historySummary}

      **Instructions:**
      1. Analyze the trend (Bullish, Bearish, or Neutral).
      2. Identify any potential risks or opportunities based on the sector and price movement.
      3. Provide a brief "Analyst Verdict" recommendation (Buy, Hold, or Sell) with a reason.
      4. Format the output with clear headings and bullet points using Markdown. Keep it under 200 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful, professional financial assistant. Use Markdown for formatting.",
      }
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate analysis. Please try again.");
  }
};
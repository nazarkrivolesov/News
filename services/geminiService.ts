
import { GoogleGenAI, Type } from "@google/genai";
import { NewsItem, WeatherData, GroundingSource } from "../types";

export class GeminiNewsService {
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async fetchCherkasyNews(): Promise<{ news: NewsItem[], sources: GroundingSource[] }> {
    try {
      const ai = this.getAI();
      const prompt = `Знайди 6-8 актуальних новин Черкас та Черкаської області за останні 24 години. 
      Використовуй інформацію з місцевих пабліків. 
      Відповідь надай СУВОРО у форматі JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              news: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    category: { type: Type.STRING },
                    timestamp: { type: Type.STRING }
                  },
                  required: ["title", "summary", "category", "timestamp"]
                }
              }
            },
            required: ["news"]
          }
        },
      });

      const text = response.text || "{}";
      const data = JSON.parse(text);
      
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: GroundingSource[] = groundingChunks
        .filter(chunk => chunk.web)
        .map(chunk => ({
          title: chunk.web.title,
          uri: chunk.web.uri
        }));

      const newsItems: NewsItem[] = (data.news || []).map((item: any, index: number) => {
        const sourceObj = sources[index % Math.max(sources.length, 1)];
        return {
          id: `news-${Date.now()}-${index}`,
          title: item.title || "Новина без заголовка",
          summary: item.summary || "",
          category: (item.category || 'Життя') as any,
          timestamp: item.timestamp || "Щойно",
          source: sourceObj?.title || "Черкаські ЗМІ",
          url: sourceObj?.uri || "https://suspilne.media/regions/cherkasy-region/",
          imageUrl: `https://picsum.photos/seed/${index + 100}/800/450`
        };
      });

      return { news: newsItems, sources };
    } catch (error) {
      console.error("Error in GeminiNewsService:", error);
      return { news: [], sources: [] };
    }
  }

  async fetchWeather(): Promise<WeatherData> {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Яка погода в Черкасах? JSON: {temp: number, condition: string}",
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              temp: { type: Type.NUMBER },
              condition: { type: Type.STRING }
            },
            required: ["temp", "condition"]
          }
        }
      });
      
      const data = JSON.parse(response.text || '{"temp":0,"condition":"Завантаження"}');
      return { ...data, location: "Черкаси" };
    } catch (error) {
      return { temp: 0, condition: "Оновлюється", location: "Черкаси" };
    }
  }
}

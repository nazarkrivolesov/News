
import { GoogleGenAI, Type } from "@google/genai";
import { NewsItem, WeatherData, GroundingSource } from "../types";

export class GeminiNewsService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async fetchCherkasyNews(): Promise<{ news: NewsItem[], sources: GroundingSource[] }> {
    try {
      const prompt = `Знайди останні новини міста Черкаси та Черкаської області за останні 24 години. 
      Зверни особливу увагу на інформацію з популярних місцевих Телеграм-каналів (таких як "18000", "Черкаси Live", "Zmi.ck.ua", "Суспільне Черкаси") та Instagram-пабліків. 
      Надай список з 6-8 найважливіших новин.
      Для кожної новини вкажи: 
      1. Заголовок
      2. Короткий зміст (2-3 речення)
      3. Категорію (Політика, Події, Культура, Спорт, Життя)
      4. Приблизний час публікації.
      
      Формат відповіді: тільки JSON.`;

      const response = await this.ai.models.generateContent({
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

      const jsonStr = response.text.trim();
      const data = JSON.parse(jsonStr);
      
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: GroundingSource[] = groundingChunks
        .filter(chunk => chunk.web)
        .map(chunk => ({
          title: chunk.web.title,
          uri: chunk.web.uri
        }));

      const newsItems: NewsItem[] = data.news.map((item: any, index: number) => ({
        id: `news-${index}`,
        title: item.title,
        summary: item.summary,
        category: item.category as any,
        timestamp: item.timestamp,
        source: sources[index % sources.length]?.title || "Місцеві ЗМІ",
        url: sources[index % sources.length]?.uri || "https://suspilne.media/regions/cherkasy-region/",
        imageUrl: `https://picsum.photos/seed/${index + 42}/800/450`
      }));

      return { news: newsItems, sources };
    } catch (error) {
      console.error("Error fetching news:", error);
      return { news: [], sources: [] };
    }
  }

  async fetchWeather(): Promise<WeatherData> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Яка зараз погода в Черкасах? Надай тільки температуру (число) та короткий опис стану неба (хмарно, сонячно тощо). Формат відповіді: JSON.",
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
      
      const data = JSON.parse(response.text.trim());
      return { ...data, location: "Черкаси" };
    } catch (error) {
      return { temp: 0, condition: "Невідомо", location: "Черкаси" };
    }
  }
}

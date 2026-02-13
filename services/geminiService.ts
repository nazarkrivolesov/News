
import { GoogleGenAI, Type } from "@google/genai";
import { NewsItem, WeatherData, GroundingSource } from "../types";

export class GeminiNewsService {
  // Використовуємо максимально пряму ініціалізацію як у документації
  private createAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async fetchCherkasyNews(): Promise<{ news: NewsItem[], sources: GroundingSource[] }> {
    try {
      const ai = this.createAI();
      const prompt = `Знайди 8 найактуальніших новин міста Черкаси та Черкаської області за останні 24 години. 
      Потрібні новини про: безпеку, транспорт, ЖКГ або важливі соціальні події.
      Мова: українська. Обов'язково використовуй Google Search для пошуку реальних посилань.
      Формат: JSON об'єкт з масивом "news".`;

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

      if (!response.text) throw new Error("Порожня відповідь від AI");
      
      const data = JSON.parse(response.text);
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      const sources: GroundingSource[] = groundingChunks
        .filter(chunk => chunk.web)
        .map(chunk => ({
          title: chunk.web.title || "Джерело новин",
          uri: chunk.web.uri
        }));

      const newsItems: NewsItem[] = (data.news || []).map((item: any, index: number) => {
        const sourceObj = sources[index] || sources[0];
        return {
          id: `ck-${Date.now()}-${index}`,
          title: item.title,
          summary: item.summary,
          category: (['Політика', 'Події', 'Культура', 'Спорт', 'Життя'].includes(item.category) ? item.category : 'Події') as any,
          timestamp: item.timestamp,
          source: sourceObj?.title.split(' - ')[0] || "Черкаси Інфо",
          url: sourceObj?.uri || "https://suspilne.media/regions/cherkasy-region/",
          imageUrl: `https://picsum.photos/seed/cknews${index}/800/450`
        };
      });

      return { news: newsItems, sources };
    } catch (error: any) {
      console.error("GeminiNewsService Error:", error);
      throw error;
    }
  }

  async fetchWeather(): Promise<WeatherData> {
    try {
      const ai = this.createAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Погода Черкаси зараз: температура числом та стан одним словом. JSON {temp, condition}",
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
      
      const data = JSON.parse(response.text || '{"temp":0,"condition":"Невідомо"}');
      return { ...data, location: "Черкаси" };
    } catch (error) {
      console.error("Weather Error:", error);
      return { temp: 0, condition: "Оновлюється...", location: "Черкаси" };
    }
  }
}

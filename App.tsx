
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import NewsCard from './components/NewsCard';
import Sidebar from './components/Sidebar';
import LoadingSkeleton from './components/LoadingSkeleton';
import { GeminiNewsService } from './services/geminiService';
import { NewsItem, WeatherData, GroundingSource } from './types';

const App: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{message: string, type: 'auth' | 'general' | 'empty' | null} | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const newsService = useMemo(() => new GeminiNewsService(), []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [newsData, weatherData] = await Promise.all([
        newsService.fetchCherkasyNews(),
        newsService.fetchWeather()
      ]);
      
      setNews(newsData.news);
      setSources(newsData.sources);
      setWeather(weatherData);

      if (newsData.news.length === 0) {
        setError({ message: "Зараз немає новин, що відповідають запиту. Спробуйте оновити пізніше.", type: 'empty' });
      }
    } catch (err: any) {
      console.error("App Error Details:", err);
      const errorMsg = err.message || "";
      
      // Перевірка на помилки авторизації/налаштування
      if (errorMsg.includes('API Key') || errorMsg.includes('API_KEY') || errorMsg.includes('set when running')) {
        setError({ 
          message: "Ключ API не знайдено або він некоректний. Переконайтеся, що ви додали 'API_KEY' у змінні оточення вашого хостингу та виконали 'Redeploy'.", 
          type: 'auth' 
        });
      } else if (errorMsg.includes('403') || errorMsg.includes('Forbidden')) {
        setError({ 
          message: "Помилка доступу (403). Можливо, ваш API ключ не підтримує Google Search Grounding.", 
          type: 'auth' 
        });
      } else {
        setError({ 
          message: "Помилка зв'язку з сервером новин. Перевірте інтернет та спробуйте ще раз.", 
          type: 'general' 
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [newsService]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Fix: Completed the missing JSX structure and added export default to fix the import error in index.tsx
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-theme pb-12">
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white border-l-4 border-blue-600 pl-4">
                Стрічка Черкащини
              </h2>
              <button 
                onClick={loadData}
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isLoading ? 'Оновлення...' : 'Оновити'}
              </button>
            </div>

            {error && (
              <div className={`p-8 rounded-3xl mb-8 border shadow-xl ${error.type === 'auth' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30'}`}>
                <div className="flex flex-col items-center text-center gap-4">
                  <div className={`p-4 rounded-full ${error.type === 'auth' ? 'bg-red-100 dark:bg-red-900/40 text-red-600 shadow-inner' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {error.type === 'auth' ? 'Помилка конфігурації' : 'Помилка завантаження'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                      {error.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {news.map((item) => (
                  <NewsCard key={item.id} news={item} />
                ))}
              </div>
            )}
          </div>

          <div className="lg:w-80">
            <Sidebar weather={weather} sources={sources} />
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default App;

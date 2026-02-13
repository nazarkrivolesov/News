
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
  const [error, setError] = useState<string | null>(null);
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
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const loadData = useCallback(async () => {
    if (!process.env.API_KEY || process.env.API_KEY === 'undefined') {
      setError("API ключ не підключено. Якщо ви щойно додали його у Vercel, вам потрібно зробити 'Redeploy' проекту.");
      setIsLoading(false);
      return;
    }

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
        setError("Новин наразі не знайдено, але зв'язок з AI встановлено.");
      }
    } catch (err) {
      console.error("Data loading error:", err);
      setError("Помилка зв'язку з AI. Спробуйте оновити пізніше.");
    } finally {
      setIsLoading(false);
    }
  }, [newsService]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-theme pb-12">
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white border-l-4 border-blue-600 pl-4">
                Останні новини Черкащини
              </h2>
              <button 
                onClick={loadData}
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors flex items-center gap-1 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Оновити
              </button>
            </div>

            {error && (
              <div className="bg-white dark:bg-gray-800 border-l-4 border-amber-500 text-gray-800 dark:text-gray-200 p-6 rounded-xl mb-8 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1">Сповіщення</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    {error.includes("Redeploy") && (
                      <div className="space-y-2 text-sm text-gray-500 dark:text-gray-500">
                        <p>1. Перейдіть у вкладку <b>Deployments</b> на Vercel.</p>
                        <p>2. Натисніть <b>"..."</b> біля останнього пункту.</p>
                        <p>3. Оберіть <b>Redeploy</b>.</p>
                      </div>
                    )}
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

          <div className="w-full lg:w-80 space-y-8">
            <Sidebar weather={weather} sources={sources} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

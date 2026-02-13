
import React, { useState, useEffect, useCallback } from 'react';
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

  const newsService = React.useMemo(() => new GeminiNewsService(), []);

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
    } catch (err) {
      setError("Не вдалося завантажити останні новини. Спробуйте пізніше.");
    } finally {
      setIsLoading(false);
    }
  }, [newsService]);

  useEffect(() => {
    loadData();
    // Refresh every 15 minutes
    const interval = setInterval(loadData, 15 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content Area */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold text-gray-900 border-l-4 border-blue-600 pl-4">
                Останні новини
              </h2>
              <button 
                onClick={loadData}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Оновити
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
                {error}
              </div>
            )}

            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {news.length > 0 ? (
                  news.map((item) => (
                    <NewsCard key={item.id} news={item} />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center text-gray-500">
                    Наразі новин не знайдено. Будь ласка, оновіть сторінку.
                  </div>
                )}
              </div>
            )}

            {/* Pagination or Load More could go here */}
            {!isLoading && news.length > 0 && (
               <div className="mt-12 text-center">
                 <button className="px-8 py-3 bg-white border border-gray-200 rounded-full font-bold text-gray-900 shadow-sm hover:shadow-md transition-all active:scale-95">
                   Завантажити більше новин
                 </button>
               </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="w-full lg:w-80 space-y-8">
            <Sidebar weather={weather} sources={sources} />
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-xl font-bold text-gray-900 mb-2">ЧЕРКАСИ NEWS</div>
          <p className="text-sm text-gray-500 mb-6">Ваше головне джерело новин Черкащини</p>
          <div className="flex justify-center gap-6 mb-8">
            <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors font-medium">Про проект</a>
            <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors font-medium">Контакти</a>
            <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors font-medium">Реклама</a>
          </div>
          <div className="text-xs text-gray-400">
            © {new Date().getFullYear()} Черкаси Новини. Всі права захищені. 
            <br />Розроблено з використанням штучного інтелекту Google Gemini.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

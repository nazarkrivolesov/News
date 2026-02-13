
import React from 'react';
import { WeatherData, GroundingSource } from '../types';

interface SidebarProps {
  weather: WeatherData | null;
  sources: GroundingSource[];
}

const Sidebar: React.FC<SidebarProps> = ({ weather, sources }) => {
  return (
    <aside className="space-y-6">
      {/* Weather Widget */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-indigo-600 dark:to-indigo-900 rounded-2xl p-6 text-white shadow-lg border border-white/10">
        <h4 className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-4">Погода в Черкасах</h4>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold">{weather ? `${weather.temp}°C` : '--°C'}</div>
            <div className="text-sm opacity-90 mt-1">{weather ? weather.condition : 'Завантаження...'}</div>
          </div>
          <div className="text-5xl">
            {weather?.condition.toLowerCase().includes('сонц') ? '☀️' : '☁️'}
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-theme">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Ми в соцмережах</h4>
        <div className="space-y-3">
          <a href="https://t.me/cherkasy_life" target="_blank" className="flex items-center gap-3 p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors group">
            <span className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold">T</span>
            <div className="flex-1">
              <div className="font-bold text-sm">Telegram</div>
              <div className="text-xs opacity-70">Найшвидші новини</div>
            </div>
          </a>
          <a href="#" target="_blank" className="flex items-center gap-3 p-3 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors group">
            <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px]">IG</span>
            <div className="flex-1">
              <div className="font-bold text-sm">Instagram</div>
              <div className="text-xs opacity-70">Фото та відео подій</div>
            </div>
          </a>
        </div>
      </div>

      {/* Useful Sources */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-theme">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Корисні посилання</h4>
        <ul className="space-y-3">
          {sources.slice(0, 5).map((source, i) => (
            <li key={i}>
              <a 
                href={source.uri} 
                target="_blank" 
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-start gap-2 group"
              >
                <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-400 dark:bg-blue-500"></span>
                <span className="flex-1 line-clamp-2 leading-snug">{source.title}</span>
              </a>
            </li>
          ))}
          {sources.length === 0 && (
             <li className="text-sm text-gray-400 dark:text-gray-500 italic">Джерела уточнюються...</li>
          )}
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-xl border border-transparent dark:border-gray-800">
        <p className="text-[10px] text-gray-500 dark:text-gray-500 leading-relaxed uppercase font-medium">
          Інформація агрегується автоматично за допомогою ШІ Gemini. Завжди перевіряйте критичні новини в офіційних джерелах ДСНС та ОВА.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;

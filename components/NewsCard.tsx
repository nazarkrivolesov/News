
import React from 'react';
import { NewsItem } from '../types';

interface NewsCardProps {
  news: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'Політика': return 'bg-red-100 text-red-700';
      case 'Події': return 'bg-orange-100 text-orange-700';
      case 'Культура': return 'bg-purple-100 text-purple-700';
      case 'Спорт': return 'bg-green-100 text-green-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <article className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={news.imageUrl} 
          alt={news.title}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className={`absolute top-4 left-4 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getCategoryColor(news.category)}`}>
          {news.category}
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <span className="font-semibold text-blue-500 uppercase">{news.source}</span>
          <span>•</span>
          <span>{news.timestamp}</span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 leading-tight mb-3 hover:text-blue-600 cursor-pointer transition-colors">
          <a href={news.url} target="_blank" rel="noopener noreferrer">{news.title}</a>
        </h3>
        
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {news.summary}
        </p>
        
        <a 
          href={news.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          Читати повністю
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </article>
  );
};

export default NewsCard;

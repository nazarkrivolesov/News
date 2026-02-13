
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  timestamp: string;
  category: 'Політика' | 'Події' | 'Культура' | 'Спорт' | 'Життя';
  imageUrl?: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  location: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

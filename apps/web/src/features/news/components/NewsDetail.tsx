import React, { useEffect, useState } from 'react';
import { NewsItem } from '../../../types';

interface Props {
  id: string;
  lang: 'en' | 'ne';
  onBack: () => void;
}

const NewsDetail: React.FC<Props> = ({ id, lang, onBack }) => {
  const [news, setNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    fetch(`/api/news/${id}`)
      .then(res => res.json())
      .then(data => setNews(data));
  }, [id]);

  if (!news) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <button onClick={onBack} className="mb-8 text-slate-500 hover:text-slate-900 flex items-center gap-2">
        ← {lang === 'en' ? 'Back to News' : 'समाचारमा फर्कनुहोस्'}
      </button>
      <h1 className="text-4xl md:text-5xl font-black mb-6">{news.title}</h1>
      {news.imageUrl && <img src={news.imageUrl} alt={news.title} className="w-full h-96 object-cover rounded-3xl mb-10" />}
      <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed">
        {news.content}
      </div>
    </div>
  );
};

export default NewsDetail;


import React, { useState, useEffect, useMemo } from 'react';
import { NewsItem } from '../../../types/index';
import { optimizeImage } from '../../../utils/imageOptimizer';

interface NewsCardProps {
  news: NewsItem;
  featured?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, featured }) => {
  // displayUrl holds the optimized data URL for featured items
  const [displayUrl, setDisplayUrl] = useState<string>(news.imageUrl);

  // Memoize share parameters for performance
  const { shareUrl, shareText } = useMemo(() => ({
    shareUrl: encodeURIComponent(`${window.location.origin}/news/${news.id || news._id}`),
    shareText: encodeURIComponent(news.title)
  }), [news.id, news._id, news.title]);

  useEffect(() => {
    // Process image optimization only for featured cards that aren't already data URLs
    if (featured && news.imageUrl && !news.imageUrl.startsWith('data:')) {
      const processFeaturedImage = async () => {
        try {
          const response = await fetch(news.imageUrl);
          if (!response.ok) throw new Error('Failed to fetch source image');
          const blob = await response.blob();
          const file = new File([blob], "news_image.webp", { type: blob.type });
          
          // Apply optimization: 1200px max width at 0.7 quality for high-impact hero images
          const optimized = await optimizeImage(file, 1200, 0.7);
          setDisplayUrl(optimized);
        } catch (err) {
          console.warn("Featured image optimization fallback to original:", err);
          setDisplayUrl(news.imageUrl);
        }
      };
      processFeaturedImage();
    }
  }, [news.imageUrl, featured]);

  const handleShare = (e: React.MouseEvent, platform: 'fb' | 'tw' | 'wa') => {
    e.stopPropagation();
    let url = '';
    switch (platform) {
      case 'fb': url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`; break;
      case 'tw': url = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`; break;
      case 'wa': url = `https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`; break;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const ShareButtons = ({ light }: { light?: boolean }) => (
    <div className="flex items-center gap-1.5 md:gap-2">
      <button 
        onClick={(e) => handleShare(e, 'fb')}
        className={`w-8 h-8 md:w-9 md:h-9 rounded-xl transition-all hover:scale-110 active:scale-90 flex items-center justify-center ${light ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#1877F2]'}`}
        aria-label="Share Facebook"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      </button>
      <button 
        onClick={(e) => handleShare(e, 'wa')}
        className={`w-8 h-8 md:w-9 md:h-9 rounded-xl transition-all hover:scale-110 active:scale-90 flex items-center justify-center ${light ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#25D366]'}`}
        aria-label="Share WhatsApp"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.558 0 11.897-5.335 11.9-11.894a11.83 11.83 0 00-3.481-8.417z"/></svg>
      </button>
    </div>
  );

  if (featured) {
    return (
      <div className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] bg-slate-900 group cursor-pointer shadow-xl aspect-[3/4] sm:aspect-video border-2 md:border-4 border-white">
        <img 
          src={displayUrl} 
          alt={news.title} 
          className="absolute inset-0 w-full h-full object-cover opacity-60 md:opacity-80 transition-transform duration-1000 group-hover:scale-105" 
          loading="eager" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-6 md:p-12 flex flex-col justify-end">
          <div className="flex justify-between items-start mb-auto">
            <span className="bg-green-600 text-white px-3 md:px-5 py-1.5 md:py-2 rounded-lg md:rounded-2xl text-[9px] md:text-xs font-black uppercase tracking-widest shadow-lg">{news.category}</span>
            <div className="xs:block">
              <ShareButtons light />
            </div>
          </div>
          <div>
            <h2 className="text-xl md:text-5xl font-black text-white mb-2 md:mb-5 news-serif leading-tight tracking-tight line-clamp-3">{news.title}</h2>
            <p className="hidden md:block text-slate-200 text-lg line-clamp-3 font-medium leading-relaxed max-w-3xl mb-8 opacity-90">{news.excerpt}</p>
            <div className="flex items-center gap-3 md:gap-5 text-white/70 text-[9px] md:text-[11px] uppercase font-black tracking-[0.2em] border-t border-white/10 pt-4 md:pt-6">
              <span className="flex items-center gap-2 text-white truncate"><span className="opacity-50 text-xs md:text-sm">👤</span> {news.author}</span>
              <span className="w-1 h-1 bg-green-500 rounded-full shrink-0"></span>
              <span className="flex items-center gap-2"><span className="opacity-50 text-xs md:text-sm">📅</span> {news.date}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-500 group flex flex-col h-full hover:-translate-y-1">
      <div className="aspect-[16/10] overflow-hidden bg-slate-50 relative">
        <img 
          src={news.imageUrl} 
          alt={news.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
          loading="lazy" 
        />
        <div className="absolute top-3 right-3">
           <div className="bg-white/80 backdrop-blur-md p-1 rounded-xl shadow-sm border border-white/20">
             <ShareButtons />
           </div>
        </div>
      </div>
      <div className="p-5 md:p-8 flex-1 flex flex-col">
        <span className="text-green-600 text-[9px] md:text-[10px] font-black mb-2 md:mb-3 uppercase tracking-[0.2em] block">{news.category}</span>
        <h3 className="text-lg md:text-2xl font-black text-slate-900 mb-2 md:mb-4 news-serif leading-tight line-clamp-2 group-hover:text-green-700 transition-colors">{news.title}</h3>
        <p className="text-slate-500 text-[11px] md:text-sm line-clamp-2 md:line-clamp-3 leading-relaxed mb-6 md:mb-8 font-medium opacity-80">{news.excerpt}</p>
        
        <div className="flex items-center justify-between mt-auto pt-4 md:pt-6 border-t border-slate-50">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-slate-100 rounded-lg md:rounded-full flex items-center justify-center text-[9px] font-black text-slate-400">
              {news.author.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-700 text-[9px] md:text-[10px] uppercase tracking-wider truncate max-w-[80px] md:max-w-[120px]">{news.author}</span>
              <span className="text-[9px] md:text-[10px] text-slate-400 font-bold">{news.date}</span>
            </div>
          </div>
          <button className="text-slate-300 group-hover:text-green-600 transition-transform hover:translate-x-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;

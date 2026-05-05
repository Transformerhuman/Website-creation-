
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, NewsItem, User } from '../types/index';
import Navbar from '../components/layout/Navbar';
import NewsCard from '../features/news/components/NewsCard';
import NewsDetail from '../features/news/components/NewsDetail';
import ExpertLive from '../features/others/components/ExpertLive';
import Helpline from '../features/others/components/Helpline';
import AgriMarket from '../features/products/components/AgriMarket';
import PartnerHub from '../features/others/components/PartnerHub';
import GovSchemes from '../features/others/components/GovSchemes';
import AdminPanel from '../features/auth/components/AdminPanel';
import MarketTicker from '../features/products/components/MarketTicker';
import AdminLogin from '../features/auth/components/AdminLogin';
import AboutUs from '../features/others/components/AboutUs';
import ContactUs from '../features/others/components/ContactUs';
import CorporateFarming from '../features/others/components/CorporateFarming';
import WeatherPopup from '../features/others/components/WeatherPopup';
import Footer from '../components/layout/Footer';
import UserAuth from '../features/auth/components/UserAuth';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { NewsSkeleton, MarketTickerSkeleton } from '../components/common/Skeleton';
import SEO from '../components/common/SEO';
import { useTranslation } from 'react-i18next';

const App: React.FC = () => {
  const { i18n } = useTranslation();
  const [view, setView] = useState<View>('news');
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ap_user_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [isOwner, setIsOwner] = useState(() => !!localStorage.getItem('ap_admin_token'));
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [cartCount, setCartCount] = useState(() => {
    const saved = localStorage.getItem('ap_cart_count');
    return saved ? parseInt(saved) : 0;
  });
  
  const weatherRef = useRef<HTMLDivElement>(null);
  const API_BASE = '/api';

  const fetchData = useCallback(async () => {
    setLoading(true);
    const correlationId = crypto.randomUUID();
    try {
      const newsRes = await fetch(`${API_BASE}/news`, {
        headers: { 'x-correlation-id': correlationId }
      });
      if (newsRes.ok) {
        const data = await newsRes.json();
        setAllNews(data.items || data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [API_BASE]);

  useEffect(() => {
    localStorage.setItem('ap_cart_count', cartCount.toString());
  }, [cartCount]);

  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem('ap_admin_token');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/auth/verify`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          localStorage.removeItem('ap_admin_token');
          setIsOwner(false);
        }
      } catch (err) {
        // Keep offline if network fails, but maybe clear if it's a 401
      }
    };
    verifyAdmin();
  }, [API_BASE]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [view, selectedNewsId]);

  const handleUserLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('ap_user_data', JSON.stringify(u));
    setShowAuthModal(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ap_user_data');
  };

  const openNewsDetail = (id: string) => {
    setSelectedNewsId(id);
    setView('news-detail' as any);
  };

  return (
    <ErrorBoundary>
      <SEO lang={i18n.language as any} />
      <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-green-100">
      {showLoginModal && (
        <AdminLogin 
          lang={i18n.language as any} 
          onClose={() => setShowLoginModal(false)} 
          onLogin={(s: boolean) => { if(s) { setIsOwner(true); setView('admin'); setShowLoginModal(false); } }} 
        />
      )}
      
      {showAuthModal && <UserAuth lang={i18n.language as any} onClose={() => setShowAuthModal(false)} onSuccess={handleUserLogin} />}

      <div className="bg-slate-900 text-slate-300 py-2.5 px-4 text-[10px] md:text-[11px] font-bold z-[110] relative">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 relative">
             {/* Restored Partner Hub indicator */}
             <button 
                onClick={() => setView('partners')}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded-full uppercase tracking-tighter flex items-center gap-2 transition-all active:scale-95"
              >
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                {i18n.language === 'en' ? 'Partner Hub' : 'पार्टनर हब'}
              </button>
             
             <div ref={weatherRef} className="relative">
                <button 
                  onClick={() => setShowWeather(!showWeather)}
                  className={`px-3 py-1 rounded-full uppercase tracking-tighter flex items-center gap-2 transition-all active:scale-95 ${showWeather ? 'bg-white text-slate-900' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}
                >
                  <span className="text-xs">🌦️</span>
                  {i18n.language === 'en' ? 'Live Weather' : 'ताजा मौसम'}
                </button>
                {showWeather && (
                  <WeatherPopup lang={i18n.language as any} onClose={() => setShowWeather(false)} />
                )}
             </div>
          </div>
          
          <div className="flex gap-4 items-center">
            {user ? (
               <div className="flex items-center gap-3">
                 <span className="text-green-400 uppercase tracking-widest text-[9px]">{user.fullName}</span>
                 <button onClick={logout} className="opacity-50 hover:opacity-100 text-[9px]">LOGOUT</button>
               </div>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="uppercase text-[9px] tracking-widest hover:text-white transition-all">Sign Up</button>
            )}
            <button onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ne' : 'en')} className="uppercase px-2 py-1 bg-white/5 rounded-md text-[10px] hover:bg-white/10 transition-all">{i18n.language === 'en' ? 'NEP' : 'ENG'}</button>
            <button onClick={() => isOwner ? setView('admin') : setShowLoginModal(true)} className="uppercase text-[10px] tracking-wider hover:text-white transition-all">{isOwner ? 'Dashboard' : 'Admin Access'}</button>
          </div>
        </div>
      </div>

      <Navbar currentView={view === 'news-detail' ? 'news' : view} setView={setView} cartCount={cartCount} />
      
      <main className="flex-grow animate-in fade-in duration-700 ease-in-out">
        {view === 'news' && (
          <div className="max-w-7xl mx-auto px-4 py-10">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-12">
                   <h2 className="text-4xl md:text-6xl font-black news-serif">{i18n.language === 'en' ? 'Latest Updates' : 'ताजा अपडेटहरू'}</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {loading ? (
                        [1, 2, 3].map(i => <NewsSkeleton key={i} />)
                      ) : (
                        allNews.map((n, idx: number) => (
                          <div key={n._id} onClick={() => openNewsDetail(n._id!)} className={`cursor-pointer ${idx === 0 ? "md:col-span-2" : ""}`}>
                            <NewsCard news={n} featured={idx === 0} />
                          </div>
                        ))
                      )}
                   </div>
                </div>
                <aside className="lg:col-span-4 space-y-8">
                   {loading ? <MarketTickerSkeleton /> : <MarketTicker lang={i18n.language as any} />}
                   
                   {/* Restored Farmer Support sidebar box */}
                   <div className="bg-green-700 p-10 rounded-[2.5rem] text-white shadow-xl shadow-green-200/50 relative overflow-hidden group">
                      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                      <h4 className="font-black news-serif text-xl mb-4 relative z-10">{i18n.language === 'en' ? 'Farmer Support' : 'किसान सहयोग'}</h4>
                      <p className="text-xs text-green-100 mb-8 opacity-80 relative z-10 leading-relaxed">{i18n.language === 'en' ? 'Connected to local JTA experts. Direct help line for pest, soil and yield queries.' : 'स्थानीय JTA विज्ञहरूसँग जोडिएको। कीरा, माटो र उत्पादन सम्बन्धी जिज्ञासाको लागि सिधा हेल्पलाइन।'}</p>
                      <button 
                        onClick={() => setView('helpline')} 
                        className="w-full bg-white text-green-800 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-lg relative z-10"
                      >
                        {i18n.language === 'en' ? 'Contact Helpdesk' : 'हेल्पडेस्कमा सम्पर्क गर्नुहोस्'}
                      </button>
                   </div>
                </aside>
             </div>
          </div>
        )}

        {(view as any) === 'news-detail' && selectedNewsId && (
          <NewsDetail id={selectedNewsId} lang={i18n.language as any} onBack={() => setView('news')} />
        )}

        {view === 'shop' && <AgriMarket lang={i18n.language as any} user={user} onUserLogin={handleUserLogin} onCartChange={setCartCount} />}
        {view === 'partners' && <PartnerHub lang={i18n.language as any} />}
        {view === 'corporate' && <CorporateFarming lang={i18n.language as any} />}
        {view === 'admin' && isOwner && <AdminPanel lang={i18n.language as any} />}
        {view === 'expert-live' && <ExpertLive lang={i18n.language as any} />}
        {view === 'helpline' && <Helpline onAddRequest={() => fetchData()} lang={i18n.language as any} />}
        {view === 'schemes' && <GovSchemes lang={i18n.language as any} />}
        {view === 'about' && <AboutUs lang={i18n.language as any} />}
        {view === 'contact' && <ContactUs lang={i18n.language as any} />}
      </main>

      <Footer setView={setView} lang={i18n.language as any} />
      </div>
    </ErrorBoundary>
  );
};

export default App;


import React, { useState, useEffect } from 'react';
import { LIVE_STREAMS } from '../../../constants';
import { StreamSession } from '../../../types/index';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';

const ExpertLive: React.FC<{ lang: 'en' | 'ne' }> = ({ lang }) => {
  const [streams, setStreams] = useState<StreamSession[]>([]);
  const [activeStream, setActiveStream] = useState<StreamSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [posted, setPosted] = useState(false);

  const t = {
    en: {
      title: 'Expert Support Hub',
      subtitle: 'Official JTA & VET Technical Guidance',
      live: 'Live Session',
      upcoming: 'Scheduled Sessions',
      manualAdvisory: 'Submit Technical Inquiry',
      manualDesc: 'Our officers will review your case and provide manual feedback via phone.'
    },
    ne: {
      title: 'विज्ञ सहयोग हब',
      subtitle: 'आधिकारिक JTA र VET प्राविधिक मार्गदर्शन',
      live: 'लाइभ सेसन',
      upcoming: 'तालिकाहरू',
      manualAdvisory: 'प्राविधिक जिज्ञासा पठाउनुहोस्',
      manualDesc: 'हाम्रा अधिकारीहरूले तपाईंको केस समीक्षा गर्नेछन् र फोन मार्फत म्यानुअल प्रतिक्रिया प्रदान गर्नेछन्।'
    }
  }[lang];

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const res = await fetch(`${API_BASE}/live-streams`);
        const data = res.ok ? await res.json() : [];
        const final = data.length > 0 ? data : LIVE_STREAMS;
        setStreams(final);
        setActiveStream(final.find((s: StreamSession) => s.status === 'live') || final[0]);
      } catch (err) { setStreams(LIVE_STREAMS); }
      finally { setLoading(false); }
    };
    fetchStreams();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-slate-900 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-black news-serif mb-4">{t.title}</h1>
        <p className="text-slate-400 font-medium max-w-2xl mx-auto">{t.subtitle}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {activeStream ? (
               <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100">
                  <div className="aspect-video bg-black relative">
                    <img src={activeStream.thumbnail} className="w-full h-full object-cover opacity-60" alt="Thumbnail" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-3xl">▶</div>
                    </div>
                  </div>
                  <div className="p-10">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{activeStream.status === 'live' ? 'LIVE NOW' : 'SCHEDULED'}</span>
                    <h2 className="text-2xl font-black news-serif text-slate-900 mt-4">{activeStream.title}</h2>
                    <p className="text-slate-500 font-bold text-xs mt-2 uppercase tracking-wider">{activeStream.expertName} • {activeStream.specialization}</p>
                    
                    <div className="mt-10 pt-10 border-t border-slate-100">
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        Live Session Queries
                      </h3>
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-full shrink-0"></div>
                          <div className="bg-slate-50 p-4 rounded-2xl flex-1">
                            <p className="text-xs font-bold text-slate-900 mb-1">Ram Bahadur <span className="text-[10px] text-slate-400 ml-2">Just now</span></p>
                            <p className="text-sm text-slate-600">Sir, my tomato plants are showing yellow spots. Is it blight?</p>
                          </div>
                        </div>
                        
                        <div className="pt-4">
                           {posted ? (
                             <div className="bg-green-50 p-6 rounded-[2rem] text-center border border-green-100">
                               <p className="text-green-700 font-black text-sm uppercase tracking-widest">{lang === 'en' ? 'Query Posted Successfully!' : 'प्रश्न सफलतापूर्वक पोस्ट गरियो!'}</p>
                               <button onClick={() => setPosted(false)} className="text-[10px] text-green-600 font-bold hover:underline mt-2">Post another</button>
                             </div>
                           ) : (
                             <>
                               <textarea 
                                 placeholder={lang === 'en' ? "Post your problem or question..." : "आफ्नो समस्या वा प्रश्न यहाँ लेख्नुहोस्..."}
                                 className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-slate-900/5 font-medium text-sm resize-none"
                                 rows={3}
                                 value={query}
                                 onChange={e => setQuery(e.target.value)}
                               ></textarea>
                               <div className="flex justify-end mt-4">
                                 <button 
                                   onClick={() => { if(query) setPosted(true); setQuery(''); }}
                                   className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-black transition-all"
                                 >
                                   Post Query
                                 </button>
                               </div>
                             </>
                           )}
                         </div>
                      </div>
                    </div>
                  </div>
               </div>
            ) : null}

            <div>
              <h3 className="text-xl font-black news-serif mb-6 text-slate-800">{t.upcoming}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {streams.filter(s => s.status !== 'live').map(s => (
                  <button key={s.id} onClick={() => setActiveStream(s)} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-4 text-left hover:border-slate-900 transition-all">
                    <img src={s.thumbnail} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                    <div className="min-w-0">
                      <p className="text-[8px] font-black text-blue-600 uppercase mb-1">{s.startTime}</p>
                      <h4 className="font-bold text-sm text-slate-900 truncate">{s.title}</h4>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
             <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-lg text-center lg:sticky lg:top-24">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">📝</div>
                <h3 className="text-xl font-black news-serif mb-2">{t.manualAdvisory}</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8">{t.manualDesc}</p>
                <div className="space-y-4">
                   <div className="flex items-center gap-3 justify-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Officers Online: 4</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertLive;

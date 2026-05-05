
import React, { useState, useEffect } from 'react';
import { AboutUsContent } from '../../../types/index';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';

const AboutUs: React.FC<{ lang: 'en' | 'ne' }> = ({ lang }) => {
  const [content, setContent] = useState<AboutUsContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await fetch(`${API_BASE}/about`);
        if (res.ok) {
          setContent(await res.json());
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAbout();
  }, [API_BASE]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const active = content?.[lang] || {
    title: 'AgroPulse Nepal',
    subtitle: 'Nepal\'s Largest Digital Agri-Network',
    missionTitle: 'Our Mission',
    missionText: 'Empowering independent farmers through modern digital tools.',
    visionTitle: 'Our Vision',
    visionText: 'A fully self-reliant agrarian Nepal.',
    valuesTitle: 'Core Values',
    val1: 'Trust', val1Text: 'Verified Data Only',
    val2: 'Prosperity', val2Text: 'Farmer Growth First',
    val3: 'Innovation', val3Text: 'Modern Tech Bridge'
  };

  return (
    <div className="bg-white min-h-screen animate-in fade-in duration-700">
      <div className="bg-slate-900 py-32 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-7xl font-black text-white news-serif mb-6">{active.title}</h1>
          <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto opacity-80">{active.subtitle}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 border-l-8 border-green-600 pl-8 news-serif">{active.missionTitle}</h2>
            <p className="text-xl text-slate-500 leading-relaxed font-medium opacity-80">{active.missionText}</p>
          </div>
          <div className="rounded-[3rem] overflow-hidden shadow-2xl bg-slate-100 aspect-video">
            <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80" alt="Mission" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { emoji: '🤝', title: active.val1, text: active.val1Text },
              { emoji: '💎', title: active.val2, text: active.val2Text },
              { emoji: '🚜', title: active.val3, text: active.val3Text }
            ].map((v, i) => (
              <div key={i} className="bg-slate-50 p-12 rounded-[2.5rem] text-center border border-slate-100 hover:shadow-xl transition-all">
                <div className="text-5xl mb-8">{v.emoji}</div>
                <h4 className="font-black text-2xl mb-4 text-slate-900">{v.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{v.text}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AboutUs;

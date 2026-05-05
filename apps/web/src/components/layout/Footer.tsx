
import React from 'react';
import { View } from '../../types';

interface FooterProps {
  setView: (view: View) => void;
  lang: 'en' | 'ne';
}

const Footer: React.FC<FooterProps> = ({ setView, lang }) => {
  const t = {
    en: {
      about: 'About Portal',
      desc: 'Nepal\'s premier agricultural datacenter providing real-time news, market insights, and digital trade solutions.',
      explore: 'Explore Portal',
      official: 'Official Links',
      contact: 'Contact Support',
      moald: 'MoALD Nepal',
      dept: 'Dept. of Agriculture',
      kalimati: 'Kalimati Market Board',
      news: 'Agri-News',
      market: 'Digital Market',
      partners: 'Partner Hub',
      schemes: 'Govt Schemes',
      address: 'Hariharbhawan, Lalitpur',
      rights: 'AgroPulse Nepal Datacenter • All Rights Reserved'
    },
    ne: {
      about: 'पोर्टलको बारेमा',
      desc: 'वास्तविक समय समाचार, बजार अन्तरदृष्टि, र डिजिटल व्यापार समाधानहरू प्रदान गर्ने नेपालको प्रमुख कृषि डाटासेन्टर।',
      explore: 'पोर्टल अन्वेषण',
      official: 'आधिकारिक लिङ्कहरू',
      contact: 'सम्पर्क सहयोग',
      moald: 'कृषि तथा पशुपन्छी विकास मन्त्रालय',
      dept: 'कृषि विभाग',
      kalimati: 'कालिमाटी फलफूल तथा तरकारी बजार',
      news: 'कृषि समाचार',
      market: 'डिजिटल बजार',
      partners: 'साझेदार हब',
      schemes: 'सरकारी योजनाहरू',
      address: 'हरिहरभवन, ललितपुर',
      rights: 'एग्रोपल्स नेपाल डाटासेन्टर • सबै अधिकार सुरक्षित'
    }
  }[lang];

  return (
    <footer className="bg-slate-950 text-slate-400 py-20 px-6 border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-[0.03] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 relative z-10">
        {/* Column 1: Identity */}
        <div className="space-y-8">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setView('news')}>
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-green-900/20 transition-transform group-hover:scale-110">
              <span className="text-white font-black text-xl">A</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-tighter leading-none uppercase">AgroPulse</span>
              <span className="text-[8px] uppercase font-black text-green-500 tracking-[0.3em] mt-1">Nepal Portal</span>
            </div>
          </div>
          <p className="text-sm font-medium leading-relaxed opacity-70">
            {t.desc}
          </p>
          <div className="pt-4 flex items-center gap-3">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Node Cluster: AP-KTM-01 Active</span>
          </div>
        </div>

        {/* Column 2: Explore */}
        <div>
          <h4 className="text-white font-black news-serif text-lg mb-8">{t.explore}</h4>
          <ul className="space-y-4">
            {[
              { id: 'news', label: t.news },
              { id: 'shop', label: t.market },
              { id: 'partners', label: t.partners },
              { id: 'schemes', label: t.schemes },
              { id: 'about', label: lang === 'en' ? 'About Us' : 'हाम्रो बारेमा' }
            ].map(link => (
              <li key={link.id}>
                <button 
                  onClick={() => setView(link.id as View)}
                  className="text-sm font-bold hover:text-green-400 transition-colors uppercase tracking-wider text-left"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Official Links */}
        <div>
          <h4 className="text-white font-black news-serif text-lg mb-8">{t.official}</h4>
          <ul className="space-y-4">
            <li>
              <a href="https://moald.gov.np" target="_blank" rel="noopener noreferrer" className="text-sm font-bold hover:text-green-400 transition-colors uppercase tracking-wider block">
                🏛️ {t.moald}
              </a>
            </li>
            <li>
              <a href="https://doanepal.gov.np" target="_blank" rel="noopener noreferrer" className="text-sm font-bold hover:text-green-400 transition-colors uppercase tracking-wider block">
                🚜 {t.dept}
              </a>
            </li>
            <li>
              <a href="https://kalimatimarket.gov.np" target="_blank" rel="noopener noreferrer" className="text-sm font-bold hover:text-green-400 transition-colors uppercase tracking-wider block">
                📊 {t.kalimati}
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact */}
        <div>
          <h4 className="text-white font-black news-serif text-lg mb-8">{t.contact}</h4>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
               <span className="text-xl">📍</span>
               <p className="text-sm font-bold text-slate-300">{t.address}</p>
            </div>
            <div className="flex items-start gap-4">
               <span className="text-xl">📞</span>
               <p className="text-sm font-bold text-slate-300">+977-1-5521148</p>
            </div>
            <div className="flex items-start gap-4">
               <span className="text-xl">📧</span>
               <p className="text-sm font-bold text-slate-300">support@agropulse.com.np</p>
            </div>
            <button 
              onClick={() => setView('contact')}
              className="mt-4 px-6 py-3 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-slate-900 transition-all"
            >
              Contact Department
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
          © 2024 {t.rights}
        </p>
        <div className="flex gap-6">
          {['fb', 'tw', 'wa', 'in'].map(social => (
            <button key={social} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-green-600 transition-all flex items-center justify-center text-white text-xs opacity-50 hover:opacity-100 uppercase font-black">
              {social}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

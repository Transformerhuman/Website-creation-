
import React, { useState, useEffect } from 'react';
import { View } from '../../types/index';
import { useTranslation } from 'react-i18next';

interface NavbarProps {
  currentView: View;
  setView: (view: View) => void;
  cartCount?: number;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, cartCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const handleNav = (view: View) => {
    setView(view);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (isMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isMenuOpen]);

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-[42px] md:top-0 z-[100] shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => handleNav('news')}>
            <div className="w-9 h-9 md:w-11 md:h-11 bg-green-600 rounded-xl flex items-center justify-center shrink-0 transition-transform group-active:scale-90 shadow-lg shadow-green-200">
              <span className="text-white font-black text-lg md:text-2xl">A</span>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-lg md:text-2xl font-black text-slate-900 tracking-tighter leading-none group-hover:text-green-700 transition-colors">AgroPulse</span>
              <span className="text-[8px] md:text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] hidden xs:block mt-0.5">Nepal Portal</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {[
              { id: 'news', label: t('nav.news') },
              { id: 'expert-live', label: t('nav.advice'), icon: '👨‍🌾' },
              { id: 'shop', label: t('nav.market'), icon: '🛒' },
              { id: 'schemes', label: t('nav.schemes'), icon: '📜' },
              { id: 'corporate', label: t('nav.corporate'), icon: '🏢' },
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => setView(item.id as View)}
                className={`px-3 lg:px-4 py-2 text-[11px] lg:text-[12px] font-black transition-all rounded-xl uppercase tracking-wider whitespace-nowrap active:scale-95 flex items-center gap-1.5 relative ${currentView === item.id ? 'bg-green-50 text-green-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                {item.icon && <span>{item.icon}</span>}
                {item.label}
                {item.id === 'shop' && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-md">
                    {cartCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`w-10 h-10 flex items-center justify-center transition-all rounded-xl active:scale-90 ${isMenuOpen ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
            >
              {isMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[120] transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMenuOpen(false)} />
      
      <div className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white z-[130] shadow-2xl transition-transform duration-500 ease-out flex flex-col md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 flex justify-between items-center border-b border-slate-50">
           <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center text-white font-black text-xl">A</div>
              <span className="font-black text-slate-900 tracking-tight">AgroPulse</span>
           </div>
           <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 active:scale-90">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {[
            { id: 'news', label: t('nav.news'), icon: '📰' },
            { id: 'expert-live', label: t('nav.advice'), icon: '👨‍🌾' },
            { id: 'shop', label: t('nav.market'), icon: '🛒' },
            { id: 'schemes', label: t('nav.schemes'), icon: '📜' },
            { id: 'corporate', label: t('nav.corporate'), icon: '🏢' },
            { id: 'contact', label: t('nav.contact') || 'Contact', icon: '📞' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => handleNav(item.id as View)}
              className={`w-full text-left px-5 py-4 rounded-xl font-black text-[13px] transition-all flex items-center gap-4 uppercase tracking-widest active:bg-slate-200 ${currentView === item.id ? 'bg-green-600 text-white shadow-lg' : 'bg-slate-50 text-slate-700'}`}
            >
              <span className="text-xl w-8 text-center">{item.icon}</span>
              {item.label}
              {item.id === 'shop' && cartCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-auto">
                  {cartCount} {t('common.items')}
                </span>
              )}
            </button>
          ))}
          <button 
            onClick={() => handleNav('admin' as any)}
            className="w-full text-left px-5 py-4 rounded-xl font-black text-[13px] transition-all flex items-center gap-4 uppercase tracking-widest bg-slate-900 text-white shadow-xl mt-4"
          >
            <span className="text-xl w-8 text-center">🔐</span>
            Admin Access
          </button>
        </div>
        <div className="p-6 border-t border-slate-50 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">AgroPulse Nepal Portal</p>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

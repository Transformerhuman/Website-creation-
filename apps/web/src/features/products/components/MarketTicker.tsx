
import React, { useState, useEffect } from 'react';
import { MarketPrice } from '../../../types/index';
import { MARKET_PRICES } from '../../../constants';

const API_BASE = '/api';

const MarketTicker: React.FC<{lang: 'en' | 'ne'}> = ({ lang }) => {
  const [open, setOpen] = useState(false);
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  
  const t = {
    en: { title: 'Kalimati Rates', item: 'Item', unit: 'Unit', avg: 'Avg Price (Rs.)', more: 'View Today\'s Rates' },
    ne: { title: 'कालिमाटी दर', item: 'वस्तु', unit: 'इकाइ', avg: 'औसत दर (रु.)', more: 'आजको दर हेर्नुहोस्' }
  }[lang];

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch(`${API_BASE}/market-prices`);
        if (res.ok) {
          const data = await res.json();
          setPrices(data.length > 0 ? data : MARKET_PRICES);
        } else {
          setPrices(MARKET_PRICES);
        }
      } catch (err) {
        setPrices(MARKET_PRICES);
      }
    };
    fetchPrices();
  }, []);

  return (
    <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden group">
      <button 
        onClick={() => setOpen(!open)}
        className={`w-full px-5 md:px-6 py-4 md:py-5 flex justify-between items-center text-left transition-colors ${open ? 'bg-slate-900 text-white' : 'bg-green-50/30 hover:bg-green-50'}`}
      >
        <div className="flex items-center gap-3">
          <span className={`text-lg md:text-xl transition-transform duration-500 ${open ? 'scale-110' : ''}`}>📊</span>
          <div className="flex flex-col">
            <h3 className={`font-black uppercase tracking-[0.1em] text-[10px] md:text-[11px] ${open ? 'text-green-400' : 'text-green-800'}`}>{t.title}</h3>
            <span className={`text-[8px] md:text-[9px] font-bold ${open ? 'text-slate-500' : 'text-slate-400'}`}>Official Live Data</span>
          </div>
        </div>
        <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all ${open ? 'bg-white/10 rotate-180' : 'bg-white shadow-sm rotate-0'}`}>
          <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
        </div>
      </button>

      {open && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-5 md:px-6 py-3 text-left font-black">{t.item}</th>
                  <th className="px-5 md:px-6 py-3 text-right font-black">{t.avg}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {prices.map((m, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 md:px-6 py-3.5 text-slate-900 font-bold">{lang === 'ne' ? m.commodityNe : m.commodity}</td>
                    <td className="px-5 md:px-6 py-3.5 text-right text-green-700 font-black">Rs. {m.avgPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 md:p-6 bg-slate-50/50 border-t border-slate-50 flex justify-center">
             <button className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-green-600 transition-colors">Full Report →</button>
          </div>
        </div>
      )}
      {!open && (
        <div className="px-6 py-2 md:py-3 text-center border-t border-slate-50 bg-slate-50/10">
          <p className="text-[8px] md:text-[9px] text-slate-300 font-black uppercase tracking-[0.3em]">{t.more}</p>
        </div>
      )}
    </div>
  );
};

export default MarketTicker;

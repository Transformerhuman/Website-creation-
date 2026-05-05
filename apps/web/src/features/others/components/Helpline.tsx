
import React, { useState } from 'react';
import { HelplineRequest } from '../../../types/index';

interface HelplineProps {
  onAddRequest: (req: HelplineRequest) => void;
  lang: 'en' | 'ne';
}

const Helpline: React.FC<HelplineProps> = ({ onAddRequest, lang }) => {
  const [formState, setFormState] = useState({ name: '', phone: '', email: '', query: '', category: 'technical' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = {
    en: {
      title: "Department Helpline",
      desc: "Our team at the Department of Agriculture is available 24/7 to listen to suggestions and provide technical support.",
      send: "Send a Suggestion",
      successTitle: "Submission Received",
      successDesc: "Your feedback has been successfully routed to the department support mail:",
      supportMail: "nepagri6@gmail.com",
      routing: "Routing message...",
      submitBtn: "Submit Suggestion",
      emailLabel: "Email Address"
    },
    ne: {
      title: "विभाग हेल्पलाइन",
      desc: "कृषि विभागको टोली तपाईंका सुझाव सुन्न र प्राविधिक सहयोग प्रदान गर्न २४/७ उपलब्ध छ।",
      send: "सुझाव पठाउनुहोस्",
      successTitle: "पेश गरियो",
      successDesc: "तपाईंको प्रतिक्रिया सफलतापूर्वक विभागको आधिकारिक इमेलमा पठाइएको छ:",
      supportMail: "nepagri6@gmail.com",
      routing: "सन्देश पठाउँदै...",
      submitBtn: "सुझाव बुझाउनुहोस्",
      emailLabel: "इमेल ठेगाना"
    }
  }[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/helpline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState)
      });
      if (res.ok) {
        setSubmitted(true);
        setFormState({ name: '', phone: '', email: '', query: '', category: 'technical' });
        // Optional: onAddRequest if you want local update
        onAddRequest({ id: Date.now().toString(), ...formState, date: new Date().toLocaleString() });
      } else {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-16 px-4 md:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
        <div className="space-y-6 md:space-y-8">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 news-serif tracking-tight leading-tight">{t.title}</h2>
          <p className="text-base md:text-xl text-slate-600 leading-relaxed opacity-80">{t.desc}</p>
          
          <div className="space-y-4 md:space-y-5">
            <div className="flex items-center gap-4 p-5 md:p-6 bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-100">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 text-2xl shrink-0">📞</div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs text-slate-400 font-black uppercase tracking-widest">Toll Free</p>
                <p className="text-lg md:text-2xl font-black text-slate-900 truncate">1148 / 1800-425-1666</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-5 md:p-6 bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-100">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-2xl shrink-0">📧</div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs text-slate-400 font-black uppercase tracking-widest">Support Email</p>
                <p className="text-lg md:text-2xl font-black text-slate-900 truncate">{t.supportMail}</p>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-amber-50 rounded-[1.5rem] md:rounded-[2.5rem] border border-amber-100 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-200/20 rounded-full blur-xl"></div>
              <h4 className="font-black text-amber-900 text-base md:text-lg mb-2 relative z-10">Emergency Pest Alert?</h4>
              <p className="text-xs md:text-sm text-amber-800 leading-relaxed opacity-90 relative z-10">If you detect Locust or Armyworm outbreaks, call the emergency hotline immediately.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl p-6 md:p-12 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16"></div>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 md:mb-8 news-serif relative z-10">{t.send}</h3>
          
          {submitted ? (
            <div className="bg-green-50 text-green-800 p-8 md:p-12 rounded-[2rem] text-center animate-in zoom-in duration-500">
              <div className="text-5xl md:text-6xl mb-4 md:mb-6">📩</div>
              <p className="text-lg md:text-2xl font-black mb-4">{t.successTitle}</p>
              <div className="bg-white/70 py-6 px-4 rounded-3xl shadow-inner border border-green-200">
                 <p className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-2">{t.successDesc}</p>
                 <p className="font-mono text-xs md:text-lg font-black text-slate-800 tracking-tight">{t.supportMail}</p>
              </div>
              <button onClick={() => setSubmitted(false)} className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-green-600 hover:underline">
                {lang === 'en' ? 'Send another suggestion' : 'अर्को सुझाव पठाउनुहोस्'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 relative z-10">
              {isSubmitting && (
                <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center rounded-[2rem]">
                  <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-green-800 font-black text-sm animate-pulse uppercase tracking-widest">{t.routing}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-1.5 md:space-y-2">
                  <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                  <input 
                    type="text" required 
                    className="w-full px-5 py-3.5 md:py-4 bg-slate-50 border border-slate-50 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-green-50 focus:bg-white outline-none font-bold text-sm transition-all" 
                    value={formState.name}
                    onChange={e => setFormState({...formState, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                  <input 
                    type="tel" required 
                    className="w-full px-5 py-3.5 md:py-4 bg-slate-50 border border-slate-50 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-green-50 focus:bg-white outline-none font-bold text-sm transition-all" 
                    value={formState.phone}
                    onChange={e => setFormState({...formState, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest px-1">{t.emailLabel}</label>
                <input 
                  type="email" required 
                  className="w-full px-5 py-3.5 md:py-4 bg-slate-50 border border-slate-50 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-green-50 focus:bg-white outline-none font-bold text-sm transition-all" 
                  value={formState.email}
                  onChange={e => setFormState({...formState, email: e.target.value})}
                />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                <select 
                  className="w-full px-5 py-3.5 md:py-4 bg-slate-50 border border-slate-50 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-green-50 focus:bg-white outline-none font-bold text-sm transition-all appearance-none cursor-pointer"
                  value={formState.category}
                  onChange={e => setFormState({...formState, category: e.target.value})}
                >
                  <option value="technical">Technical Support</option>
                  <option value="subsidy">Subsidy Query</option>
                  <option value="report">Market Malpractice</option>
                  <option value="feedback">Policy Suggestion</option>
                </select>
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest px-1">Your Message</label>
                <textarea 
                  required rows={4}
                  className="w-full px-5 py-4 md:py-5 bg-slate-50 border border-slate-50 rounded-xl md:rounded-[2rem] focus:ring-4 focus:ring-green-50 focus:bg-white outline-none font-bold text-sm transition-all resize-none shadow-inner"
                  value={formState.query}
                  onChange={e => setFormState({...formState, query: e.target.value})}
                ></textarea>
              </div>
               {error && (
                 <div className="p-4 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-center border border-red-100">
                   {error}
                 </div>
               )}
               <button 
                 type="submit" 
                 disabled={isSubmitting}
                 className="w-full bg-slate-900 text-white py-4 md:py-6 rounded-xl md:rounded-3xl font-black text-sm md:text-base uppercase tracking-widest shadow-2xl active:scale-95 transition-all hover:bg-green-700 disabled:opacity-50 mt-2"
               >
                 {isSubmitting ? 'Routing Suggestion...' : t.submitBtn}
               </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Helpline;

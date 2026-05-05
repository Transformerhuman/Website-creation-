
import React, { useState, useEffect } from 'react';
import PaymentModal from '../../../components/common/PaymentModal';
import { CorporateContent } from '../../../types/index';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';

const DEFAULT_CONTENT: CorporateContent = {
  heroTitle_en: 'AgroPulse Corporate Network',
  heroTitle_ne: 'एग्रोपल्स कर्पोरेट नेटवर्क',
  heroSubtitle_en: 'Elite agricultural integration for commercial success.',
  heroSubtitle_ne: 'व्यावसायिक सफलताको लागि कुलीन कृषि एकीकरण।',
  enrollmentFee: 2500,
  services: [
    { 
      id: 'insurance', 
      icon: '🛡️', 
      title: 'Crop & Cattle Insurance', 
      desc: 'Comprehensive coverage against natural disasters and disease.',
      details: ['Natural Disaster Coverage', 'Disease Protection', 'Quick Claim Settlement']
    },
    { 
      id: 'markets', 
      icon: '🏛️', 
      title: 'Guaranteed Market', 
      desc: 'Direct buy-back agreements at pre-agreed floor prices.',
      details: ['Floor Price Guarantee', 'Direct Export Access', 'Corporate Supply Chain']
    },
    { 
      id: 'inputs', 
      icon: '📦', 
      title: 'Premium Inputs Pool', 
      desc: 'Access to high-quality hybrid seeds, fertilizers, and safe pesticides.',
      details: ['Hybrid Seed Varieties', 'Global Grade Fertilizers', 'Safe Pesticide Solutions']
    }
  ],
  benefits: [
    'Quarterly Soil Analysis & Health Card',
    'Exclusive Crop Insurance Protection',
    'Corporate Fertilizer & Seed Pool Access',
    'Guaranteed Buy-back for Premium Produce'
  ]
};

const CorporateFarming: React.FC<{ lang: 'en' | 'ne' }> = ({ lang }) => {
  const [content, setContent] = useState<CorporateContent>(DEFAULT_CONTENT);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [enrollData, setEnrollData] = useState({
    fullName: '', phone: '', email: '', farmLocation: ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`${API_BASE}/corporate-content`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.services && data.services.length > 0) setContent(data);
        }
      } catch (err) { 
        console.warn("Using default corporate content due to API error:", err);
      } finally { 
        setLoading(false); 
      }
    };
    fetchContent();
  }, []);

  const handleEnrollmentSuccess = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/corporate-enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrollData)
      });
      
      if (res.ok) {
        setShowPayment(false);
        setSuccess(true);
        setEnrollData({ fullName: '', phone: '', email: '', farmLocation: '' });
      } else {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }
    } catch (err: any) { 
      setError(err.message);
      setShowPayment(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Ecosystem...</p>
        </div>
      </div>
    );
  }

  const handleEnrollClick = () => {
    if(!enrollData.fullName || !enrollData.phone || !enrollData.farmLocation) {
      alert(lang === 'en' ? "Please fill in all required farm details." : "कृपया सबै आवश्यक विवरणहरू भर्नुहोस्।");
      return;
    }
    setShowPayment(true);
  };

  return (
    <div className="bg-white min-h-screen animate-in fade-in duration-500 pb-20">
      {showPayment && (
        <PaymentModal 
          amount={content.enrollmentFee} 
          lang={lang} 
          onClose={() => setShowPayment(false)} 
          onSuccess={handleEnrollmentSuccess} 
        />
      )}

      {/* Hero Section */}
      <div className="bg-slate-900 py-24 md:py-40 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-10"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <span className="inline-block bg-green-600/20 text-green-400 border border-green-400/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">Elite Membership</span>
          <h1 className="text-4xl md:text-8xl font-black text-white news-serif mb-6 leading-tight tracking-tight">
            {lang === 'en' ? content.heroTitle_en : content.heroTitle_ne}
          </h1>
          <p className="text-lg md:text-2xl text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed opacity-80">
            {lang === 'en' ? content.heroSubtitle_en : content.heroSubtitle_ne}
          </p>
        </div>
      </div>

      {/* Corporate Services Pillars */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
          {content.services.map(s => (
            <div key={s.id} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 hover:border-green-500 hover:shadow-2xl transition-all group flex flex-col">
              <div className="text-5xl mb-8 transition-transform group-hover:scale-110 duration-500">{s.icon}</div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 news-serif">{s.title}</h3>
              <p className="text-slate-500 font-medium mb-8 leading-relaxed text-sm">{s.desc}</p>
              
              {s.details && (
                <ul className="space-y-3 mb-10 border-t border-slate-50 pt-6 flex-1">
                  {s.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-wider text-slate-400">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      {detail}
                    </li>
                  ))}
                </ul>
              )}
              
              <div className="h-2 w-16 bg-slate-100 group-hover:bg-green-600 transition-all rounded-full"></div>
            </div>
          ))}
        </div>

        {/* Enrollment Form Section */}
        <div className="bg-slate-900 rounded-[3rem] md:rounded-[5rem] p-10 md:p-24 flex flex-col lg:flex-row items-center gap-16 md:gap-24 relative overflow-hidden shadow-2xl">
           <div className="absolute -top-20 -left-20 w-80 h-80 bg-green-600/10 rounded-full blur-3xl"></div>
           <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>

           <div className="flex-1 space-y-8 relative z-10 w-full text-center lg:text-left">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black text-white news-serif leading-tight">Join the Elite Network</h2>
                <p className="text-slate-400 font-medium text-lg md:text-xl leading-relaxed opacity-90">
                  {lang === 'en' 
                    ? `Membership Fee: Rs. ${content.enrollmentFee} / Year` 
                    : `सदस्यता शुल्क: रु. ${content.enrollmentFee} / वर्ष`}
                </p>
              </div>

              {success ? (
                <div className="bg-green-600/20 border border-green-500/30 p-8 rounded-3xl text-center">
                  <div className="text-4xl mb-4">✅</div>
                  <h4 className="text-xl font-black text-white news-serif mb-2">{lang === 'en' ? 'Enrollment Successful!' : 'नामांकन सफल भयो!'}</h4>
                  <p className="text-green-100/70 text-xs font-medium mb-6">{lang === 'en' ? 'Our officers will contact you shortly to verify your details.' : 'हाम्रा अधिकारीहरूले तपाईंको विवरणहरू प्रमाणित गर्न चाँडै सम्पर्क गर्नेछन्।'}</p>
                  <button onClick={() => setSuccess(false)} className="text-green-400 text-[10px] font-black uppercase tracking-widest hover:underline">Apply for another account</button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                       <input placeholder="Ex: Ram Bahadur" required className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white focus:bg-white/10 outline-none transition-all" value={enrollData.fullName} onChange={e => setEnrollData({...enrollData, fullName: e.target.value})} />
                    </div>
                    <div className="space-y-1.5 text-left">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Phone</label>
                       <input placeholder="98XXXXXXXX" required className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white focus:bg-white/10 outline-none transition-all" value={enrollData.phone} onChange={e => setEnrollData({...enrollData, phone: e.target.value})} />
                    </div>
                    <div className="space-y-1.5 text-left">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Email</label>
                       <input placeholder="email@example.com" className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white focus:bg-white/10 outline-none transition-all" value={enrollData.email} onChange={e => setEnrollData({...enrollData, email: e.target.value})} />
                    </div>
                    <div className="space-y-1.5 text-left">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Location</label>
                       <input placeholder="Ex: Chitwan, Ward 4" required className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white focus:bg-white/10 outline-none transition-all" value={enrollData.farmLocation} onChange={e => setEnrollData({...enrollData, farmLocation: e.target.value})} />
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-[10px] font-black uppercase tracking-widest text-center">
                      Error: {error}
                    </div>
                  )}

                  <button 
                    onClick={handleEnrollClick}
                    disabled={isSubmitting}
                    className="w-full lg:w-auto bg-green-600 text-white px-12 md:px-20 py-5 md:py-6 rounded-2xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all hover:bg-green-500 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Processing...' : 'Enroll Now'}
                  </button>
                </>
              )}
           </div>

           <div className="flex-1 w-full relative z-10 flex items-center justify-center">
              <div className="w-full max-w-md bg-white p-8 md:p-14 rounded-[3rem] shadow-2xl flex flex-col gap-8">
                 <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm">💳</div>
                    <h4 className="font-black text-xl text-slate-900">Secure Payment</h4>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Verified via eSewa / Khalti</p>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrollment Fee</span>
                       <span className="font-black text-slate-900">Rs. {content.enrollmentFee}</span>
                    </div>
                    <div className="flex justify-between items-center bg-green-50 p-4 rounded-2xl border border-green-100">
                       <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Network Status</span>
                       <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Active Pool</span>
                    </div>
                 </div>
                 
                 <p className="text-[9px] text-center text-slate-300 font-bold uppercase tracking-widest leading-relaxed">
                   By enrolling, you agree to the corporate buy-back policy and digital asset management terms.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateFarming;


import React, { useState } from 'react';
import { PartnerFarm } from '../../../types/index';

const PartnerHub: React.FC<{ lang: 'en' | 'ne' }> = ({ lang }) => {
  const [formData, setFormData] = useState({
    farmName: '', ownerName: '', contactPhone: '', contactEmail: '', 
    location: '', specialities: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = {
    en: {
      title: 'Partner Hub',
      subtitle: 'Apply to become a verified AgroPulse partner farm.',
      formTitle: 'Registration Form',
      submit: 'Submit Application',
      success: 'Application submitted successfully! We will contact you soon.'
    },
    ne: {
      title: 'पार्टनर हब',
      subtitle: 'प्रमाणित एग्रोपल्स पार्टनर फार्म बन्नको लागि आवेदन दिनुहोस्।',
      formTitle: 'दर्ता फारम',
      submit: 'आवेदन बुझाउनुहोस्',
      success: 'आवेदन सफलतापूर्वक बुझाइयो! हामी तपाईंलाई चाँडै सम्पर्क गर्नेछौं।'
    }
  }[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
          status: 'pending'
        })
      });
      if (res.ok) {
        setSuccess(true);
        setFormData({ farmName: '', ownerName: '', contactPhone: '', contactEmail: '', location: '', specialities: '' });
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
    <div className="bg-white min-h-screen pb-20 animate-in fade-in duration-500">
      <div className="bg-green-700 text-white py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-7xl font-black news-serif mb-6 leading-tight">{t.title}</h1>
          <p className="text-lg md:text-xl text-green-100 font-medium opacity-80">{t.subtitle}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-10">
        <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] shadow-2xl p-8 md:p-20 border border-slate-100">
          {success ? (
            <div className="text-center py-12">
               <div className="text-6xl mb-6">✅</div>
               <h2 className="text-2xl font-black mb-4">{t.success}</h2>
               <button onClick={() => setSuccess(false)} className="text-green-600 font-black uppercase tracking-widest text-[10px] hover:underline">Apply for another farm</button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl md:text-4xl font-black news-serif mb-12 text-slate-900">{t.formTitle}</h2>
              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Farm/Organization Name</label>
                    <input required className="w-full p-4 md:p-5 bg-slate-50 border rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 font-bold text-sm" value={formData.farmName} onChange={e => setFormData({...formData, farmName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Owner Full Name</label>
                    <input required className="w-full p-4 md:p-5 bg-slate-50 border rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 font-bold text-sm" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                    <input required className="w-full p-4 md:p-5 bg-slate-50 border rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 font-bold text-sm" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                    <input type="email" required className="w-full p-4 md:p-5 bg-slate-50 border rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 font-bold text-sm" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Location / Hub</label>
                  <input required className="w-full p-4 md:p-5 bg-slate-50 border rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 font-bold text-sm" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Primary Specialities (e.g. Organic, Cattle, Poultry)</label>
                  <textarea rows={3} required className="w-full p-4 md:p-5 bg-slate-50 border rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 font-bold text-sm resize-none" value={formData.specialities} onChange={e => setFormData({...formData, specialities: e.target.value})} />
                </div>
                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-center border border-red-100">
                    {error}
                  </div>
                )}
                <button type="submit" disabled={isSubmitting} className="w-full bg-green-700 text-white py-6 md:py-8 rounded-[2rem] font-black text-lg md:text-xl uppercase tracking-widest shadow-2xl hover:bg-green-600 transition-all active:scale-[0.98] disabled:opacity-50">
                  {isSubmitting ? 'Sending Application...' : t.submit}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerHub;


import React, { useState, useEffect } from 'react';
import { GovScheme, ApplicationSubmission } from '../../../types/index';
import { GOV_SCHEMES } from '../../../constants';

const API_BASE = '/api';

const GovSchemes: React.FC<{ lang: 'en' | 'ne' }> = ({ lang }) => {
  const [schemes, setSchemes] = useState<GovScheme[]>([]);
  const [filter, setFilter] = useState<'All' | 'Subsidy' | 'Training' | 'Scheme'>('All');
  const [loading, setLoading] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState<GovScheme | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '', idNumber: '', district: '', state: '', fatherName: '', grandfatherName: ''
  });

  const t = {
    en: {
      title: 'Govt Schemes',
      subtitle: 'Official support programs for farmers.',
      apply: 'Apply Now',
      all: 'All',
      subsidies: 'Subsidies',
      trainings: 'Trainings',
      formTitle: 'Application Form',
      submit: 'Submit',
      external: 'Official Portal',
      close: 'Back',
      success: 'Application Received.',
      upload: 'Upload ID Photo',
      noSchemes: 'No active government schemes available at the moment.'
    },
    ne: {
      title: 'सरकारी योजना',
      subtitle: 'किसानहरूको लागि आधिकारिक सहयोग कार्यक्रम।',
      apply: 'आवेदन दिनुहोस्',
      all: 'सबै',
      subsidies: 'अनुदान',
      trainings: 'तालिम',
      formTitle: 'आवेदन फारम',
      submit: 'बुझाउनुहोस्',
      external: 'सरकारी पोर्टल',
      close: 'बन्द',
      success: 'आवेदन प्राप्त भयो।',
      upload: 'ID फोटो अपलोड',
      noSchemes: 'अहिले कुनै सक्रिय सरकारी योजनाहरू उपलब्ध छैनन्।'
    }
  }[lang];

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const res = await fetch(`${API_BASE}/schemes`);
        const data = res.ok ? await res.json() : [];
        setSchemes(data.length > 0 ? data : GOV_SCHEMES);
      } catch (err) {
        setSchemes(GOV_SCHEMES);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemeId: selectedScheme?._id || selectedScheme?.id,
          schemeTitle: selectedScheme?.title,
          ...formData
        })
      });
      if (res.ok) {
        alert(t.success);
        setSelectedScheme(null);
        setFormData({ fullName: '', idNumber: '', district: '', state: '', fatherName: '', grandfatherName: '' });
      }
    } catch (err) {
      alert("Error submitting application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSchemes = schemes.filter(s => filter === 'All' || s.category === filter);

  return (
    <div className="bg-white min-h-screen">
      {selectedScheme && (
        <div className="fixed inset-0 bg-slate-900/90 z-[120] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center shrink-0">
              <h2 className="font-bold text-lg">{t.formTitle}</h2>
              <button onClick={() => setSelectedScheme(null)} className="text-slate-400 p-2">✕</button>
            </div>
            
            <form onSubmit={handleApplySubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input placeholder={lang === 'en' ? 'Full Name' : 'पूरा नाम'} required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="p-3 bg-slate-50 rounded-lg border w-full text-sm font-bold" />
                <input placeholder={lang === 'en' ? 'ID Number' : 'परिचयपत्र नम्बर'} required value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} className="p-3 bg-slate-50 rounded-lg border w-full text-sm font-bold" />
                <input placeholder={lang === 'en' ? 'District' : 'जिल्ला'} required value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="p-3 bg-slate-50 rounded-lg border w-full text-sm font-bold" />
                <input placeholder={lang === 'en' ? 'State' : 'प्रदेश'} required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="p-3 bg-slate-50 rounded-lg border w-full text-sm font-bold" />
                <input placeholder={lang === 'en' ? "Father's Name" : 'बुबाको नाम'} required value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="p-3 bg-slate-50 rounded-lg border w-full text-sm font-bold" />
                <input placeholder={lang === 'en' ? "Grandfather's Name" : 'हजुरबुबाको नाम'} required value={formData.grandfatherName} onChange={e => setFormData({...formData, grandfatherName: e.target.value})} className="p-3 bg-slate-50 rounded-lg border w-full text-sm font-bold" />
              </div>
              
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500">{t.upload}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-20 border-2 border-dashed rounded-lg flex items-center justify-center text-[10px] text-slate-400 font-black">Front Side</div>
                  <div className="h-20 border-2 border-dashed rounded-lg flex items-center justify-center text-[10px] text-slate-400 font-black">Back Side</div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 shrink-0">
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-amber-600 text-white py-3 rounded-lg font-black text-sm uppercase tracking-widest shadow-lg hover:bg-amber-700 active:scale-95 transition-all">
                  {isSubmitting ? '...' : t.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-slate-50 py-16 md:py-24 px-4 border-b">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-black news-serif mb-4 text-slate-900">{t.title}</h1>
          <p className="text-slate-500 text-sm md:text-base font-medium">{t.subtitle}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-wrap gap-2 mb-12 justify-center">
          {['All', 'Subsidy', 'Training', 'Scheme'].map(f => (
            <button 
              key={f} onClick={() => setFilter(f as any)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${filter === f ? 'bg-amber-600 border-amber-600 text-white shadow-lg' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              {f === 'All' ? t.all : f === 'Subsidy' ? t.subsidies : f === 'Training' ? t.trainings : f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div></div>
        ) : filteredSchemes.length === 0 ? (
          <div className="text-center py-24 opacity-30">
            <span className="text-5xl mb-4 block">📜</span>
            <p className="font-black text-xs uppercase tracking-widest">{t.noSchemes}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSchemes.map(s => (
              <div key={s._id || s.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500 group">
                <div className="aspect-video bg-slate-100 overflow-hidden relative">
                  <img src={s.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-amber-700 uppercase tracking-widest shadow-sm">
                    {s.category}
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between mb-4">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">🏛️ {s.authority}</span>
                    <span className="text-[10px] text-red-500 font-black uppercase tracking-widest">⏰ {s.deadline}</span>
                  </div>
                  <h3 className="font-black news-serif text-xl mb-3 text-slate-900 leading-tight group-hover:text-amber-600 transition-colors">{s.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-3 mb-8 leading-relaxed font-medium">{s.description}</p>
                  
                  <div className="mt-auto space-y-3">
                    <button onClick={() => setSelectedScheme(s)} className="w-full bg-slate-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-amber-600 transition-all active:scale-95">
                      {t.apply}
                    </button>
                    {s.govLink && (
                      <a 
                        href={s.govLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full block text-center bg-slate-50 text-slate-600 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all"
                      >
                        🔗 {t.external}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GovSchemes;


import React, { useState } from 'react';
import { User } from '../../../types/index';

const API_BASE = '/api';

interface UserAuthProps {
  onSuccess: (user: User) => void;
  onClose: () => void;
  lang: 'en' | 'ne';
}

const UserAuth: React.FC<UserAuthProps> = ({ onSuccess, onClose, lang }) => {
  const [step, setStep] = useState<'signup' | 'otp'>('signup');
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '' });
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const t = {
    en: {
      title: 'Join AgroPulse',
      subtitle: 'Verified access for Market & Partners',
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      signup: 'Send Verification Code',
      otpTitle: 'Verify Node',
      otpSubtitle: 'Enter the 4-digit code sent to your phone',
      verify: 'Verify & Continue',
      change: 'Change details'
    },
    ne: {
      title: 'एग्रोपल्समा सामेल हुनुहोस्',
      subtitle: 'बजार र साझेदारहरूको लागि प्रमाणित पहुँच',
      name: 'पूरा नाम',
      email: 'इमेल ठेगाना',
      phone: 'फोन नम्बर',
      signup: 'प्रमाणीकरण कोड पठाउनुहोस्',
      otpTitle: 'नोड प्रमाणित गर्नुहोस्',
      otpSubtitle: 'तपाईको फोनमा पठाइएको ४-अंकको कोड प्रविष्ट गर्नुहोस्',
      verify: 'प्रमाणित गर्नुहोस् र जारी राख्नुहोस्',
      change: 'विवरण परिवर्तन गर्नुहोस्'
    }
  }[lang];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call to send OTP
    setTimeout(() => {
      setStep('otp');
      setIsLoading(false);
    }, 1500);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '1234') { // Simulated correct OTP
      alert(lang === 'en' ? "Invalid code. Use 1234 for testing." : "गलत कोड। परीक्षणको लागि 1234 प्रयोग गर्नुहोस्।");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const user = await res.json();
        onSuccess(user);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[500] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in zoom-in duration-300">
        <div className="bg-slate-900 p-10 text-white text-center">
          <h3 className="text-3xl font-black news-serif">{step === 'signup' ? t.title : t.otpTitle}</h3>
          <p className="text-slate-400 text-sm mt-2">{step === 'signup' ? t.subtitle : t.otpSubtitle}</p>
        </div>

        <div className="p-10">
          {step === 'signup' ? (
            <form onSubmit={handleSignup} className="space-y-5">
              <input placeholder={t.name} required className="w-full p-5 bg-slate-50 border rounded-2xl font-bold" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
              <input placeholder={t.email} type="email" required className="w-full p-5 bg-slate-50 border rounded-2xl font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input placeholder={t.phone} type="tel" required className="w-full p-5 bg-slate-50 border rounded-2xl font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <button disabled={isLoading} className="w-full bg-green-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-green-700 transition-all">
                {isLoading ? '...' : t.signup}
              </button>
              <button type="button" onClick={onClose} className="w-full text-slate-400 font-bold text-xs uppercase tracking-widest pt-2">Cancel</button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <input 
                placeholder="XXXX" maxLength={4} required 
                className="w-full p-8 bg-slate-50 border rounded-3xl font-black text-4xl text-center tracking-[0.5em] outline-none focus:ring-4 focus:ring-green-50" 
                value={otp} onChange={e => setOtp(e.target.value)} 
              />
              <button disabled={isLoading} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-green-700 transition-all">
                {isLoading ? '...' : t.verify}
              </button>
              <button type="button" onClick={() => setStep('signup')} className="w-full text-slate-400 font-bold text-xs uppercase tracking-widest">{t.change}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAuth;

import React from 'react';

const ContactUs: React.FC<{ lang: 'en' | 'ne' }> = ({ lang }) => (
  <div className="max-w-xl mx-auto py-20 px-4">
    <h2 className="text-4xl font-black mb-6">{lang === 'en' ? 'Contact Us' : 'हामीलाई सम्पर्क गर्नुहोस्'}</h2>
    <div className="space-y-6">
      <div className="p-6 bg-slate-50 rounded-3xl">
        <h4 className="font-bold mb-2">Office</h4>
        <p className="text-slate-600">Kathmandu, Nepal</p>
      </div>
      <div className="p-6 bg-slate-50 rounded-3xl">
        <h4 className="font-bold mb-2">Email</h4>
        <p className="text-slate-600">contact@agropulse.com.np</p>
      </div>
    </div>
  </div>
);

export default ContactUs;

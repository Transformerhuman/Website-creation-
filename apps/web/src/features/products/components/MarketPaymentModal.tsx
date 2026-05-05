import React from 'react';

interface Props {
  lang: 'en' | 'ne';
  onClose: () => void;
  total: number;
}

const MarketPaymentModal: React.FC<Props> = ({ lang, onClose, total }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[500] p-4">
      <div className="bg-white p-8 rounded-3xl w-full max-w-md">
        <h2 className="text-2xl font-black mb-4">{lang === 'en' ? 'Payment' : 'भुक्तानी'}</h2>
        <p className="mb-6 text-slate-600">Total: Rs. {total}</p>
        <button onClick={onClose} className="w-full p-4 bg-green-600 text-white rounded-2xl">
          {lang === 'en' ? 'Pay with eSewa' : 'eSewa मार्फत भुक्तानी गर्नुहोस्'}
        </button>
      </div>
    </div>
  );
};

export default MarketPaymentModal;

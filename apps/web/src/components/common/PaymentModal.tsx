import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

const PaymentModal: React.FC<Props> = ({ isOpen, onClose, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[500] p-4">
      <div className="bg-white p-8 rounded-3xl w-full max-w-md">
        <h2 className="text-2xl font-black mb-4">{title}</h2>
        <button onClick={onClose} className="w-full p-4 bg-green-600 text-white rounded-2xl">
          Complete Payment
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;

import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, title, message, onConfirm, onCancel, isDestructive 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[600] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in duration-300">
        <h3 className="text-xl font-black mb-4">{title}</h3>
        <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">{message}</p>
        <div className="flex gap-4">
          <button 
            onClick={onCancel}
            className="flex-1 py-4 bg-slate-50 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-400 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white shadow-lg ${isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

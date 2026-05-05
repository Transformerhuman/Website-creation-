import React from 'react';

interface Props {
  lang: 'en' | 'ne';
  onClose: () => void;
  onLogin: (success: boolean) => void;
}

const AdminLogin: React.FC<Props> = ({ lang, onClose, onLogin }) => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('ap_admin_token', data.token);
        onLogin(true);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4 animate-in fade-in duration-300">
      <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] w-full max-w-md shadow-2xl border border-slate-100">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">🔐</div>
           <h2 className="text-2xl md:text-3xl font-black news-serif">{lang === 'en' ? 'Admin Gateway' : 'प्रशासक द्वार'}</h2>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Authorized Access Only</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase text-center border border-red-100">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
            <input 
              type="text" 
              required
              className="w-full p-4 md:p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all font-bold text-sm" 
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full p-4 md:p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all font-bold text-sm" 
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-3 pt-6">
            <button type="button" onClick={onClose} className="order-2 md:order-1 flex-1 py-4 md:py-5 border border-slate-100 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-400 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading} className="order-1 md:order-2 flex-1 py-4 md:py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-[0.98]">
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

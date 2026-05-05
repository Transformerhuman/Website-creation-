
import React, { useState, useEffect } from 'react';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { 
  NewsItem, PartnerFarm, CorporateEnrollment, Product, 
  BulkListing
} from '../../../types/index';

const AdminPanel: React.FC<{ lang: 'en' | 'ne' }> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'news' | 'market' | 'partners' | 'corporate' | 'schemes' | 'storage'>('news');
  const [storageData, setStorageData] = useState<{ images: any[]; emails: any[] }>({ images: [], emails: [] });
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [data, setData] = useState<{
    news: NewsItem[],
    shop: Product[],
    partners: PartnerFarm[],
    enrollments: CorporateEnrollment[],
    schemes: any[]
  }>({
    news: [], shop: [], partners: [], enrollments: [], schemes: []
  });
  const [isCreating, setIsCreating] = useState(false);
  // Extended form type covers all tabs: news, market, schemes
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState<{ savingPercent: number; compressedKb: number } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: string, id: string } | null>(null);
  
  const API_BASE = '/api';

  const logout = () => {
    localStorage.removeItem('ap_admin_token');
    window.location.reload();
  };

  const fetchData = async () => {
    const endpoints = ['news', 'products', 'partners', 'corporate-enrollments', 'schemes'];
    const token = localStorage.getItem('ap_admin_token');
    const correlationId = crypto.randomUUID();
    try {
      const res = await Promise.all(endpoints.map(e => fetch(`${API_BASE}/${e}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-correlation-id': correlationId
        }
      })));
      const results = await Promise.all(res.map(r => r.ok ? r.json() : null));
      setData({
        news: results[0]?.items || results[0] || [], 
        shop: results[1]?.items || results[1] || [],
        partners: results[2]?.items || results[2] || [], 
        enrollments: results[3]?.items || results[3] || [],
        schemes: results[4]?.items || results[4] || []
      });
    } catch (err) { console.error(err); }
  };

  const fetchStorage = async () => {
    const token = localStorage.getItem('ap_admin_token');
    try {
      const [imgRes, emlRes] = await Promise.all([
        fetch('/api/admin/storage/images', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/storage/emails',  { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);
      const [imgData, emlData] = await Promise.all([imgRes.json(), emlRes.json()]);
      setStorageData({
        images: imgData.files  || [],
        emails: emlData.emails || [],
      });
    } catch (err) { console.error('[storage fetch]', err); }
  };

  useEffect(() => { 
    const token = localStorage.getItem('ap_admin_token');
    if (!token) {
      window.location.reload();
      return;
    }
    fetchData();
    fetchStorage();

    // Poll every 5 seconds so frontend reflects admin changes immediately
    const pollInterval = setInterval(() => { fetchData(); fetchStorage(); }, 5000);

    // Strict 2-minute session limit
    const sessionTimer = setTimeout(() => {
      logout();
    }, 120000); // 120,000ms = 2 minutes

    return () => {
      clearInterval(pollInterval);
      clearTimeout(sessionTimer);
    };
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    setUploadStats(null);
    const token = localStorage.getItem('ap_admin_token');
    const form = new FormData();
    form.append('image', e.target.files[0]);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      if (data.url) {
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
        // Show compression stats badge
        if (data.savingPercent !== undefined) {
          setUploadStats({
            savingPercent: data.savingPercent,
            compressedKb: Math.round(data.compressedSize / 1024),
          });
          // Auto-dismiss after 4 seconds
          setTimeout(() => setUploadStats(null), 4000);
        }
      }
    } catch (err: any) {
      alert('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('ap_admin_token');
    const endpoint = activeTab === 'market' ? 'products' : activeTab;
    try {
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsCreating(false);
        setFormData({});
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const handleStatusUpdate = async (type: string, id: string, status: string) => {
    const token = localStorage.getItem('ap_admin_token');
    const correlationId = crypto.randomUUID();
    try {
      const res = await fetch(`${API_BASE}/${type}/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-correlation-id': correlationId
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (type: string, id: string) => {
    const token = localStorage.getItem('ap_admin_token');
    const correlationId = crypto.randomUUID();
    try {
      const res = await fetch(`${API_BASE}/${type}/${id}`, { 
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-correlation-id': correlationId
        }
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
    setConfirmDelete(null);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl md:text-5xl font-black news-serif">Command Center</h1>
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mt-2">AgroPulse Node Administration</p>
        </div>
        <div className="flex gap-4">
          {['news', 'market', 'schemes'].includes(activeTab) && (
            <button onClick={() => setIsCreating(!isCreating)} className="bg-green-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-900/20">
              {isCreating ? 'Close Form' : `Add ${activeTab}`}
            </button>
          )}
          <button onClick={logout} className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border border-red-100 hover:bg-red-600 hover:text-white transition-all">Terminate Session</button>
        </div>
      </div>

      {isCreating && (
        <div className="mb-12 bg-white p-8 md:p-12 rounded-[3rem] border-2 border-green-600/20 shadow-2xl animate-in slide-in-from-top-4 duration-500">
          <h3 className="text-2xl font-black news-serif mb-8 capitalize">New {activeTab} Entry</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Thumbnail / Image</label>
                <div className="relative group">
                  <div className={`aspect-video rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all relative ${
                    formData.imageUrl ? 'border-solid border-green-500' : 'hover:border-slate-400'
                  }`}>
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Compressing…</span>
                      </div>
                    ) : formData.imageUrl ? (
                      <>
                        <img src={formData.imageUrl} className="w-full h-full object-cover" />
                        {uploadStats && (
                          <div className="absolute top-2 right-2 bg-green-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg animate-in fade-in zoom-in duration-300">
                            ✦ {uploadStats.savingPercent}% saved · {uploadStats.compressedKb} KB
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-slate-400 font-black text-xs uppercase tracking-widest">Drop image here</span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
              <input placeholder="Title (English)" required className="w-full p-5 bg-slate-50 rounded-2xl font-bold" onChange={e => setFormData({ ...formData, [activeTab === 'market' ? 'name_en' : 'title']: e.target.value })} />
              <input placeholder="Title (Nepali)" required className="w-full p-5 bg-slate-50 rounded-2xl font-bold" onChange={e => setFormData({ ...formData, [activeTab === 'market' ? 'name_ne' : 'title_ne']: e.target.value })} />
            </div>
            
            <div className="space-y-6">
              {activeTab === 'market' ? (
                <>
                  <input placeholder="Price (NPR)" type="number" required className="w-full p-5 bg-slate-50 rounded-2xl font-bold" onChange={e => setFormData({ ...formData, price: e.target.value })} />
                  <input placeholder="Seller Name" required className="w-full p-5 bg-slate-50 rounded-2xl font-bold" onChange={e => setFormData({ ...formData, seller: e.target.value })} />
                  <select className="w-full p-5 bg-slate-50 rounded-2xl font-bold" onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    <option value="Vegetable">Vegetable</option>
                    <option value="Fruit">Fruit</option>
                    <option value="Grain">Grain</option>
                    <option value="Meat">Meat</option>
                  </select>
                </>
              ) : activeTab === 'schemes' ? (
                <>
                  <input placeholder="Authority" required className="w-full p-5 bg-slate-50 rounded-2xl font-bold" onChange={e => setFormData({ ...formData, authority: e.target.value })} />
                  <input placeholder="Deadline" required className="w-full p-5 bg-slate-50 rounded-2xl font-bold" onChange={e => setFormData({ ...formData, deadline: e.target.value })} />
                  <select className="w-full p-5 bg-slate-50 rounded-2xl font-bold" onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    <option value="Subsidy">Subsidy</option>
                    <option value="Training">Training</option>
                    <option value="Scheme">Scheme</option>
                  </select>
                  <textarea placeholder="Description" rows={4} required className="w-full p-5 bg-slate-50 rounded-2xl font-bold resize-none" onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                </>
              ) : (
                <>
                  <input placeholder="Author" required className="w-full p-5 bg-slate-50 rounded-2xl font-bold" onChange={e => setFormData({ ...formData, author: e.target.value })} />
                  <select className="w-full p-5 bg-slate-50 rounded-2xl font-bold" onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    <option value="Market">Market</option>
                    <option value="Weather">Weather</option>
                    <option value="Policy">Policy</option>
                  </select>
                  <textarea placeholder="Content Snippet" rows={4} required className="w-full p-5 bg-slate-50 rounded-2xl font-bold resize-none" onChange={e => setFormData({ ...formData, snippet: e.target.value })}></textarea>
                </>
              )}
              <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:bg-black transition-all">Publish Entry</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex overflow-x-auto gap-2 mb-12 border-b border-slate-100 pb-4 scrollbar-hide">
        {[
          { id: 'news',      label: '📰 Reports'  },
          { id: 'partners',  label: '🤝 Partners'  },
          { id: 'corporate', label: '🏢 Corporate' },
          { id: 'market',    label: '🛒 Market'    },
          { id: 'schemes',   label: '📜 Schemes'   },
          { id: 'storage',   label: '🗄️ Storage'   },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 border hover:bg-slate-50'}`}>{tab.label}</button>
        ))}
      </div>

      <div className="space-y-12">
        {activeTab === 'news' && (
          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border shadow-sm">
             <h2 className="text-xl md:text-2xl font-black news-serif mb-8">News Reports</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.news.map((n: any) => (
                  <div key={n._id} className="p-6 bg-slate-50 rounded-2xl border flex flex-col group">
                     <div className="flex justify-between items-start mb-4">
                        {n.imageUrl && (
                          <img
                            src={n.imageUrl}
                            className="w-16 h-16 rounded-xl object-cover shadow-sm"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        <button onClick={() => setConfirmDelete({ type: 'news', id: n._id ?? '' })} className="text-red-500 text-[10px] font-black uppercase hover:bg-red-50 px-3 py-1 rounded-lg">Delete</button>
                     </div>
                     <h4 className="font-bold text-sm leading-tight mb-2">{n.title}</h4>
                     <p className="text-[9px] text-slate-400 font-black uppercase">{n.author} • {n.category}</p>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'schemes' && (
          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border shadow-sm">
             <h2 className="text-xl md:text-2xl font-black news-serif mb-8">Government Schemes</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.schemes.map((s) => (
                  <div key={s._id} className="p-6 bg-slate-50 rounded-2xl border flex flex-col group">
                     <div className="flex justify-between items-start mb-4">
                        <div className="bg-white px-3 py-1 rounded-full text-[8px] font-black uppercase text-amber-600 border border-amber-100">{s.category}</div>
                        <button onClick={() => setConfirmDelete({ type: 'schemes', id: s._id })} className="text-red-500 text-[10px] font-black uppercase hover:bg-red-50 px-3 py-1 rounded-lg">Remove</button>
                     </div>
                     <h4 className="font-bold text-sm leading-tight mb-1">{s.title}</h4>
                     <p className="text-[9px] text-slate-400 font-black uppercase">{s.authority} • {s.deadline}</p>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'market' && (
          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border shadow-sm">
             <h2 className="text-xl md:text-2xl font-black news-serif mb-8">Market Management</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {data.shop.map((p: any) => (
                  <div key={p._id} className="p-5 md:p-6 bg-slate-50 rounded-2xl border flex flex-col group">
                     <div className="flex justify-between items-start mb-4">
                        {p.imageUrl && (
                          <img
                            src={p.imageUrl}
                            className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover shadow-sm"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        <button onClick={() => setConfirmDelete({ type: 'products', id: p._id ?? '' })} className="text-red-500 text-[9px] font-black uppercase hover:bg-red-50 px-3 py-1 rounded-lg">Remove</button>
                     </div>
                     <h4 className="font-bold text-sm">{p.name_en}</h4>
                     <p className="text-[9px] text-slate-400 font-black uppercase">Seller: {p.seller}</p>
                     <p className="text-lg font-black text-green-700 mt-2">Rs. {p.price} / KG</p>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'partners' && (
          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border shadow-sm">
             <h2 className="text-xl md:text-2xl font-black news-serif mb-8">Partner Authorization</h2>
             <div className="space-y-4 md:space-y-6">
                {data.partners.map((p: any) => (
                  <div key={p._id} className="p-6 md:p-8 bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] border flex flex-col lg:flex-row justify-between items-center gap-6">
                     <div className="flex items-center gap-4 md:gap-6 w-full lg:w-auto">
                        {p.imageUrl && (
                          <img
                            src={p.imageUrl}
                            className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl object-cover shadow-md"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        <div>
                           <h4 className="text-lg md:text-xl font-black">{p.farmName}</h4>
                           <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase">{p.ownerName} • {p.contactPhone}</p>
                           <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[8px] font-black uppercase ${p.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span>
                        </div>
                     </div>
                     <div className="flex gap-2 w-full lg:w-auto">
                        {p.status !== 'approved' && <button onClick={() => handleStatusUpdate('partners', p._id ?? '', 'approved')} className="flex-1 lg:flex-none bg-green-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg">Approve</button>}
                        <button onClick={() => setConfirmDelete({ type: 'partners', id: p._id ?? '' })} className="flex-1 lg:flex-none bg-white text-red-500 border border-red-100 px-6 py-3 rounded-xl font-black text-[10px] uppercase">Reject</button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'corporate' && (
          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border shadow-sm">
             <h2 className="text-xl md:text-2xl font-black news-serif mb-8">Corporate Enrollments</h2>
             <div className="space-y-4 md:space-y-6">
                {data.enrollments.map((e: any) => (
                  <div key={e._id} className="p-6 md:p-8 bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] border flex flex-col md:flex-row justify-between items-center gap-4">
                     <div className="w-full md:w-auto">
                        <h4 className="text-lg font-black">{e.fullName}</h4>
                        <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest">📍 {e.farmLocation} • 📞 {e.phone}</p>
                     </div>
                     <div className="flex gap-2 w-full md:w-auto">
                        {e.status !== 'approved' && <button onClick={() => handleStatusUpdate('corporate-enrollments', e._id ?? '', 'approved')} className="flex-1 md:flex-none bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">Enroll</button>}
                        <button onClick={() => setConfirmDelete({ type: 'corporate-enrollments', id: e._id ?? '' })} className="text-red-400 px-3 hover:bg-red-50 rounded-lg transition-colors">✕</button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* ─── Storage Tab ──────────────────────────────────────────────────── */}
        {activeTab === 'storage' && (
          <div className="space-y-10">

            {/* Image Gallery */}
            <div className="bg-white p-6 md:p-10 rounded-[2rem] border shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl md:text-2xl font-black news-serif">📁 Image Storage</h2>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border">
                  {storageData.images.length} files
                </span>
              </div>
              {storageData.images.length === 0 ? (
                <p className="text-slate-400 text-sm font-bold text-center py-12">No images uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {storageData.images.map((img: any) => (
                    <div key={img.filename} className="group relative rounded-2xl overflow-hidden border shadow-sm bg-slate-50">
                      <img
                        src={img.url}
                        alt={img.filename}
                        className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1 1%22><rect fill=%22%23f1f5f9%22 width=%221%22 height=%221%22/></svg>'; }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          onClick={async () => {
                            const token = localStorage.getItem('ap_admin_token');
                            await fetch(`/api/admin/storage/images/${img.filename}`, {
                              method: 'DELETE',
                              headers: { 'Authorization': `Bearer ${token}` }
                            });
                            fetchStorage();
                          }}
                          className="bg-red-500 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-lg shadow-lg"
                        >Delete</button>
                      </div>
                      <div className="p-2">
                        <p className="text-[8px] font-black text-slate-400 uppercase truncate">{img.filename}</p>
                        <p className="text-[8px] text-slate-300">{img.sizeKb} KB</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Email Inbox */}
            <div className="bg-white p-6 md:p-10 rounded-[2rem] border shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl md:text-2xl font-black news-serif">📧 Helpdesk Inbox</h2>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border">
                  {storageData.emails.length} messages
                </span>
              </div>
              {storageData.emails.length === 0 ? (
                <p className="text-slate-400 text-sm font-bold text-center py-12">No helpdesk submissions yet.</p>
              ) : (
                <div className="space-y-3">
                  {storageData.emails.map((email: any) => (
                    <div key={email.id} className="border rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setExpandedEmail(expandedEmail === email.id ? null : email.id)}
                        className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-sm shrink-0">
                            {(email.name || email.userId || '?')[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-sm">{email.name || email.userId || 'Anonymous'}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              {email.email || ''} {email.phone ? '• ' + email.phone : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[9px] text-slate-300 font-bold">
                            {email.receivedAt ? new Date(email.receivedAt).toLocaleString() : ''}
                          </span>
                          <span className="text-slate-400">{expandedEmail === email.id ? '▲' : '▼'}</span>
                        </div>
                      </button>
                      {expandedEmail === email.id && (
                        <div className="p-6 border-t bg-white space-y-4">
                          {email.category && (
                            <span className="inline-block bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-100">
                              {email.category}
                            </span>
                          )}
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{email.query}</p>
                          <div className="flex justify-end pt-2">
                            <button
                              onClick={async () => {
                                const token = localStorage.getItem('ap_admin_token');
                                await fetch(`/api/admin/storage/emails/${email.id}`, {
                                  method: 'DELETE',
                                  headers: { 'Authorization': `Bearer ${token}` }
                                });
                                setExpandedEmail(null);
                                fetchStorage();
                              }}
                              className="text-[10px] font-black uppercase text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
                            >Archive / Delete</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={() => confirmDelete && handleDelete(confirmDelete.type, confirmDelete.id)}
        onCancel={() => setConfirmDelete(null)}
        isDestructive={true}
      />
    </div>
  );
};

export default AdminPanel;

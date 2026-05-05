
import React, { useState, useEffect, useMemo } from 'react';
import { Product, CartItem, BulkListing, BuyerNeed, User } from '../../../types/index';
import { PRODUCTS } from '../../../constants';
import MarketPaymentModal from './MarketPaymentModal';
import UserAuth from '../../auth/components/UserAuth';

const API_BASE = '/api';

const CATEGORY_MAP = [
  { key: 'seeds', en: 'Seeds', ne: 'बीउ' },
  { key: 'fertilizer', en: 'Fertilizer', ne: 'मल' },
  { key: 'tools', en: 'Tools', ne: 'औजार' },
  { key: 'produce', en: 'Produce', ne: 'उत्पादन' },
];

interface AgriMarketProps {
  lang: 'en' | 'ne';
  onCartChange?: (count: number) => void;
  user: User | null;
  onUserLogin: (user: User) => void;
}

const AgriMarket: React.FC<AgriMarketProps> = ({ lang, onCartChange, user, onUserLogin }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [bulkListings, setBulkListings] = useState<BulkListing[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [activeTab, setActiveTab] = useState<'market' | 'wholesale' | 'needs' | 'sell'>('market');
  const [activeCatKey, setActiveCatKey] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [postType, setPostType] = useState<'product' | 'bulk' | 'need'>('product');
  
  const [formData, setFormData] = useState({
    name: '', price: '', stock: '', desc: '', category: 'produce', 
    minOrder: '', location: '', phone: '', email: '', buyerName: '', buyerType: 'Individual'
  });

  const fetchData = async () => {
    try {
      const endpoints = ['products', 'bulk-listings'];
      const responses = await Promise.all(endpoints.map(e => fetch(`${API_BASE}/${e}`)));
      const [pData, bData] = await Promise.all(responses.map(r => r.ok ? r.json() : []));
      
      const mergedProducts = [...(pData || []), ...PRODUCTS.filter(p => !pData?.some((up: any) => up._id === p.id))];
      setProducts(mergedProducts);
      setBulkListings(bData || []);
    } catch (err) { 
      setProducts(PRODUCTS); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (onCartChange) onCartChange(cart.reduce((s, i) => s + i.quantity, 0));
  }, [cart, onCartChange]);

  const addToCart = (p: Product) => {
    if (!user) { setShowAuth(true); return; }
    setCart(prev => {
      const exists = prev.find(item => (item.id || (item as any)._id) === (p.id || (p as any)._id));
      if (exists) return prev.map(item => (item.id || (item as any)._id) === (p.id || (p as any)._id) ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...p, quantity: 1 }];
    });
    alert(lang === 'en' ? "Added to cart!" : "कार्टमा थपियो!");
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setShowAuth(true); return; }
    setIsSubmitting(true);
    
    const endpoint = postType === 'product' ? 'products' : 'bulk-listings';
    const body = postType === 'product' ? {
      name_en: formData.name, name_ne: formData.name,
      desc_en: formData.desc, desc_ne: formData.desc,
      price: Number(formData.price), stock: Number(formData.stock),
      category: formData.category, imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=400&q=80',
      seller: user.fullName, contactPhone: user.phone, contactEmail: user.email
    } : {
      name_en: formData.name, name_ne: formData.name,
      desc_en: formData.desc, desc_ne: formData.desc,
      price: Number(formData.price), totalStock: Number(formData.stock),
      minOrder: Number(formData.minOrder), location_en: formData.location, location_ne: formData.location,
      category: formData.category, imageUrl: 'https://images.unsplash.com/photo-1551739440-5dd934d3a94a?auto=format&fit=crop&w=400&q=80',
      seller: user.fullName, contactPhone: user.phone, contactEmail: user.email
    };

    try {
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        alert(lang === 'en' ? "Listing successfully published!" : "सूची सफलतापूर्वक प्रकाशित भयो!");
        setFormData({ name: '', price: '', stock: '', desc: '', category: 'produce', minOrder: '', location: '', phone: '', email: '', buyerName: '', buyerType: 'Individual' });
        setActiveTab(postType === 'product' ? 'market' : 'wholesale');
        await fetchData();
      }
    } catch (err) { console.error(err); } 
    finally { setIsSubmitting(false); }
  };

  const processedProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const matchesCat = activeCatKey === 'all' || p.category.toLowerCase() === activeCatKey;
      const matchesSearch = !searchQuery || 
        p.name_en.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.desc_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.seller.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
    
    return filtered.sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0; 
    });
  }, [products, activeCatKey, sortBy, searchQuery]);

  const t = {
    en: {
      market: 'Market', wholesale: 'Wholesale', needs: 'Buyer Needs', sell: 'Sell/Request',
      checkout: 'Checkout', listBtn: 'Publish Listing', inquire: 'Inquire', minOrder: 'Min Order',
      lookingFor: 'Looking for', by: 'By', location: 'Location', item: 'Item', items: 'Items',
      cartSummary: 'Your Shopping Cart Summary', proceed: 'Proceed to Payment', submitting: 'Processing...',
      postProduct: 'List Single Product', postBulk: 'List Bulk/Wholesale',
      postProductDesc: 'Appears in "Market"', postBulkDesc: 'Appears in "Wholesale"',
      sort: 'Sort By', newest: 'Newest', lowHigh: 'Price Low-High', highLow: 'Price High-Low',
      stock: 'Stock Status', inStock: 'In Stock', outOfStock: 'Out of Stock',
      details: 'Product Details', searchPlaceholder: 'Search products, sellers, or varieties...',
      perKg: 'Per KG', inKg: 'in KG'
    },
    ne: {
      market: 'बजार', wholesale: 'थोक बजार', needs: 'खरिदकर्ताको आवश्यकता', sell: 'बेच्नुहोस्/अनुरोध',
      checkout: 'चेकआउट', listBtn: 'सूची प्रकाशित गर्नुहोस्', inquire: 'सोधपुछ', minOrder: 'न्यूनतम अर्डर',
      lookingFor: 'खोजिरहेको', by: 'द्वारा', location: 'स्थान', item: 'सामान', items: 'सामानहरू',
      cartSummary: 'तपाईंको किनमेल कार्ट सारांश', proceed: 'भुक्तानीमा जानुहोस्', submitting: 'प्रशोधन गर्दै...',
      postProduct: 'एकल उत्पादन सूची', postBulk: 'थोक उत्पादन सूची',
      postProductDesc: '"बजार" मा देखा पर्दछ', postBulkDesc: '"थोक" मा देखा पर्दछ',
      sort: 'क्रमबद्ध', newest: 'नयाँ पहिले', lowHigh: 'मूल्य कम-उच्च', highLow: 'मूल्य उच्च-कम',
      stock: 'स्टक अवस्था', inStock: 'स्टकमा छ', outOfStock: 'स्टक सकियो',
      details: 'उत्पादन विवरण', searchPlaceholder: 'उत्पादन, बिक्रेता वा जात खोज्नुहोस्...',
      perKg: 'प्रति केजी', inKg: 'केजीमा'
    }
  }[lang];

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-24 relative animate-in fade-in duration-500">
      {showAuth && <UserAuth onSuccess={(u) => { onUserLogin(u); setShowAuth(false); }} onClose={() => setShowAuth(false)} lang={lang} />}
      
      {/* Search Header for Market */}
      <div className="bg-slate-900 text-white pt-10 md:pt-16 pb-24 md:pb-32 px-4 md:px-6 text-center">
        <h1 className="text-3xl md:text-7xl font-black mb-6 md:mb-8 news-serif tracking-tight">
          {lang === 'en' ? "AgroPulse Market" : "एग्रोपल्स बजार"}
        </h1>
        <div className="max-w-3xl mx-auto relative mb-4">
           <input 
             type="text" 
             placeholder={t.searchPlaceholder}
             className="w-full pl-12 md:pl-14 pr-16 md:pr-20 py-4 md:py-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl md:rounded-3xl text-white font-bold outline-none focus:bg-white focus:text-slate-900 focus:ring-4 focus:ring-green-500/20 transition-all shadow-2xl text-sm md:text-base"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
           <span className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-xl md:text-2xl">🔍</span>
           <button className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 bg-green-600 px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-green-500 transition-colors">Find</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-12 md:-mt-16">
        <div className="bg-white p-2 md:p-3 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl flex gap-2 md:gap-3 mb-10 md:mb-16 border border-slate-100 overflow-x-auto scrollbar-hide sticky top-[70px] md:static z-40">
           {['market', 'wholesale', 'needs', 'sell'].map(tab => (
             <button 
              key={tab} 
              onClick={() => setActiveTab(tab as any)} 
              className={`flex-1 min-w-[100px] md:min-w-[120px] px-4 md:px-8 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 ${activeTab === tab ? 'bg-green-600 text-white shadow-xl shadow-green-200' : 'text-slate-500 hover:bg-slate-50'}`}
             >
               {t[tab as keyof typeof t]}
             </button>
           ))}
        </div>

        {activeTab === 'market' && (
          <div className="space-y-16">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex justify-start md:justify-center gap-2 md:gap-3 overflow-x-auto pb-4 scrollbar-hide w-full md:w-auto px-2">
                <button onClick={() => setActiveCatKey('all')} className={`px-6 md:px-8 py-3 md:py-3.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border whitespace-nowrap ${activeCatKey === 'all' ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{lang === 'en' ? 'All' : 'सबै'}</button>
                {CATEGORY_MAP.map(c => (
                  <button key={c.key} onClick={() => setActiveCatKey(c.key)} className={`px-6 md:px-8 py-3 md:py-3.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${activeCatKey === c.key ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{lang === 'en' ? c.en : c.ne}</button>
                ))}
              </div>
              <div className="flex items-center gap-4 bg-slate-50 px-5 md:px-6 py-2.5 md:py-3 rounded-2xl border border-slate-100 w-full md:w-auto justify-between md:justify-start">
                 <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">{t.sort}:</span>
                 <select className="bg-transparent text-[11px] md:text-xs font-black outline-none cursor-pointer" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                   <option value="newest">{t.newest}</option>
                   <option value="price-asc">{t.lowHigh}</option>
                   <option value="price-desc">{t.highLow}</option>
                 </select>
              </div>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {processedProducts.map(p => (
                <div key={p.id || (p as any)._id} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col group hover:-translate-y-2">
                   <div className="aspect-square overflow-hidden bg-slate-50 relative cursor-pointer" onClick={() => setSelectedProduct(p)}>
                     <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={p.name_en} />
                     <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black text-slate-900 uppercase tracking-widest shadow-sm">
                       {CATEGORY_MAP.find(cm => cm.key === p.category.toLowerCase())?.[lang] || p.category}
                     </div>
                   </div>
                   <div className="p-8 flex-1 flex flex-col">
                      <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight group-hover:text-green-700 transition-colors cursor-pointer">{lang === 'en' ? p.name_en : p.name_ne}</h3>
                      <p className="text-[10px] text-green-600 font-black uppercase tracking-widest mb-6">{t.by} {p.seller}</p>
                      <p className="text-3xl font-black text-slate-900 mb-8">Rs. {p.price} <span className="text-[10px] text-slate-400 uppercase tracking-widest">{t.perKg}</span></p>
                      <button onClick={() => addToCart(p)} className="mt-auto w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-green-600 transition-all active:scale-[0.98] shadow-lg">Add to Cart</button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sell' && (
          <div className="max-w-4xl mx-auto bg-white p-12 md:p-20 rounded-[4rem] shadow-2xl border border-slate-100 animate-in zoom-in duration-500">
            {!user ? (
               <div className="text-center py-10 space-y-6">
                 <div className="text-5xl">🔐</div>
                 <h2 className="text-3xl font-black news-serif">Sign up to List</h2>
                 <p className="text-slate-500 font-medium">Verified identity is mandatory for market nodes.</p>
                 <button onClick={() => setShowAuth(true)} className="bg-green-600 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl">Join Ecosystem</button>
               </div>
            ) : (
              <>
                <h2 className="text-3xl md:text-5xl font-black news-serif mb-12 text-center text-slate-900">List Your Resource</h2>
                <div className="flex gap-3 mb-16 bg-slate-50 p-2 rounded-[2rem]">
                  {(['product', 'bulk'] as const).map(type => (
                    <button key={type} type="button" onClick={() => setPostType(type)} className={`flex-1 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all ${postType === type ? 'bg-white shadow-xl text-slate-900' : 'text-slate-400'}`}>
                       <div className="flex flex-col items-center">
                         <span>{type === 'product' ? t.postProduct : t.postBulk}</span>
                         <span className="text-[8px] font-medium opacity-60 normal-case mt-1">{type === 'product' ? t.postProductDesc : t.postBulkDesc}</span>
                       </div>
                    </button>
                  ))}
                </div>
                <form onSubmit={handlePost} className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Resource Name</label>
                       <input placeholder="Ex: Hybrid Tomato" required className="w-full p-5 bg-slate-50 rounded-2xl border text-sm font-bold outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Category</label>
                       <select className="w-full p-5 bg-slate-50 rounded-2xl border text-sm font-bold outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                         {CATEGORY_MAP.map(c => <option key={c.key} value={c.key}>{lang === 'en' ? c.en : c.ne}</option>)}
                       </select>
                     </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Unit Price (Rs {t.perKg})</label>
                       <input placeholder="Ex: 85" type="number" required className="w-full p-5 bg-slate-50 rounded-2xl border text-sm font-bold outline-none" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{postType === 'bulk' ? `Total Capacity (${t.inKg})` : `Stock Quantity (${t.inKg})`}</label>
                       <input placeholder="Ex: 500" required className="w-full p-5 bg-slate-50 rounded-2xl border text-sm font-bold outline-none" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                     </div>
                   </div>
                   {postType === 'bulk' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Min Order (in KG)</label>
                          <input placeholder="Ex: 100" type="number" required className="w-full p-5 bg-slate-50 rounded-2xl border text-sm font-bold outline-none" value={formData.minOrder} onChange={e => setFormData({...formData, minOrder: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Location Hub</label>
                          <input placeholder="Ex: Chitwan" required className="w-full p-5 bg-slate-50 rounded-2xl border text-sm font-bold outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                        </div>
                     </div>
                   )}
                   <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white py-8 rounded-[2.5rem] font-black text-xl uppercase tracking-widest shadow-2xl hover:bg-green-600 transition-all active:scale-[0.98]">
                     {isSubmitting ? t.submitting : t.listBtn}
                   </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgriMarket;

import React, { useState, useEffect } from 'react';
import { Bell, Search, Menu, Package, Truck, Laptop, ChevronRight, Moon, Sun, Accessibility, Sparkles, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function Header({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { isDarkMode, toggleTheme, isHighContrast, toggleHighContrast } = useTheme();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({ products: [], suppliers: [], assets: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  // GÜVENLİ YAPAY ZEKA ENTEGRASYONU (BACKEND ÜZERİNDEN)
  useEffect(() => {
    const fetchNotificationsAndAI = async () => {
      try {
        const response = await api.get('/products');
        const products = response.data;
        
        // 1. Standart Kritik Stok Uyarıları
        const criticalProducts = products.filter(p => p.quantity <= p.minQuantity);
        const dynamicWarnings = criticalProducts.map(p => ({
          id: `warn-${p._id}`,
          type: 'warning',
          title: 'Kritik Stok Uyarısı',
          message: `${p.name} tükenmek üzere (Kalan: ${p.quantity} adet). Lütfen tedarik planlaması yapın.`,
          time: 'Yeni',
          isRead: false
        }));

        // 2. Kendi Backend'imizden AI Yanıtını Çek
        let aiInsightMessage = "AI analizi yükleniyor...";
        try {
           const aiResponse = await api.get('/ai/insights'); 
           aiInsightMessage = aiResponse.data.message;
        } catch (aiError) {
           console.error("Backend AI servisine ulaşılamadı:", aiError);
           aiInsightMessage = "Sistem verilerine göre kritik stok seviyelerinizi kontrol etmeniz önerilir."; 
        }

        const baseNotifications = [
          { 
            id: 'ai-1', 
            type: 'ai', 
            title: 'AI Envanter Analizi', 
            message: aiInsightMessage, 
            time: 'Şimdi', 
            isRead: false 
          },
          ...dynamicWarnings 
        ];

        setNotifications(baseNotifications);
      } catch (error) {
        console.error("Bildirimler yüklenirken hata oluştu:", error);
      }
    };

    fetchNotificationsAndAI();
  }, []);

  // Arama İşlevi
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 1) {
        setIsSearching(true);
        setShowDropdown(true);
        try {
          const [prodRes, supRes, assetRes] = await Promise.all([
            api.get('/products'),
            api.get('/suppliers'),
            api.get('/assets')
          ]);

          const term = searchTerm.toLowerCase();

          const filteredProducts = prodRes.data.filter(p => 
            (p.name?.toLowerCase() || "").includes(term) || 
            (p.sku?.toLowerCase() || "").includes(term)
          );
          
          const filteredSuppliers = supRes.data.filter(s => 
            (s.name?.toLowerCase() || "").includes(term) || 
            (s.contactName?.toLowerCase() || "").includes(term)
          );
          
          const filteredAssets = assetRes.data.filter(a => 
            (a.name?.toLowerCase() || "").includes(term) || 
            (a.sku?.toLowerCase() || "").includes(term)
          );

          setSearchResults({
            products: filteredProducts,
            suppliers: filteredSuppliers,
            assets: filteredAssets
          });
        } catch (error) {
          console.error("Arama sırasında hata:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults({ products: [], suppliers: [], assets: [] });
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleResultClick = (path) => {
    navigate(path);
    setShowDropdown(false);
    setSearchTerm('');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 transition-colors duration-300">
      
      <div className="flex items-center flex-1">
        
        <button 
          onClick={onMenuClick} 
          className="md:hidden p-2 mr-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="relative flex items-center text-slate-400 w-full max-w-md">
          <Search size={20} className="absolute ml-3 text-slate-400 dark:text-slate-500" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Sistemde ara (Ürün, Tedarikçi, Demirbaş)..." 
            className="w-full bg-slate-50 dark:bg-slate-800 border border-transparent rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-200 focus:ring-4 focus:ring-blue-50 transition-all text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
          />

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden max-h-[70vh] overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {isSearching ? (
                <div className="p-4 text-center text-sm text-slate-500">Sistem taranıyor...</div>
              ) : (searchResults.products.length === 0 && searchResults.suppliers.length === 0 && searchResults.assets.length === 0) ? (
                <div className="p-4 text-center text-sm text-slate-500">"{searchTerm}" için sonuç bulunamadı.</div>
              ) : (
                <div className="py-2">
                  
                  {searchResults.products.length > 0 && (
                    <div className="mb-2">
                      <div className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900">Stok & Ürünler</div>
                      {searchResults.products.map(p => (
                        <div key={p._id} onClick={() => handleResultClick('/inventory')} className="flex items-center justify-between px-4 py-2 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer transition-colors group">
                          <div className="flex items-center gap-3">
                            <Package size={16} className="text-blue-500" />
                            <div>
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400">{p.name}</p>
                              <p className="text-xs text-slate-400">SKU: {p.sku || 'Belirtilmedi'}</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500" />
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.suppliers.length > 0 && (
                    <div className="mb-2">
                      <div className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900">Tedarikçiler</div>
                      {searchResults.suppliers.map(s => (
                        <div key={s._id} onClick={() => handleResultClick('/suppliers')} className="flex items-center justify-between px-4 py-2 hover:bg-indigo-50 dark:hover:bg-slate-700 cursor-pointer transition-colors group">
                          <div className="flex items-center gap-3">
                            <Truck size={16} className="text-indigo-500" />
                            <div>
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">{s.name}</p>
                              <p className="text-xs text-slate-400">{s.contactName || 'Belirtilmedi'}</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500" />
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.assets.length > 0 && (
                    <div>
                      <div className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900">Demirbaşlar</div>
                      {searchResults.assets.map(a => (
                        <div key={a._id} onClick={() => handleResultClick('/assets')} className="flex items-center justify-between px-4 py-2 hover:bg-emerald-50 dark:hover:bg-slate-700 cursor-pointer transition-colors group">
                          <div className="flex items-center gap-3">
                            <Laptop size={16} className="text-emerald-500" />
                            <div>
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{a.name}</p>
                              <p className="text-xs text-slate-400">SKU: {a.sku || 'Belirtilmedi'}</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500" />
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        
        <button 
          onClick={toggleHighContrast} 
          title="Yüksek Kontrast ve Büyük Metin"
          className={`p-2 rounded-lg transition-all ${isHighContrast ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 ring-2 ring-amber-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600'}`}
        >
          <Accessibility size={22} />
        </button>

        <button 
          onClick={toggleTheme} 
          title="Tema Değiştir"
          className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 rounded-lg transition-colors"
        >
          {isDarkMode ? <Sun size={22} className="text-amber-500" /> : <Moon size={22} />}
        </button>

        <div className="relative hidden sm:block">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-lg transition-colors ${showNotifications ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600'}`}
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 dark:text-white">Bildirimler</h3>
                  {unreadCount > 0 && (
                    <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} Yeni
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors">
                    Tümünü Okundu İşaretle
                  </button>
                )}
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">Bildiriminiz bulunmuyor.</div>
                ) : (
                  <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-4 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 ${!notification.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                      >
                        <div className="flex gap-3">
                          <div className="mt-0.5 shrink-0">
                            {notification.type === 'ai' && <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"><Sparkles size={16} /></div>}
                            {notification.type === 'warning' && <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg"><AlertTriangle size={16} /></div>}
                          </div>
                          <div>
                            <p className={`text-sm font-semibold mb-0.5 ${!notification.isRead ? 'text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>
                              {notification.title}
                            </p>
                            <p className={`text-xs leading-relaxed ${!notification.isRead ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:block h-8 w-px bg-slate-200 dark:bg-slate-700"></div>

        <div 
          onClick={() => navigate('/settings')}
          className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 md:pl-3 rounded-xl transition-colors"
          title="Ayarlar"
        >
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{user?.name || 'Kullanıcı'}</span>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{user?.role || 'Yetki Yok'}</span>
          </div>
          
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm border-2 border-white dark:border-slate-800 text-sm md:text-base">
            {getInitials(user?.name)}
          </div>
        </div>

      </div>
    </header>
  );
}
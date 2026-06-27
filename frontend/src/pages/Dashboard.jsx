import React, { useState, useEffect } from 'react';
import { 
  Package, TrendingUp, AlertTriangle, DollarSign, Clock, 
  ArrowRight, Sparkles, ChevronRight, X, Send, MessageSquare 
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalAssetValue: 0,
    totalDepreciation: 0,
    criticalStock: 0
  });
  const [categoryData, setCategoryData] = useState([]);
  const [financialData, setFinancialData] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // NexusAI için State'ler
  const [aiInsight, setAiInsight] = useState("Yapay zeka stok verilerinizi analiz ediyor...");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchAiInsight();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsRes, assetsRes] = await Promise.all([
        api.get('/products'),
        api.get('/assets')
      ]);

      const products = productsRes.data;
      const assets = assetsRes.data;

      const totalProducts = products.length;
      const criticalStock = products.filter(p => p.quantity <= p.minQuantity).length;
      const totalAssetValue = assets.reduce((sum, asset) => sum + Number(asset.currentValue), 0);
      const totalDepreciation = assets.reduce((sum, asset) => sum + Number(asset.accumulatedDepreciation), 0);

      setStats({ totalProducts, totalAssetValue, totalDepreciation, criticalStock });

      const categories = {};
      products.forEach(p => {
        categories[p.category] = (categories[p.category] || 0) + p.quantity;
      });
      const formattedCategoryData = Object.keys(categories).map(key => ({
        name: key,
        adet: categories[key]
      }));
      setCategoryData(formattedCategoryData);

      const monthNames = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
      const dynamicFinData = [];
      const today = new Date();

      for (let i = 5; i >= 0; i--) {
        const targetDate = new Date(today.getFullYear(), today.getMonth() - i + 1, 0); 
        const monthString = monthNames[targetDate.getMonth()];

        let monthNetValue = 0;
        let monthDepreciation = 0;

        assets.forEach(asset => {
          const purchaseDate = new Date(asset.purchaseDate);
          if (purchaseDate <= targetDate) {
            const yearsUsed = (targetDate - purchaseDate) / (1000 * 60 * 60 * 24 * 365.25);
            const annualDep = (asset.purchasePrice - asset.salvageValue) / asset.usefulLife;
            const accumulated = Math.min(Math.max(0, yearsUsed * annualDep), asset.purchasePrice - asset.salvageValue);
            
            monthDepreciation += accumulated;
            monthNetValue += (asset.purchasePrice - accumulated);
          }
        });

        dynamicFinData.push({
          name: monthString,
          deger: Math.round(monthNetValue),
          amortisman: Math.round(monthDepreciation)
        });
      }
      
      setFinancialData(dynamicFinData);

      const sortedProducts = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
      setRecentProducts(sortedProducts);

      setLoading(false);

    } catch (error) {
      console.error("Dashboard veri çekme hatası:", error);
      setLoading(false);
    }
  };

  const fetchAiInsight = async () => {
    try {
      const res = await api.get('/ai/insights');
      if (res.data && res.data.message) {
        setAiInsight(res.data.message);
      }
    } catch (error) {
      console.error("Dashboard AI Hatası:", error);
      setAiInsight("Sistem verilerine göre donanım ve elektronik kategorilerinde planlı tedarik döngüsü yaklaşmaktadır.");
    }
  };

  // NexusAI Soru Sorma Fonksiyonu
  const handleAskAI = async (customQuestion) => {
    const question = customQuestion || aiQuestion;
    if (!question.trim()) return;

    // YENİ UX GÜNCELLEMESİ: Soru alındığı an input kutusunu anında temizliyoruz
    setAiQuestion("");

    setIsAiLoading(true);
    setAiAnswer("");
    try {
      const res = await api.post('/ai/ask', { query: question });
      setAiAnswer(res.data.answer);
    } catch (error) {
      console.error("AI Soru Hatası:", error);
      setAiAnswer("Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
        <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
          <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      
      {/* Başlık Alanı */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white transition-colors">Sistem Özeti</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">NexusERP envanter ve finansal durumunuzun gerçek zamanlı görünümü.</p>
        </div>
        <div className="text-sm text-slate-400 dark:text-slate-500 flex items-center gap-2 transition-colors">
          <Clock size={16} /> Güncellendi: {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* NexusAI Yönetici Özeti Kartı */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-[2px] rounded-2xl shadow-xl mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-colors">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-xl shrink-0">
            <Sparkles size={28} className="animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">NexusAI Analizi</h3>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Aktif</span>
            </div>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {aiInsight}
            </p>
          </div>
          <button 
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
          >
            Detaylı Rapor <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 4'LÜ KPI KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div><p className="text-sm font-medium text-slate-500 dark:text-slate-400">Kayıtlı Çeşit (SKU)</p><h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stats.totalProducts}</h3></div>
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400"><Package size={24} /></div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div><p className="text-sm font-medium text-slate-500 dark:text-slate-400">Toplam Varlık Değeri</p><h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">₺{stats.totalAssetValue.toLocaleString('tr-TR')}</h3></div>
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400"><DollarSign size={24} /></div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div><p className="text-sm font-medium text-slate-500 dark:text-slate-400">Toplam Değer Kayabı</p><h3 className="text-2xl font-bold text-red-500 dark:text-red-400 mt-1">-₺{stats.totalDepreciation.toLocaleString('tr-TR')}</h3></div>
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center text-red-500 dark:text-red-400"><TrendingUp size={24} /></div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:shadow-md transition-all duration-300 hover:border-orange-200 dark:hover:border-orange-500/50">
          <div><p className="text-sm font-medium text-slate-500 dark:text-slate-400">Kritik Stok Uyarıları</p><h3 className="text-2xl font-bold text-orange-500 dark:text-orange-400 mt-1">{stats.criticalStock}</h3></div>
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center text-orange-500 dark:text-orange-400"><AlertTriangle size={24} /></div>
        </div>
      </div>

      {/* GRAFİKLER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all duration-300">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">6 Aylık Gerçek Finansal Seyir</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={financialData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₺${value/1000}k`} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => `₺${value.toLocaleString('tr-TR')}`} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#0f172a' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: '#64748b' }} />
                <Line type="monotone" dataKey="deger" name="Net Varlık Değeri" stroke="#10B981" strokeWidth={3} activeDot={{ r: 6 }} dot={false} />
                <Line type="monotone" dataKey="amortisman" name="Birikmiş Amortisman" stroke="#EF4444" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all duration-300">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Kategori Bazlı Stok Dağılımı</h3>
          {categoryData.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-slate-400 dark:text-slate-500">Veri bulunamadı.</div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip cursor={{fill: 'rgba(148, 163, 184, 0.1)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#0f172a' }} />
                  <Bar dataKey="adet" name="Stok Adedi" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* SON İŞLEMLER TABLOSU */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Son Eklenen Ürünler</h3>
          <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors">
            Tümünü Gör <ArrowRight size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider transition-colors">
                <th className="p-4 font-medium">Ürün Adı</th>
                <th className="p-4 font-medium whitespace-nowrap w-[1%]">Kategori</th>
                <th className="p-4 font-medium whitespace-nowrap w-[1%]">Tedarikçi Firma</th>
                <th className="p-4 font-medium whitespace-nowrap w-[1%]">Stok Durumu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 transition-colors">
              {recentProducts.map((product) => (
                <tr key={product._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{product.name}</td>
                  <td className="p-4 whitespace-nowrap w-[1%]">
                    <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md text-xs font-medium transition-colors">{product.category}</span>
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap w-[1%]">
                    {product.supplier?.name || <span className="text-slate-400 dark:text-slate-500 italic">Dahili Üretim / Belirtilmedi</span>}
                  </td>
                  <td className="p-4 whitespace-nowrap w-[1%]">
                    {product.quantity <= product.minQuantity ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-md w-max transition-colors">
                        <AlertTriangle size={12} /> Kritik ({product.quantity})
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md transition-colors">Yeterli ({product.quantity})</span>
                    )}
                  </td>
                </tr>
              ))}
              {recentProducts.length === 0 && (
                <tr><td colSpan="4" className="p-8 text-center text-slate-500 dark:text-slate-400">Henüz ürün eklenmemiş.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEXUSAI ASİSTANI MODAL (Drawer Style) */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full sm:w-[500px] h-full sm:h-[95vh] bg-white dark:bg-slate-900 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-600 to-indigo-600 flex justify-between items-center">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-white/20 rounded-lg"><Sparkles size={20} /></div>
                <div>
                  <h2 className="text-lg font-bold">NexusAI Asistanı</h2>
                  <p className="text-xs text-blue-100">Veritabanı tabanlı akıllı analiz merkezi</p>
                </div>
              </div>
              <button onClick={() => setIsAiModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Otomatik Soru Butonları (Hızlı Aksiyonlar) */}
              <div className="grid grid-cols-1 gap-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Hızlı Analiz Soruları</p>
                {[
                  "Kritik stok riskini hesapla ve ürünleri listele.",
                  "En yüksek maliyetli 3 demirbaş hangisi?",
                  "Stok devir hızı ve genel envanter sağlığı raporu ver.",
                  "Tedarikçi bazlı finansal yükümüzü özetle."
                ].map((q, idx) => (
                  <button 
                    key={idx}
                    onClick={() => { handleAskAI(q); }}
                    className="flex items-center justify-between p-3 text-sm text-left text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all group"
                  >
                    {q} <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>

              {/* Cevap Alanı */}
              <div className="min-h-[200px] bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-5 border border-dashed border-slate-200 dark:border-slate-800">
                {!aiAnswer && !isAiLoading && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-10 opacity-60">
                    <MessageSquare size={40} className="text-slate-300" />
                    <p className="text-slate-500 text-sm italic">Bir soru seçin veya aşağıdan asistanınıza sorun...</p>
                  </div>
                )}
                {isAiLoading && (
                  <div className="space-y-4 animate-pulse">
                    {/* YENİ GÜNCELLEME: UX için bilgilendirici yükleme yazısı eklendi */}
                    <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 mb-4 text-sm font-medium">
                      <Sparkles className="animate-pulse" size={16} /> NexusAI veritabanını tarıyor ve analiz ediyor...
                    </div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                  </div>
                )}
                {aiAnswer && (
                  <div className="space-y-4 animate-in fade-in duration-700">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase">
                      <Sparkles size={14} /> Analiz Sonucu
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-line">
                      {aiAnswer}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer / Input Area */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <div className="relative">
                <input 
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
                  placeholder="Sisteme bir şey sorun... (Örn: Toplam varlık değerimiz ne?)"
                  disabled={isAiLoading} // YENİ GÜNCELLEME: API beklerken input kilitlenir
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-4 pl-5 pr-14 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-800 dark:text-white shadow-inner disabled:opacity-50 disabled:cursor-not-allowed" 
                />
                <button 
                  onClick={() => handleAskAI()}
                  disabled={isAiLoading || !aiQuestion.trim()} // YENİ GÜNCELLEME: Yüklenirken buton da kilitlenir
                  className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-lg transition-all flex items-center justify-center"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
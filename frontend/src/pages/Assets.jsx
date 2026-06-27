import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, TrendingDown, Wrench, History, Download, Filter, FileSpreadsheet } from 'lucide-react'; 
import toast from 'react-hot-toast';
import jsPDF from 'jspdf'; 
import autoTable from 'jspdf-autotable'; 
import * as XLSX from 'xlsx'; // YENİ EKLENDİ: Gerçek Excel oluşturucu kütüphane
import api from '../services/api';
import { useAuth } from '../context/AuthContext'; 

export default function Assets() {
  const { isAdmin } = useAuth(); 
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // YENİ EKLENDİ: Arama ve Filtreleme State'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Tümü');
  const [categories, setCategories] = useState(['Elektronik', 'Mobilya', 'Makine', 'Araç', 'Diğer']);

  // Yeni Demirbaş Ekleme Modal State'leri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [formData, setFormData] = useState({
    name: '', sku: '', category: 'Elektronik', purchasePrice: 0, purchaseDate: '', salvageValue: 0, usefulLife: 5
  });

  // Bakım (Maintenance) Modal State'leri
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [maintenances, setMaintenances] = useState([]);
  const [maintForm, setMaintForm] = useState({ description: '', cost: 0, performedBy: '' });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/assets');
      setAssets(response.data);

      // YENİ EKLENDİ: Dinamik Kategori Öğrenme Sistemi
      const existingCategories = response.data.map(a => a.category).filter(Boolean);
      const uniqueCategories = [...new Set(existingCategories)];
      const defaultCategories = ['Elektronik', 'Mobilya', 'Makine', 'Araç', 'Diğer'];
      const combinedCategories = [...new Set([...defaultCategories, ...uniqueCategories])];
      setCategories(combinedCategories);

    } catch (err) {
      toast.error('Demirbaşlar yüklenirken bir hata oluştu.');
      console.error('Demirbaşlar yüklenirken hata oluştu', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text("NexusERP - Demirbas ve Amortisman Raporu", 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Olusturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 30);

      const tableColumn = ["Demirbas Adi", "SKU", "Kategori", "Alis Fiyati (TL)", "Guncel Deger (TL)"];
      const tableRows = [];

      // GÜNCELLENDİ: Sadece filtrelenmiş verileri PDF'e aktarır
      filteredAssets.forEach(asset => {
        const assetData = [
          asset.name,
          asset.sku,
          asset.category,
          `${Number(asset.purchasePrice).toLocaleString('tr-TR')}`,
          `${Number(asset.currentValue).toLocaleString('tr-TR')}`
        ];
        tableRows.push(assetData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 10 },
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] }, 
        alternateRowStyles: { fillColor: [248, 250, 252] } 
      });

      doc.save(`NexusERP_Demirbas_Raporu_${new Date().toLocaleDateString('tr-TR')}.pdf`);
      toast.success('PDF raporu başarıyla indirildi!');
    } catch (error) {
      toast.error('PDF oluşturulurken bir hata oluştu.');
      console.error("PDF Hatası:", error);
    }
  };

  // YENİ EKLENDİ: Gerçek ve Estetik XLSX Dosyası Oluşturma
  const handleExportExcel = () => {
    try {
      const excelData = filteredAssets.map(asset => ({
        "Demirbaş Adı": asset.name,
        "Stok Kodu (SKU)": asset.sku,
        "Kategori": asset.category,
        "Alış Fiyatı (TL)": asset.purchasePrice,
        "Değer Kaybı (TL)": asset.accumulatedDepreciation || 0,
        "Güncel Değer (TL)": asset.currentValue || 0,
        "Hurda Değeri (TL)": asset.salvageValue,
        "Faydalı Ömür (Yıl)": asset.usefulLife
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);

      worksheet['!cols'] = [
        { wch: 30 }, // Demirbaş Adı
        { wch: 20 }, // SKU
        { wch: 15 }, // Kategori
        { wch: 18 }, // Alış Fiyatı
        { wch: 18 }, // Değer Kaybı
        { wch: 18 }, // Güncel Değer
        { wch: 18 }, // Hurda Değeri
        { wch: 18 }  // Faydalı Ömür
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Demirbaşlar");
      XLSX.writeFile(workbook, `NexusERP_Demirbas_Raporu_${new Date().toLocaleDateString('tr-TR')}.xlsx`);

      toast.success('Excel (.xlsx) raporu başarıyla indirildi!');
    } catch (error) {
      toast.error('Excel oluşturulurken bir hata oluştu.');
      console.error("Excel Hatası:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDeleteAsset = async (id) => {
    if (window.confirm('Bu demirbaşı sistemden tamamen silmek istediğinize emin misiniz?')) {
      try {
        await api.delete(`/assets/${id}`);
        toast.success('Demirbaş sistemden başarıyla silindi.');
        fetchAssets(); 
      } catch (err) {
        toast.error('Demirbaş silinirken bir hata oluştu!');
        console.error(err);
      }
    }
  };

  const handleEditClick = (asset) => {
    setEditingId(asset._id);
    const formattedDate = new Date(asset.purchaseDate).toISOString().split('T')[0];
    
    setFormData({
      name: asset.name,
      sku: asset.sku,
      category: asset.category,
      purchasePrice: asset.purchasePrice,
      purchaseDate: formattedDate,
      salvageValue: asset.salvageValue,
      usefulLife: asset.usefulLife
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/assets/${editingId}`, formData);
        toast.success('Demirbaş başarıyla güncellendi!');
      } else {
        await api.post('/assets', formData);
        toast.success('Yeni demirbaş sisteme kaydedildi!');
      }
      closeModal();
      fetchAssets();
    } catch (err) {
      toast.error('Demirbaş kaydedilirken bir hata oluştu!');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', sku: '', category: 'Elektronik', purchasePrice: 0, purchaseDate: '', salvageValue: 0, usefulLife: 5 });
  };

  const openMaintenanceModal = async (asset) => {
    setSelectedAsset(asset);
    setIsMaintModalOpen(true);
    try {
      const response = await api.get(`/maintenance/${asset._id}`);
      setMaintenances(response.data);
    } catch (error) {
      toast.error('Bakım geçmişi çekilemedi.');
      console.error("Bakım geçmişi çekilemedi", error);
    }
  };

  const handleMaintInputChange = (e) => {
    setMaintForm({ ...maintForm, [e.target.name]: e.target.value });
  };

  const handleMaintSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/maintenance', { ...maintForm, assetId: selectedAsset._id });
      
      toast.success('Servis kaydı başarıyla işlendi!');
      
      const response = await api.get(`/maintenance/${selectedAsset._id}`);
      setMaintenances(response.data);
      setMaintForm({ description: '', cost: 0, performedBy: '' });
      
      fetchAssets();
    } catch (error) {
      toast.error('Bakım kaydı eklenirken hata oluştu!');
    }
  };

  // YENİ EKLENDİ: Zincirleme Filtreleme Algoritması
  const filteredAssets = assets.filter(asset => {
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchLower) ||
      asset.sku.toLowerCase().includes(searchLower) ||
      asset.category.toLowerCase().includes(searchLower);

    const matchesCategory = selectedCategoryFilter === 'Tümü' || asset.category === selectedCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 relative animate-in fade-in duration-500">
      
      {/* Üst Kısım */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white transition-colors">Demirbaşlar ve Amortisman</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Şirket varlıklarını ve arıza/bakım geçmişlerini yönetin.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* YENİ EKLENDİ: Excel İndir Butonu */}
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
          >
            <FileSpreadsheet size={20} />
            Excel İndir
          </button>

          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
          >
            <Download size={20} />
            PDF İndir
          </button>

          {isAdmin() && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
            >
              <Plus size={20} />
              Yeni Demirbaş Ekle
            </button>
          )}
        </div>
      </div>

      {/* YENİ EKLENDİ: ARAMA VE FİLTRELEME ÇUBUĞU */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3 focus-within:ring-2 focus-within:ring-indigo-500 transition-colors">
          <Search className="text-slate-400 dark:text-slate-500" size={20} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Demirbaş kodu (SKU), cihaz adı veya kategori ile ara..." 
            className="bg-transparent border-none outline-none w-full text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder-slate-500"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 p-2 sm:p-0 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center shrink-0">
          <div className="flex items-center px-4 border-r border-slate-100 dark:border-slate-700 h-full">
            <Filter className="text-slate-400 dark:text-slate-500" size={18} />
          </div>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="bg-transparent border-none outline-none px-4 py-4 w-full sm:w-48 text-slate-700 dark:text-slate-200 font-medium focus:ring-0 cursor-pointer appearance-none"
          >
            <option value="Tümü">Tüm Kategoriler</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tablo Alanı */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 animate-pulse">Veriler getiriliyor...</div>
        ) : filteredAssets.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            {searchTerm || selectedCategoryFilter !== 'Tümü' 
              ? `Belirlediğiniz kriterlere uygun demirbaş bulunamadı.` 
              : 'Kayıtlı demirbaş bulunamadı.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider transition-colors">
                  <th className="p-4 font-medium whitespace-nowrap">Demirbaş Adı</th>
                  <th className="p-4 font-medium whitespace-nowrap">Alış Fiyatı</th>
                  <th className="p-4 font-medium text-red-500 dark:text-red-400 flex items-center gap-1 whitespace-nowrap">
                    <TrendingDown size={16} /> Değer Kaybı
                  </th>
                  <th className="p-4 font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">Güncel Değer</th>
                  <th className="p-4 font-medium text-right whitespace-nowrap">İşlemler / Bakım</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 transition-colors">
                {filteredAssets.map((asset) => (
                  <tr key={asset._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      <div>{asset.name}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">{asset.sku}</div>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">₺{asset.purchasePrice.toLocaleString('tr-TR')}</td>
                    <td className="p-4 text-red-500 dark:text-red-400 font-medium font-mono whitespace-nowrap">
                      - ₺{Number(asset.accumulatedDepreciation).toLocaleString('tr-TR')}
                    </td>
                    <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold text-lg whitespace-nowrap">
                      ₺{Number(asset.currentValue).toLocaleString('tr-TR')}
                    </td>
                    <td className="p-4 flex justify-end gap-2 whitespace-nowrap">
                      <button 
                        onClick={() => openMaintenanceModal(asset)}
                        title="Bakım Geçmişi"
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Wrench size={16} /> Bakım
                      </button>
                      
                      {isAdmin() && (
                        <>
                          <button 
                            onClick={() => handleEditClick(asset)} 
                            title="Düzenle"
                            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                          >
                            <Edit size={18} />
                          </button>

                          <button 
                            onClick={() => handleDeleteAsset(asset._id)} 
                            title="Sil"
                            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- 1. YENİ DEMİRBAŞ EKLEME MODALI --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{editingId ? 'Demirbaş Güncelle' : 'Yeni Demirbaş Alımı'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cihaz Adı</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SKU</label>
                  <input required type="text" name="sku" value={formData.sku} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Alış Fiyatı</label>
                  <input required type="number" name="purchasePrice" value={formData.purchasePrice} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tarih</label>
                  <input required type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ömür (Yıl)</label>
                  <input required type="number" name="usefulLife" value={formData.usefulLife} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hurda (₺)</label>
                  <input required type="number" name="salvageValue" value={formData.salvageValue} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">İptal</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-lg transition-colors">{editingId ? 'Güncelle' : 'Kaydet'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- 2. BAKIM & ARIZA GEÇMİŞİ MODALI --- */}
      {isMaintModalOpen && selectedAsset && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl w-full max-w-3xl p-6 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in zoom-in duration-200">
            
            {/* Sol Taraf: Yeni Bakım Ekleme Formu */}
            <div>
              <div className="flex justify-between items-center mb-6 md:hidden">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Bakım Paneli</h2>
                <button onClick={() => setIsMaintModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><X size={24} /></button>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Yeni Servis Kaydı</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{selectedAsset.name} için işlem girin.</p>
              
              <form onSubmit={handleMaintSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Yapılan İşlem / Arıza Detayı</label>
                  <textarea required rows="3" name="description" value={maintForm.description} onChange={handleMaintInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors" placeholder="Örn: Anakart değişimi yapıldı..."></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Servis Maliyeti (₺)</label>
                    <input required type="number" name="cost" value={maintForm.cost} onChange={handleMaintInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Servis Sağlayıcı</label>
                    <input required type="text" name="performedBy" value={maintForm.performedBy} onChange={handleMaintInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors" placeholder="Örn: Yetkili Servis" />
                  </div>
                </div>
                <button type="submit" className="w-full py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
                  Kaydı Sisteme İşle
                </button>
              </form>
            </div>

            {/* Sağ Taraf: Geçmiş Bakım Listesi */}
            <div className="flex flex-col h-full border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 pt-6 md:pt-0 md:pl-8 relative transition-colors">
              <button onClick={() => setIsMaintModalOpen(false)} className="absolute top-0 right-0 hidden md:block text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><X size={24} /></button>
              
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <History size={20} className="text-blue-500" /> Servis Geçmişi
              </h3>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[400px]">
                {maintenances.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic text-center mt-10">Bu cihaza ait geçmiş servis kaydı bulunmuyor.</p>
                ) : (
                  maintenances.map((maint) => (
                    <div key={maint._id} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 relative transition-colors">
                      <span className="absolute top-3 right-3 text-xs font-bold text-slate-400 dark:text-slate-500">
                        {new Date(maint.maintenanceDate).toLocaleDateString('tr-TR')}
                      </span>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 pr-20">{maint.description}</p>
                      <div className="flex justify-between items-center mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>Servis: <span className="font-medium text-slate-700 dark:text-slate-300">{maint.performedBy}</span></span>
                        <span className="font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded transition-colors">Masraf: ₺{maint.cost}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
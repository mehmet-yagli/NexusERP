import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, Truck, Download, AlertTriangle, Filter, FileSpreadsheet, History } from 'lucide-react'; // YENİ: History ikonu eklendi
import toast from 'react-hot-toast';
import jsPDF from 'jspdf'; 
import autoTable from 'jspdf-autotable'; 
import * as XLSX from 'xlsx'; 
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Inventory() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Tümü');

  const [categories, setCategories] = useState(['Elektronik', 'Mobilya', 'Kırtasiye', 'Teknoloji', 'Gıda', 'Temizlik', 'Diğer']);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Elektronik',
    quantity: 0,
    minQuantity: 0,
    price: 0,
    supplier: '' 
  });

  //  Stok Hareketleri (Geçmiş) Modal State'leri
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchSuppliers(); 
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data);
      
      const existingCategories = response.data.map(p => p.category).filter(Boolean);
      const uniqueCategories = [...new Set(existingCategories)];
      const defaultCategories = ['Elektronik', 'Mobilya', 'Kırtasiye', 'Teknoloji', 'Gıda', 'Temizlik', 'Diğer'];
      const combinedCategories = [...new Set([...defaultCategories, ...uniqueCategories])];
      setCategories(combinedCategories);

      setError(null);
    } catch (err) {
      setError('Ürünler yüklenirken bir hata oluştu.');
      console.error("API Hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data);
    } catch (err) {
      console.error("Tedarikçiler çekilemedi:", err);
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("NexusERP - Stok ve Urunler Raporu", 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Olusturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 30);

      const tableColumn = ["Urun Adi", "SKU", "Kategori", "Tedarikci", "Miktar", "Birim Fiyat (TL)"];
      const tableRows = [];

      filteredProducts.forEach(product => {
        const productData = [
          product.name,
          product.sku,
          product.category,
          product.supplier?.name || 'Belirtilmedi',
          `${product.quantity} Adet`,
          `${Number(product.price).toLocaleString('tr-TR')}`
        ];
        tableRows.push(productData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 10 },
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] }, 
        alternateRowStyles: { fillColor: [248, 250, 252] } 
      });

      doc.save(`NexusERP_Stok_Raporu_${new Date().toLocaleDateString('tr-TR')}.pdf`);
      toast.success('PDF raporu başarıyla indirildi!');
    } catch (error) {
      toast.error('PDF oluşturulurken bir hata oluştu.');
      console.error("PDF Hatası:", error);
    }
  };

  const handleExportExcel = () => {
    try {
      const excelData = filteredProducts.map(product => ({
        "Ürün Adı": product.name,
        "Stok Kodu (SKU)": product.sku,
        "Kategori": product.category,
        "Tedarikçi": product.supplier?.name || 'Belirtilmedi',
        "Miktar (Adet)": product.quantity,
        "Birim Fiyat (TL)": product.price
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);

      worksheet['!cols'] = [
        { wch: 30 }, 
        { wch: 20 }, 
        { wch: 15 }, 
        { wch: 25 }, 
        { wch: 15 }, 
        { wch: 15 }  
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Stoklar");

      XLSX.writeFile(workbook, `NexusERP_Stok_Raporu_${new Date().toLocaleDateString('tr-TR')}.xlsx`);

      toast.success('Excel (.xlsx) raporu başarıyla indirildi!');
    } catch (error) {
      toast.error('Excel oluşturulurken bir hata oluştu.');
      console.error("Excel Hatası:", error);
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim() !== '') {
      const newCat = newCategoryName.trim();
      setCategories([...categories, newCat]);
      setFormData({ ...formData, category: newCat });
      setNewCategoryName('');
      setShowNewCategoryInput(false);
      toast.success(`'${newCat}' kategorisi eklendi!`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category' && value === 'NEW_CATEGORY') {
      setShowNewCategoryInput(true);
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Ürün başarıyla silindi!'); 
        fetchProducts();
      } catch (err) {
        toast.error('Ürün silinirken bir hata oluştu!'); 
        console.error(err);
      }
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      quantity: product.quantity,
      minQuantity: product.minQuantity,
      price: product.price,
      supplier: product.supplier?._id || '' 
    });
    
    if (!categories.includes(product.category)) {
      setCategories([...categories, product.category]);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (payload.supplier === '') {
        payload.supplier = null;
      }

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast.success('Ürün başarıyla güncellendi!'); 
      } else {
        await api.post('/products', payload);
        toast.success('Yeni ürün başarıyla eklendi!'); 
      }
      
      closeModal();
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ürün kaydedilirken bir hata oluştu!'); 
      console.error(err);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', sku: '', category: 'Elektronik', quantity: 0, minQuantity: 0, price: 0, supplier: '' }); 
    setShowNewCategoryInput(false);
  };

  // Ürünün stok geçmişini backend'den çekme fonksiyonu
  const handleViewHistory = async (product) => {
    setSelectedProduct(product);
    setIsHistoryModalOpen(true);
    setLoadingHistory(true);
    try {
      const response = await api.get(`/products/${product._id}/movements`);
      setMovements(response.data);
    } catch (error) {
      toast.error('Stok geçmişi getirilemedi.');
      setMovements([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      product.name.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower);

    const matchesCategory = selectedCategoryFilter === 'Tümü' || product.category === selectedCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 relative animate-in fade-in duration-500">
      
      {/* ÜST BAŞLIK VE BUTONLAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white transition-colors">Stok & Ürünler</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Envanterinizdeki tüm ürünleri buradan yönetebilirsiniz.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
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
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
            >
              <Plus size={20} />
              Yeni Ürün Ekle
            </button>
          )}
        </div>
      </div>

      {/* ARAMA VE FİLTRELEME ÇUBUĞU */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3 focus-within:ring-2 focus-within:ring-blue-500 transition-colors">
          <Search className="text-slate-400 dark:text-slate-500" size={20} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Stok kodu (SKU), ürün adı veya kategori ile ara..." 
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

      {/* TABLO ALANI */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 animate-pulse">Veriler yükleniyor...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 font-medium">{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            {searchTerm || selectedCategoryFilter !== 'Tümü' 
              ? `Belirlediğiniz kriterlere uygun ürün bulunamadı.` 
              : 'Henüz hiç ürün eklenmemiş.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider transition-colors">
                  <th className="p-4 font-medium whitespace-nowrap">Ürün Adı</th>
                  <th className="p-4 font-medium whitespace-nowrap">Stok Kodu</th>
                  <th className="p-4 font-medium whitespace-nowrap">Kategori</th>
                  <th className="p-4 font-medium whitespace-nowrap">Tedarikçi</th>
                  <th className="p-4 font-medium whitespace-nowrap">Miktar</th>
                  <th className="p-4 font-medium whitespace-nowrap">Birim Fiyat</th>
                  <th className="p-4 font-medium whitespace-nowrap text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 transition-colors">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">{product.name}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-sm whitespace-nowrap">{product.sku}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-medium transition-colors">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 text-sm whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Truck size={14} className="text-slate-400 dark:text-slate-500" />
                        {product.supplier?.name || <span className="text-slate-400 dark:text-slate-500 italic">Belirtilmedi</span>}
                      </div>
                    </td>
                    <td className="p-4 text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {product.quantity <= product.minQuantity ? (
                        <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-md w-max transition-colors">
                          <AlertTriangle size={14} /> {product.quantity} adet
                        </span>
                      ) : (
                        <span className="px-2 py-1">{product.quantity} adet</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-800 dark:text-slate-200 font-medium whitespace-nowrap">₺{product.price.toLocaleString('tr-TR')}</td>
                    <td className="p-4 flex justify-end gap-2 whitespace-nowrap">
                      {/* Geçmiş Butonu (Admin/Personel herkes görebilir) */}
                      <button onClick={() => handleViewHistory(product)} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors" title="Stok Geçmişi">
                        <History size={18} />
                      </button>

                      {isAdmin() && (
                        <>
                          <button onClick={() => handleEditClick(product)} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Düzenle">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(product._id)} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Sil">
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

      {/* STOK HAREKETLERİ (GEÇMİŞ) MODALI */}
      {isHistoryModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Stok Hareketleri</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{selectedProduct.name} ({selectedProduct.sku})</p>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {loadingHistory ? (
                <div className="text-center text-slate-500 dark:text-slate-400 py-8 animate-pulse">Geçmiş veriler yükleniyor...</div>
              ) : movements.length === 0 ? (
                <div className="text-center py-10">
                  <div className="bg-slate-100 dark:bg-slate-700/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <History size={24} />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-medium">Bu ürüne ait stok hareketi bulunamadı.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {movements.map((mov, index) => (
                    <div key={mov._id} className="flex gap-4 relative">
                      {/* Çizgi (Zaman Çizelgesi) */}
                      {index !== movements.length - 1 && (
                        <div className="absolute left-[11px] top-6 bottom-[-20px] w-px bg-slate-200 dark:bg-slate-700"></div>
                      )}
                      
                      {/* İkon / Nokta */}
                      <div className="flex flex-col items-center mt-1 z-10">
                        <div className={`w-6 h-6 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center ${mov.type === 'Giriş' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      </div>
                      
                      {/* İçerik */}
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl flex-1 border border-slate-100 dark:border-slate-700/50">
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-sm font-bold ${mov.type === 'Giriş' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {mov.type === 'Giriş' ? '+' : '-'}{mov.quantity} Adet {mov.type}
                          </p>
                          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 px-2 py-1 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
                            {new Date(mov.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mt-1">{mov.reason}</p>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                            {mov.user?.name ? mov.user.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          İşlem Yapan: {mov.user?.name || 'Bilinmiyor'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}

      {/* MODAL (YENİ ÜRÜN EKLE / DÜZENLE) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{editingId ? 'Ürünü Güncelle' : 'Yeni Ürün Ekle'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ürün Adı</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stok Kodu (SKU)</label>
                  <input required type="text" name="sku" value={formData.sku} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                  
                  {!showNewCategoryInput ? (
                    <select 
                      name="category" 
                      value={formData.category} 
                      onChange={handleInputChange} 
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      {categories.map((cat, index) => (
                        <option key={index} value={cat}>{cat}</option>
                      ))}
                      <option value="NEW_CATEGORY" className="text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-slate-800">
                        + Yeni Kategori Ekle...
                      </option>
                    </select>
                  ) : (
                    <div className="flex gap-1 animate-in slide-in-from-right-2 duration-200">
                      <input 
                        type="text" 
                        value={newCategoryName} 
                        onChange={(e) => setNewCategoryName(e.target.value)} 
                        placeholder="Örn: Tekstil" 
                        className="w-full px-2 py-2 border border-blue-300 dark:border-blue-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors" 
                        autoFocus
                      />
                      <button 
                        type="button" 
                        onClick={handleAddCategory} 
                        className="bg-blue-600 dark:bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium transition-colors"
                      >
                        Ekle
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowNewCategoryInput(false)} 
                        className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tedarikçi Firma (Opsiyonel)</label>
                <select 
                  name="supplier" 
                  value={formData.supplier} 
                  onChange={handleInputChange} 
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <option value="">-- Tedarikçi Seçiniz --</option>
                  {suppliers.map(sup => (
                    <option key={sup._id} value={sup._id}>{sup.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Miktar</label>
                  <input required type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Min. Miktar</label>
                  <input required type="number" name="minQuantity" value={formData.minQuantity} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fiyat (₺)</label>
                  <input required type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium">
                  İptal
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition-colors font-medium">
                  {editingId ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
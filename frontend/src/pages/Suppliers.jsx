import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, Truck, Phone, Mail, Download, Filter, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf'; 
import autoTable from 'jspdf-autotable'; 
import * as XLSX from 'xlsx'; // YENİ EKLENDİ: Gerçek Excel oluşturucu kütüphane
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Suppliers() {
  const { isAdmin } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // YENİ EKLENDİ: Arama ve Filtreleme State'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('Tümü');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', contactName: '', email: '', phone: '', address: '', status: 'Aktif'
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/suppliers');
      setSuppliers(response.data);
    } catch (err) {
      toast.error('Tedarikçiler yüklenirken bir hata oluştu.');
      console.error('Tedarikçiler yüklenirken hata oluştu', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text("NexusERP - Tedarikci Firmalar Raporu", 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Olusturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 30);

      const tableColumn = ["Firma Adi", "Yetkili Kisi", "E-posta", "Telefon", "Durum"];
      const tableRows = [];

      // GÜNCELLENDİ: Sadece filtrelenmiş verileri PDF'e aktarır
      filteredSuppliers.forEach(sup => {
        const supData = [
          sup.name,
          sup.contactName || 'Belirtilmedi',
          sup.email,
          sup.phone,
          sup.status || 'Aktif'
        ];
        tableRows.push(supData);
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

      doc.save(`NexusERP_Tedarikciler_Raporu_${new Date().toLocaleDateString('tr-TR')}.pdf`);
      toast.success('PDF raporu başarıyla indirildi!');
    } catch (error) {
      toast.error('PDF oluşturulurken bir hata oluştu.');
      console.error("PDF Hatası:", error);
    }
  };

  // YENİ EKLENDİ: Gerçek ve Estetik XLSX Dosyası Oluşturma
  const handleExportExcel = () => {
    try {
      const excelData = filteredSuppliers.map(sup => ({
        "Firma Adı": sup.name,
        "Yetkili Kişi": sup.contactName || 'Belirtilmedi',
        "E-posta": sup.email,
        "Telefon": sup.phone,
        "Açık Adres": sup.address || 'Belirtilmedi',
        "Durum": sup.status || 'Aktif'
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // ESTETİK DOKUNUŞ: Sütun genişliklerini ayarla
      worksheet['!cols'] = [
        { wch: 30 }, // Firma Adı
        { wch: 20 }, // Yetkili Kişi
        { wch: 30 }, // E-posta
        { wch: 15 }, // Telefon
        { wch: 40 }, // Açık Adres
        { wch: 15 }  // Durum
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Tedarikçiler");
      XLSX.writeFile(workbook, `NexusERP_Tedarikciler_Raporu_${new Date().toLocaleDateString('tr-TR')}.xlsx`);

      toast.success('Excel (.xlsx) raporu başarıyla indirildi!');
    } catch (error) {
      toast.error('Excel oluşturulurken bir hata oluştu.');
      console.error("Excel Hatası:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu tedarikçiyi silmek istediğinize emin misiniz?')) {
      try {
        await api.delete(`/suppliers/${id}`);
        toast.success('Tedarikçi sistemden başarıyla silindi.');
        fetchSuppliers();
      } catch (err) {
        toast.error('Tedarikçi silinirken bir hata oluştu!');
      }
    }
  };

  const handleEditClick = (supplier) => {
    setEditingId(supplier._id);
    setFormData({
      name: supplier.name, 
      contactName: supplier.contactName || '', 
      email: supplier.email,
      phone: supplier.phone, 
      address: supplier.address, 
      status: supplier.status || 'Aktif'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/suppliers/${editingId}`, formData);
        toast.success('Tedarikçi bilgileri başarıyla güncellendi!');
      } else {
        await api.post('/suppliers', formData);
        toast.success('Yeni tedarikçi sisteme kaydedildi!');
      }
      closeModal();
      fetchSuppliers();
    } catch (err) {
      toast.error('Tedarikçi kaydedilirken bir hata oluştu!');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', contactName: '', email: '', phone: '', address: '', status: 'Aktif' });
  };

  // YENİ EKLENDİ: Zincirleme Filtreleme Algoritması
  const filteredSuppliers = suppliers.filter(sup => {
    const searchLower = searchTerm.toLowerCase();
    
    // Arama Çubuğu (İsim, yetkili kişi, email veya telefon içinde arar)
    const matchesSearch = 
      sup.name.toLowerCase().includes(searchLower) ||
      (sup.contactName && sup.contactName.toLowerCase().includes(searchLower)) ||
      sup.email.toLowerCase().includes(searchLower) ||
      sup.phone.toLowerCase().includes(searchLower);

    // Durum Filtresi (Tümü, Aktif, Pasif)
    const matchesStatus = selectedStatusFilter === 'Tümü' || (sup.status || 'Aktif') === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 relative animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white transition-colors">Tedarikçi Firmalar</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Mal ve hizmet aldığınız iş ortaklarınızı yönetin.</p>
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
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm">
              <Plus size={20} />
              Yeni Tedarikçi Ekle
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
            placeholder="Firma adı, yetkili, e-posta veya telefon ile ara..." 
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
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-transparent border-none outline-none px-4 py-4 w-full sm:w-48 text-slate-700 dark:text-slate-200 font-medium focus:ring-0 cursor-pointer appearance-none"
          >
            <option value="Tümü">Tüm Durumlar</option>
            <option value="Aktif">Aktif Çalışılıyor</option>
            <option value="Pasif">Pasif / Askıda</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 animate-pulse">Tedarikçiler getiriliyor...</div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            {searchTerm || selectedStatusFilter !== 'Tümü' 
              ? `Belirlediğiniz kriterlere uygun tedarikçi bulunamadı.` 
              : 'Kayıtlı tedarikçi bulunamadı.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider transition-colors">
                  <th className="p-4 font-medium whitespace-nowrap">Firma Adı</th>
                  <th className="p-4 font-medium whitespace-nowrap">Yetkili Kişi</th>
                  <th className="p-4 font-medium whitespace-nowrap">İletişim</th>
                  <th className="p-4 font-medium whitespace-nowrap">Durum</th>
                  <th className="p-4 font-medium text-right whitespace-nowrap">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 transition-colors">
                {filteredSuppliers.map((sup) => (
                  <tr key={sup._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3 whitespace-nowrap">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 transition-colors">
                        <Truck size={20} />
                      </div>
                      {sup.name}
                    </td>
                    
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                      {sup.contactName ? sup.contactName : <span className="text-slate-400 dark:text-slate-500 italic text-sm">Belirtilmedi</span>}
                    </td>
                    
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">
                      <div className="flex items-center gap-1"><Mail size={14}/> {sup.email}</div>
                      <div className="flex items-center gap-1 mt-1"><Phone size={14}/> {sup.phone}</div>
                    </td>
                    
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                        sup.status === 'Pasif' 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                          : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {sup.status || 'Aktif'}
                      </span>
                    </td>
                    
                    <td className="p-4 flex justify-end gap-2 mt-2 whitespace-nowrap">
                      {isAdmin() && (
                        <>
                          <button onClick={() => handleEditClick(sup)} title="Düzenle" className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"><Edit size={18} /></button>
                          <button onClick={() => handleDelete(sup._id)} title="Sil" className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 size={18} /></button>
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

      {/* MODAL (YENİ TEDARİKÇİ EKLE / DÜZENLE) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{editingId ? 'Tedarikçi Güncelle' : 'Yeni Tedarikçi Ekle'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Firma Adı</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Yetkili Kişi</label>
                  <input required type="text" name="contactName" value={formData.contactName} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Durum</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all">
                    <option value="Aktif">Aktif Çalışılıyor</option>
                    <option value="Pasif">Pasif / Askıda</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">E-posta</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefon</label>
                  <input required type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Açık Adres</label>
                <textarea rows="2" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors">İptal</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors">{editingId ? 'Güncelle' : 'Kaydet'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
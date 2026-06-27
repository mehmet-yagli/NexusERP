import React, { useState, useEffect } from 'react';
import { User, Lock, Shield, Bell, Save, CheckCircle2, AlertCircle, Mail, Smartphone, Trash2, Activity } from 'lucide-react'; // YENİ: Activity ikonu eklendi
import api from '../services/api';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState({ name: '', email: '', role: '' });
  
  // Şifre değiştirme state'leri
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' }); // type: 'success' | 'error'

  // Bildirim Tercihleri State'i
  const [notifications, setNotifications] = useState({
    criticalStock: true,
    dailyReport: false,
    aiAlerts: true,
    loginAlerts: false
  });

  const [userList, setUserList] = useState([]);
  
  // YENİ EKLENDİ: Sistem Günlüğü (Audit Logs) State'leri
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    // Sayfa yüklendiğinde LocalStorage'dan kullanıcı bilgilerini çek
    const storedUser = JSON.parse(localStorage.getItem('user')) || {};
    setUser({
      name: storedUser.name || '',
      email: storedUser.email || '',
      role: storedUser.role || 'Personel'
    });
    
    // Eğer veritabanında kullanıcının daha önceden kaydettiği bildirim ayarları varsa onları da çekebiliriz
    if (storedUser.notifications) {
      setNotifications(storedUser.notifications);
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users'); // Backend'deki GET /api/users rotasına istek atar
        if (res.data.success) {
          setUserList(res.data.data);
        }
      } catch (error) {
        console.error('Kullanıcılar getirilirken hata oluştu:', error);
      }
    };

    // Sadece 'Yetki Yönetimi' sekmesine girildiğinde ve kullanıcı Admin ise verileri çek
    if (activeTab === 'permissions' && user.role === 'Admin') {
      fetchUsers();
    }
  }, [activeTab, user.role]);

  // YENİ EKLENDİ: Sistem Günlüklerini (Audit Logs) veritabanından çeken fonksiyon
  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoadingLogs(true);
      try {
        const res = await api.get('/audit-logs'); 
        setAuditLogs(res.data);
      } catch (error) {
        console.error('Sistem logları getirilirken hata oluştu:', error);
      } finally {
        setLoadingLogs(false);
      }
    };

    if (activeTab === 'auditLogs' && user.role === 'Admin') {
      fetchAuditLogs();
    }
  }, [activeTab, user.role]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwords.newPassword !== passwords.confirmPassword) {
      return setMessage({ type: 'error', text: 'Yeni şifreler birbiriyle eşleşmiyor!' });
    }

    setLoading(true);
    try {
      await api.put('/users/change-password', { 
        currentPassword: passwords.currentPassword, 
        newPassword: passwords.newPassword 
      });
      
      setMessage({ type: 'success', text: 'Şifreniz başarıyla güncellendi.' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Şifre güncellenirken bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/profile', { name: user.name, email: user.email });
      
      // Güncel bilgileri tarayıcı hafızasına (LocalStorage) da kaydet
      const updatedUser = { ...JSON.parse(localStorage.getItem('user')), name: user.name, email: user.email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setMessage({ type: 'success', text: 'Profil bilgileriniz kaydedildi.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Profil güncellenemedi.' });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationsSave = async () => {
    setLoading(true);
    try {
      await api.put('/users/notifications', notifications);
      
      const updatedUser = { ...JSON.parse(localStorage.getItem('user')), notifications };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setMessage({ type: 'success', text: 'Bildirim tercihleriniz güncellendi.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Bildirimler kaydedilemedi.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      
      // UI tarafını güncelle
      setUserList(userList.map(u => u._id === userId ? { ...u, role: newRole } : u));
      setMessage({ type: 'success', text: 'Kullanıcı yetkisi başarıyla değiştirildi.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Kullanıcı yetkisi güncellenemedi.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Ayarlar</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Hesap tercihlerinizi ve güvenlik ayarlarınızı yönetin.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sol Menü (Tabs) */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          <button 
            onClick={() => {setActiveTab('profile'); setMessage({type:'', text:''})}}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <User size={20} /> Profil Bilgileri
          </button>
          <button 
            onClick={() => {setActiveTab('security'); setMessage({type:'', text:''})}}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'security' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <Lock size={20} /> Güvenlik & Şifre
          </button>
          <button 
            onClick={() => {setActiveTab('notifications'); setMessage({type:'', text:''})}}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'notifications' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <Bell size={20} /> Bildirim Ayarları
          </button>
          
          {/* Sadece Admin yetkisi olanlar bu sekmeyi görebilir */}
          {user.role === 'Admin' && (
            <>
              <button 
                onClick={() => {setActiveTab('permissions'); setMessage({type:'', text:''})}}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'permissions' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Shield size={20} /> Yetki Yönetimi
              </button>
              
              {/* YENİ EKLENDİ: Sadece Admin yetkisi olanlar bu sekmeyi görebilir */}
              <button 
                onClick={() => {setActiveTab('auditLogs'); setMessage({type:'', text:''})}}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'auditLogs' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Activity size={20} /> Sistem Günlüğü
              </button>
            </>
          )}
        </div>

        {/* Sağ İçerik Alanı */}
        <div className="flex-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm min-h-[500px]">
            
            {/* Geri Bildirim Mesajı (Toast/Alert) */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <p>{message.text}</p>
              </div>
            )}

            {/* SEKME 1: PROFIL */}
            {activeTab === 'profile' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">Kişisel Bilgiler</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-lg">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Ad Soyad</label>
                    <input 
                      type="text" 
                      value={user.name} 
                      onChange={(e) => setUser({...user, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">E-posta Adresi</label>
                    <input 
                      type="email" 
                      value={user.email} 
                      onChange={(e) => setUser({...user, email: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Sistem Rolü</label>
                    <input type="text" disabled value={user.role} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 cursor-not-allowed" />
                    <p className="text-xs text-slate-400 mt-2">* Rol değişiklikleri sadece Süper Admin tarafından yapılabilir.</p>
                  </div>
                  <button type="submit" disabled={loading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-70">
                    <Save size={18} /> {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </button>
                </form>
              </div>
            )}

            {/* SEKME 2: GÜVENLİK */}
            {activeTab === 'security' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">Şifre Değiştir</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-lg">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Mevcut Şifre</label>
                    <input required type="password" name="currentPassword" value={passwords.currentPassword} onChange={handlePasswordChange} placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Yeni Şifre</label>
                    <input required type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Yeni Şifre (Tekrar)</label>
                    <input required type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 dark:text-white" />
                  </div>
                  <button type="submit" disabled={loading} className="flex items-center gap-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-70">
                    <Lock size={18} /> {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                  </button>
                </form>
              </div>
            )}

            {/* SEKME 3: BİLDİRİMLER */}
            {activeTab === 'notifications' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">Bildirim Tercihleri</h2>
                
                <div className="space-y-6 max-w-2xl">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex gap-4">
                      <div className="mt-1 text-red-500"><AlertCircle size={24}/></div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white">Kritik Stok Uyarıları</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ürünler minimum stok seviyesinin altına düştüğünde e-posta al.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" className="sr-only peer" checked={notifications.criticalStock} onChange={() => setNotifications({...notifications, criticalStock: !notifications.criticalStock})} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex gap-4">
                      <div className="mt-1 text-emerald-500"><Mail size={24}/></div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white">Günlük Özet Raporu</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Her sabah 08:00'da sistem özeti ve amortisman raporunu mail at.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" className="sr-only peer" checked={notifications.dailyReport} onChange={() => setNotifications({...notifications, dailyReport: !notifications.dailyReport})} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex gap-4">
                      <div className="mt-1 text-indigo-500"><Smartphone size={24}/></div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white">NexusAI Öngörüleri</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Yapay zeka tedarik zincirinde bir anormallik tespit ettiğinde uyar.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" className="sr-only peer" checked={notifications.aiAlerts} onChange={() => setNotifications({...notifications, aiAlerts: !notifications.aiAlerts})} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <button onClick={handleNotificationsSave} disabled={loading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-70 mt-4">
                    <Save size={18} /> {loading ? 'Kaydediliyor...' : 'Tercihleri Kaydet'}
                  </button>
                </div>
              </div>
            )}

            {/* SEKME 4: YETKİ YÖNETİMİ */}
            {activeTab === 'permissions' && user.role === 'Admin' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">Kullanıcı Rolleri (RBAC)</h2>
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-xs font-bold uppercase flex items-center gap-1"><Shield size={14}/> Sadece Admin</span>
                </div>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Sisteme kayıtlı kullanıcıların erişim seviyelerini (Personel / Admin) bu panelden yönetebilirsiniz.</p>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                      <tr>
                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kullanıcı</th>
                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sistem Rolü</th>
                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Durum</th>
                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {userList.length === 0 ? (
                         <tr><td colSpan="4" className="p-8 text-center text-slate-500">Kullanıcılar yükleniyor...</td></tr>
                      ) : (
                        userList.map((u) => (
                          <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800 dark:text-white">{u.name}</div>
                                  <div className="text-xs text-slate-500">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <select 
                                value={u.role}
                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                disabled={u.email === user.email} 
                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:opacity-50 outline-none"
                              >
                                <option value="Admin">Admin (Tam Yetki)</option>
                                <option value="Personel">Personel (Sadece Oku)</option>
                              </select>
                            </td>
                            <td className="p-4">
                              {u.status === 'Aktif' || !u.status 
                                ? <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-bold">Aktif</span>
                                : <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-md text-xs font-bold">Pasif</span>
                              }
                            </td>
                            <td className="p-4 text-right">
                              <button 
                                className="text-slate-400 hover:text-red-500 transition-colors p-2 disabled:opacity-30 disabled:cursor-not-allowed" 
                                disabled={u.email === user.email}
                                title={u.email === user.email ? "Kendi hesabınızı silemezsiniz" : "Kullanıcıyı Sil"}
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* YENİ EKLENDİ - SEKME 5: SİSTEM GÜNLÜĞÜ (AUDIT LOGS) */}
            {activeTab === 'auditLogs' && user.role === 'Admin' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">Sistem İz Kayıtları (Audit Logs)</h2>
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-xs font-bold uppercase flex items-center gap-1"><Shield size={14}/> Sadece Admin</span>
                </div>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Sistemde yapılan tüm kritik işlemleri (ekleme, silme, güncelleme) buradan tarih ve kullanıcı bazlı takip edebilirsiniz.</p>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl max-h-[500px] overflow-y-auto">
                  <table className="w-full text-left relative">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tarih</th>
                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kullanıcı</th>
                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">İşlem Modülü</th>
                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">İşlem Detayı</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {loadingLogs ? (
                        <tr><td colSpan="4" className="p-8 text-center text-slate-500 animate-pulse">Kayıtlar yükleniyor...</td></tr>
                      ) : auditLogs.length === 0 ? (
                        <tr><td colSpan="4" className="p-8 text-center text-slate-500">Henüz kaydedilmiş bir sistem işlemi bulunmuyor.</td></tr>
                      ) : (
                        auditLogs.map((log) => (
                          <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="p-4 text-sm text-slate-500 font-medium whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                              {log.user?.name || 'Sistem / Bilinmeyen'}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-md text-[11px] font-extrabold tracking-wider ${
                                log.action.includes('SİLİNDİ') ? 'bg-red-100 text-red-600' : 
                                log.action.includes('EKLENDİ') ? 'bg-emerald-100 text-emerald-600' : 
                                'bg-blue-100 text-blue-600'
                              }`}>
                                {log.module} / {log.action.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                              {log.details}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
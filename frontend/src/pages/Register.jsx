import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, ArrowRight, AlertCircle, Shield, Box, Activity } from 'lucide-react';
import api from '../services/api';

export default function Register() {
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', role: 'Personel' 
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post('/auth/register', formData);
      alert('Hesap başarıyla oluşturuldu! Lütfen giriş yapın.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt olurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* SOL TARAF: Form Alanı */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative overflow-hidden bg-slate-50/50">
        <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Box className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Nexus<span className="text-indigo-600">ERP</span></h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Hesap Oluşturun</h2>
            <p className="text-slate-500">Sisteme dahil olmak için bilgilerinizi eksiksiz doldurun.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl flex items-start gap-3 text-sm font-medium animate-in fade-in">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ad Soyad</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <User size={20} />
                </div>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} 
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700" 
                  placeholder="Mühendis / Yönetici" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">E-posta Adresi</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Mail size={20} />
                </div>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} 
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700" 
                  placeholder="kurumsal@sirket.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Şifre</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input required type="password" name="password" value={formData.password} onChange={handleInputChange} 
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700" 
                  placeholder="••••••••" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sistem Yetkisi</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Shield size={20} />
                </div>
                <select name="role" value={formData.role} onChange={handleInputChange} 
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700 appearance-none cursor-pointer">
                  <option value="Personel">Personel (Sadece Görüntüleme)</option>
                  <option value="Admin">Admin (Tam Yetki)</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-70">
              {loading ? 'Sisteme Kaydediliyor...' : <>Hesabı Oluştur <ArrowRight size={20} /></>}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-500 border-t border-slate-200 pt-6">
            Zaten bir hesabınız var mı?{' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
              Giriş Ekranına Dönün
            </Link>
          </div>
        </div>
      </div>

      {/* SAĞ TARAF: Şov ve Branding */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-900"></div>

        <div className="relative z-10 w-full max-w-lg text-center">
          <div className="w-24 h-24 mx-auto bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20 mb-8 animate-pulse">
            <Activity size={40} className="text-indigo-400" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">Yüksek performanslı<br/>ERP mimarisine katılın.</h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-12">
            Modern envanter yönetimi, gerçek zamanlı demirbaş takibi ve yapay zeka destekli karar alma mekanizması tek bir çatı altında.
          </p>
          
          <div className="grid grid-cols-2 gap-4 text-left">
             <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl">
               <h4 className="text-indigo-400 font-bold mb-1 text-sm uppercase tracking-wider">Hızlı Kurulum</h4>
               <p className="text-slate-400 text-sm">Saniyeler içinde kayıt olun ve sisteme entegre olun.</p>
             </div>
             <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl">
               <h4 className="text-indigo-400 font-bold mb-1 text-sm uppercase tracking-wider">RBAC Güvenliği</h4>
               <p className="text-slate-400 text-sm">Rol bazlı yetki kontrolü ile verileriniz güvende.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
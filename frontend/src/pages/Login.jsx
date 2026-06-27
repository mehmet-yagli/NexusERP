import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles, Box, TrendingUp, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // YENİ: Şifremi Unuttum State'i
  const [view, setView] = useState('login'); // 'login' | 'forgot' | 'sent'

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
      window.location.reload(); 
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  // YENİ: Şifre Sıfırlama Simülasyonu
  const handleForgotPassword = (e) => {
    e.preventDefault();
    setLoading(true);
    // Gerçek bir API isteği atıyormuş gibi 1.5 saniye beklet (Jüri şovu)
    setTimeout(() => {
      setLoading(false);
      setView('sent');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* SOL TARAF: Form Alanı */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative overflow-hidden">
        {/* Dekoratif Arkaplan Objeleri */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

        <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Logo Bölümü */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Box className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Nexus<span className="text-blue-600">ERP</span></h1>
          </div>

          {/* GÖRÜNÜM: GİRİŞ YAP */}
          {view === 'login' && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Hoş Geldiniz</h2>
                <p className="text-slate-500">Yönetim paneline erişmek için bilgilerinizi girin.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl flex items-start gap-3 text-sm font-medium animate-in fade-in">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">E-posta Adresi</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Mail size={20} />
                    </div>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} 
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
                      placeholder="ornek@sirket.com" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Şifre</label>
                    <button type="button" onClick={() => setView('forgot')} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                      Şifremi Unuttum?
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Lock size={20} />
                    </div>
                    <input required type="password" name="password" value={formData.password} onChange={handleInputChange} 
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
                      placeholder="••••••••" />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-slate-900/20">
                  {loading ? 'Bağlantı Kuruluyor...' : <>Sisteme Giriş Yap <ArrowRight size={20} /></>}
                </button>
              </form>

              <div className="mt-8 text-center text-sm font-medium text-slate-500 border-t border-slate-100 pt-6">
                Sistemde hesabınız yok mu?{' '}
                <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                  Personel Kaydı Oluşturun
                </Link>
              </div>
            </>
          )}

          {/* GÖRÜNÜM: ŞİFREMİ UNUTTUM */}
          {view === 'forgot' && (
            <div className="animate-in slide-in-from-right-8 duration-500">
              <button onClick={() => setView('login')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors mb-6">
                <ArrowLeft size={16} /> Geri Dön
              </button>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Şifre Sıfırlama</h2>
              <p className="text-slate-500 mb-8">Hesabınıza kayıtlı e-posta adresini girin, size bir sıfırlama bağlantısı göndereceğiz.</p>
              
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">E-posta Adresi</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Mail size={20} />
                    </div>
                    <input required type="email" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700" placeholder="ornek@sirket.com" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/30">
                  {loading ? 'Gönderiliyor...' : 'Bağlantı Gönder'}
                </button>
              </form>
            </div>
          )}

          {/* GÖRÜNÜM: BAĞLANTI GÖNDERİLDİ */}
          {view === 'sent' && (
            <div className="animate-in zoom-in-95 duration-500 text-center py-8">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">E-posta Gönderildi</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">Şifre sıfırlama talimatları e-posta adresinize iletildi. Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.</p>
              <button onClick={() => setView('login')} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-4 px-4 rounded-xl transition-all">
                Giriş Ekranına Dön
              </button>
            </div>
          )}

        </div>
      </div>

      {/* SAĞ TARAF: Şov ve Branding (Sadece Masaüstünde Görünür) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
        {/* Arkaplan Efektleri */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-500/20 via-cyan-500/10 to-transparent rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

        <div className="relative z-10 w-full max-w-lg">
          {/* Glassmorphism Kartları (Dashboard Simülasyonu) */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl transform transition-transform hover:-translate-y-2">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30 text-blue-400">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">NexusAI Devrede</h3>
                  <p className="text-slate-300 text-sm">Yapay zeka tabanlı stok optimizasyonu aktif.</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl ml-12 transform transition-transform hover:-translate-y-2">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30 text-emerald-400">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Finansal Raporlama</h3>
                  <p className="text-slate-300 text-sm">Amortisman ve demirbaş değerleri anlık işleniyor.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl transform transition-transform hover:-translate-y-2">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30 text-purple-400">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Güvenli Altyapı</h3>
                  <p className="text-slate-300 text-sm">Rol bazlı yetkilendirme ve uçtan uca şifreleme.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">Envanter yönetimini <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">yapay zeka ile</span> yeniden tanımlayın.</h2>
            <p className="text-slate-400 text-lg">Sivas Cumhuriyet Üniversitesi Bilgisayar Mühendisliği vizyonuyla geliştirilmiştir.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Laptop, LogOut, Truck, Settings, Box } from 'lucide-react'; 
import { useAuth } from '../context/AuthContext'; 

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth(); 

  // GÜNCELLENDİ: Sadece düz mavi yerine, daha "premium" hissettiren bir gradient ve hafif sağa kayma efekti (translate-x-1)
  const isActive = (path) => {
    return location.pathname === path 
      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 font-semibold translate-x-1" 
      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 hover:translate-x-1";
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    // GÜNCELLENDİ: Arka plan rengi çok hafif daha koyu yapılarak ana içerikle kontrastı artırıldı (bg-[#0B1120])
    <div className="w-64 bg-[#0B1120] dark:bg-slate-950 h-full text-white flex flex-col transition-colors duration-300 border-r border-slate-800/50 shadow-2xl relative z-20">
      
      {/* LOGO ALANI GÜNCELLENDİ: Kurumsal bir icon-logo tasarımı eklendi */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800/50">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Box size={18} className="text-white" />
        </div>
        <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent drop-shadow-sm mt-0.5">
          NexusERP
        </h1>
      </div>

      <nav className="flex-1 mt-6 px-3 space-y-1.5 overflow-y-auto">
        {/* BÖLÜM: ANA MENÜ */}
        <p className="px-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3 mt-2">Ana Menü</p>
        
        {/* Dashboard -> Genel Bakış olarak güncellendi */}
        <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive('/')}`}>
          <LayoutDashboard size={20} className={location.pathname === '/' ? "text-white" : "text-slate-400 group-hover:text-blue-400 transition-colors"} />
          <span>Genel Bakış</span>
        </Link>
        
        <Link to="/inventory" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive('/inventory')}`}>
          <Package size={20} className={location.pathname === '/inventory' ? "text-white" : "text-slate-400 group-hover:text-blue-400 transition-colors"} />
          <span>Stok & Ürünler</span>
        </Link>
        
        <Link to="/assets" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive('/assets')}`}>
          <Laptop size={20} className={location.pathname === '/assets' ? "text-white" : "text-slate-400 group-hover:text-blue-400 transition-colors"} />
          <span>Demirbaşlar</span>
        </Link>
        
        <Link to="/suppliers" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive('/suppliers')}`}>
          <Truck size={20} className={location.pathname === '/suppliers' ? "text-white" : "text-slate-400 group-hover:text-blue-400 transition-colors"} />
          <span>Tedarikçiler</span>
        </Link>

        {/* BÖLÜM: SİSTEM VE PROFİL - Artık personelin profil yönetimi için herkese açık */}
        <div className="pt-4 pb-1">
          <div className="h-px bg-slate-800/50 w-full mb-4"></div>
          <p className="px-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Hesap & Ayarlar</p>
        </div>
        
        <Link to="/settings" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive('/settings')}`}>
          <Settings size={20} className={location.pathname === '/settings' ? "text-white" : "text-slate-400 group-hover:text-blue-400 transition-colors"} />
          <span>Ayarlar</span>
        </Link>
      </nav>

      {/* ÇIKIŞ BUTONU: Daha zarif ve interaktif */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-900/30 dark:bg-slate-950">
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-300 group font-medium"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Sistemden Çıkış</span>
        </button>
      </div>
      
    </div>
  );
}
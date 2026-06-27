import React, { useState } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Assets from './pages/Assets';
import Login from './pages/Login';
import Register from './pages/Register';
import Suppliers from './pages/Suppliers';
import Settings from './pages/Settings'; 

function App() {
  const isAuthenticated = !!localStorage.getItem('token');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Router>
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 3000,
          style: { borderRadius: '10px', background: '#333', color: '#fff' }
        }} 
      />

      {/* KRİTİK GÜNCELLEME BURADA: min-h-screen yerine h-screen w-full yapıldı! */}
      {/* Bu sayede ana ekran kilitlenir, sadece sağ panel kendi içinde kayar. */}
      <div className="h-screen w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex overflow-hidden transition-colors duration-300">
        
        {/* Mobil Menü Açıkken Arkaya Gelen Siyah Bulanık Ekran */}
        {isAuthenticated && isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Kapsayıcısı */}
        {isAuthenticated && (
          <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="h-full" onClick={() => setIsMobileMenuOpen(false)}>
              <Sidebar />
            </div>
          </div>
        )}

        {/* SAĞ TARAF: İçerik ve Header Alanı */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {isAuthenticated && (
            <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
          )}

          {/* Ana İçerik Ekranı (Kaydırma çubuğu sadece burada çıkacak: overflow-y-auto) */}
          <div className="flex-1 p-4 md:p-8 overflow-y-auto">
            <Routes>
              <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/inventory" element={isAuthenticated ? <Inventory /> : <Navigate to="/login" />} />
              <Route path="/assets" element={isAuthenticated ? <Assets /> : <Navigate to="/login" />} />
              <Route path="/suppliers" element={isAuthenticated ? <Suppliers /> : <Navigate to="/login" />} />
              <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} />
              
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </div>
          
        </div>

      </div>
    </Router>
  );
}

export default App;
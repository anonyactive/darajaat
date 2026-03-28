import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { BookOpen, Users, BarChart3, Settings, LogIn, LogOut, GraduationCap } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';

import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Collab from './pages/Collab';
import Login from './pages/Login';
import SettingsView from './pages/Settings';
import Classes from './pages/Classes';

function NavLinks() {
  const location = useLocation()
  const { user } = useAuth();
  
  const links = [
    { path: '/', label: 'ڈیش بورڈ', icon: <BarChart3 size={20} />, public: true },
    { path: '/classes', label: 'کلاسز', icon: <GraduationCap size={20} />, public: false },
    { path: '/subjects', label: 'مضامین', icon: <BookOpen size={20} />, public: false },
    { path: '/collab', label: 'ہم جماعت', icon: <Users size={20} />, public: false },
    { path: '/settings', label: 'ترتیبات', icon: <Settings size={20} />, public: false },
  ]

  return (
    <nav className="flex gap-4 items-center" style={{ overflowX: 'auto' }}>
      {links.map((link) => {
        // Hide protected links if not logged in
        if (!link.public && !user) return null;

        const isActive = location.pathname === link.path || (location.pathname === '/add' && link.path === '/subjects');
        return (
          <Link 
            key={link.path} 
            to={link.path} 
            className="flex items-center gap-2"
            style={{ 
              color: isActive ? 'var(--primary-color)' : 'var(--text-muted)',
              fontWeight: isActive ? 'bold' : 'normal',
              background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              padding: '0.6rem 1.2rem',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {link.icon}
            <span style={{ fontSize: '1.1rem' }}>{link.label}</span>
          </Link>
        )
      })}
      
      {!user ? (
        <Link to="/login" className="btn btn-primary ml-4" style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
          <LogIn size={18} /> لاگ ان
        </Link>
      ) : (
        <button onClick={() => signOut(auth)} className="btn btn-danger ml-4" style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
          <LogOut size={18} /> لاگ آؤٹ
        </button>
      )}
    </nav>
  )
}

function AppContent() {
  return (
    <div className="container flex-col" style={{ minHeight: '100vh', display: 'flex' }}>
      <header className="flex justify-between items-center my-8 glass-panel animate-fade-in" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div className="flex items-center gap-4">
          <div style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', padding: '0.6rem', borderRadius: '14px', boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)' }}>
            <BookOpen size={32} color="#fff" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.85rem', fontFamily: '"Scheherazade New", "Noto Naskh Arabic", serif', color: 'var(--text-muted)', letterSpacing: '2px', lineHeight: 1.2 }}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
            <h1 style={{ margin: 0, fontSize: '2.2rem', letterSpacing: '-0.5px', lineHeight: 1 }}>درجات</h1>
          </div>
        </div>
        <NavLinks />
      </header>

      <main style={{ flex: 1, paddingBottom: '4rem' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/collab" element={<Collab />} />
          <Route path="/add" element={<Subjects />} />
          <Route path="/settings" element={<SettingsView />} />
        </Routes>
      </main>
      
      <footer className="text-center text-muted my-8 glass-panel animate-fade-in delay-3" style={{ padding: '1.5rem' }}>
        <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>درجات - طلباء کے لیے ایک بہترین ساتھی | <Link to="/collab" style={{ fontWeight: 'bold' }}>ہم جماعتوں کے ساتھ جڑیں</Link></p>
      </footer>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AuthProvider>
  )
}

export default App

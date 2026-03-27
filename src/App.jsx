import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { BookOpen, Users, BarChart3, Settings } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Collab from './pages/Collab';

function NavLinks() {
  const location = useLocation()
  
  const links = [
    { path: '/', label: 'ڈیش بورڈ', icon: <BarChart3 size={20} /> },
    { path: '/subjects', label: 'مضامین', icon: <BookOpen size={20} /> },
    { path: '/collab', label: 'ہم جماعت', icon: <Users size={20} /> },
    { path: '/settings', label: 'ترتیبات', icon: <Settings size={20} /> },
  ]

  return (
    <nav className="flex gap-4 items-center" style={{ overflowX: 'auto' }}>
      {links.map((link) => {
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
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter basename="/darajaat">
      <div className="container flex-col" style={{ minHeight: '100vh', display: 'flex' }}>
        <header className="flex justify-between items-center my-8 glass-panel animate-fade-in" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div className="flex items-center gap-4">
            <div style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', padding: '0.6rem', borderRadius: '14px', boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)' }}>
              <BookOpen size={32} color="#fff" />
            </div>
            <h1 style={{ margin: 0, fontSize: '2.5rem', letterSpacing: '-0.5px' }}>درجات</h1>
          </div>
          <NavLinks />
        </header>

        <main style={{ flex: 1, paddingBottom: '4rem' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/collab" element={<Collab />} />
            <Route path="/add" element={<Subjects />} /> {/* Fallback for dashboard CTA */}
            <Route path="/settings" element={<div className="glass-panel text-center animate-fade-in py-8"><Settings size={64} color="var(--text-muted)" style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} /><h2 style={{ fontSize: '2rem' }}>ترتیبات</h2><p className="text-muted mt-4 text-lg">جلد آرہا ہے...</p></div>} />
          </Routes>
        </main>
        
        <footer className="text-center text-muted my-8 glass-panel animate-fade-in delay-3" style={{ padding: '1.5rem' }}>
          <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>درجات - طلباء کے لیے ایک بہترین ساتھی | <Link to="/collab" style={{ fontWeight: 'bold' }}>ہم جماعتوں کے ساتھ جڑیں</Link></p>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App

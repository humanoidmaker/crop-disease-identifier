import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Leaf, BookOpen, Clock, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/scan', label: 'Scan', icon: Leaf },
  { to: '/diseases', label: 'Disease Guide', icon: BookOpen },
  { to: '/history', label: 'History', icon: Clock },
];

export default function Layout({ user, onLogout }: { user: any; onLogout: () => void }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-primary-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Leaf className="w-6 h-6" />
            CropDoc
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${location.pathname === to ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            ))}
            {user && (
              <button onClick={onLogout} className="ml-4 px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 flex items-center gap-2">
                <LogOut className="w-4 h-4" />Logout
              </button>
            )}
          </nav>
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileOpen && (
          <nav className="md:hidden border-t border-white/20 px-4 pb-4 space-y-1">
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)} className={`block px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${location.pathname === to ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            ))}
            {user && (
              <button onClick={() => { onLogout(); setMobileOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 flex items-center gap-2">
                <LogOut className="w-4 h-4" />Logout
              </button>
            )}
          </nav>
        )}
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8"><Outlet /></main>
      <footer className="border-t bg-white py-6 text-center text-sm text-slate-500">
        <p>CropDoc by <a href="https://www.humanoidmaker.com" className="text-primary-700 hover:underline" target="_blank" rel="noreferrer">Humanoid Maker</a></p>
        <p className="mt-1 text-xs">AI-powered crop disease identification. Verify with an agricultural expert.</p>
      </footer>
    </div>
  );
}

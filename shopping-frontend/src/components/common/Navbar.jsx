import React from 'react';
import { ShoppingBag, User, LogOut } from 'lucide-react';

export default function Navbar({ user, activeView, setActiveView, onLogout }) {
  return (
    <nav className="bg-slate-800/80 border-b border-slate-700/60 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white text-lg tracking-tight">Shopping Store</span>
            <span className={`ml-3 text-xs px-2.5 py-0.5 rounded-full font-semibold ${user.role === 'admin'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}>
              {user.role === 'admin' ? 'ADMIN PANEL' : 'CUSTOMER STORE'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-white">{user.full_name}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
          <button
            onClick={() => setActiveView(activeView === 'profile' ? 'main' : 'profile')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/60 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 border border-slate-600/50 hover:border-indigo-500/30 rounded-xl text-xs font-medium transition"
          >
            <User className="w-3.5 h-3.5" />
            {activeView === 'profile' ? 'Main Page' : 'Account Settings'}
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/60 hover:bg-rose-600/20 text-slate-300 hover:text-rose-400 border border-slate-600/50 hover:border-rose-500/30 rounded-xl text-xs font-medium transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Log out
          </button>
        </div>
      </div>
    </nav>
  );
}

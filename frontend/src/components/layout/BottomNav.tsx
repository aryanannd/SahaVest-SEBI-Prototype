import React from 'react';
import { Home, BookOpen, ShieldAlert, MessageCircle, ScrollText, Wallet, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const currentPath = location.pathname;

  const items = [
    { id: "/dashboard", icon: Home, label: "Home" },
    { id: "/portfolio", icon: Wallet, label: "Portfolio" },
    { id: "/fraud", icon: ShieldAlert, label: "Check tip" },
    { id: "/chat", icon: MessageCircle, label: "Ask AI" },
    { id: "/profile", icon: User, label: "Profile" },
  ];

  // Don't show bottom nav on onboarding or deep screens
  if (currentPath.includes('/onboarding') || currentPath.includes('/fund/')) {
    return null;
  }

  return (
    <nav className="fixed md:absolute bottom-0 w-full z-50 border-t border-outline-variant bg-surface flex justify-around items-center h-[72px] px-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {items.map((it) => {
        const Icon = it.icon;
        
        let active = currentPath.startsWith(it.id);
        if (it.id === '/fraud') {
          active = currentPath.startsWith('/fraud') || currentPath.startsWith('/trust') || currentPath.startsWith('/protection') || currentPath.startsWith('/safety');
        } else if (it.id === '/chat') {
          active = currentPath.startsWith('/chat') || currentPath.startsWith('/twin') || currentPath.startsWith('/ai');
        } else if (it.id === '/profile') {
          active = currentPath.startsWith('/profile') || currentPath.startsWith('/compliance') || currentPath.startsWith('/privacy');
        } else if (it.id === '/portfolio') {
          active = currentPath.startsWith('/portfolio') || currentPath.startsWith('/fund');
        }

        return (
          <button 
            key={it.id} 
            onClick={() => navigate(it.id)} 
            className="group relative flex flex-col items-center justify-center w-16 h-full pt-1 pb-2 active:scale-95 transition-transform duration-200 ease-out"
          >
            {/* Pill Background Indicator */}
            <div className={`absolute top-2 w-14 h-8 rounded-full transition-all duration-300 ease-in-out ${active ? 'bg-secondary-container scale-100 opacity-100' : 'bg-transparent scale-50 opacity-0 group-hover:bg-surface-container-high group-hover:scale-100 group-hover:opacity-100'}`} />
            
            {/* Icon */}
            <Icon 
              size={24} 
              strokeWidth={active ? 2.5 : 2}
              className={`relative z-10 transition-colors duration-300 ${active ? 'text-on-secondary-container fill-secondary-container/50' : 'text-on-surface-variant group-hover:text-on-surface'}`} 
            />
            
            {/* Label */}
            <span className={`relative z-10 font-label-sm mt-1 transition-colors duration-300 ${active ? 'text-on-surface font-semibold' : 'text-on-surface-variant group-hover:text-on-surface'}`}>
              {it.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

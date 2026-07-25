import React from 'react';
import { Home, BookOpen, ShieldAlert, MessageCircle, ScrollText, Wallet } from 'lucide-react';
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
    { id: "/audit", icon: ScrollText, label: "Audit" },
  ];

  // Don't show bottom nav on onboarding or deep screens
  if (currentPath.includes('/onboarding') || currentPath.includes('/fund/')) {
    return null;
  }

  return (
    <nav className="fixed md:absolute bottom-0 w-full z-50 border-t border-outline-variant bg-surface flex justify-around items-center h-[64px] px-2 pb-safe">
      {items.map((it) => {
        const Icon = it.icon;
        const active = currentPath.startsWith(it.id);
        return (
          <button 
            key={it.id} 
            onClick={() => navigate(it.id)} 
            className={`flex flex-col items-center justify-center p-2 rounded-full active:scale-90 duration-200 ease-in-out ${active ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <Icon size={20} className={active ? 'fill-secondary-container' : ''} />
            <span className="font-label-sm mt-1">{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

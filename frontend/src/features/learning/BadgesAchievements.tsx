import React, { useState } from 'react';
import { Search, User, CreditCard, PieChart, Repeat, Flag, Diamond, ShieldCheck, X, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';

interface BadgeData {
  id: string;
  title: string;
  desc: string;
  earned: boolean;
  date?: string;
  icon: React.ElementType;
}

export function BadgesAchievements() {
  const navigate = useNavigate();
  const [selectedBadge, setSelectedBadge] = useState<BadgeData | null>(null);

  const badges: BadgeData[] = [
    {
      id: 'first-deposit',
      title: 'First Deposit',
      desc: 'You successfully made your first deposit into SahaVest.',
      earned: true,
      date: 'Oct 12, 2023',
      icon: CreditCard
    },
    {
      id: 'diversifier',
      title: 'Diversifier',
      desc: 'Invested in 3 different asset classes to balance your portfolio.',
      earned: true,
      date: 'Nov 05, 2023',
      icon: PieChart
    },
    {
      id: 'consistency',
      title: 'Consistency',
      desc: 'Set up an auto-deposit and completed 3 consecutive months.',
      earned: true,
      date: 'Jan 15, 2024',
      icon: Repeat
    },
    {
      id: 'goal-crusher',
      title: 'Goal Crusher',
      desc: 'Reach 100% of your first defined financial goal.',
      earned: false,
      icon: Flag
    },
    {
      id: 'diamond-hands',
      title: 'Diamond Hands',
      desc: 'Hold a single investment without selling for over 1 year.',
      earned: false,
      icon: Diamond
    },
    {
      id: 'protector',
      title: 'Protector',
      desc: 'Secure your account with 2FA and emergency contacts.',
      earned: false,
      icon: ShieldCheck
    }
  ];

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased">
      {/* TopAppBar */}
      <header className="bg-surface dark:bg-surface-dim w-full sticky top-0 z-50 border-b border-outline-variant dark:border-outline">
        <div className="flex items-center justify-between px-4 py-2 w-full max-w-7xl mx-auto h-[56px]">
          <button aria-label="Search" className="w-[44px] h-[44px] flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full active:scale-95 duration-100">
            <Search size={24} />
          </button>
          <Header />
          <button aria-label="Account" className="w-[44px] h-[44px] flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full active:scale-95 duration-100">
            <User size={24} className="fill-current" />
          </button>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-6 pb-24">
        <div className="mb-6">
          <h2 className="font-headline-md text-on-surface mb-1">Achievements</h2>
          <p className="font-body-md text-on-surface-variant">Track your financial milestones and accomplishments.</p>
        </div>

        {/* Bento Grid for Badges */}
        <div className="grid grid-cols-3 gap-4">
          {badges.map(badge => {
            const Icon = badge.icon;
            return (
              <button 
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`flex flex-col items-center justify-center p-3 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant hover:bg-surface-container-low transition-colors active:scale-95 ${badge.earned ? '' : 'opacity-75 grayscale'}`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 relative ${badge.earned ? 'bg-secondary-container' : 'bg-surface-variant'}`}>
                  <Icon size={32} className={badge.earned ? 'text-secondary' : 'text-outline'} />
                  {!badge.earned && (
                    <div className="absolute -bottom-1 -right-1 bg-surface-container-highest rounded-full p-1 border-2 border-surface-container-lowest">
                      <Lock size={14} className="text-on-surface-variant" />
                    </div>
                  )}
                </div>
                <span className={`font-label-md text-center line-clamp-2 ${badge.earned ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                  {badge.title}
                </span>
              </button>
            );
          })}
        </div>
      </main>

      {/* Modal for Badge Details */}
      {selectedBadge && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-on-background/20 backdrop-blur-[2px] animate-in fade-in duration-200"
            onClick={() => setSelectedBadge(null)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant w-full max-w-sm overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-end p-2 absolute top-0 right-0 w-full">
              <button 
                onClick={() => setSelectedBadge(null)}
                className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low rounded-full active:scale-95 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 pt-10 flex flex-col items-center text-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 relative ${selectedBadge.earned ? 'bg-secondary-container' : 'bg-surface-variant grayscale opacity-75'}`}>
                {React.createElement(selectedBadge.icon, { 
                  size: 48, 
                  className: selectedBadge.earned ? 'text-secondary' : 'text-outline' 
                })}
                {!selectedBadge.earned && (
                  <div className="absolute bottom-0 right-0 bg-surface-container-highest rounded-full p-1 border-4 border-surface-container-lowest">
                    <Lock size={20} className="text-on-surface-variant" />
                  </div>
                )}
              </div>
              
              <h3 className="font-headline-sm text-on-surface mb-2">{selectedBadge.title}</h3>
              <p className="font-body-md text-on-surface-variant mb-4">{selectedBadge.desc}</p>
              
              {selectedBadge.earned ? (
                <div className="bg-surface-container-low px-4 py-2 rounded-full">
                  <span className="font-label-md text-on-surface-variant">Earned: <span className="text-on-surface">{selectedBadge.date}</span></span>
                </div>
              ) : (
                <div className="font-label-md text-outline">
                  Keep exploring to unlock this achievement.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

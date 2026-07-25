import React from 'react';
import { BookOpen, Flame, Medal, PlayCircle, Trophy, Play, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LearningHub() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-surface overflow-y-auto px-4 pt-4 pb-20">
      <div className="mb-6">
        <h1 className="font-display-lg-mobile text-primary mb-2">Learning Hub</h1>
        <p className="font-body-md text-on-surface-variant text-sm">Master financial concepts and earn rewards.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm flex flex-col items-center justify-center">
          <Flame size={32} className="text-[#F5A623] mb-2" />
          <span className="font-display-lg-mobile text-on-surface">5</span>
          <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">Day Streak</span>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          <Medal size={32} className="text-[#087347] mb-2" />
          <span className="font-display-lg-mobile text-on-surface">3</span>
          <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">Badges Earned</span>
        </div>
      </div>

      <h2 className="font-headline-sm text-on-surface mb-3">Recommended for you</h2>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm mb-6 flex gap-4 items-center">
        <div className="w-16 h-16 bg-primary-container rounded-lg flex items-center justify-center flex-shrink-0">
          <BookOpen className="text-primary" size={28} />
        </div>
        <div className="flex-1">
          <h3 className="font-label-md text-on-surface mb-1">Mutual Funds 101</h3>
          <div className="w-full bg-surface-container rounded-full h-1.5 mb-2">
            <div className="bg-secondary h-1.5 rounded-full" style={{ width: '40%' }} />
          </div>
          <p className="text-[11px] text-on-surface-variant font-medium">2 modules remaining</p>
        </div>
        <button 
          onClick={() => navigate('/learn/quiz')}
          className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center transition-transform active:scale-95 flex-shrink-0 shadow-sm"
        >
          <Play size={18} className="ml-1" />
        </button>
      </div>

      <h2 className="font-headline-sm text-on-surface mb-3">Community Leaderboard</h2>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-variant">
          <div className="flex items-center gap-3">
            <div className="font-headline-sm text-primary w-6 text-center">1</div>
            <div className="w-8 h-8 rounded-full bg-[#FAECE7] flex items-center justify-center font-label-md text-[#4A1B0C]">R</div>
            <span className="font-label-md text-on-surface">Rahul S.</span>
          </div>
          <span className="font-label-md text-primary">1,250 XP</span>
        </div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-variant">
          <div className="flex items-center gap-3">
            <div className="font-headline-sm text-primary w-6 text-center">2</div>
            <div className="w-8 h-8 rounded-full bg-[#E6F4EA] flex items-center justify-center font-label-md text-[#0D532A]">P</div>
            <span className="font-label-md text-on-surface">Priya M.</span>
          </div>
          <span className="font-label-md text-primary">1,120 XP</span>
        </div>
        <div className="flex items-center justify-between bg-primary-container/20 -mx-4 px-4 py-2 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="font-headline-sm text-secondary w-6 text-center">5</div>
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center font-label-md text-[#087347]">Y</div>
            <span className="font-label-md text-on-surface">You</span>
          </div>
          <span className="font-label-md text-secondary">850 XP</span>
        </div>
      </div>
    </div>
  );
}

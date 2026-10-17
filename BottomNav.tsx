import React from 'react';
import { Music2, Search, Disc, Heart, Settings } from 'lucide-react';

export type TabType = 'library' | 'search' | 'player' | 'favorites' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  hasActiveSong: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  hasActiveSong,
}) => {
  const tabs = [
    { id: 'library' as TabType, label: 'Library', icon: Music2 },
    { id: 'search' as TabType, label: 'Search', icon: Search },
    {
      id: 'player' as TabType,
      label: 'Player',
      icon: Disc,
      highlight: hasActiveSong,
    },
    { id: 'favorites' as TabType, label: 'Favorites', icon: Heart },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#141e30]/95 light:bg-[#e6edf5]/95 backdrop-blur-md border-t border-slate-800/80 light:border-slate-300/80 shadow-2xl transition-colors">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center relative group py-1 active:scale-95 transition-transform"
              aria-label={tab.label}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'nm-inset-sm text-cyan-400 border border-cyan-500/25 glow-cyan-sm'
                    : 'text-slate-400 light:text-slate-600 hover:text-slate-200 light:hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  } ${tab.highlight && !isActive ? 'text-cyan-400 animate-pulse' : ''}`}
                />
              </div>

              <span
                className={`text-[10px] font-medium tracking-tight mt-0.5 transition-colors ${
                  isActive
                    ? 'text-cyan-400 font-semibold'
                    : 'text-slate-400 light:text-slate-600'
                }`}
              >
                {tab.label}
              </span>

              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-cyan-400 glow-cyan-sm" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

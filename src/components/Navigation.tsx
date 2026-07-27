import React from 'react';
import { Home, Receipt, Calendar, CheckSquare, MessageSquare, Mic } from 'lucide-react';
import type { ActiveTab } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openVoiceModal: () => void;
  unreadSlipsCount?: number;
  pendingTasksCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  openVoiceModal,
  unreadSlipsCount = 0,
  pendingTasksCount = 0
}) => {
  const navItems = [
    { id: 'home' as ActiveTab, label: 'หน้าหลัก', icon: Home },
    { id: 'slips' as ActiveTab, label: 'สลิปบัญชี', icon: Receipt, badge: unreadSlipsCount },
    { id: 'schedule' as ActiveTab, label: 'ตารางงาน', icon: Calendar },
    { id: 'notes' as ActiveTab, label: 'โน๊ต&งาน', icon: CheckSquare, badge: pendingTasksCount },
    { id: 'line' as ActiveTab, label: 'LINE OA', icon: MessageSquare },
  ];

  return (
    <nav className="border-t border-slate-800 bg-slate-950/90 backdrop-blur-xl px-2 py-2 sticky bottom-0 z-40">
      <div className="flex items-center justify-around max-w-lg mx-auto relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 relative ${
                isActive
                  ? 'text-emerald-400 font-medium scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-slate-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-slate-950 shadow-sm">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-0.5 shadow-sm shadow-emerald-400 animate-pulse"></span>
              )}
            </button>
          );
        })}

        {/* Floating Voice Microphone Trigger Button */}
        <button
          onClick={openVoiceModal}
          title="สั่งงานด้วยเสียง"
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-xl shadow-emerald-500/30 hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-2 border-slate-950 group"
        >
          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center group-hover:bg-transparent transition-all">
            <Mic className="w-6 h-6 text-emerald-400 group-hover:text-slate-950 transition-colors animate-bounce-subtle" />
          </div>
        </button>
      </div>
    </nav>
  );
};

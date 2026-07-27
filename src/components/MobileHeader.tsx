import React from 'react';
import { Bot, Smartphone, Monitor, FolderSync } from 'lucide-react';
import type { ActiveTab } from '../types';

interface MobileHeaderProps {
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  activeTab: ActiveTab;
  isFolderWatching: boolean;
  isLineConnected: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  isMobileFrame,
  setIsMobileFrame,
  activeTab,
  isFolderWatching,
  isLineConnected
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'home': return 'หน้าหลักเลขาส่วนตัว';
      case 'slips': return 'จัดการสลิป & โฟลเดอร์อัตโนมัติ';
      case 'schedule': return 'ตารางนัดหมาย & Google Calendar';
      case 'notes': return 'โน๊ตย่อ & รายการที่ต้องทำ';
      case 'line': return 'LINE OA & ระบบแชต';
      case 'activity': return 'ประวัติกิจกรรมทั้งหมด';
      default: return 'เลขาส่วนตัว AI';
    }
  };

  return (
    <header className="header-glass px-4 py-3 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-slate-100 text-sm leading-tight flex items-center gap-1.5">
              เลขา AI ส่วนตัว
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-mono">
                v2.6 Pro
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400">{getTabTitle()}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Status badges */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] bg-slate-900 border border-slate-800 rounded-full px-2.5 py-1 text-slate-300">
          <FolderSync className={`w-3.5 h-3.5 ${isFolderWatching ? 'text-emerald-400 animate-spin-slow' : 'text-slate-500'}`} />
          <span>{isFolderWatching ? 'Auto Slip ON' : 'Pause'}</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] bg-slate-900 border border-slate-800 rounded-full px-2.5 py-1 text-slate-300">
          <span className={`w-2 h-2 rounded-full ${isLineConnected ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-amber-400'}`}></span>
          <span>LINE OA</span>
        </div>

        {/* Device Frame View Switcher */}
        <button
          onClick={() => setIsMobileFrame(!isMobileFrame)}
          title={isMobileFrame ? "สลับเป็นโหมดเต็มจอ" : "สลับเป็นโหมดจำลองจอมือถือ"}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all text-xs flex items-center gap-1.5"
        >
          {isMobileFrame ? (
            <>
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">เต็มจอ</span>
            </>
          ) : (
            <>
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">จอมือถือ</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

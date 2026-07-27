import React from 'react';
import { FolderSync, Sparkles, MessageSquare } from 'lucide-react';
import type { SlipFolderWatcherState } from '../types';

interface FolderWatcherCardProps {
  watcherState: SlipFolderWatcherState;
  onToggleWatcher: () => void;
  onSimulateNewSlip: () => void;
}

export const FolderWatcherCard: React.FC<FolderWatcherCardProps> = ({
  watcherState,
  onToggleWatcher,
  onSimulateNewSlip
}) => {
  return (
    <div className="card-glass p-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-emerald-950/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none"></div>

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FolderSync className={`w-5 h-5 ${watcherState.isWatching ? 'animate-spin-slow' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-100 text-sm">ระบบเฝ้าโฟลเดอร์สลิปอัตโนมัติ</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                watcherState.isWatching
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${watcherState.isWatching ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
                {watcherState.isWatching ? 'กำลังทำงาน Auto-Watch' : 'ปิดใช้งาน'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{watcherState.folderName}</p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={onToggleWatcher}
          className={`w-12 h-6 rounded-full transition-colors p-1 relative flex items-center ${
            watcherState.isWatching ? 'bg-emerald-500' : 'bg-slate-800'
          }`}
        >
          <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
            watcherState.isWatching ? 'translate-x-6' : 'translate-x-0'
          }`} />
        </button>
      </div>

      {/* Info Banner */}
      <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>ไม่ต้องส่งสลิปในไลน์! เมื่อมีรูปสลิปใหม่ลงโฟลเดอร์นี้ เลขาจะบันทึกบัญชี & ทักไลน์แจ้งทันที</span>
      </div>

      {/* Stats & Actions */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="text-xs text-slate-400 font-mono">
          สแกนแล้ว: <span className="text-emerald-400 font-bold">{watcherState.scannedSlipsCount} สลิป</span> • ล่าสุด: {watcherState.lastScannedAt}
        </div>

        <button
          onClick={onSimulateNewSlip}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>ทดสอบเพิ่มสลิปเข้าโฟลเดอร์</span>
        </button>
      </div>
    </div>
  );
};

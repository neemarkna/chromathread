import React from 'react';
import { Activity, FolderSync, MessageSquare, Calendar, Receipt, Mic, CheckCircle2 } from 'lucide-react';
import type { ActivityItem } from '../types';

interface ActivityLogTabProps {
  activities: ActivityItem[];
}

export const ActivityLogTab: React.FC<ActivityLogTabProps> = ({ activities }) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'slip_auto_watch': return <FolderSync className="w-4 h-4 text-emerald-400" />;
      case 'line_msg': return <MessageSquare className="w-4 h-4 text-[#06C755]" />;
      case 'schedule': return <Calendar className="w-4 h-4 text-cyan-400" />;
      case 'expense': return <Receipt className="w-4 h-4 text-amber-400" />;
      case 'voice': return <Mic className="w-4 h-4 text-purple-400" />;
      default: return <CheckCircle2 className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            ประวัติกิจกรรมย้อนหลัง (Activity Timeline)
          </h2>
          <p className="text-xs text-slate-400">บันทึกประวัติการสแกนสลิป, ลงตารางงาน, และการคุยสั่งงานเลขา</p>
        </div>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {activities.map((item) => (
          <div key={item.id} className="relative group">
            {/* Timeline node icon */}
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-md">
              {getActivityIcon(item.type)}
            </div>

            <div className="card-glass p-3 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-200 text-xs">{item.title}</span>
                <span className="text-[10px] text-slate-500 font-mono">{item.timestamp}</span>
              </div>
              <p className="text-xs text-slate-400">{item.description}</p>
              {item.badgeText && (
                <span className="inline-block text-[9px] bg-slate-800 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono mt-1">
                  {item.badgeText}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

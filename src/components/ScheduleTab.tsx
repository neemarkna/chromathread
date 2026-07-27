import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, ExternalLink, Download, CheckCircle, Sparkles } from 'lucide-react';
import type { ScheduleEvent, EventCategory } from '../types';
import { generateGoogleCalendarUrl, downloadICalFile } from '../services/googleService';

interface ScheduleTabProps {
  schedules: ScheduleEvent[];
  onAddSchedule: (event: Omit<ScheduleEvent, 'id'>) => void;
  onToggleStatus: (id: string) => void;
}

export const ScheduleTab: React.FC<ScheduleTabProps> = ({
  schedules,
  onAddSchedule,
  onToggleStatus
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('10:00');
  const [newEndTime, setNewEndTime] = useState('11:00');
  const [newCategory, setNewCategory] = useState<EventCategory>('Meeting');
  const [newLocation, setNewLocation] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddSchedule({
      title: newTitle.trim(),
      description: newDescription.trim(),
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      category: newCategory,
      location: newLocation.trim(),
      status: 'upcoming'
    });

    setNewTitle('');
    setNewDescription('');
    setNewLocation('');
    setShowAddModal(false);
  };

  const getCategoryColor = (cat: EventCategory) => {
    switch (cat) {
      case 'Meeting': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'Appointment': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Work': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'Reminder': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Payment': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-cyan-400" />
            ตารางนัดหมาย & Google Calendar
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">จัดการนัดหมายประจำวัน และซิงก์ตรงเข้า Google Calendar</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>เพิ่มนัดใหม่</span>
        </button>
      </div>

      {/* Google Sync Info Card */}
      <div className="card-glass p-3.5 rounded-2xl border border-cyan-500/20 bg-slate-900/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="font-semibold text-slate-200">1-Click Google Calendar Sync</div>
            <div className="text-slate-400">แตะที่ปุ่ม <span className="text-cyan-400 font-medium">Google Calendar</span> บนการ์ดนัดหมายเพื่อบันทึกลงแอป Google Calendar ในมือถือทันที</div>
          </div>
        </div>
      </div>

      {/* Schedule Items List */}
      <div className="space-y-3">
        {schedules.length === 0 ? (
          <div className="text-center py-10 card-glass rounded-2xl border border-slate-800 text-slate-400 text-xs">
            ยังไม่มีนัดหมาย พูดสั่งเลขาด้วยเสียง หรือกดปุ่ม "เพิ่มนัดใหม่" ด้านบน
          </div>
        ) : (
          schedules.map((ev) => {
            const gcalUrl = generateGoogleCalendarUrl(ev);
            const isCompleted = ev.status === 'completed';

            return (
              <div
                key={ev.id}
                className={`card-glass p-4 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'border-slate-800/60 bg-slate-950/40 opacity-70'
                    : 'border-slate-800 bg-slate-900/90 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onToggleStatus(ev.id)}
                      className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                          : 'border-slate-600 hover:border-cyan-400'
                      }`}
                    >
                      {isCompleted && <CheckCircle className="w-4 h-4 fill-slate-950 stroke-emerald-500" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getCategoryColor(ev.category)}`}>
                          {ev.category}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {ev.date}
                        </span>
                      </div>

                      <h3 className={`font-semibold text-slate-100 text-sm mt-1 ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                        {ev.title}
                      </h3>

                      {ev.description && (
                        <p className="text-xs text-slate-400 mt-1">{ev.description}</p>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          {ev.startTime} - {ev.endTime} น.
                        </span>
                        {ev.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-400" />
                            {ev.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <a
                      href={gcalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[11px] font-medium flex items-center gap-1 transition-colors"
                      title="เพิ่มลง Google Calendar"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Google Cal</span>
                    </a>

                    <button
                      onClick={() => downloadICalFile(ev)}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center justify-center gap-1 transition-colors"
                      title="ดาวน์โหลดไฟล์ .ics"
                    >
                      <Download className="w-3 h-3" />
                      <span>.ICS</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSubmitNew} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-cyan-400" />
              เพิ่มรายการนัดหมายใหม่
            </h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">หัวข้อการนัดหมาย *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="เช่น นัดประชุมสรุปยอดขายกับทีม"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">วันที่</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">หมวดหมู่</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as EventCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                >
                  <option value="Meeting">Meeting (ประชุม)</option>
                  <option value="Appointment">Appointment (นัดหมาย)</option>
                  <option value="Work">Work (งาน)</option>
                  <option value="Reminder">Reminder (แจ้งเตือน)</option>
                  <option value="Payment">Payment (ชำระเงิน)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">เวลาเริ่ม</label>
                <input
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">เวลาสิ้นสุด</label>
                <input
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">สถานที่ / ลิงก์ประชุม</label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="เช่น ห้องประชุม 2 หรือ Google Meet Link"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20"
              >
                บันทึกนัดหมาย
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

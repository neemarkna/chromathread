import { useState, useEffect } from 'react';
import type { ActiveTab, ExpenseItem, ScheduleEvent, TaskItem, NoteItem, ActivityItem, SlipFolderWatcherState, LineChannelState } from './types';
import { MobileHeader } from './components/MobileHeader';
import { Navigation } from './components/Navigation';
import { SlipScannerTab } from './components/SlipScannerTab';
import { ScheduleTab } from './components/ScheduleTab';
import { NotesAndTasksTab } from './components/NotesAndTasksTab';
import { LineSimulatorTab } from './components/LineSimulatorTab';
import { ActivityLogTab } from './components/ActivityLogTab';
import { AccountingTab } from './components/AccountingTab';
import { VoiceModal } from './components/VoiceModal';
import { initialFolderState, simulateNewSlipDetected } from './services/folderWatcherService';
import { generateSampleSlipSvg } from './services/ocrService';
import type { ParsedVoiceIntent } from './services/speechService';
import { Sparkles, Bot, MessageSquare, Receipt, Calendar } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Folder Watcher State
  const [watcherState, setWatcherState] = useState<SlipFolderWatcherState>(() => {
    const saved = localStorage.getItem('ai_sec_folder_watcher');
    return saved ? JSON.parse(saved) : initialFolderState;
  });

  // Expenses Data State
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem('ai_sec_expenses');
    if (saved) return JSON.parse(saved);

    const now = new Date().toISOString().split('T')[0];
    return [
      {
        id: 'exp-1',
        title: 'ค่าอาหาร & ชาตรามือ',
        amount: 185,
        type: 'expense',
        category: 'Food',
        date: now,
        time: '12:30',
        bankSender: 'KBank (กสิกรไทย)',
        refNo: 'REF20260727001',
        slipImageUrl: generateSampleSlipSvg('185', 'ชาตรามือ สาขาเซ็นทรัล'),
        source: 'slip_ocr',
        autoProcessed: true
      },
      {
        id: 'exp-2',
        title: 'ค่าน้ำมันรถยนต์ ปตท.',
        amount: 950,
        type: 'expense',
        category: 'Transport',
        date: now,
        time: '08:15',
        bankSender: 'SCB (ไทยพาณิชย์)',
        refNo: 'REF20260727002',
        slipImageUrl: generateSampleSlipSvg('950', 'สถานีบริการน้ำมัน ปตท.'),
        source: 'slip_ocr',
        autoProcessed: true
      }
    ];
  });

  // Schedules Data State
  const [schedules, setSchedules] = useState<ScheduleEvent[]>(() => {
    const saved = localStorage.getItem('ai_sec_schedules');
    if (saved) return JSON.parse(saved);

    const now = new Date().toISOString().split('T')[0];
    return [
      {
        id: 'sch-1',
        title: 'นัดประชุมสรุปยอดขายประจำเดือนกับทีม',
        description: 'เตรียมสไลด์พรีเซนต์สรุปยอดขายและแผนงานไตรมาสถัดไป',
        date: now,
        startTime: '10:00',
        endTime: '11:30',
        category: 'Meeting',
        location: 'ห้องประชุมใหญ่ 3 หรือ Google Meet',
        status: 'upcoming'
      },
      {
        id: 'sch-2',
        title: 'นัดพบแพทย์ตรวจสุขภาพประจำปี',
        description: 'โรงพยาบาลกรุงเทพ อดอาหารหลังเที่ยงคืน',
        date: now,
        startTime: '14:00',
        endTime: '15:30',
        category: 'Appointment',
        location: 'โรงพยาบาลกรุงเทพ',
        status: 'upcoming'
      }
    ];
  });

  // Tasks Data State
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('ai_sec_tasks');
    if (saved) return JSON.parse(saved);

    return [
      {
        id: 'task-1',
        title: 'ส่งเอกสารรายงานค่าใช้จ่ายประจำเดือนให้ฝ่ายบัญชี',
        completed: false,
        priority: 'high',
        category: 'งาน',
        source: 'slip',
        createdAt: '10:00'
      },
      {
        id: 'task-2',
        title: 'ซื้อของสดเข้าบ้าน (นมสด, ไข่ไก่, ขนมปัง)',
        completed: false,
        priority: 'medium',
        category: 'ส่วนตัว',
        source: 'voice',
        createdAt: '11:15'
      }
    ];
  });

  // Notes Data State
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem('ai_sec_notes');
    if (saved) return JSON.parse(saved);

    return [
      {
        id: 'note-1',
        title: 'ไอเดียแผนการตลาดออนไลน์ไตรมาส 3',
        content: '1. ยิงแคมเปญโฆษณาใน TikTok & IG Reels\n2. โปรโมตระบบสแกนสลิปอัตโนมัติผ่าน LINE OA\n3. จัดส่วนลด 15% สำหรับสมาชิกใหม่',
        tags: ['การตลาด', 'วางแผน'],
        createdAt: '27 ก.ค. 2026'
      }
    ];
  });

  // LINE State - Connected to "เลขาคิม" (@958xhyrx)
  const [lineState, setLineState] = useState<LineChannelState>(() => {
    const saved = localStorage.getItem('ai_sec_line');
    if (saved) return JSON.parse(saved);

    return {
      channelId: '2010871312',
      channelName: 'เลขาคิม (@958xhyrx)',
      isConnected: true,
      autoReplyEnabled: true,
      simulatedMessages: [
        {
          id: 'msg-1',
          sender: 'assistant',
          timestamp: '09:00',
          text: 'สวัสดีค่ะ! หนูเลขาคิม ยินดีรับใช้ค่ะ 🌸 มีอะไรให้หนูช่วยจัดการวันนี้ไหมคะ?'
        },
        {
          id: 'msg-2',
          sender: 'assistant',
          timestamp: '09:01',
          text: '📥 บัญชีไลน์ @958xhyrx เชื่อมต่อกับระบบเฝ้าโฟลเดอร์สลิปเรียบร้อยแล้วค่ะ!'
        }
      ]
    };
  });

  // Activities Log State
  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem('ai_sec_activities');
    if (saved) return JSON.parse(saved);

    return [
      {
        id: 'act-1',
        timestamp: '12:30 น.',
        type: 'slip_auto_watch',
        title: 'ตรวจจับสลิปใหม่สำเร็จ',
        description: 'บันทึกค่าใช้จ่าย: ค่าอาหาร & ชาตรามือ ฿185 เข้าบัญชี',
        badgeText: 'Auto-Sync'
      },
      {
        id: 'act-2',
        timestamp: '10:00 น.',
        type: 'schedule',
        title: 'ลงตารางนัดหมายใหม่',
        description: 'นัดประชุมสรุปยอดขายประจำเดือนกับทีม (10:00 - 11:30 น.)',
        badgeText: 'Google Cal'
      }
    ];
  });

  // Persist State Changes
  useEffect(() => {
    localStorage.setItem('ai_sec_folder_watcher', JSON.stringify(watcherState));
  }, [watcherState]);

  useEffect(() => {
    localStorage.setItem('ai_sec_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('ai_sec_schedules', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem('ai_sec_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('ai_sec_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('ai_sec_line', JSON.stringify(lineState));
  }, [lineState]);

  useEffect(() => {
    localStorage.setItem('ai_sec_activities', JSON.stringify(activities));
  }, [activities]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handlers
  const handleToggleWatcher = () => {
    setWatcherState(prev => ({
      ...prev,
      isWatching: !prev.isWatching
    }));
    showToast(watcherState.isWatching ? 'ปิดการเฝ้าโฟลเดอร์สลิปแล้ว' : 'เปิดการเฝ้าโฟลเดอร์สลิปอัตโนมัติแล้ว!');
  };

  const handleSimulateNewSlip = async () => {
    const newExpense = await simulateNewSlipDetected(
      (expense) => {
        setExpenses(prev => [expense, ...prev]);
        setWatcherState(prev => ({
          ...prev,
          scannedSlipsCount: prev.scannedSlipsCount + 1,
          lastScannedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        }));
        
        // Log activity
        const newAct: ActivityItem = {
          id: `act-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
          type: 'slip_auto_watch',
          title: 'สแกนสลิปใหม่จากโฟลเดอร์สำเร็จ',
          description: `บันทึกค่าใช้จ่าย: ${expense.title} ฿${expense.amount.toLocaleString()} (${expense.bankSender})`,
          badgeText: 'LINE Alert'
        };
        setActivities(prev => [newAct, ...prev]);
      },
      (lineMsgText) => {
        const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
        const lineMsg = {
          id: `msg-auto-${Date.now()}`,
          sender: 'assistant' as const,
          timestamp: timeStr,
          text: lineMsgText
        };
        setLineState(prev => ({
          ...prev,
          simulatedMessages: [...prev.simulatedMessages, lineMsg]
        }));
      }
    );

    showToast(`📥 เลขาคิมพบสลิปใหม่! บันทึก ${newExpense.title} ฿${newExpense.amount} เรียบร้อยแล้ว`);
  };

  const handleConfirmVoiceIntent = (intent: ParsedVoiceIntent) => {
    const nowTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const nowDate = new Date().toISOString().split('T')[0];

    if (intent.type === 'expense') {
      const newExp: ExpenseItem = {
        id: `exp-voice-${Date.now()}`,
        title: intent.title,
        amount: intent.amount || 100,
        type: 'expense',
        category: (intent.category as any) || 'Food',
        date: nowDate,
        time: nowTime,
        bankSender: 'Voice Input',
        source: 'voice'
      };
      setExpenses(prev => [newExp, ...prev]);
    } else if (intent.type === 'schedule') {
      const newSch: ScheduleEvent = {
        id: `sch-voice-${Date.now()}`,
        title: intent.title,
        date: intent.date || nowDate,
        startTime: intent.time || '10:00',
        endTime: '11:00',
        category: 'Appointment',
        status: 'upcoming'
      };
      setSchedules(prev => [newSch, ...prev]);
    } else if (intent.type === 'task') {
      const newTask: TaskItem = {
        id: `task-voice-${Date.now()}`,
        title: intent.title,
        completed: false,
        priority: 'medium',
        category: 'ทั่วไป',
        source: 'voice',
        createdAt: nowTime
      };
      setTasks(prev => [newTask, ...prev]);
    } else {
      const newNote: NoteItem = {
        id: `note-voice-${Date.now()}`,
        title: intent.title,
        content: intent.summary,
        tags: ['เสียงพูด'],
        createdAt: nowDate
      };
      setNotes(prev => [newNote, ...prev]);
    }

    setActivities(prev => [{
      id: `act-v-${Date.now()}`,
      timestamp: nowTime + ' น.',
      type: 'voice',
      title: 'บันทึกคำสั่งด้วยเสียง',
      description: intent.summary,
      badgeText: 'Voice AI'
    }, ...prev]);

    showToast(`เลขาคิมบันทึก: ${intent.summary}`);
  };

  const handleGenerateAiSummary = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    const totalExp = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    const summaryContent = `📊 **สรุปรายงานประจำวันที่ ${dateStr}**\n\n` +
      `💳 **ยอดรวมรายจ่ายวันนี้:** ฿${totalExp.toLocaleString()} บาท (${expenses.length} รายการ)\n` +
      `📅 **นัดหมายคงเหลือ:** ${schedules.filter(s => s.status === 'upcoming').length} นัดหมาย\n` +
      `📋 **งานที่ต้องทำ:** ${tasks.filter(t => !t.completed).length} รายการที่รอดำเนินการ\n\n` +
      `💡 *สร้างโดย เลขาคิม AI (@958xhyrx) อัตโนมัติ*`;

    const summaryNote: NoteItem = {
      id: `note-summary-${Date.now()}`,
      title: `สรุปภาพรวมประจำวัน (${now.toLocaleDateString('th-TH')})`,
      content: summaryContent,
      tags: ['สรุปประจำวัน', 'AI Digest'],
      createdAt: dateStr,
      isAiGenerated: true
    };

    setNotes(prev => [summaryNote, ...prev]);
    showToast('สร้างโน๊ตสรุปประจำวันด้วย AI เรียบร้อยแล้ว!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start antialiased font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Container - Handles Mobile Frame Switcher */}
      <div className={`w-full transition-all duration-300 ${
        isMobileFrame 
          ? 'max-w-md my-0 sm:my-6 rounded-none sm:rounded-[40px] border-0 sm:border-8 border-slate-800 shadow-2xl overflow-hidden bg-slate-950 min-h-screen sm:min-h-[840px] flex flex-col'
          : 'max-w-4xl min-h-screen flex flex-col'
      }`}>
        
        {/* Header */}
        <MobileHeader
          isMobileFrame={isMobileFrame}
          setIsMobileFrame={setIsMobileFrame}
          activeTab={activeTab}
          isFolderWatching={watcherState.isWatching}
          isLineConnected={lineState.isConnected}
        />

        {/* Main Scrollable View Area */}
        <main className="flex-1 p-4 overflow-y-auto">
          {activeTab === 'home' && (
            <div className="space-y-4 animate-fade-in">
              {/* Folder Watcher Hero Widget */}
              <div className="card-glass p-5 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <Bot className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-100 text-sm">ยินดีต้อนรับค่ะคุณผู้ใช้! 🌸</h2>
                      <p className="text-xs text-slate-400">หนูคือ <span className="text-emerald-400 font-semibold">เลขาคิม (@958xhyrx)</span> ช่วยเฝ้าสลิปและจัดการนัดหมายให้ค่ะ</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveTab('slips')}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <Receipt className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] text-emerald-400 font-mono">Auto Slips</span>
                    </div>
                    <div className="text-sm font-bold text-slate-100 mt-2">
                      ฿{expenses.reduce((a, b) => a + b.amount, 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">รวมสลีปรายจ่ายทั้งหมด</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('schedule')}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      <span className="text-[10px] text-cyan-400 font-mono">Google Cal</span>
                    </div>
                    <div className="text-sm font-bold text-slate-100 mt-2">
                      {schedules.filter(s => s.status === 'upcoming').length} นัดหมาย
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">รอดำเนินการในตาราง</div>
                  </button>
                </div>
              </div>

              {/* Accounting Metrics */}
              <AccountingTab expenses={expenses} />

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left flex items-center gap-3 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shrink-0">
                    <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">พูดสั่งงานเลขา</div>
                    <div className="text-[10px] text-slate-400">สั่งจดบัญชี/ลงตารางด้วยเสียง</div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('line')}
                  className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left flex items-center gap-3 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#06C755]/20 border border-[#06C755]/40 flex items-center justify-center text-[#06C755] shrink-0">
                    <MessageSquare className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">LINE: @958xhyrx</div>
                    <div className="text-[10px] text-slate-400">คุยแชตกับเลขาคิมในไลน์</div>
                  </div>
                </button>
              </div>

              {/* Recent Tasks Preview */}
              <NotesAndTasksTab
                tasks={tasks}
                notes={notes}
                onAddTask={(t) => setTasks(prev => [{ id: `t-${Date.now()}`, ...t, createdAt: 'เพิ่งสร้าง' }, ...prev])}
                onToggleTask={(id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))}
                onAddNote={(n) => setNotes(prev => [{ id: `n-${Date.now()}`, ...n, createdAt: 'เพิ่งสร้าง' }, ...prev])}
                onGenerateAiSummary={handleGenerateAiSummary}
              />
            </div>
          )}

          {activeTab === 'slips' && (
            <SlipScannerTab
              expenses={expenses}
              watcherState={watcherState}
              onToggleWatcher={handleToggleWatcher}
              onSimulateNewSlip={handleSimulateNewSlip}
              onAddExpense={(item) => setExpenses(prev => [item, ...prev])}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleTab
              schedules={schedules}
              onAddSchedule={(ev) => setSchedules(prev => [{ id: `sch-${Date.now()}`, ...ev }, ...prev])}
              onToggleStatus={(id) => setSchedules(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'completed' ? 'upcoming' : 'completed' } : s))}
            />
          )}

          {activeTab === 'notes' && (
            <NotesAndTasksTab
              tasks={tasks}
              notes={notes}
              onAddTask={(t) => setTasks(prev => [{ id: `t-${Date.now()}`, ...t, createdAt: 'เพิ่งสร้าง' }, ...prev])}
              onToggleTask={(id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))}
              onAddNote={(n) => setNotes(prev => [{ id: `n-${Date.now()}`, ...n, createdAt: 'เพิ่งสร้าง' }, ...prev])}
              onGenerateAiSummary={handleGenerateAiSummary}
            />
          )}

          {activeTab === 'line' && (
            <LineSimulatorTab
              lineState={lineState}
              onSendMessage={(msg) => setLineState(prev => ({
                ...prev,
                simulatedMessages: [...prev.simulatedMessages, msg]
              }))}
            />
          )}

          {activeTab === 'activity' && (
            <ActivityLogTab activities={activities} />
          )}
        </main>

        {/* Bottom Navigation */}
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openVoiceModal={() => setIsVoiceModalOpen(true)}
          unreadSlipsCount={expenses.length}
          pendingTasksCount={tasks.filter(t => !t.completed).length}
        />
      </div>

      {/* Speech Voice Recognition Modal */}
      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onConfirmIntent={handleConfirmVoiceIntent}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-emerald-500/40 text-slate-100 text-xs px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce-subtle">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default App;

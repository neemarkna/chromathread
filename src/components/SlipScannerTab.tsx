import React, { useState } from 'react';
import { Receipt, Upload, Eye } from 'lucide-react';
import type { ExpenseItem, SlipFolderWatcherState } from '../types';
import { FolderWatcherCard } from './FolderWatcherCard';
import { parseSlipImage } from '../services/ocrService';

interface SlipScannerTabProps {
  expenses: ExpenseItem[];
  watcherState: SlipFolderWatcherState;
  onToggleWatcher: () => void;
  onSimulateNewSlip: () => void;
  onAddExpense: (item: ExpenseItem) => void;
}

export const SlipScannerTab: React.FC<SlipScannerTabProps> = ({
  expenses,
  watcherState,
  onToggleWatcher,
  onSimulateNewSlip,
  onAddExpense
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeSlipModal, setActiveSlipModal] = useState<ExpenseItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const parsed = await parseSlipImage(file);
      
      const newExpense: ExpenseItem = {
        id: `exp-${Date.now()}-${i}`,
        title: parsed.title,
        amount: parsed.amount,
        type: 'expense',
        category: parsed.category,
        date: parsed.date,
        time: parsed.time,
        bankSender: parsed.bankSender,
        bankReceiver: parsed.bankReceiver,
        accountNo: parsed.accountNo,
        refNo: parsed.refNo,
        slipImageUrl: parsed.slipImageUrl,
        source: 'slip_ocr',
        autoProcessed: false
      };

      onAddExpense(newExpense);
    }

    setIsUploading(false);
  };

  const filteredExpenses = selectedCategory === 'all'
    ? expenses
    : expenses.filter(item => item.category === selectedCategory);

  const totalExpense = expenses
    .filter(item => item.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-4 animate-fade-in pb-6">
      {/* Folder Watcher Card Banner */}
      <FolderWatcherCard
        watcherState={watcherState}
        onToggleWatcher={onToggleWatcher}
        onSimulateNewSlip={onSimulateNewSlip}
      />

      {/* Action Header Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            รายการสลิปและบัญชีรายจ่าย
          </h2>
          <p className="text-xs text-slate-400">รายการสลิปที่สแกนแล้ว ยอดรวม: <span className="text-emerald-400 font-bold font-mono">฿{totalExpense.toLocaleString()}</span></p>
        </div>

        <label className="cursor-pointer px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1.5 border border-slate-700 transition-colors">
          <Upload className="w-4 h-4 text-emerald-400" />
          <span>{isUploading ? 'กำลังอ่านสลิป...' : 'อัปโหลดรูปสลิป'}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {['all', 'Food', 'Transport', 'Utilities', 'Shopping', 'Others'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat === 'all' ? 'ทั้งหมด' : cat}
          </button>
        ))}
      </div>

      {/* Expense Receipts List */}
      <div className="space-y-2.5">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-10 card-glass rounded-2xl border border-slate-800 text-slate-400 text-xs">
            ไม่พบรายการสลิป ลองกดทดสอบเพิ่มสลิปเข้าโฟลเดอร์ หรืออัปโหลดรูปภาพสลิป
          </div>
        ) : (
          filteredExpenses.map((item) => (
            <div
              key={item.id}
              className="card-glass p-3.5 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-emerald-500/30 transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400 overflow-hidden relative group shrink-0">
                  {item.slipImageUrl ? (
                    <img src={item.slipImageUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <Receipt className="w-5 h-5" />
                  )}
                  {item.autoProcessed && (
                    <span title="ประมวลผลอัตโนมัติจากโฟลเดอร์" className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-slate-950"></span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100 text-sm">{item.title}</span>
                    {item.autoProcessed && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded-full font-mono">
                        Auto Slip
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                    <span>{item.date} {item.time}</span>
                    <span>•</span>
                    <span className="text-slate-300">{item.bankSender || 'PromptPay'}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-emerald-400 text-sm font-mono">
                  -฿{item.amount.toLocaleString()}
                </div>
                {item.slipImageUrl && (
                  <button
                    onClick={() => setActiveSlipModal(item)}
                    className="text-[11px] text-cyan-400 hover:underline flex items-center justify-end gap-1 mt-0.5 ml-auto"
                  >
                    <Eye className="w-3 h-3" />
                    <span>ดูสลิป</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Slip Modal View */}
      {activeSlipModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-sm">รายละเอียดสลิปการโอนเงิน</h3>
              <button
                onClick={() => setActiveSlipModal(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ปิดหน้าต่าง
              </button>
            </div>

            {activeSlipModal.slipImageUrl && (
              <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-80 flex justify-center bg-slate-950 p-2">
                <img src={activeSlipModal.slipImageUrl} alt="สลิป" className="max-h-72 object-contain" />
              </div>
            )}

            <div className="space-y-1.5 text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">ยอดเงิน:</span>
                <span className="text-emerald-400 font-bold">฿{activeSlipModal.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">รายการ:</span>
                <span>{activeSlipModal.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ธนาคาร:</span>
                <span>{activeSlipModal.bankSender || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">เลขที่อ้างอิง:</span>
                <span>{activeSlipModal.refNo || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

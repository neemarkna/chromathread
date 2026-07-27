import React from 'react';
import { PieChart, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react';
import type { ExpenseItem } from '../types';

interface AccountingTabProps {
  expenses: ExpenseItem[];
}

export const AccountingTab: React.FC<AccountingTabProps> = ({ expenses }) => {
  const totalExpense = expenses
    .filter(e => e.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalIncome = 45000; // Mock salary income for demo

  // Category breakdown calculation
  const categories = ['Food', 'Transport', 'Utilities', 'Shopping', 'Others'] as const;
  const categoryTotals = categories.map(cat => {
    const total = expenses
      .filter(e => e.category === cat)
      .reduce((sum, item) => sum + item.amount, 0);
    const percentage = totalExpense > 0 ? Math.round((total / totalExpense) * 100) : 0;
    return { name: cat, total, percentage };
  });

  const handleExportCsv = () => {
    const csvHeader = 'ID,Title,Amount,Category,Date,Time,BankSender,RefNo\n';
    const csvRows = expenses.map(e => 
      `"${e.id}","${e.title}",${e.amount},"${e.category}","${e.date}","${e.time}","${e.bankSender || ''}","${e.refNo || ''}"`
    ).join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Accounting_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-6">
      {/* Financial Overview Card */}
      <div className="card-glass p-4 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">สรุปบัญชีรายรับ-รายจ่ายประจำเดือน</span>
            <div className="text-2xl font-black text-slate-100 font-mono mt-0.5">
              ฿{(totalIncome - totalExpense).toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">คงเหลือสุทธิ (Net Balance)</span>
          </div>

          <button
            onClick={handleExportCsv}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400">รายรับรวม</div>
              <div className="text-xs font-bold text-slate-200 font-mono">฿{totalIncome.toLocaleString()}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400">รายจ่ายรวม</div>
              <div className="text-xs font-bold text-rose-400 font-mono">฿{totalExpense.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown Progress Bars */}
      <div className="card-glass p-4 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3">
        <h3 className="font-bold text-slate-100 text-xs flex items-center gap-2">
          <PieChart className="w-4 h-4 text-emerald-400" />
          สัดส่วนรายจ่ายแยกตามหมวดหมู่
        </h3>

        <div className="space-y-2.5">
          {categoryTotals.map(cat => (
            <div key={cat.name} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">{cat.name}</span>
                <span className="text-slate-400 font-mono">฿{cat.total.toLocaleString()} ({cat.percentage}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${cat.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

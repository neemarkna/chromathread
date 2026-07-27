import React, { useState } from 'react';
import { CheckSquare, FileText, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import type { TaskItem, NoteItem, TaskPriority } from '../types';

interface NotesAndTasksTabProps {
  tasks: TaskItem[];
  notes: NoteItem[];
  onAddTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  onToggleTask: (id: string) => void;
  onAddNote: (note: Omit<NoteItem, 'id' | 'createdAt'>) => void;
  onGenerateAiSummary: () => void;
}

export const NotesAndTasksTab: React.FC<NotesAndTasksTabProps> = ({
  tasks,
  notes,
  onAddTask,
  onToggleTask,
  onAddNote,
  onGenerateAiSummary
}) => {
  const [subTab, setSubTab] = useState<'tasks' | 'notes'>('tasks');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');

  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    onAddTask({
      title: newTaskTitle.trim(),
      completed: false,
      priority: newTaskPriority,
      category: 'ทั่วไป',
      source: 'manual'
    });

    setNewTaskTitle('');
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    onAddNote({
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      tags: ['บันทึกย่อ']
    });

    setNewNoteTitle('');
    setNewNoteContent('');
  };

  return (
    <div className="space-y-4 animate-fade-in pb-6">
      {/* Top Banner & AI Generator */}
      <div className="card-glass p-4 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-slate-900/90 to-purple-950/30 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <h2 className="font-bold text-slate-100 text-sm">เลขา AI จัดแจงโน๊ต & To-Do List</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">รวมกิจกรรม ค่าใช้จ่าย และนัดหมายเป็นรายการงานอัตโนมัติ</p>
        </div>

        <button
          onClick={onGenerateAiSummary}
          className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-500/20 active:scale-95 transition-all shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>สรุปประจำวัน</span>
        </button>
      </div>

      {/* Sub Tab Selector */}
      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setSubTab('tasks')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            subTab === 'tasks' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>To-Do List ({tasks.filter(t => !t.completed).length})</span>
        </button>
        <button
          onClick={() => setSubTab('notes')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            subTab === 'notes' ? 'bg-slate-800 text-purple-400 shadow-sm' : 'text-slate-400'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Smart Notes ({notes.length})</span>
        </button>
      </div>

      {/* TASKS VIEW */}
      {subTab === 'tasks' && (
        <div className="space-y-3">
          {/* Quick Add Task */}
          <form onSubmit={handleTaskSubmit} className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="เพิ่มสิ่งที่ต้องทำ (เช่น โทรหาลูกค้า)..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
            />
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-300 focus:outline-none"
            >
              <option value="high">ด่วนมาก</option>
              <option value="medium">ปกติ</option>
              <option value="low">ทั่วไป</option>
            </select>
            <button
              type="submit"
              className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่ม</span>
            </button>
          </form>

          {/* Task Items */}
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">ไม่มีรายการที่ต้องทำ</div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onToggleTask(task.id)}
                  className={`card-glass p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    task.completed
                      ? 'border-slate-800/50 bg-slate-950/40 opacity-60'
                      : 'border-slate-800 bg-slate-900/80 hover:border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                      task.completed ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700'
                    }`}>
                      {task.completed && <CheckCircle2 className="w-4 h-4" />}
                    </div>

                    <div>
                      <span className={`text-xs font-medium text-slate-100 ${task.completed ? 'line-through text-slate-500' : ''}`}>
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                          task.priority === 'high' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {task.priority === 'high' ? 'ด่วน' : task.priority === 'medium' ? 'ปกติ' : 'ต่ำ'}
                        </span>
                        <span className="text-[10px] text-slate-500">ที่มา: {task.source}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* NOTES VIEW */}
      {subTab === 'notes' && (
        <div className="space-y-3">
          {/* Add Note Form */}
          <form onSubmit={handleNoteSubmit} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 space-y-2">
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="หัวข้อโน๊ตย่อ..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-purple-400"
            />
            <textarea
              rows={2}
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="รายละเอียดเนื้อหาโน๊ต..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-400 resize-none"
            />
            <button
              type="submit"
              className="w-full py-1.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>บันทึกโน๊ต</span>
            </button>
          </form>

          {/* Notes List */}
          <div className="space-y-2.5">
            {notes.map((note) => (
              <div key={note.id} className="card-glass p-3.5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-100 text-xs flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    {note.title}
                  </h3>
                  {note.isAiGenerated && (
                    <span className="text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded-full font-mono flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      AI Daily Digest
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 font-sans">
                  {note.content}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>{note.createdAt}</span>
                  <div className="flex gap-1">
                    {note.tags.map(t => (
                      <span key={t} className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">#{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

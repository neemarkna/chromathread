import React, { useState } from 'react';
import { MessageSquare, Send, Bot, ShieldCheck, Sparkles } from 'lucide-react';
import type { LineChannelState, LineChatMessage } from '../types';
import { createLineBotReply } from '../services/lineService';

interface LineSimulatorTabProps {
  lineState: LineChannelState;
  onSendMessage: (msg: LineChatMessage) => void;
}

export const LineSimulatorTab: React.FC<LineSimulatorTabProps> = ({
  lineState,
  onSendMessage
}) => {
  const [inputText, setInputText] = useState('');

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const userMsg: LineChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: timeStr,
      text: inputText.trim()
    };

    onSendMessage(userMsg);

    // Trigger AI Bot Reply
    setTimeout(() => {
      const reply = createLineBotReply(inputText.trim());
      onSendMessage(reply);
    }, 600);

    setInputText('');
  };

  const handleQuickSample = (sample: string) => {
    setInputText(sample);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-6">
      {/* Header Status Card */}
      <div className="card-glass p-4 rounded-2xl border border-emerald-500/20 bg-slate-900/90 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#06C755] flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-[#06C755]/20">
            <MessageSquare className="w-5 h-5 fill-slate-950 stroke-none" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-100 text-sm">LINE Official Account Hub</h2>
              <span className="text-[10px] bg-[#06C755]/15 text-[#06C755] border border-[#06C755]/30 px-2 py-0.5 rounded-full font-mono">
                🟢 Connected
              </span>
            </div>
            <p className="text-xs text-slate-400">คุย สั่งงานด้วยเสียง หรือรับการแจ้งเตือนสลิปใหม่ผ่าน LINE</p>
          </div>
        </div>
      </div>

      {/* LINE Chat Simulator Frame */}
      <div className="border border-slate-800 rounded-3xl bg-[#0B1523] overflow-hidden flex flex-col h-[460px] shadow-2xl relative">
        {/* LINE Chat Header */}
        <div className="bg-[#1A2636] px-4 py-3 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 flex items-center gap-1">
                เลขา AI ส่วนตัว (Official)
                <ShieldCheck className="w-3.5 h-3.5 text-[#06C755]" />
              </div>
              <div className="text-[10px] text-slate-400">@AI_Secretary_TH</div>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded-full font-mono">LINE Bot API v2</span>
        </div>

        {/* LINE Chat Messages Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin">
          {lineState.simulatedMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-end gap-1.5 max-w-[85%]">
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mb-1">
                    <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                )}

                <div
                  className={`p-3 rounded-2xl text-xs space-y-2 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#06C755] text-slate-950 font-medium rounded-tr-none shadow-md'
                      : 'bg-[#1E2C3D] text-slate-100 rounded-tl-none border border-slate-700/60'
                  }`}
                >
                  {msg.text && <p>{msg.text}</p>}

                  {/* Flex Message Card */}
                  {msg.flexCard && (
                    <div className="mt-2 bg-slate-950/90 border border-emerald-500/30 p-3 rounded-xl space-y-2 text-slate-100 font-sans">
                      <div className="font-bold text-emerald-400 text-xs flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        {msg.flexCard.title}
                      </div>

                      <div className="space-y-1 text-[11px] font-mono border-t border-b border-slate-800 py-1.5">
                        {msg.flexCard.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="text-slate-400">{item.label}:</span>
                            <span className="text-slate-200 font-semibold">{item.value}</span>
                          </div>
                        ))}
                      </div>

                      {msg.flexCard.actionLabel && (
                        <button className="w-full py-1.5 bg-[#06C755] hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-[11px] transition-colors">
                          {msg.flexCard.actionLabel}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-slate-500 font-mono mb-1">{msg.timestamp}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-1.5 bg-[#14202E] border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {['สรุปสลิปวันนี้', 'นัดประชุมพรุ่งนี้ 10:00', 'ยอดรวมค่าใช้จ่ายเดือนนี้'].map((chip) => (
            <button
              key={chip}
              onClick={() => handleQuickSample(chip)}
              className="text-[10px] px-2.5 py-1 rounded-full bg-[#1E2C3D] text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-[#1A2636] border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="พิมพ์คุย หรือสั่งงานเลขา AI..."
            className="flex-1 bg-[#0F1823] border border-slate-700 rounded-2xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#06C755]"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 rounded-2xl bg-[#06C755] hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold transition-all shadow-md"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
};

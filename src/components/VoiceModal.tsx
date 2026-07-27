import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Sparkles, Check, Receipt, Calendar, CheckSquare, FileText } from 'lucide-react';
import { SpeechRecognitionService, parseThaiVoiceIntent, type ParsedVoiceIntent } from '../services/speechService';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmIntent: (intent: ParsedVoiceIntent) => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  onConfirmIntent
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedIntent, setParsedIntent] = useState<ParsedVoiceIntent | null>(null);
  const [speechService] = useState(() => new SpeechRecognitionService());

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
    }
  }, [isOpen]);

  const startListening = () => {
    setIsListening(true);
    setTranscript('');
    setParsedIntent(null);

    speechService.startListening(
      (text) => {
        setTranscript(text);
        if (text) {
          const parsed = parseThaiVoiceIntent(text);
          setParsedIntent(parsed);
        }
      },
      (err) => {
        console.warn('Voice error:', err);
        setIsListening(false);
      }
    );
  };

  const stopListening = () => {
    setIsListening(false);
    speechService.stopListening();
  };

  const handleSelectSample = (sampleText: string) => {
    setTranscript(sampleText);
    const parsed = parseThaiVoiceIntent(sampleText);
    setParsedIntent(parsed);
  };

  const handleConfirm = () => {
    if (parsedIntent) {
      onConfirmIntent(parsedIntent);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ระบบวิเคราะห์คำสั่งเสียงภาษาไทย</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">พูดสั่งงานเลขา AI</h2>
          <p className="text-xs text-slate-400 mt-1">พูดลงบันทึกรายจ่าย, นัดหมายลงตาราง, หรือเพิ่ม To-Do List</p>
        </div>

        {/* Microphone Sound Animation Button */}
        <div className="flex flex-col items-center justify-center my-2">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 relative ${
              isListening
                ? 'bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-2xl shadow-emerald-500/40 scale-105'
                : 'bg-slate-800 border-2 border-slate-700 hover:border-emerald-500/50'
            }`}
          >
            {isListening && (
              <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping"></span>
            )}
            {isListening ? (
              <Mic className="w-10 h-10 text-slate-950 animate-bounce-subtle" />
            ) : (
              <MicOff className="w-10 h-10 text-slate-400" />
            )}
          </button>
          
          <div className="flex items-center gap-1 mt-3">
            {isListening ? (
              <>
                <div className="flex items-center gap-1 h-4">
                  <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="w-1 h-5 bg-cyan-400 rounded-full animate-pulse delay-75"></span>
                  <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse delay-150"></span>
                  <span className="w-1 h-4 bg-teal-400 rounded-full animate-pulse delay-100"></span>
                </div>
                <span className="text-xs text-emerald-400 font-medium ml-1">กำลังฟังเสียง...</span>
              </>
            ) : (
              <span className="text-xs text-slate-400">กดที่ไมค์เพื่อเริ่มฟัง</span>
            )}
          </div>
        </div>

        {/* Transcript & Intent Box */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-slate-200 min-h-[90px] flex flex-col justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-mono mb-1">ข้อความเสียงที่พูด:</div>
            <p className="text-sm font-medium text-slate-100 italic">
              {transcript ? `"${transcript}"` : 'กำลังรอฟังเสียงพูด หรือแตะปุ่มตัวอย่างด้านล่าง...'}
            </p>
          </div>

          {parsedIntent && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                {parsedIntent.type === 'expense' && <Receipt className="w-4 h-4 text-emerald-400" />}
                {parsedIntent.type === 'schedule' && <Calendar className="w-4 h-4 text-cyan-400" />}
                {parsedIntent.type === 'task' && <CheckSquare className="w-4 h-4 text-amber-400" />}
                {parsedIntent.type === 'note' && <FileText className="w-4 h-4 text-purple-400" />}
                <span className="text-emerald-400 font-semibold">{parsedIntent.summary}</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Sample Voice Buttons */}
        <div>
          <div className="text-[11px] text-slate-400 mb-1.5 font-medium">ลองแตะประโยคสั่งงานตัวอย่าง:</div>
          <div className="flex flex-wrap gap-1.5">
            {[
              'ค่าข้าว 150 บาท',
              'นัดประชุมทีมพรุ่งนี้ 10 โมง',
              'เติมน้ำมัน 800 บาท',
              'เตือนซักผ้าตอนเย็น',
              'สรุปไอเดียการตลาด'
            ].map((sample) => (
              <button
                key={sample}
                onClick={() => handleSelectSample(sample)}
                className="text-xs px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
          >
            ยกเลิก
          </button>
          <button
            disabled={!parsedIntent}
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>ยืนยันบันทึกข้อมูล</span>
          </button>
        </div>
      </div>
    </div>
  );
};

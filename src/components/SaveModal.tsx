import React from 'react';
import { X, Lock, Unlock, Download, AlertCircle } from 'lucide-react';

const CORRECT_CODE = 'NS2024'; // รหัสสำหรับ export ไม่มีลายน้ำ

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (format: 'jpeg' | 'png', withWatermark: boolean) => void;
  isSaving: boolean;
}

export const SaveModal: React.FC<SaveModalProps> = ({ isOpen, onClose, onSave, isSaving }) => {
  const [code, setCode] = React.useState('');
  const [format, setFormat] = React.useState<'jpeg' | 'png'>('jpeg');
  const [codeStatus, setCodeStatus] = React.useState<'idle' | 'correct' | 'wrong'>('idle');

  React.useEffect(() => {
    if (!isOpen) {
      setCode('');
      setCodeStatus('idle');
    }
  }, [isOpen]);

  const handleCodeChange = (val: string) => {
    setCode(val);
    if (val === '') setCodeStatus('idle');
    else if (val === CORRECT_CODE) setCodeStatus('correct');
    else setCodeStatus('wrong');
  };

  const handleSave = () => {
    const withWatermark = codeStatus !== 'correct';
    onSave(format, withWatermark);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '400px', padding: '32px',
          display: 'flex', flexDirection: 'column', gap: '20px',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>บันทึกรูปภาพ</h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>เลือกรูปแบบไฟล์และใส่รหัส</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Format Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>รูปแบบไฟล์</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {(['jpeg', 'png'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className="btn-secondary"
                style={{
                  flex: 1, padding: '10px',
                  borderColor: format === f ? 'var(--accent-purple)' : 'var(--border-color)',
                  background: format === f ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.02)',
                  fontWeight: format === f ? 700 : 400,
                  fontSize: '14px',
                  textTransform: 'uppercase',
                }}
              >
                {f === 'jpeg' ? '🖼️ JPEG' : '🏞️ PNG'}
              </button>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>
            {format === 'jpeg' ? 'JPEG: ไฟล์เล็ก เหมาะส่งออนไลน์ (ไม่รองรับพื้นหลังโปร่งใส)' : 'PNG: คุณภาพสูง รองรับพื้นหลังโปร่งใส'}
          </p>
        </div>

        {/* Password Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={14} /> รหัสผ่าน (ถ้าไม่ใส่จะมีลายน้ำ "นำสมัย")
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              className="glass-input w-full"
              placeholder="ใส่รหัสเพื่อ Export ไฟล์คุณภาพเต็ม..."
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              style={{
                paddingRight: '40px',
                borderColor: codeStatus === 'correct' ? '#22c55e'
                           : codeStatus === 'wrong' ? '#ef4444'
                           : 'var(--border-color)',
              }}
            />
            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
              {codeStatus === 'correct' && <Unlock size={16} color="#22c55e" />}
              {codeStatus === 'wrong' && <Lock size={16} color="#ef4444" />}
              {codeStatus === 'idle' && <Lock size={16} color="var(--text-muted)" />}
            </div>
          </div>

          {/* Status indicator */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px', borderRadius: '8px',
              background: codeStatus === 'correct'
                ? 'rgba(34,197,94,0.1)' : 'rgba(251,191,36,0.08)',
              border: `1px solid ${codeStatus === 'correct' ? 'rgba(34,197,94,0.3)' : 'rgba(251,191,36,0.2)'}`,
            }}
          >
            {codeStatus === 'correct' ? (
              <>
                <Unlock size={14} color="#22c55e" />
                <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: 600 }}>
                  รหัสถูกต้อง — จะ Export ไฟล์แบบคุณภาพเต็มไม่มีลายน้ำ
                </span>
              </>
            ) : (
              <>
                <AlertCircle size={14} color="#fbbf24" />
                <span style={{ fontSize: '12px', color: '#fbbf24' }}>
                  ไม่มีรหัส — ไฟล์จะมีลายน้ำ <strong>"นำสมัย"</strong> ทับรูป
                </span>
              </>
            )}
          </div>
        </div>

        {/* Save Button */}
        <button
          className="btn-primary w-full"
          onClick={handleSave}
          disabled={isSaving}
          style={{ padding: '14px', fontSize: '15px', fontWeight: 700, borderRadius: '12px' }}
        >
          {isSaving ? (
            <>⏳ กำลังบันทึก...</>
          ) : (
            <>
              <Download size={18} />
              บันทึกเป็น {format.toUpperCase()}
              {codeStatus !== 'correct' && ' (พร้อมลายน้ำ)'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

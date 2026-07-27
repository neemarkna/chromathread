import type { LineChatMessage } from '../types';

export function createLineBotReply(userText: string): LineChatMessage {
  const textLower = userText.toLowerCase();
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // Check if intent is expense / slip query
  if (textLower.includes('สแกน') || textLower.includes('สลิป') || textLower.includes('ค่าใช้จ่าย') || textLower.includes('บัญชี')) {
    return {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      timestamp: timeStr,
      text: 'เลขาจัดสรุปรายการบัญชีและสลิปล่าสุดให้แล้วค่ะ 📊',
      flexCard: {
        type: 'slip_summary',
        title: 'สรุปการเงินวันนี้ 💳',
        items: [
          { label: 'ยอดรวมรายจ่าย', value: '฿1,450.00' },
          { label: 'รายการล่าสุด', value: 'ค่าอาหาร (KBank ฿150)' },
          { label: 'สถานะโฟลเดอร์', value: '🟢 Auto-Sync Active' }
        ],
        actionLabel: 'เปิดดูบัญชีเต็ม',
        actionUrl: '#'
      }
    };
  }

  // Check if intent is schedule / appointment
  if (textLower.includes('นัด') || textLower.includes('ประชุม') || textLower.includes('ตาราง') || textLower.includes('calendar')) {
    return {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      timestamp: timeStr,
      text: 'บันทึกลงตารางงานและพร้อม Sync ไปยัง Google Calendar เรียบร้อยค่ะ 📅',
      flexCard: {
        type: 'schedule_alert',
        title: 'นัดหมายใหม่ 📌',
        items: [
          { label: 'หัวข้อ', value: userText },
          { label: 'เวลา', value: 'วันนี้ 14:00 น.' },
          { label: 'Google Calendar', value: 'พร้อมซิงก์ 1-Click' }
        ],
        actionLabel: 'เพิ่มลง Google Calendar',
        actionUrl: 'https://calendar.google.com'
      }
    };
  }

  // Default friendly personal assistant response
  return {
    id: `bot-${Date.now()}`,
    sender: 'assistant',
    timestamp: timeStr,
    text: `รับทราบค่ะ! เลขาได้บันทึกเรื่อง "${userText}" ไว้ในระบบเรียบร้อยแล้วค่ะ หากมีรูปสลิปใหม่ในโฟลเดอร์ หนูจะสแกนและทักไลน์แจ้งทันทีนะคะ 😊`
  };
}

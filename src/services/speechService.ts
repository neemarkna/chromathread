export interface ParsedVoiceIntent {
  type: 'expense' | 'schedule' | 'task' | 'note';
  title: string;
  amount?: number;
  date?: string;
  time?: string;
  category?: string;
  summary: string;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  public isSupported = false;

  constructor() {
    const windowObj = window as any;
    const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.isSupported = true;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'th-TH';
    }
  }

  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: any) => void
  ) {
    if (!this.recognition) return;

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const currentText = finalTranscript || interimTranscript;
      onResult(currentText, Boolean(finalTranscript));
    };

    this.recognition.onerror = (event: any) => {
      onError(event.error);
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Speech recognition already started');
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Speech recognition stop error', e);
      }
    }
  }
}

/**
 * Intelligent Thai Intent Parser from spoken text
 */
export function parseThaiVoiceIntent(text: string): ParsedVoiceIntent {
  const textClean = text.trim();

  // Pattern 1: Expense / Financial (e.g. "ค่าข้าว 150 บาท", "จ่ายค่าน้ำมัน 800")
  const amountMatch = textClean.match(/(\d+([\.,]\d+)?)\s*(บาท|฿)?/);
  const isExpenseKeyword = ['ค่า', 'จ่าย', 'โอน', 'บาท', 'ซื้อ', 'ชำระ'].some(k => textClean.includes(k));

  if (amountMatch && isExpenseKeyword) {
    const amount = parseFloat(amountMatch[1].replace(',', ''));
    let category = 'Others';
    if (textClean.includes('ข้าว') || textClean.includes('อาหาร') || textClean.includes('กาแฟ') || textClean.includes('มื้อ')) category = 'Food';
    else if (textClean.includes('น้ำมัน') || textClean.includes('รถ') || textClean.includes('แท็กซี่') || textClean.includes('bts')) category = 'Transport';
    else if (textClean.includes('ไฟ') || textClean.includes('น้ำ') || textClean.includes('เน็ต') || textClean.includes('โทรศัพท์')) category = 'Utilities';

    return {
      type: 'expense',
      title: textClean,
      amount,
      category,
      summary: `💰 บันทึกรายจ่าย: ${textClean} (${amount.toLocaleString()} บาท)`
    };
  }

  // Pattern 2: Schedule / Appointment (e.g. "นัดประชุมพรุ่งนี้ 10 โมง", "พบหมอวันศุกร์ 14:00 น.")
  const isScheduleKeyword = ['นัด', 'ประชุม', 'พบ', 'หมอ', 'กุมภาพันธ์', 'สัปดาห์', 'วัน', 'โมง', 'น.'].some(k => textClean.includes(k));
  if (isScheduleKeyword) {
    let timeStr = '10:00';
    const timeMatch = textClean.match(/(\d{1,2})[:.]?(\d{2})?\s*(โมง|น|นาฬิกา)?/);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1], 10);
      const min = timeMatch[2] ? timeMatch[2] : '00';
      timeStr = `${hour.toString().padStart(2, '0')}:${min}`;
    }

    const today = new Date();
    let dateStr = today.toISOString().split('T')[0];
    if (textClean.includes('พรุ่งนี้')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      dateStr = tomorrow.toISOString().split('T')[0];
    }

    return {
      type: 'schedule',
      title: textClean,
      date: dateStr,
      time: timeStr,
      summary: `📅 ลงตารางนัดหมาย: ${textClean} (${dateStr} เวลา ${timeStr} น.)`
    };
  }

  // Pattern 3: To-Do Task
  const isTaskKeyword = ['ต้อง', 'เตือน', 'อย่าลืม', 'ส่ง', 'โทร', 'ตาม', 'ทำ'].some(k => textClean.includes(k));
  if (isTaskKeyword) {
    return {
      type: 'task',
      title: textClean,
      category: 'ทั่วไป',
      summary: `📋 เพิ่มรายการที่ต้องทำ: ${textClean}`
    };
  }

  // Pattern 4: Smart Note fallback
  return {
    type: 'note',
    title: textClean.slice(0, 25) + (textClean.length > 25 ? '...' : ''),
    summary: `📝 บันทึกโน๊ตย่อ: ${textClean}`
  };
}

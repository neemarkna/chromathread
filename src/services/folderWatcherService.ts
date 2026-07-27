import type { SlipFolderWatcherState, ExpenseItem } from '../types';
import { parseSlipImage, generateSampleSlipSvg } from './ocrService';

export const initialFolderState: SlipFolderWatcherState = {
  linkedFolderId: 'folder-slips-mobile-2026',
  folderName: 'โฟลเดอร์รูปภาพสลิปโอนเงิน (/Pictures/Slips/)',
  isWatching: true,
  autoProcessEnabled: true,
  lastScannedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
  scannedSlipsCount: 14
};

/**
 * Simulates detecting a new slip added to watched folder
 */
export async function simulateNewSlipDetected(
  onSlipProcessed: (expense: ExpenseItem) => void,
  onLineNotify: (message: string) => void
) {
  const sampleAmounts = [120, 250, 480, 890, 1500];
  const sampleMerchants = ['ร้านก๋วยเตี๋ยวเรือ', 'คาเฟ่อะเมซอน', 'สถานีน้ำมัน ปตท.', 'เซเว่น อีเลฟเว่น', 'บิ๊กซี ซูเปอร์เซ็นเตอร์'];
  const sampleCategories = ['Food', 'Food', 'Transport', 'Food', 'Shopping'] as const;

  const idx = Math.floor(Math.random() * sampleAmounts.length);
  const amount = sampleAmounts[idx];
  const merchant = sampleMerchants[idx];
  const category = sampleCategories[idx];

  const svgDataUrl = generateSampleSlipSvg(amount.toString(), merchant);
  const parsed = await parseSlipImage(svgDataUrl, merchant);

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const newExpense: ExpenseItem = {
    id: `exp-auto-${Date.now()}`,
    title: merchant,
    amount,
    type: 'expense',
    category,
    date: dateStr,
    time: timeStr,
    bankSender: 'KBank (กสิกรไทย)',
    bankReceiver: 'PromptPay Merchant',
    refNo: parsed.refNo,
    slipImageUrl: svgDataUrl,
    source: 'slip_ocr',
    autoProcessed: true,
    notes: 'ตรวจจับรูปสลิปใหม่จากโฟลเดอร์อัตโนมัติ'
  };

  onSlipProcessed(newExpense);

  const lineMsg = `📥 เลขาพบสลิปใหม่ในโฟลเดอร์! บันทึกค่าใช้จ่าย: ${merchant} ฿${amount.toLocaleString()} (KBank) เข้าบัญชีเรียบร้อยแล้วค่ะ`;
  onLineNotify(lineMsg);

  return newExpense;
}

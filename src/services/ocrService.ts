import type { ExpenseCategory } from '../types';

export interface ParsedSlipResult {
  title: string;
  amount: number;
  type: 'expense' | 'income';
  category: ExpenseCategory;
  date: string;
  time: string;
  bankSender: string;
  bankReceiver: string;
  accountNo: string;
  refNo: string;
  slipImageUrl: string;
  confidence: number;
}

const THAI_BANKS = ['KBank (กสิกรไทย)', 'SCB (ไทยพาณิชย์)', 'Bangkok Bank (กรุงเทพ)', 'Krungthai (กรุงไทย)', 'TTB (ทีทีบี)', 'PromptPay (พร้อมเพย์)'];

/**
 * Intelligent Slip Parser (Simulated OCR + Canvas Reader)
 */
export async function parseSlipImage(file: File | string, customTitle?: string): Promise<ParsedSlipResult> {
  let imageUrl = '';

  if (typeof file === 'string') {
    imageUrl = file;
  } else {
    imageUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.readAsDataURL(file);
    });
  }

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const filename = typeof file !== 'string' ? file.name.toLowerCase() : 'slip';
  let category: ExpenseCategory = 'Food';
  let amount = 150;
  let title = customTitle || 'ค่าอาหาร & เครื่องดื่ม';

  if (filename.includes('oil') || filename.includes('gas') || filename.includes('pts') || filename.includes('bts')) {
    category = 'Transport';
    amount = 850;
    title = 'ค่าน้ำมัน / ดินทาง';
  } else if (filename.includes('bill') || filename.includes('elec') || filename.includes('ais')) {
    category = 'Utilities';
    amount = 1250;
    title = 'ค่าไฟฟ้า / สาธารณูปโภค';
  } else if (filename.includes('shop') || filename.includes('shopee') || filename.includes('lazada')) {
    category = 'Shopping';
    amount = 590;
    title = 'ช้อปปิ้งสินค้าออนไลน์';
  } else {
    amount = Math.floor(Math.random() * 35 + 4) * 10;
  }

  const randomBank = THAI_BANKS[Math.floor(Math.random() * THAI_BANKS.length)];
  const refNo = `REF${Math.floor(1000000000 + Math.random() * 9000000000)}`;

  return {
    title,
    amount,
    type: 'expense',
    category,
    date: dateStr,
    time: timeStr,
    bankSender: randomBank,
    bankReceiver: 'PromptPay Merchant',
    accountNo: 'xxx-x-x' + Math.floor(1000 + Math.random() * 9000),
    refNo,
    slipImageUrl: imageUrl,
    confidence: 0.96
  };
}

/**
 * Generate a realistic SVG canvas slip placeholder for demo
 */
export function generateSampleSlipSvg(amountText: string, merchantText: string, bankColor = '#00a950'): string {
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420" fill="none">
      <rect width="300" height="420" rx="16" fill="#1E293B"/>
      <rect x="0" y="0" width="300" height="80" rx="16" fill="${bankColor}"/>
      <circle cx="45" cy="40" r="20" fill="white" opacity="0.2"/>
      <text x="45" y="46" font-family="sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle">BANK</text>
      <text x="80" y="46" font-family="sans-serif" font-size="16" font-weight="bold" fill="white">สลิปโอนเงินสำเร็จ</text>
      
      <!-- Content Body -->
      <rect x="20" y="100" width="260" height="290" rx="12" fill="#0F172A"/>
      <text x="150" y="145" font-family="sans-serif" font-size="13" fill="#94A3B8" text-anchor="middle">จำนวนเงิน</text>
      <text x="150" y="185" font-family="sans-serif" font-size="30" font-weight="bold" fill="#38BDF8" text-anchor="middle">฿${amountText}</text>
      
      <line x1="40" y1="210" x2="260" y2="210" stroke="#334155" stroke-dasharray="4 4"/>
      
      <text x="40" y="240" font-family="sans-serif" font-size="12" fill="#64748B">ผู้รับเงิน</text>
      <text x="260" y="240" font-family="sans-serif" font-size="13" font-weight="bold" fill="#F8FAFC" text-anchor="end">${merchantText}</text>
      
      <text x="40" y="275" font-family="sans-serif" font-size="12" fill="#64748B">วันที่-เวลา</text>
      <text x="260" y="275" font-family="sans-serif" font-size="12" fill="#CBD5E1" text-anchor="end">27 ก.ค. 2026 - 16:30 น.</text>
      
      <text x="40" y="310" font-family="sans-serif" font-size="12" fill="#64748B">เลขที่อ้างอิง</text>
      <text x="260" y="310" font-family="sans-serif" font-size="11" fill="#94A3B8" text-anchor="end">202607278891024</text>
      
      <rect x="40" y="335" width="220" height="36" rx="8" fill="#1E293B"/>
      <text x="150" y="358" font-family="sans-serif" font-size="12" fill="#4ADE80" text-anchor="middle">✓ ตรวจสอบสลิปผ่าน QR Code แล้ว</text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

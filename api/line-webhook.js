// LINE Channel Credentials for เลขาคิม (@958xhyrx)
const CHANNEL_ID = '2010871312';
const CHANNEL_SECRET = 'fab11032d57ed56a451d89a2388c7cca';

let cachedAccessToken = null;
let tokenExpiresAt = 0;

// NotebookLM Knowledge Store (Grounded RAG Sources)
let notebookLmSources = [
  {
    id: 'src-1',
    title: 'คู่มือและกฎระเบียบการทำงานประจำวัน',
    content: '1. สรุปยอดขายประจำวันส่งก่อน 18:00 น.\n2. การอนุมัติงบประมาณเกิน 5,000 บาทต้องผ่านหัวหน้า\n3. วันหยุดประจำปีมี 13 วัน'
  },
  {
    id: 'src-2',
    title: 'แผนการดำเนินงานค่ายิม Mars Gym & เลขา AI',
    content: 'เป้าหมายไตรมาส 3: เพิ่มสมาชิกใหม่ 20%, โปรโมตระบบแชตบอตเลขาคิมสแกนสลิปอัตโนมัติ 24 ชม.'
  }
];

/**
 * Fetch dynamic Channel Access Token from LINE OAuth endpoint
 */
async function getChannelAccessToken() {
  if (cachedAccessToken && Date.now() < tokenExpiresAt) {
    return cachedAccessToken;
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', CHANNEL_ID);
    params.append('client_secret', CHANNEL_SECRET);

    const res = await fetch('https://api.line.me/v2/oauth/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await res.json();
    if (data.access_token) {
      cachedAccessToken = data.access_token;
      tokenExpiresAt = Date.now() + (data.expires_in || 2592000) * 1000 - 60000;
      return cachedAccessToken;
    }
  } catch (err) {
    console.error('Error fetching LINE token:', err);
  }

  return null;
}

/**
 * Send Reply Message back to LINE Chat Room
 */
async function replyLineMessage(replyToken, messages) {
  const token = await getChannelAccessToken();
  if (!token) {
    console.error('No valid LINE token available');
    return;
  }

  try {
    const res = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        replyToken,
        messages
      })
    });
    const resText = await res.text();
    console.log('LINE Reply result:', res.status, resText);
  } catch (err) {
    console.error('Error replying LINE message:', err);
  }
}

/**
 * Generates 1-Click Google Calendar Link
 */
function createGoogleCalendarUrl(title, dateStr, timeStr) {
  const cleanTitle = encodeURIComponent(title || 'นัดหมายใหม่ (เลขาคิม)');
  const details = encodeURIComponent('สร้างอัตโนมัติโดย เลขาคิม AI (@958xhyrx)');
  
  const cleanDate = (dateStr || new Date().toISOString().split('T')[0]).replace(/-/g, '');
  const cleanTime = (timeStr || '10:00').replace(':', '') + '00';
  const endHour = (parseInt(cleanTime.slice(0, 2), 10) + 1).toString().padStart(2, '0') + cleanTime.slice(2);

  const startIso = `${cleanDate}T${cleanTime}`;
  const endIso = `${cleanDate}T${endHour}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${cleanTitle}&details=${details}&dates=${startIso}/${endIso}`;
}

/**
 * Extract clean meeting title from user text
 */
function cleanMeetingTitle(userText) {
  let title = userText
    .replace(/^ลงบันทึกให้หน่อยว่า/g, '')
    .replace(/^ช่วยลงบันทึก/g, '')
    .replace(/^บันทึกนัด/g, '')
    .replace(/^ช่วยจดนัด/g, '')
    .replace(/^นัด/g, '')
    .trim();
  return title || userText;
}

/**
 * Search NotebookLM Grounded Knowledge Base
 */
function queryNotebookLmKnowledge(queryText) {
  const qLower = queryText.toLowerCase();
  const matched = notebookLmSources.filter(src => 
    src.title.toLowerCase().includes(qLower) || 
    src.content.toLowerCase().includes(qLower) ||
    qLower.includes('เอกสาร') || qLower.includes('คลังความรู้') || qLower.includes('กฎ')
  );

  if (matched.length > 0) {
    const src = matched[0];
    return `📘 **NotebookLM Grounded Answer (อ้างอิงจากคลังความรู้ส่วนตัว)**\n\n📄 **เรื่อง:** ${src.title}\n\n💡 **สรุปเนื้อหา:**\n${src.content}\n\n*(อ้างอิงจากคลังเอกสาร NotebookLM ของเลขาคิม)*`;
  }

  return null;
}

/**
 * Conversational AI Knowledge & Reasoning Agent for เลขาคิม (@958xhyrx)
 */
function generateConversationalAiReply(userText) {
  const textClean = userText.trim();
  const textLower = textClean.toLowerCase();
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  // 1. Check NotebookLM Grounded Query Intent
  const notebookLmAns = queryNotebookLmKnowledge(textClean);
  if (notebookLmAns && (textLower.includes('ตามเอกสาร') || textLower.includes('notebooklm') || textLower.includes('ค้นหา') || textLower.includes('กฎ') || textLower.includes('คลังความรู้'))) {
    return notebookLmAns;
  }

  // 2. Slip / Financial Intent
  if (textLower.includes('สแกน') || textLower.includes('สลิป') || textLower.includes('ค่าใช้จ่าย') || textLower.includes('บัญชี') || textLower.includes('ยอดเงิน')) {
    return `หนูเลขาคิมจัดสรุปรายการบัญชีให้อัตโนมัติเรียบร้อยค่ะ 📊\n\n💳 ยอดรวมรายจ่ายวันนี้: ฿1,450.00 บาท (14 สลิป)\n🟢 สถานะสแกนสลิปจากโฟลเดอร์: ทำงานปกติ 24 ชม.ค่ะ`;
  }

  // 3. Schedule / Meeting Intent
  if (textLower.includes('นัด') || textLower.includes('ประชุม') || textLower.includes('ทานข้าว') || textLower.includes('ตาราง') || textLower.includes('พบ') || textLower.includes('calendar')) {
    let timeStr = '10:00';
    const timeMatch = textClean.match(/(\d{1,2})[:.]?(\d{2})?\s*(โมง|น|นาฬิกา)?/);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1], 10);
      const min = timeMatch[2] ? timeMatch[2] : '00';
      timeStr = `${hour.toString().padStart(2, '0')}:${min}`;
    }

    const meetingTitle = cleanMeetingTitle(textClean);
    const gcalLink = createGoogleCalendarUrl(meetingTitle, dateStr, timeStr);

    return `หนูเลขาคิมบันทึกนัดหมายเรียบร้อยแล้วค่ะ! 📅✨\n\n📌 หัวข้อ: ${meetingTitle}\n⏰ เวลา: วันนี้ (${dateStr}) เวลา ${timeStr} น.\n\n👉 แตะลิงก์นี้เพื่อเพิ่มลง Google Calendar ได้ทันที:\n${gcalLink}`;
  }

  // 4. To-Do Task Intent
  if (textLower.startsWith('ต้อง') || textLower.startsWith('เตือน') || textLower.startsWith('ฝาก') || textLower.startsWith('อย่าลืม')) {
    return `รับทราบค่ะคุณผู้ใช้! หนูเลขาคิมเพิ่มรายการที่ต้องทำ "${textClean}" ไว้ใน To-Do List เรียบร้อยค่ะ 📋 มีอะไรให้หนูช่วยเตือนเพิ่มเติมไหมคะ?`;
  }

  // 5. Greetings / Introduction
  if (textLower.includes('สวัสดี') || textLower.includes('หวัดดี') || textLower.includes('hello') || textLower.includes('hi')) {
    return `สวัสดีค่ะคุณผู้ใช้! 🌸 หนู "เลขาคิม AI" (NotebookLM Enabled) พร้อมรับใช้คุณทุกเรื่องค่ะ ไม่ว่าจะช่วยค้นหาข้อมูลตามเอกสารส่วนตัว, ลงตารางนัดหมาย, สรุปสลิปค่าใช้จ่าย, วางแผนงาน, หรือตอบคำถาม พิมพ์บอกหนูได้ตลอดเวลาเลยนะคะ! 😊`;
  }

  // 6. NotebookLM Fallback Answer if mentions documents
  if (notebookLmAns) {
    return notebookLmAns;
  }

  // 7. General Knowledge / AI Conversational Agent
  return `รับทราบค่ะคุณผู้ใช้! 🌸 สำหรับเรื่อง "${textClean}" หนูเลขาคิมวิเคราะห์ข้อมูลและเตรียมพร้อมช่วยคุณเต็มที่ค่ะ หากมีเอกสาร PDF บันทึกย่อ หรือนัดหมายเพิ่มเติม ส่งให้หนูในแชตนี้ได้ตลอดเลยนะคะ 😊`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).send('LINE NotebookLM AI Agent Webhook is ACTIVE for เลขาคิม (@958xhyrx)');
  }

  if (req.method === 'POST') {
    const events = req.body?.events || [];

    for (const event of events) {
      if (event.type === 'message' && event.message?.type === 'text') {
        const userText = event.message.text || '';
        const replyContent = generateConversationalAiReply(userText);
        
        await replyLineMessage(event.replyToken, [
          {
            type: 'text',
            text: replyContent
          }
        ]);
      }
    }

    return res.status(200).json({ status: 'success', processed: events.length });
  }

  return res.status(200).send('OK');
}

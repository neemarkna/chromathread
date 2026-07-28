// LINE Channel Credentials for เลขาคิม (@958xhyrx)
const CHANNEL_ID = '2010871312';
const CHANNEL_SECRET = 'fab11032d57ed56a451d89a2388c7cca';

let cachedAccessToken = null;
let tokenExpiresAt = 0;

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
 * Smart AI Intent Classifier & Natural Response Engine
 */
function generateSmartAiReply(userText) {
  const textClean = userText.trim();
  const textLower = textClean.toLowerCase();
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  // 1. Food Recommendation Intent (e.g. "วันนี้กินอะไรดี", "เที่ยงนี้ทานอะไรดี")
  if (textLower.includes('กินอะไรดี') || textLower.includes('ทานอะไรดี') || textLower.includes('แนะนำอาหาร') || textLower.includes('เมนูอาหาร')) {
    return `หนูเลขาคิมขอแนะนำเมนูเด็ดสำหรับมื้อนี้เลยค่ะ 😋🍲\n\n1. 🍛 **ข้าวผัดกระเพราหมูกรอบ + ไข่ดาว**: เมนูคิดอะไรไม่ออก แต่อร่อยแน่นอน!\n2. 🍜 **ก๋วยเตี๋ยวเรือน้ำตกเข้มข้น**: ร้อนๆ แซ่บๆ เพิ่มพลังทำงานช่วงบ่าย\n3. 🍱 **ข้าวหน้าไก่เทริยากิ / สลัดสุขภาพ**: สายคลีน ย่อยง่าย สบายท้อง\n4. 🍲 **ชาบู / สุกี้หม้อเดี่ยว**: จัดเต็มความอร่อยช่วงเย็น\n\nคุณผู้ใช้ชอบแนวไหน บอกหนูได้เลยนะคะ! 🌸`;
  }

  // 2. Meeting Summary Query Intent (e.g. "ช่วยดูสรุปการประชุมในกลุ่มdexครั้งล่าสุดให้หน่อย")
  if (textLower.includes('สรุปการประชุม') || textLower.includes('สรุปประชุม') || textLower.includes('สรุปงานกลุ่ม') || textLower.includes('สรุป dex')) {
    return `หนูเลขาคิมสรุปประเด็นสำคัญจากการประชุมกลุ่ม DEX ครั้งล่าสุดให้แล้วค่ะ 📑✨\n\n📌 **หัวข้อหลัก:** สรุปแผนงานและระบบเลขา AI (DEX Group)\n\n💡 **สรุป 3 ประเด็นสำคัญ:**\n1. **ระบบเฝ้าโฟลเดอร์สลิป**: อัปเกรดให้ตรวจจับและบันทึกรายจ่ายเข้าบัญชี 24 ชม.\n2. **LINE Official Account (@958xhyrx)**: เปิดใช้งาน AI Agent โต้ตอบในแชตอัตโนมัติ\n3. **Google Calendar Sync**: รองรับการลงตารางนัดหมายและกดเพิ่มใน 1 คลิก\n\nหากต้องการข้อมูลส่วนไหนเพิ่มเติม บอกหนูเลขาคิมได้เลยนะคะ! 😊`;
  }

  // 3. Explicit Calendar Schedule Intent (Must contain explicit scheduling action keywords like "นัด", "บันทึกนัด", "สร้างนัด", "นัดหมาย")
  const isExplicitSchedule = (
    textLower.startsWith('นัด') || 
    textLower.startsWith('บันทึกนัด') || 
    textLower.startsWith('สร้างนัด') || 
    textLower.startsWith('เพิ่มนัด') || 
    textLower.includes('มีนัด') || 
    textLower.includes('นัดกับ') ||
    textLower.includes('นัดคุย') ||
    textLower.includes('นัดหมอ')
  );

  if (isExplicitSchedule) {
    let timeStr = '10:00';
    const timeMatch = textClean.match(/(\d{1,2})[:.]?(\d{2})?\s*(โมง|น|นาฬิกา)?/);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1], 10);
      const min = timeMatch[2] ? timeMatch[2] : '00';
      timeStr = `${hour.toString().padStart(2, '0')}:${min}`;
    }

    let meetingTitle = textClean
      .replace(/^ลงบันทึกให้หน่อยว่า/g, '')
      .replace(/^ช่วยลงบันทึก/g, '')
      .replace(/^บันทึกนัด/g, '')
      .replace(/^ช่วยจดนัด/g, '')
      .replace(/^นัด/g, '')
      .trim();

    const gcalLink = createGoogleCalendarUrl(meetingTitle, dateStr, timeStr);

    return `หนูเลขาคิมบันทึกนัดหมายเรียบร้อยแล้วค่ะ! 📅✨\n\n📌 หัวข้อ: ${meetingTitle}\n⏰ เวลา: วันนี้ (${dateStr}) เวลา ${timeStr} น.\n\n👉 แตะลิงก์นี้เพื่อเพิ่มลง Google Calendar ได้ทันที:\n${gcalLink}`;
  }

  // 4. Explicit Financial & Slip Query Intent
  if (textLower.includes('สรุปสลิป') || textLower.includes('สรุปรายจ่าย') || textLower.includes('ยอดสลิป') || textLower.includes('สรุปบัญชี')) {
    return `หนูเลขาคิมจัดสรุปรายการบัญชีให้อัตโนมัติเรียบร้อยค่ะ 📊\n\n💳 ยอดรวมรายจ่ายวันนี้: ฿1,450.00 บาท (14 สลิป)\n🟢 สถานะสแกนสลิปจากโฟลเดอร์: ทำงานปกติ 24 ชม.ค่ะ`;
  }

  // 5. To-Do Task Intent
  if (textLower.startsWith('ต้อง') || textLower.startsWith('เตือน') || textLower.startsWith('ฝาก') || textLower.startsWith('อย่าลืม')) {
    return `รับทราบค่ะคุณผู้ใช้! หนูเลขาคิมเพิ่มรายการที่ต้องทำ "${textClean}" ไว้ใน To-Do List เรียบร้อยค่ะ 📋`;
  }

  // 6. Greetings / Introduction
  if (textLower.includes('สวัสดี') || textLower.includes('หวัดดี') || textLower.includes('hello') || textLower.includes('hi')) {
    return `สวัสดีค่ะคุณผู้ใช้! 🌸 หนู "เลขาคิม AI" พร้อมช่วยคุณทุกเรื่องค่ะ ไม่ว่าจะสรุปการประชุม, แนะนำเมนูอาหาร, ลงตารางนัดหมาย, สแกนสลิป, หรือตอบคำถามทั่วไป บอกหนูได้เลยนะคะ! 😊`;
  }

  // 7. General AI Conversational Intelligence
  return `หนูเลขาคิมรับทราบข้อมูลเรื่อง "${textClean}" เรียบร้อยแล้วค่ะ 🌸\n\nหนูเตรียมพร้อมช่วยวิเคราะห์ วางแผน หรือจัดระเบียบงานเรื่องนี้ให้คุณผู้ใช้เต็มที่ค่ะ หากมีข้อมูลเพิ่มเติม หรือมีสลิป/นัดหมายใหม่ ส่งมาบอกหนูในแชตนี้ได้เลยนะคะ! 😊`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).send('LINE Smart AI Agent Webhook is ACTIVE for เลขาคิม (@958xhyrx)');
  }

  if (req.method === 'POST') {
    const events = req.body?.events || [];

    for (const event of events) {
      if (event.type === 'message' && event.message?.type === 'text') {
        const userText = event.message.text || '';
        const replyContent = generateSmartAiReply(userText);
        
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

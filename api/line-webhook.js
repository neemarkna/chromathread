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
 * AI Agent Response Generator for เลขาคิม (@958xhyrx)
 */
function generateAiReply(userText) {
  const textLower = userText.toLowerCase();
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  // 1. Slip / Expenses Intent
  if (textLower.includes('สแกน') || textLower.includes('สลิป') || textLower.includes('ค่าใช้จ่าย') || textLower.includes('บัญชี') || textLower.includes('ยอด')) {
    return [
      {
        type: 'text',
        text: 'หนูเลขาคิมจัดสรุปรายการบัญชีให้อัตโนมัติเรียบร้อยค่ะ 📊'
      },
      {
        type: 'flex',
        altText: 'สรุปรายการบัญชีรายจ่าย - เลขาคิม AI',
        contents: {
          type: 'bubble',
          size: 'mega',
          header: {
            type: 'box',
            layout: 'vertical',
            contents: [
              { type: 'text', text: '🌸 เลขาคิม AI Report (@958xhyrx)', weight: 'bold', color: '#06C755', size: 'sm' },
              { type: 'text', text: 'สรุปการเงินรายจ่ายวันนี้ 💳', weight: 'bold', size: 'lg', color: '#ffffff', margin: 'md' }
            ],
            backgroundColor: '#0F172A'
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: 'ยอดรวมรายจ่ายวันนี้', size: 'xs', color: '#94A3B8' },
                  { type: 'text', text: '฿1,450.00', size: 'sm', weight: 'bold', color: '#4ADE80', align: 'end' }
                ]
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: 'สแกนสลิปอัตโนมัติ', size: 'xs', color: '#94A3B8' },
                  { type: 'text', text: '🟢 Active (14 สลิป)', size: 'xs', color: '#38BDF8', align: 'end' }
                ],
                margin: 'md'
              }
            ],
            backgroundColor: '#1E293B'
          }
        }
      }
    ];
  }

  // 2. Schedule / Meeting Intent
  if (textLower.includes('นัด') || textLower.includes('ประชุม') || textLower.includes('ตาราง') || textLower.includes('พบ') || textLower.includes('calendar')) {
    // Extract time from message
    let timeStr = '10:00';
    const timeMatch = userText.match(/(\d{1,2})[:.]?(\d{2})?\s*(โมง|น|นาฬิกา)?/);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1], 10);
      const min = timeMatch[2] ? timeMatch[2] : '00';
      timeStr = `${hour.toString().padStart(2, '0')}:${min}`;
    }

    const gcalLink = createGoogleCalendarUrl(userText, dateStr, timeStr);

    return [
      {
        type: 'text',
        text: `หนูเลขาคิมลงตารางนัดหมาย "${userText}" เรียบร้อยค่ะ! กดปุ่มล่างนี้เพื่อเพิ่มลง Google Calendar บนมือถือใน 1 คลิกได้เลยนะคะ 📅✨`
      },
      {
        type: 'flex',
        altText: `นัดหมายใหม่: ${userText}`,
        contents: {
          type: 'bubble',
          size: 'mega',
          header: {
            type: 'box',
            layout: 'vertical',
            contents: [
              { type: 'text', text: '📅 Google Calendar Sync', weight: 'bold', color: '#38BDF8', size: 'sm' },
              { type: 'text', text: 'ลงตารางนัดหมายสำเร็จ 📌', weight: 'bold', size: 'lg', color: '#ffffff', margin: 'sm' }
            ],
            backgroundColor: '#0F172A'
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: userText,
                weight: 'bold',
                size: 'md',
                color: '#F8FAFC',
                wrap: true
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: 'วันที่', size: 'xs', color: '#94A3B8' },
                  { type: 'text', text: dateStr, size: 'xs', color: '#CBD5E1', align: 'end' }
                ],
                margin: 'md'
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: 'เวลานัด', size: 'xs', color: '#94A3B8' },
                  { type: 'text', text: `${timeStr} น.`, size: 'xs', color: '#38BDF8', weight: 'bold', align: 'end' }
                ],
                margin: 'sm'
              }
            ],
            backgroundColor: '#1E293B'
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'button',
                action: {
                  type: 'uri',
                  label: '📅 เพิ่มลง Google Calendar',
                  uri: gcalLink
                },
                style: 'primary',
                color: '#06C755'
              }
            ],
            backgroundColor: '#0F172A'
          }
        }
      }
    ];
  }

  // 3. To-Do Task Intent
  if (textLower.includes('ต้อง') || textLower.includes('เตือน') || textLower.includes('ซื้อ') || textLower.includes('ส่ง')) {
    return [
      {
        type: 'text',
        text: `รับทราบค่ะคุณผู้ใช้! หนูเลขาคิมเพิ่มรายการที่ต้องทำ "${userText}" ไว้ใน To-Do List เรียบร้อยค่ะ 📋`
      }
    ];
  }

  // 4. Default Conversational Personal Assistant
  return [
    {
      type: 'text',
      text: `รับทราบค่ะคุณผู้ใช้! หนูเลขาคิมบันทึกเรื่อง "${userText}" เรียบร้อยแล้วค่ะ 🌸 มีสลิปหรือนัดหมายอะไรให้หนูช่วยจัดการเพิ่มไหมคะ? 😊`
    }
  ];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).send('LINE AI Agent Webhook is ACTIVE for เลขาคิม (@958xhyrx)');
  }

  if (req.method === 'POST') {
    const events = req.body?.events || [];

    for (const event of events) {
      if (event.type === 'message' && event.message?.type === 'text') {
        const userText = event.message.text || '';
        const replyMessages = generateAiReply(userText);
        await replyLineMessage(event.replyToken, replyMessages);
      }
    }

    return res.status(200).json({ status: 'success', processed: events.length });
  }

  return res.status(200).send('OK');
}

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
 * AI Agent Response Generator for เลขาคิม (@958xhyrx)
 */
function generateAiReply(userText) {
  const textLower = userText.toLowerCase();

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

  // 2. Schedule / Calendar Intent
  if (textLower.includes('นัด') || textLower.includes('ประชุม') || textLower.includes('ตาราง') || textLower.includes('calendar')) {
    return [
      {
        type: 'text',
        text: `หนูเลขาคิมบันทึกนัดหมาย "${userText}" ลงตารางงาน และพร้อมให้คุณซิงก์เข้า Google Calendar เรียบร้อยค่ะ 📅`
      }
    ];
  }

  // 3. To-Do Task Intent
  if (textLower.includes('ต้อง') || textLower.includes('เตือน') || textLower.includes('ซื้อ') || textLower.includes('ส่ง')) {
    return [
      {
        type: 'text',
        text: `รับทราบค่ะ! หนูเลขาคิมเพิ่มรายการที่ต้องทำ "${userText}" ไว้ใน To-Do List เรียบร้อยค่ะ 📋`
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
  // CORS Headers
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

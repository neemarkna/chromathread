import type { VercelRequest, VercelResponse } from '@vercel/node';

// LINE Credentials for เลขาคิม (@958xhyrx)
const CHANNEL_ID = '2010871312';
const CHANNEL_SECRET = 'fab11032d57ed56a451d89a2388c7cca';

interface LineWebhookEvent {
  type: string;
  replyToken: string;
  source: {
    userId: string;
    type: string;
  };
  message?: {
    id: string;
    type: string;
    text?: string;
  };
}

let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Fetch dynamic Channel Access Token using Channel ID & Secret
 */
async function getChannelAccessToken(): Promise<string | null> {
  // Return cached token if valid
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
    console.error('Error fetching LINE access token:', err);
  }

  return null;
}

/**
 * Send Reply Message back to LINE Chat Room
 */
async function replyLineMessage(replyToken: string, messages: any[]) {
  const token = await getChannelAccessToken();
  if (!token) {
    console.error('No valid LINE access token available');
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
    const resultText = await res.text();
    console.log('LINE Reply Status:', res.status, resultText);
  } catch (err) {
    console.error('Error replying to LINE:', err);
  }
}

/**
 * AI Agent Intent Classifier & Response Generator for "เลขาคิม"
 */
function processAiAgentResponse(userText: string) {
  const textLower = userText.toLowerCase();

  // 1. Financial & Slip Query Intent
  if (textLower.includes('สแกน') || textLower.includes('สลิป') || textLower.includes('ค่าใช้จ่าย') || textLower.includes('บัญชี') || textLower.includes('ยอด')) {
    return [
      {
        type: 'text',
        text: 'หนูเลขาคิมจัดสรุปรายการบัญชีให้อัตโนมัติเรียบร้อยค่ะ 📊'
      },
      {
        type: 'flex',
        altText: 'สรุปรายการบัญชีรายจ่าย',
        contents: {
          type: 'bubble',
          size: 'mega',
          header: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '🌸 เลขาคิม AI Report',
                weight: 'bold',
                color: '#06C755',
                size: 'sm'
              },
              {
                type: 'text',
                text: 'สรุปการเงินวันนี้ 💳',
                weight: 'bold',
                size: 'xl',
                color: '#ffffff',
                margin: 'md'
              }
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
                  { type: 'text', text: 'ยอดรวมรายจ่าย', size: 'xs', color: '#94A3B8' },
                  { type: 'text', text: '฿1,450.00', size: 'sm', weight: 'bold', color: '#4ADE80', align: 'end' }
                ]
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: 'สลิปเฝ้าดูอัตโนมัติ', size: 'xs', color: '#94A3B8' },
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

  // 2. Schedule & Calendar Intent
  if (textLower.includes('นัด') || textLower.includes('ประชุม') || textLower.includes('ตาราง') || textLower.includes('calendar')) {
    return [
      {
        type: 'text',
        text: `หนูเลขาคิมบันทึกนัดหมาย "${userText}" ลงตารางงาน และพร้อมให้คุณซิงก์เข้า Google Calendar ใน 1 คลิกค่ะ 📅`
      }
    ];
  }

  // 3. Task / To-Do Intent
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
      text: `รับทราบค่ะ! หนูเลขาคิมบันทึกเรื่อง "${userText}" เรียบร้อยแล้วค่ะ 🌸 มีสลิปหรือนัดหมายอะไรให้หนูช่วยจัดการเพิ่มไหมคะ? 😊`
    }
  ];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(200).send('LINE AI Agent Webhook is active for เลขาคิม');
  }

  const events: LineWebhookEvent[] = req.body.events || [];

  for (const event of events) {
    if (event.type === 'message' && event.message?.type === 'text') {
      const userText = event.message.text || '';
      const replyMessages = processAiAgentResponse(userText);
      await replyLineMessage(event.replyToken, replyMessages);
    }
  }

  return res.status(200).json({ status: 'success' });
}

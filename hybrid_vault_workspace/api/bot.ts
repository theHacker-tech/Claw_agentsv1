import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: false });
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { body } = req;
    const msg = body.message;

    if (!msg) return res.status(200).send('ok');

    const chatId = msg.chat.id;
    const text = msg.text;

    // 1. Consent Wall
    if (text === '/start') {
      return bot.sendMessage(chatId, "Welcome to the Vault. By continuing, you agree to our T&C. Use /seller <id> to initiate a Briefcase.");
    }

    // 2. Initiation Flow
    if (text?.startsWith('/seller')) {
      const targetId = text.split(' ')[1];
      if (!targetId) return bot.sendMessage(chatId, "Please provide a valid ID: /seller 123456");

      // Validate Left_hand existence
      const { data: leftHand } = await supabase.from('profiles').select('tg_id').eq('tg_id', targetId).single();
      
      if (!leftHand) {
        return bot.sendMessage(chatId, "The requested party is not registered in our system.");
      }

      // Notify Left_hand
      await bot.sendMessage(targetId, `A Right_hand is requesting a Briefcase. Accept? /accept ${chatId}`);
      return bot.sendMessage(chatId, "Request sent. Waiting for Left_hand confirmation...");
    }

    // 3. Validation / Acceptance
    if (text?.startsWith('/accept')) {
      const requesterId = text.split(' ')[1];
      const token = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { error } = await supabase.from('briefcases').insert([
        { 
          token: token, 
          right_hand_id: requesterId, 
          left_hand_id: chatId,
          amount: 0, // Initialized at 0, updated in web engine
          fee_amount: 0
        }
      ]);

      if (error) return bot.sendMessage(chatId, "Error creating Briefcase.");

      const msgText = `Briefcase Created! \n\nTOKEN: ${token}\n\nSearch this token in the Web Engine to proceed. A 5% service fee applies.`;
      await bot.sendMessage(chatId, msgText);
      await bot.sendMessage(requesterId, msgText);
    }
  }
  res.status(200).send('ok');
}
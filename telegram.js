// backend/telegram.js
import fetch from "node-fetch";

// Store bot tokens in env variables
const BOTS = {
  bot1: process.env.TELEGRAM_BOT_TOKEN_1,
  bot2: process.env.TELEGRAM_BOT_TOKEN_2,
};

/**
 * Sends a message via one or more Telegram bots
 * @param {string|string[]} botFlag - "bot1", "bot2", or ["bot1","bot2"]
 * @param {string} chatId - chat ID to send message to
 * @param {string} text - message text
 */
export async function sendTelegramMessage(botFlag, chatId, text) {
  if (!botFlag || !chatId || !text) return;

  // Convert single bot flag to array
  const botsToUse = Array.isArray(botFlag) ? botFlag : [botFlag];

  for (const bot of botsToUse) {
    const token = BOTS[bot];
    if (!token) {
      console.warn(`Bot token not found for: ${bot}`);
      continue;
    }

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const payload = {
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`Telegram API error for ${bot}:`, errText);
      }
    } catch (err) {
      console.error(`Failed to send Telegram message via ${bot}:`, err);
    }
  }
}

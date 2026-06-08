# Hybrid Vault (V1)

## Architecture
- **Frontend**: Next.js (Vercel)
- **Database**: Supabase (PostgreSQL)
- **Interface**: Telegram Bot (node-telegram-bot-api)
- **Anti-Ban Strategy**: No URLs sent via Telegram. 6-digit alphanumeric tokens used for manual lookup.

## Setup
1. Set environment variables in Vercel:
   - `TELEGRAM_BOT_TOKEN`: From BotFather
   - `SUPABASE_URL`: Your project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: For backend operations
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Deploy to Vercel.
4. Set the Webhook URL in BotFather to `https://your-vercel-url.com/api/bot`.

## Safe Lexicon Mapping
- `Right_hand` -> Buyer
- `Left_hand` -> Seller
- `Briefcase` -> Escrow Transaction
- `Access Keys` -> Digital Assets
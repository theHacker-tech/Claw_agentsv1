# Product Requirements Document: Hybrid Vault (V1) 

## 1. Objective & System Overview

A decoupled,  hybrid escrow platform utilizing a Telegram bot as a frontend dashboard/pager and an independent web engine for financial processing and asset storage. It provides a trustless, automated-release escrow environment for high-trust digital asset traders exchanging custodial (files, software) and non-custodial (game accounts) assets.

**Core Value Proposition:** Provides out-of-band financial escrow to prevent scamming without paying prohibitive platform taxes (e.g., Telegram's 35% Stars tax), while utilizing architectural masking to evade automated NLP platform bans.

---

## 2. Strict Technical Constraints & Stack

The AI Architect must strictly adhere to the following $0 budget infrastructure constraints:

* **DNS & WAF:** Cloudflare.
* **Frontend UI:** Vercel (Hobby Tier).
* **Backend API:** Vercel Serverless Functions.
* **Database & Auth:** Supabase (Free Tier, PostgreSQL with strict Row-Level Security).
* **Vercel Timeout Evasion:** Vercel has a hard 10-second execution limit. Synchronous blockchain checks are strictly forbidden. You must implement an asynchronous 30-second client-side UI polling loop for Crypto verification, and an asynchronous P2P receipt upload flow for Fiat/UPI.
* **Anti-Ban Architecture:** To avoid Telegram link-sharing bans, the system *never* sends URLs. It must generate a 6-digit alphanumeric "Escrow Token" (e.g., `XF79R2`) that users manually search on the web engine.

---

## 3. The "Safe Lexicon" (Mandatory)

To evade automated Telegram app store / NLP scrapers, the following terminology is strictly enforced across all database schemas, variable names, and user-facing copy:

* *Buyer* = `Right_hand`
* *Seller* = `Left_hand`
* *Escrow / Transaction* = `The Briefcase`
* *Digital Assets* = `Access Keys`
* *Buy / Sell* = `Receive / Send`

---

## 4. Identity Protocol & Revenue Model

* **Authentication:** 100% reliance on the Telegram Login Widget (64-bit Telegram IDs). No passwords or emails. Supabase RLS must ensure only the two authorized Telegram IDs can successfully query a `Briefcase` token.
* **Financials:** A flat 5% platform service fee is automatically calculated and deducted upon funding confirmation.

---

## 5. End-to-End User Flow

### Phase A: Onboarding & Handshake

1. **Bot Consent Wall:** User starts the bot and must accept the ToS/T&C.
2. **Initiation:** `Right_hand` initiates by sending `/seller <id>` to the bot.
3. **Validation:** If `Left_hand` is unregistered, the system halts. If registered, `Left_hand` receives an Accept/Reject prompt.
4. **Token Generation:** Upon acceptance, the backend generates the 6-digit `Briefcase` Token and notifies both parties of the 5% fee.

### Phase B: The Web Engine Exchange

1. **Dashboard Access:** Users log into the web engine (via Telegram Widget) and search their 6-digit token.
2. **Asset Lock:** `Left_hand` securely inputs the `Access Keys`.
3. **Funding:** `Right_hand` selects Crypto (USDT/ETH) or Fiat (UPI).
4. **Verification UX:** When `Right_hand` clicks "Verify Payment", the UI displays the "Decryption Matrix" (a rapid, randomized string of alphanumeric characters replacing the Access Keys) alongside a 30-second async timer to bypass Vercel limits.

### Phase C: Release & Notification

1. **Execution:** Once funded, the 5% fee is deducted, `Access Keys` are revealed to `Right_hand`, and 95% of funds clear for `Left_hand`.
2. **Webhooks:** Supabase webhooks trigger Vercel to ping the Telegram Bot, DMing both users that the transaction is complete.

---

## 6. Execution Roadmap (Required Outputs)

The AI Architect must output a comprehensive blueprint fulfilling these agile cycles:

* **Cycle 1 (Handshake):** Telegram Bot command logic and exact conversational tree.
* **Cycle 2 (Security):** Exact Supabase PostgreSQL schema and Row-Level Security (RLS) policies mapping Telegram IDs.
* **Cycle 3 (Vault Execution):** Backend scaffolding for the 6-Digit Token generation and Asset Lock API.
* **Cycle 4 (Financials):** 5% Fee Calculation logic and Async Crypto UI State endpoints.
* **Cycle 5 (Edge Cases):** Supabase Webhook notification scaffolding.

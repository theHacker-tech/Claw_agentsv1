# 📄 MASTER REVISION: PRODUCT REQUIREMENTS DOCUMENT (PRD)
**Project:** Hybrid Telegram x Web Vault (V1)
**Status:** Approved for Implementation
### 1. Executive Summary
A decoupled, hybrid platform utilizing a Telegram bot as a frontend dashboard and notification pager, paired with an independent secure web engine for financial processing and asset storage. It provides a trustless, automated-release escrow environment for digital assets while strictly bypassing Telegram's 35% taxation, avoiding 21-day fund holds, and utilizing architectural masking to prevent automated platform bans.
### 2. Target Audience
High-trust digital asset traders engaging in high-stakes, off-market exchanges who require absolute security without prohibitive platform taxes. This is specifically tailored for users coordinating high-value transfers of:
 * **Custodial Assets:** Files, software, text keys, and data packages.
 * **Non-Custodial Assets:** Game accounts, in-game items, or characters that cannot be deposited outside their native environment.
   *(Note: It is designed specifically for scenarios where out-of-game financial escrow is strictly required to prevent scamming).*
### 3. Core Constraints & Assumptions
 * **Infrastructure:** Strict $0 monthly budget.
   * **DNS & WAF:** Cloudflare.
   * **Frontend UI:** Vercel (Hobby Tier).
   * **Backend API:** Vercel Serverless Functions.
   * **Database & Auth:** Supabase (Free Tier, PostgreSQL with strict Row-Level Security).
 * **Revenue Model:** The platform automatically deducts a flat **5% service fee** from the funded amount before payout.
 * **Identity:** 100% reliance on the Telegram Login Widget (64-bit Telegram IDs). No independent passwords or emails are managed.
 * **Lexicon Masking Rule:** While this document uses standard terminology (Buyer, Seller, Escrow) for clarity, the actual deployed bot and website will utilize a strictly masked lexicon (e.g., *Right_hand*, *Left_hand*, *The Briefcase*, *Access Keys*) to evade automated platform bans.
### 4. End-to-End User Flow (MVP)
#### Phase A: Onboarding & Initialization
 1. **Bot Welcome & Consent Wall:** A user starts the bot and reads the introductory description. When they press /start, they receive a brief welcome message containing a mandatory "Accept ToS and T&C" or "Reject" prompt. (The bot explicitly warns that they cannot proceed without accepting).
 2. **Soft Web Prompt:** Upon acceptance, community menus (Leaderboards, Trust Scores, Help) unlock. The bot suggests that new users register on the web via the Telegram Widget for full access, but this is **not forced** until a transaction is initiated.
 3. **Web Consent Wall:** When a user visits the web engine for the very first time, they must accept a separate, web-specific ToS and T&C before the dashboard unlocks.
#### Phase B: Creating the Escrow (The Handshake)
 1. **Initiation:** The Buyer initiates the process by sending /seller <id> to the bot.
 2. **Registration Validation:**
   * **Unregistered Seller:** If the target Seller has not accepted the bot's ToS, the system halts. The Buyer receives a message: *"The other party has not registered with the bot yet. Please contact them directly to proceed further."*
   * **Registered Seller:** The Seller receives an actionable prompt: *"User @username wants to create a deal with you. [Accept] / [Reject]"*
 3. **Rejection Path:** If the Seller clicks Reject, they must select a reason from a predefined list (a "Back" button is included to prevent accidental rejections). The Buyer is notified of the rejection and the specific reason.
 4. **Acceptance & Fee Acknowledgment:** If accepted, both users are explicitly notified about the **5% platform service fee** that will be deducted from the final payout.
 5. **Token Generation:** The backend generates a secure **6-digit alphanumeric Escrow Token** (e.g., XF79R2). To prevent Telegram link-sharing bans, the bot sends this token *instead* of a URL.
 6. **Dashboard Access:** Users log into the web engine and search for this exact token. (Database constraint: The search will strictly return "No escrow found" if queried by anyone other than the two authorized Telegram IDs).
#### Phase C: The Web Engine Exchange
 1. **Asset Lock:** The Seller securely inputs the custodial or non-custodial asset details into the web engine.
 2. **Funding:** The Buyer is prompted to pay the agreed amount. They select a payment method:
   * **Crypto (USDT):** Low-fee/gas networks (e.g., Polygon, TRC-20).
   * **Fiat (UPI/Non-Reversible):** Options that cannot reverse funds.
 3. **Verification UX:**
   * The Buyer clicks "Verify Payment".
   * The button immediately grays out, becomes unclickable, and the text updates to: *"Please wait for server checks..."*
   * A 30-second visual timer begins running underneath the button to account for external network confirmations without locking the Vercel backend.
   * *For UPI:* The Buyer uploads a screenshot of the transaction receipt (UTR) for asynchronous verification.
 4. **Release:** Once funding is verified, the state shifts to 'Funded'. The platform deducts the 5% fee, the assets become visible to the Buyer, and the remaining 95% of funds are cleared for the Seller.
#### Phase D: Notification
 1. Supabase webhooks trigger the Vercel backend to ping the Telegram Bot. The bot direct-messages both users acknowledging the completed transaction.
### 5. Feature Classification
**Must-Have (V1 MVP)**
 * Strict Consent Walls (Separate Bot and Web ToS/T&C).
 * Registration checks and the Accept/Reject/Reason handshake flow.
 * 6-digit alphanumeric Escrow Token generation and RLS search mapping.
 * 5% automated fee calculation and user acknowledgment prompt.
 * Asynchronous payment verification (Crypto 30-second UI loop & UPI receipt upload).
 * Telegram Widget Auth & Webhook push notifications.
**Nice-to-Have (Post-V1)**
 * Automated UPI merchant integration (if aggregator fees fall below 0.01%).
 * Admin dashboard for manual dispute resolution.
 * Public-facing reputation leaderboards.
### 6. Critical Architecture & Decision Log
 * **Serverless Migration:** Shifted from Render to Vercel Serverless to prevent 15-minute sleep states, eliminate cold-starts, and comply with free-tier ToS.
 * **Timeout Prevention:** Vercel has a hard 10-second execution limit on the Hobby tier. Replaced synchronous blockchain checks with an asynchronous UI timer, and replaced automated fiat gateways with a manual UPI receipt upload flow to entirely bypass Vercel timeout crashes.
 * **Anti-Ban Data Passing:** Escrow IDs are delivered as 6-digit tokens rather than direct links to avoid Telegram's automated link-sharing bans.
 * **Database Performance:** Escrow identifiers were changed from a lengthy timestamp format to a short alphanumeric token to improve Supabase PostgreSQL indexing and reduce user input friction.
 * 

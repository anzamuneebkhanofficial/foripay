# ⚡ PayLock (ForiPay) — Real-Time Non-Custodial Crypto Payment Gateway

PayLock is an open-source, production-grade cryptocurrency payment gateway and merchant settlement platform. Built with **Next.js 16 (App Router & Turbopack)**, **MongoDB**, and **NOWPayments REST API v1**, it eliminates customer anxiety during checkout through sub-3-second mempool detection, real-time Server-Sent Events (SSE) block finality tracking, and automated non-custodial payouts.

---

## 💡 The Core Problem Solved

Standard cryptocurrency payments (Bitcoin, Ethereum, Tron USDT) require on-chain miner confirmations that typically take anywhere from 10 minutes to over an hour:
- **Buyer Anxiety:** Customers wonder: *"Did my payment fail? Did I send to the wrong address? Why does the screen still show Unpaid?"*
- **Merchant Confusion:** Merchants struggle to match incoming transaction hashes with customer order IDs and must manually verify whether 1, 2, or 3 blocks have finalized before fulfilling orders.

### The PayLock Solution:
1. **Sub-3s Mempool Detection:** The moment the customer broadcasts a payment from their crypto wallet, PayLock identifies the raw transaction in the mempool before block mining, instantly acknowledging receipt.
2. **Live Block Consensus Tracker (1/3 → 2/3 → 3/3):** Real-time SSE telemetry updates both merchant and customer screens synchronously through every confirmation stage.
3. **Automated Non-Custodial Settlement:** Zero funds are held by PayLock. Once 3/3 blocks finalize, an automated PDF-ready cryptographic receipt is dispatched via Nodemailer, funds route directly to the merchant's cold vault, and signed HMAC-SHA512 webhooks notify the merchant's store backend.

---

## 🛠️ Tech Stack & Key Features

- **Frontend & Server:** Next.js 16.3.8 (React 19, Turbopack, App Router)
- **Database:** MongoDB Atlas / Local MongoDB via Mongoose
- **Crypto Gateway:** Dual-engine NOWPayments API (Direct Deposit & Hosted Invoice Fallback)
- **Real-Time Pipeline:** Server-Sent Events (SSE) `/api/stream` with mempool telemetry
- **Email Dispatcher:** Nodemailer with automated HTML receipt templates
- **Security:** Argon2id password hashing, HTTP-only JWT sessions, HMAC-SHA512 IPN webhook signing
- **QR Code Engine:** Pure ISO/IEC 18004 scannable vector QR generator with Mobile Scanner & Crypto Wallet address modes

---

## 🚀 Quick Start & Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/paylock.git
cd paylock

# 2. Install dependencies
pnpm install

# 3. Create your environment file from template
cp .env.example .env.local

# 4. Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔄 Dual-Mode Configuration: Sandbox vs. Live Production

PayLock includes a seamless **Dual-Mode Environment Toggle**. You never need to touch or modify application code to switch between free local testing and live mainnet blockchain payments.

### 🧪 Mode 1: Local Sandbox Testing ($0 Free Testing)

Use this mode during local development, demo presentations, or automated QA without needing real cryptocurrency.

#### 1. Set `.env.local` Variables:
```env
NODE_ENV=development
SandBox_FakeTest_Simulation=on
NEXT_PUBLIC_SANDBOX_SIMULATION=on
NOWPAYMENTS_ENV=sandbox
NOWPAYMENTS_API_KEY=YOUR_SANDBOX_API_KEY
NOWPAYMENTS_IPN_SECRET=YOUR_SANDBOX_IPN_SECRET
```

#### 2. How to Test Locally:
1. **Login as Merchant:** Navigate to [http://localhost:3000/login](http://localhost:3000/login) (or register a new merchant account).
2. **Create an Invoice:** Go to **Dashboard ➔ + Create Invoice** (`/dashboard/create-invoice`). Enter an amount (e.g. `$50 USD`) and choose crypto (e.g. `BTC` or `TRX`). Click **Generate Live Invoice**.
3. **Open Customer Tracker:** Click **"Share Payment Link"** or navigate to `/tracker/[id]`.
4. **Advance Blockchain Block:** On the customer tracker page, you will see the **🧪 Sandbox Payment Simulator ($0 Free)** card. Click **⚡ Send Test Payment**.
   - **Click 1:** Advances block state to `Confirming (1/3)`.
   - **Click 2:** Advances block state to `Confirming (2/3)`.
   - **Click 3:** Finalizes consensus at `Confirmed (3/3 Finalized)`.
5. **Verify Outcomes:**
   - Status badge turns emerald green.
   - Confirmation receipt email is dispatched to the customer's email.
   - Merchant receives an instant signed IPN Webhook callback.

---

### 🌐 Mode 2: Real-World Live Production (Asal Blockchain Payments)

Use this mode when accepting real cryptocurrency from authentic buyers across the globe.

#### 1. Prerequisites (What You Need for Production):
1. **Real Crypto Payout Wallet:** A personal or business address (Binance, Bybit, Trust Wallet, MetaMask, Ledger) to receive your funds (e.g. `USDT TRC20`, `BTC Native SegWit`).
2. **NOWPayments Production Account:** Sign up at [https://account.nowpayments.io](https://account.nowpayments.io).
   - In **Store Settings**, paste your payout wallet address.
   - In **Payment Settings**, generate your live **API Key**.
   - In **Instant Payment Notifications (IPN)**, copy your **IPN Secret** and set callback URL to `https://yourdomain.com/api/webhooks/nowpayments`.
3. **MongoDB Atlas Cluster:** A cloud database connection string from [https://cloud.mongodb.com](https://cloud.mongodb.com).
4. **SMTP Service:** Google App Password (16-character) or Resend API key for real receipt delivery.

#### 2. Set `.env.local` (or Production Environment Dashboard):
```env
NODE_ENV=production
SandBox_FakeTest_Simulation=off
NEXT_PUBLIC_SANDBOX_SIMULATION=off
NOWPAYMENTS_ENV=production
NOWPAYMENTS_API_KEY=YOUR_LIVE_PRODUCTION_KEY
NOWPAYMENTS_IPN_SECRET=YOUR_LIVE_IPN_SECRET
NEXT_PUBLIC_APP_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://admin:YourPassword@cluster0.abcde.mongodb.net/paylock?retryWrites=true&w=majority
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=billing@yourcompany.com
SMTP_PASS="xxxx xxxx xxxx xxxx"
SMTP_FROM="PayLock Billing <billing@yourcompany.com>"
ADMIN_EMAIL=owner@yourdomain.com
ADMIN_PASSWORD=YourStrongMasterPassword2026!
```

#### 3. What Happens in Production:
- **Customer Tracker (`/tracker/[id]`):** The **"🧪 Sandbox Payment Simulator"** and all test buttons are **100% hidden**. Customers only see their scannable QR Code, deposit address, exact amount, and real-time blockchain sync indicator.
- **Merchant Dashboard Tracker:** The **"⚡ Simulate Next Block"** button is replaced with a live **`📡 Live Network Sync`** badge.
- **Backend Security Shield:** The `/api/payments/[id]/advance` endpoint responds with **403 Forbidden**, ensuring nobody can fake payments via API calls.
- **Actual Payment Verification:** Transactions are confirmed strictly when real miners broadcast blocks on the decentralized blockchain. Automated background polling queries NOWPayments every 8 seconds, and IPN webhooks update order finality hands-free.

---

## ⚙️ Environment Variables Reference Table

| Variable | Required? | Demo / Default Value | Purpose |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | `development` / `production` | Application runtime environment. |
| `SandBox_FakeTest_Simulation` | Yes | `on` / `off` | Toggles sandbox simulator UI and test buttons. |
| `NEXT_PUBLIC_SANDBOX_SIMULATION` | Yes | `on` / `off` | Exposes simulation mode state to client components. |
| `NOWPAYMENTS_API_KEY` | Yes | `RS18Y4R-S50MBZ1-HMP18YT-P8MMW80` | Gateway authentication token for payment generation. |
| `NOWPAYMENTS_IPN_SECRET` | Yes | `xjCBGfe6UxqIFZRBzCt1Cs8xo0KKA2LF` | Secret key used to verify incoming webhook signatures. |
| `NOWPAYMENTS_ENV` | Yes | `sandbox` / `production` | Gateway API endpoint selector (`api-sandbox` vs `api`). |
| `MONGODB_URI` | Yes | `mongodb://localhost:27017/paylock` | MongoDB persistence connection URI. |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` | Canonical origin URL for invoice links and callbacks. |
| `SMTP_USER` | Yes | `billing@yourstore.com` | Email address used to dispatch customer invoices & receipts. |
| `SMTP_PASS` | Yes | `your-16-char-app-password` | Gmail App Password or SMTP provider credential. |
| `ADMIN_EMAIL` | Yes | `admin@paylock.io` | Master credentials for global `/admin` observatory. |
| `ADMIN_PASSWORD` | Yes | `AdminPayLock2026!` | Master administrative password. |

---

## 📂 Project Architecture

```
├── app/
│   ├── (auth)/             # Login, Register, Forgot Password, Reset Password
│   ├── admin/              # Global cross-merchant management observatory
│   ├── api/
│   │   ├── payments/       # Payment creation, sync, and simulation advance
│   │   ├── stream/         # Server-Sent Events (SSE) live mempool ticker
│   │   └── webhooks/       # NOWPayments IPN callback & store dispatcher
│   ├── dashboard/          # Merchant workspace (Invoices, Tracker, Settings)
│   ├── tracker/[id]/       # Customer-facing live payment tracker
│   └── receipt/            # Printable proof-of-payment receipt
├── components/
│   ├── AdminConsoleView.jsx # Dynamic merchant & admin invoice manager
│   ├── DashboardTrackerView.jsx # Dual-mode merchant tracker
│   ├── TrackerView.jsx     # Customer payment tracker (Dual-mode)
│   └── QRCodeVisualizer.jsx # Pure vector ISO/IEC 18004 QR generator
├── lib/
│   ├── env.js              # Centralized environment & simulation helper
│   ├── nowpayments.js      # Official NOWPayments v1 gateway driver
│   ├── store.js            # MongoDB transactional state engine
│   └── crypto-utils.js     # Currency tickers, rate calculations, HMAC signers
└── models/                 # Mongoose schemas (Order, User, WebhookLog)
```

---

## 🔒 Security Best Practices

1. **Non-Custodial Design:** PayLock does not store private keys. Customer funds route directly to merchant payout wallets.
2. **Signed Webhooks:** Every store callback includes an `X-ForiPay-Signature` header computed via HMAC-SHA512.
3. **Session Hardening:** All auth sessions utilize HTTP-only, SameSite=Lax JWT tokens with cryptographic signature validation.
4. **Zero Environment Leakage:** Sensitive credentials are restricted to server-side executions; only variables explicitly prefixed with `NEXT_PUBLIC_` are bundled into browser runtimes.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Contributions, issues, and feature requests are welcome!

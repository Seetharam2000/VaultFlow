# VaultFlow

VaultFlow is an intelligent personal finance workspace for understanding idle cash, planning liquidity, and comparing deposit opportunities. It helps users make informed decisions while keeping every transfer and investment action under their control.

## Product Flow

1. Sign in or create an account with email/password or Google.
2. Review the VaultFlow welcome splash screen.
3. Select a bank and add the account number and IFSC code.
4. Open the dashboard to view the account-linked money picture.
5. Analyze liquidity, review emergency-buffer coverage, and explore deposit options.

Protected finance pages redirect to account setup until an account has been linked.

## Features

- Firebase email/password and Google authentication
- Bank selector with public, private, small-finance, payments, and foreign banks
- Account-linked onboarding flow
- Liquidity analysis and operating-baseline planning
- Deposit agent with projected interest and maturity calculations
- Emergency buffer protection workflow
- Portfolio and deposit tracking
- Payments workspace for common financial actions
- AI assistant powered by a server-side Groq API route
- Razorpay order creation and payment verification routes
- Light and dark theme support
- Local account and deposit persistence for the prototype
- Account details PDF export

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Firebase Authentication and Analytics
- Framer Motion
- Lucide React
- Razorpay APIs
- Groq API

## Getting Started

### Requirements

- Node.js 20 or newer
- npm
- Firebase project credentials for authentication

### Install

```bash
npm install
```

### Configure environment variables

Copy the example file to `.env.local` and replace the placeholders with your local values:

```powershell
Copy-Item .env.local.example .env.local
```

The environment file supports:

- `GROQ_API_KEY` and `GROQ_MODEL` for the AI assistant
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` for browser checkout
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` for server-side payment operations
- `NEXT_PUBLIC_FIREBASE_*` values for Firebase web authentication and analytics

Never commit `.env.local` or server-side secrets. The repository ignores `.env*` files. Use `.env.local.example` as the safe configuration reference.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server with Turbopack |
| `npm run build` | Create a production build |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |

## Main Routes

| Route | Purpose |
| --- | --- |
| `/login` | Sign in or create an account |
| `/account-setup` | Link a bank account to the user profile |
| `/dashboard` | View the account overview and current money picture |
| `/liquidity` | Analyze operating cash and surplus liquidity |
| `/deposit-workflow` | Review and create a term-deposit strategy |
| `/emergency-buffer` | Protect the configured emergency cash buffer |
| `/portfolio` | Review active and historical deposits |
| `/payments/[action]` | Explore payment and financial actions |
| `/settings` | Update profile and workspace preferences |

## API Routes

- `POST /api/ai/chat` sends prompts to the configured Groq model.
- `POST /api/razorpay/order` creates a Razorpay order using server-side credentials.
- `POST /api/razorpay/verify` verifies a completed Razorpay payment signature.

## Data and Security Notes

This is a prototype. Account profile and deposit state are currently persisted in browser `localStorage`; no live bank account aggregation is performed. The bank form demonstrates the onboarding experience and should be replaced with a regulated account-linking provider before production use.

Keep all server credentials in environment variables. Only variables prefixed with `NEXT_PUBLIC_` should be exposed to browser code. Do not store real banking credentials or payment secrets in the repository or browser storage.

## Validation

Run both checks before opening a pull request:

```bash
npm run lint
npm run build
```

## Repository

GitHub: [Seetharam2000/YieldPulse](https://github.com/Seetharam2000/YieldPulse)

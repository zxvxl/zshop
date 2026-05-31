# ZShop - USDT Digital Goods Store

A lightweight, self-hosted digital goods auto-delivery store with USDT (BSC) payment.

## Features

- **USDT Payment** - BSC chain, no wallet private key needed
- **Auto Delivery** - Cards delivered instantly after payment confirmed
- **Multi-language** - Chinese / English
- **Modern UI** - Clean, minimal design inspired by modern e-commerce
- **Admin Panel** - Product management, card import, order tracking
- **SQLite** - Zero-config database, single file
- **Docker** - One command deployment

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS + shadcn/ui components
- Prisma + SQLite
- next-intl (i18n)
- BSCScan API (payment verification)

## Quick Start

```bash
# 1. Clone
git clone https://github.com/zxvxl/zshop.git
cd zshop

# 2. Install
npm install

# 3. Configure
cp .env.example .env
# Edit .env with your BSC wallet address and BSCScan API key

# 4. Setup database
npx prisma db push

# 5. Run
npm run dev

# 6. Start payment checker (separate terminal)
node cron.js
```

Visit:
- Shop: http://localhost:3000
- Admin: http://localhost:3000/admin (default: admin / 123456)

## Docker Deployment

```bash
cp .env.example .env
# Edit .env

docker compose up -d
```

## Payment Flow

1. User selects product and submits order
2. System generates a unique USDT amount (e.g., `12.001`)
3. User transfers exact amount to the displayed BSC address
4. Cron job checks BSCScan every 5 seconds for matching transaction
5. On match: order marked as paid, cards auto-delivered
6. User sees card keys on the payment page

## Admin

Protected by HTTP Basic Auth. Default credentials: `admin:123456`

- `/admin` - Dashboard (revenue, order count)
- `/admin/products` - Product CRUD + show/hide
- `/admin/cards` - Import card keys (one per line)
- `/admin/orders` - Order history
- `/admin/categories` - Category management

## License

MIT

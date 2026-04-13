<div align="center">

<!-- Header Banner -->
<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=D97757&height=200&section=header&text=🍽️%20FOODIE%20Server&fontSize=52&fontColor=FAF9F7&fontAlignY=38&desc=Multi-Vendor%20Food%20Delivery%20Backend%20API&descAlignY=58&descSize=18&descColor=FAF9F7" />

<br />

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-DB-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-D97757?style=for-the-badge)](LICENSE)

<br />

> **FOODIE** is a production-ready, multi-vendor food delivery backend — built with Express, Prisma, and PostgreSQL. Secure, scalable, and structured for real-world use.

<br />

[![Live API](https://img.shields.io/badge/🚀%20Live%20API-foodie--server--seven.vercel.app-D97757?style=flat-square)](https://foodie-server-seven.vercel.app)
[![Frontend](https://img.shields.io/badge/🌐%20Frontend-food--hub--client.vercel.app-6B8E7D?style=flat-square)](https://food-hub-client-eta.vercel.app)
[![Repo](https://img.shields.io/badge/GitHub-foodie--server-1F2933?style=flat-square&logo=github)](https://github.com/Md-Sufian-Jidan/foodie-server)

</div>

---

## 🎬 Demo Video

> See the FOODIE platform in action — from the API powering real-time orders to the full delivery lifecycle.

<!-- Replace YOUR_VIDEO_ID with your actual YouTube video ID after uploading -->
[![FOODIE Server Demo](https://drive.google.com/drive/folders/1BFsTe_Faip6CwDFOBLNyxfHM_T7Fbntd?usp=sharing)](https://drive.google.com/drive/folders/1BFsTe_Faip6CwDFOBLNyxfHM_T7Fbntd?usp=sharing)

<!-- > 📌 *Once your video is uploaded, embed a clickable thumbnail like this:*
> ```md
> [![Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)
> ``` -->

---

## 🔐 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | `adminfoodie@gmail.com` | `Admin@1234` |
| 🏪 Provider | `superprovider@gmail.com` | `Superprovider@com` |
| 👤 Customer | `supercustomer@gmail.com` | `Supercustomer@com` |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| ⚡ Runtime | Node.js 18+ | Server environment |
| 🌐 Framework | Express.js | HTTP routing & middleware |
| 📘 Language | TypeScript | Type safety |
| 🗄️ Database | PostgreSQL | Relational data store |
| 🔷 ORM | Prisma | Type-safe DB access |
| 🔐 Auth | Better Auth (JWT) | Authentication & sessions |
| ✅ Validation | Zod | Schema & request validation |
| 📦 Build | tsup | Fast TypeScript bundler |

---

## 📁 Project Structure

```
foodie-server/
│
├── 📦 src/
│   ├── app/
│   │   ├── modules/
│   │   │   ├── 👑 admin/
│   │   │   ├── 🏷️  category/
│   │   │   ├── 🍽️  meal/
│   │   │   ├── 🧾  order/
│   │   │   ├── 🏪  provider/
│   │   │   ├── ⭐  review/
│   │   │   └── 👤  user/
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.ts                # JWT authentication guard
│   │   │   ├── GlobalErrorHandler.ts  # Centralized error handling
│   │   │   ├── NotFound.ts            # 404 route handler
│   │   │   └── validateRequest.ts     # Zod request validation
│   │   │
│   │   ├── routes/                    # Route aggregation layer
│   │   ├── errorHelpers/              # Error formatting utilities
│   │   ├── helper/                    # Business logic helpers
│   │   ├── shared/                    # Shared utilities & constants
│   │   └── types/                     # App-level TypeScript types
│   │
│   ├── types/                         # Global type declarations
│   ├── app.ts                         # Express app configuration
│   ├── index.ts                       # Entry point export
│   └── server.ts                      # Server bootstrap
│
└── 🗄️ prisma/
    ├── schema/
    │   ├── schema.prisma              # Main Prisma config & datasource
    │   ├── user.prisma                # User model
    │   ├── provider.prisma            # Provider model
    │   ├── meal.prisma                # Meal model
    │   ├── category.prisma            # Category model
    │   ├── order.prisma               # Order model
    │   ├── orderItems.prisma          # Order line items
    │   ├── review.prisma              # Review model
    │   └── enums.prisma               # Shared enums
    └── migrations/                    # Migration history
```

---

## 🚀 Getting Started

### ✅ Prerequisites

- Node.js `18+`
- PostgreSQL (local or cloud — Neon / Supabase)
- npm / yarn / pnpm

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Md-Sufian-Jidan/foodie-server.git
cd foodie-server
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
NODE_ENV=development

FRONTEND_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:5000
BETTER_AUTH_SECRET=your_secret_key_here

DATABASE_URL=postgresql://user:password@localhost:5432/foodie

# Email Configuration (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com     # process.env.APP_USER
EMAIL_PASS=your_app_password        # process.env.APP_PASS
```

### 4️⃣ Run Database Migrations

```bash
npx prisma migrate dev
```

### 5️⃣ Seed Admin User *(optional)*

```bash
npm run seed:admin
```

### 6️⃣ Start Development Server

```bash
npm run dev
# Server runs at http://localhost:5000
```

---

## 📝 Scripts Reference

### Add to `package.json`

```json
"scripts": {
  "start":      "node dist/server.js",
  "dev":        "tsx watch src/server.ts",
  "build":      "prisma generate && tsup src/index.ts --format esm --platform node --target node20 --outDir api --external pg-native",
  "seed:admin": "tsx src/app/script/seedAdmin.ts",
  "migrate":    "prisma migrate dev",
  "generate":   "prisma generate",
  "studio":     "prisma studio",
  "push":       "prisma db push",
  "pull":       "prisma db pull",
  "lint":       "npx eslint /src/**/*"
}
```

### Quick Command Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot-reload |
| `npm run build` | Bundle for production via tsup |
| `npm run start` | Run compiled production build |
| `npm run seed:admin` | Create default admin account |
| `npm run migrate` | Create & apply DB migration |
| `npm run generate` | Regenerate Prisma Client |
| `npm run studio` | Open Prisma Studio GUI |
| `npm run push` | Push schema without migration file |
| `npm run pull` | Introspect DB → update schema |
| `npm run lint` | Run ESLint across project |

> 💡 Always run `npm run generate` after modifying your Prisma schema.

---

## 🗄️ Database Schema

The FOODIE database uses a normalized relational design with PostgreSQL, managed via Prisma ORM.

---

### Entity Relationships

```
┌──────────┐  1:1   ┌──────────────┐  1:N   ┌──────────┐  N:1  ┌──────────────┐
│   User   │───────▶│   Provider   │───────▶│   Meal   │──────▶│   Category   │
└──────────┘        └──────────────┘        └──────────┘       └──────────────┘
     │                                           │
     │ 1:N                                       │ 1:N
     ▼                                           ▼
┌──────────┐  1:N   ┌──────────────┐       ┌──────────┐
│  Order   │───────▶│  OrderItem   │       │  Review  │
└──────────┘        └──────────────┘       └──────────┘
```

---

### Model Descriptions

**👤 User** — Central auth entity with roles: `CUSTOMER`, `PROVIDER`, `ADMIN`. Stores name, email, phone, and status. Linked to orders, reviews, and optionally a provider profile.

**🏪 Provider Profile** — Extends User for multi-vendor support. Holds shop name, address, contact info, description, and open/closed status. One-to-many with Meals and Orders.

**🍽️ Meal** — Food items listed by providers. Includes price, image, availability, calories, ingredients, dietary tags, cuisine type, spice level, and meal type (Breakfast / Lunch / Dinner / Snack). Belongs to one Category.

**🏷️ Category** — Organizes meals for filtering and browsing with a unique name and slug. One-to-many with Meals.

**🧾 Order** — Customer purchases linked to a provider. Stores order number, total, delivery address, payment type (COD), and timestamps.

```
PENDING  →  ACCEPTED  →  COOKING  →  ON_THE_WAY  →  DELIVERED
                  ↘
               CANCELLED   (only before acceptance)
```

**📦 OrderItem** — Bridge between Orders and Meals. Stores meal reference, quantity, and price at time of purchase for historical accuracy.

**⭐ Review** — Customer reviews on meals. Supports 1–5 star ratings and optional comments. Enforces one review per user per meal via unique constraint.

---

## 🗃️ Database Management

### Recommended Workflow

```bash
# 1. Modify schema.prisma
# 2. Apply the migration
npm run migrate

# 3. Regenerate Prisma Client
npm run generate

# 4. Inspect changes visually
npm run studio
```

### 🔄 Reset Database *(destructive!)*

```bash
npx prisma migrate reset
```

> ⚠️ **Warning:** Drops, recreates, and reseeds the entire database. All data will be lost.

---

## 🌐 Deployment

```bash
vercel --prod
```

### Production Environment Checklist

| Variable | Requirement |
|----------|-------------|
| `DATABASE_URL` | ✅ Production PostgreSQL URL |
| `BETTER_AUTH_SECRET` | ✅ Strong, unique secret key |
| `NODE_ENV` | ✅ Set to `production` |
| `FRONTEND_URL` | ✅ Your deployed frontend origin (for CORS) |
| `BETTER_AUTH_URL` | ✅ Your deployed API URL |

---

## 📈 Performance Highlights

- **Indexed queries** — frequently queried fields are indexed in Prisma schema
- **Selective fetching** — `select` / `include` prevents over-fetching
- **Pagination** — all list endpoints paginate to prevent heavy payloads
- **Reduced N+1** — queries are batched and optimized via Prisma relations
- **Caching-ready** — architecture supports a Redis layer for high-traffic endpoints

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `P1001: Can't reach database` | Check `DATABASE_URL`, ensure PostgreSQL is running, verify credentials |
| `P3006 / Migration failed` | Run `npx prisma migrate reset` *(data loss!)* |
| `PrismaClient` type errors | Run `npm run generate` |
| `EADDRINUSE: port in use` | Change `PORT` in `.env` or kill the running process |
| `.env` values not loading | Ensure file is in root dir, restart server, check exact variable names |

> 🚀 **Pro tip:** After any schema or environment change, run `npm run generate` and restart the dev server.

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit your changes** using conventional commits
   ```bash
   git commit -m "feat: add your feature description"
   ```
4. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request**

Please ensure ESLint passes before submitting.

---

## 📄 License

This project is licensed under the **MIT License** — free to use, modify, and distribute.

---

<div align="center">

Made with ❤️ by **[Md Abu Sufian](https://github.com/Md-Sufian-Jidan)**

[![GitHub](https://img.shields.io/badge/GitHub-Md--Sufian--Jidan-1F2933?style=flat-square&logo=github)](https://github.com/Md-Sufian-Jidan)

<br />

🔗 **Frontend Repository:** [Jj-FoodHub-Client](https://github.com/Md-Sufian-Jidan/Jj-FoodHub-Client)

<br />

> ⚠️ *This repository contains only the backend API. Clone and set up the [frontend repo](https://github.com/Md-Sufian-Jidan/Jj-FoodHub-Client) to run the complete FOODIE platform.*

<br />

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=D97757&height=100&section=footer" />

</div>
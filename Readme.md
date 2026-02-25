# 🚀 FOODIE Backend Server

**FOODIE** — A multi-vendor food delivery platform built with **Node.js, Express, Prisma, and PostgreSQL**.

---

## 🔐 Credentials for Testing

### 👑 Admin
- **Email:** admin@foodie.com
- **Password:** Admin@1234

### 🏪 Provider
- **Email:** provider@gmail.com  
- **Password:** provider123  

### 👤 Customer
- **Email:** customer@gmail.com  
- **Password:** customer123  

---

## 🌐 Live Demo

- **Frontend:** https://food-hub-client-eta.vercel.app  
- **Backend API:** https://foodie-server-seven.vercel.app

---

## 🛠️ Tech Stack

- **Runtime:** Node.js  
- **Framework:** Express.js  
- **Language:** TypeScript  
- **Database:** PostgreSQL  
- **ORM:** Prisma  
- **Authentication:** Better Auth with JWT  
- **Validation:** Zod  
- **Build Tool:** tsup  

---

## 📁 Project Structure

```
src/
├── app/
│   ├── modules/
│   │   ├── admin/
│   │   ├── category/
│   │   ├── meal/
│   │   ├── order/
│   │   ├── provider/
│   │   ├── review/
│   │   └── user/
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── GlobalErrorHandler.ts   
│   │   ├── NotFound.ts
│   │   └── validateRequest.ts
│   ├── routes/
│   └── errorHelpers/
│   └── helper/
│   └── shared/
│   └── types/
├── types/
├── app.ts
├── index.ts
└── server.ts

prisma/
├── schema/
│   ├── schema.prisma
│   ├── category.prisma
│   ├── enums.prisma
│   ├── meal.prisma
│   ├── order.prisma
│   ├── orderItems.prisma
│   ├── provider.prisma
│   ├── review.prisma
│   └── user.prisma
└── migrations/
```

---

## 🚀 Let's Get Started

### 📌 Prerequisites

- Node.js 18+
- Express
- PostgreSQL
- Prisma
- Better Auth (Basic)
- npm / yarn / pnpm

---

### 🔧 Installation

#### 1️⃣ Clone and navigate to server directory

```bash
cd foodie-server
```

#### 2️⃣ Install dependencies

```bash
npm install
```

#### 3️⃣ Setup environment variables

Create `.env` file and configure:

```env
PORT=5000
NODE_ENV=development

FRONTEND_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:5000
BETTER_AUTH_SECRET=your_secret_key

DATABASE_URL=postgresql://user:password@localhost:5432/foodie

# Email Config
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email  //  process.env.APP_USER
EMAIL_PASS=your_password  //  process.env.APP_PASS
```

---

#### 4️⃣ Run Prisma migrations

```bash
npx prisma migrate dev
```

#### 5️⃣ Seed the database (optional)

```bash
npm run seed:admin
```

#### 6️⃣ Start development server

```bash
npm run dev
```

Server runs on:

```
http://localhost:5000
```

---

## 📝 Available Scripts

### Add this scripts to your package.json file

```bash
"start": "node dist/server.js",
"dev": "tsx watch src/server.ts",
"seed:admin": "tsx src/app/script/seedAdmin.ts",
"migrate": "prisma migrate dev",
"generate": "prisma generate",
"studio": "prisma studio",
"push": "prisma db push",
"pull": "prisma db pull",
"lint": "npx eslint /src/**/*",
"build": "prisma generate && tsup src/index.ts --format esm --platform node --target node20 --outDir api --external pg-native",
```
### Then you can give this commands to the terminal
```bash

npm run dev            # Start development server
npm run build          # Generate the file and make a mjs file
npm run start          # Start production server
npm run seed:admin     # Seed database
npm run studio         # Open Prisma Studio
npm run migrate        # Create & apply migrations
npm run generate       # Generate Prisma Client
```

## 📝 Available Scripts

Below are the scripts configured in `package.json` to manage development, database operations, and production builds.

---

### 📦 Add These Scripts to Your `package.json`

```json
"scripts": {
  "start": "node dist/server.js",
  "dev": "tsx watch src/server.ts",
  "seed:admin": "tsx src/app/script/seedAdmin.ts",
  "migrate": "prisma migrate dev",
  "generate": "prisma generate",
  "studio": "prisma studio",
  "push": "prisma db push",
  "pull": "prisma db pull",
  "lint": "npx eslint /src/**/*",
  "build": "prisma generate && tsup src/index.ts --format esm --platform node --target node20 --outDir api --external pg-native"
}
```

---

## 🚀 Script Usage Guide

### 🔧 Development

```bash
npm run dev
```
Start the development server with hot-reload using `tsx`.

---

### 🏗 Build for Production

```bash
npm run build
```
- Generates Prisma Client  
- Bundles the application using `tsup`  
- Outputs optimized `.mjs` build files inside the `api` folder  

---

### ▶️ Start Production Server

```bash
npm run start
```
Runs the compiled production build from the `dist` folder.

---

### 👑 Seed Admin User

```bash
npm run seed:admin
```
Creates a default admin account for testing and management.

---

### 🗄 Database Commands

#### Create & Apply Migration
```bash
npm run migrate
```

#### Generate Prisma Client
```bash
npm run generate
```

#### Push Schema (Without Migration)
```bash
npm run push
```

#### Pull Database Schema
```bash
npm run pull
```

#### Open Prisma Studio
```bash
npm run studio
```

---

### 🧹 Lint Code

```bash
npm run lint
```
Runs ESLint across the project to maintain code quality.

---

## 📌 Quick Command Reference

| Command | Description |
|----------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build production files |
| `npm run start` | Start production server |
| `npm run seed:admin` | Seed admin user |
| `npm run migrate` | Create & apply migration |
| `npm run generate` | Generate Prisma Client |
| `npm run studio` | Open Prisma Studio |

---

💡 Tip: Always run `npm run generate` after modifying Prisma schema.

---

## 🗄️ Database Schema Overview

The FoodHub database is designed using a relational structure with PostgreSQL and managed through Prisma ORM. Below is a clear overview of the core entities and their responsibilities.

---

### 👤 User

The central entity of the system responsible for authentication and role-based access.

**Key Features:**
- Supports multiple roles:
  - `CUSTOMER`
  - `PROVIDER`
  - `ADMIN`
- Managed authentication using Better Auth (JWT-based)
- Stores profile information:
  - Name
  - Email (unique)
  - Phone
  - Status (ACTIVE, BLOCKED, etc.)
- Linked with:
  - Orders
  - Reviews
  - Provider Profile (if role is PROVIDER)

---

### 🏪 Provider Profile

Extends the User model for providers (multi-vendor support).

**Contains:**
- Shop name
- Address
- Contact phone
- Shop description
- Open/Closed status

**Relationships:**
- One-to-One with User
- One-to-Many with Meals
- One-to-Many with Orders

---

### 🍽️ Meal

Represents food items listed by providers.

**Includes:**
- Name & description
- Price
- Image
- Availability status
- Calories
- Ingredients (array)
- Dietary information (array)
- Cuisine type
- Spice level
- Meal type (Breakfast/Lunch/Dinner/Snack)

**Relationships:**
- Belongs to a Category
- Belongs to a Provider
- Has many Reviews
- Connected to Orders through OrderItems

---

### 🏷️ Category

Used to organize meals for filtering and browsing.

**Fields:**
- Unique name
- Unique slug

**Relationship:**
- One-to-Many with Meals

---

### 🧾 Order

Represents a customer purchase from a provider.

**Core Features:**
- Unique order number
- Linked to:
  - Customer (User)
  - Provider
- Total amount calculation
- Delivery address
- Payment type (`COD`)
- Automatic timestamps

**Order Status Flow:**
```
PENDING → ACCEPTED → COOKING → ON_THE_WAY → DELIVERED
                         ↘ CANCELLED
```

**Relationships:**
- One-to-Many with OrderItems

---

### 📦 OrderItem

Acts as a bridge between Orders and Meals.

**Stores:**
- Meal reference
- Quantity
- Price at time of purchase

This allows:
- Multiple meals in one order
- Historical price tracking

---

### ⭐ Review

Allows customers to review meals.

**Features:**
- Rating (1–5 stars)
- Optional comment
- Linked to User & Meal
- Unique constraint:
  - One review per user per meal

---

## 🔗 Relationship Summary

- A **User** can place multiple Orders.
- A **Provider** can create multiple Meals.
- A **Meal** belongs to one Category.
- An **Order** contains multiple OrderItems.
- A **Review** connects a User and a Meal.

---

## 📌 Database Design Highlights

- Proper indexing on frequently queried fields
- Normalized relational design
- Cascade deletion for data integrity
- Unique constraints to prevent duplicate data
- Optimized for scalable multi-vendor architecture

---

## 🌍 Deployment

### 🚀 Deploy to Vercel

```bash
vercel --prod
```

### 🔐 Production Environment Variables

- Set `DATABASE_URL` to production database
- Update `BETTER_AUTH_SECRET`
- Set `NODE_ENV=production`
- Configure CORS origins

---

## 📊 Database Management

Manage your PostgreSQL database efficiently using Prisma CLI commands and npm scripts.

---

### 🖥 Open Database GUI (Prisma Studio)

```bash
npm run studio
```

Launches Prisma Studio — a visual database editor where you can:
- View tables
- Edit records
- Add or delete data
- Inspect relationships

---

### 🛠 Create & Apply Migration

```bash
npm run migrate
```

Creates a new migration based on schema changes and applies it to the database.

> 💡 Make sure your `schema.prisma` file is updated before running this command.

---

### 🔄 Reset Database

```bash
npx prisma migrate reset
```

- Drops the database
- Recreates it
- Reapplies all migrations
- (Optional) Runs seed scripts

⚠️ **Warning:** This will delete all existing data.

---

### ⚙️ Generate Prisma Client

```bash
npm run generate
```

Regenerates the Prisma Client after:
- Modifying schema
- Pulling schema from database
- Updating models

---

### 📤 Push Schema (Without Migration)

```bash
npm run push
```

Pushes schema changes directly to the database without creating migration files.  
Useful for rapid prototyping.

---

### 📥 Pull Database Schema

```bash
npm run pull
```

Introspects the existing database and updates your Prisma schema accordingly.

---

## 📌 Best Practice Workflow

1. Update `schema.prisma`
2. Run:
   ```bash
   npm run migrate
   ```
3. Run:
   ```bash
   npm run generate
   ```
4. Test changes using:
   ```bash
   npm run studio
   ```

---

🚀 Keeping migrations clean ensures a stable and production-ready database structure.

---

## 🐛 Troubleshooting

### ❌ Database Connection Error

- Check `DATABASE_URL`
- Ensure PostgreSQL is running
- Verify database exists

### ❌ Prisma Client Not Generated

```bash
npx prisma generate
```

### ❌ Port Already in Use

- Change `PORT` in `.env`
- Or kill running process

## 🐛 Troubleshooting

Common issues you may face during development and how to fix them.

---

### ❌ Database Connection Error

If you see errors like:

- `P1001: Can't reach database server`
- `Database connection failed`
- `ECONNREFUSED`

✅ **Possible Solutions:**

- Check your `DATABASE_URL` inside `.env`
- Ensure PostgreSQL service is running
- Verify the database exists
- Confirm username, password, and port are correct
- If using cloud DB (Neon/Supabase), ensure network access is enabled

---

### ❌ Migration Failed (P3006 / P1014)

This usually happens when:

- A table does not exist
- Migration history is inconsistent
- Shadow database failed

✅ **Fix Options:**

```bash
npm run migrate
```

If problem persists:

```bash
npx prisma migrate reset
```

⚠️ Warning: This will erase all data.

---

### ❌ Prisma Client Not Generated

If you get type errors like:
- `Property does not exist on PrismaClient`
- Model not found

Run:

```bash
npm run generate
```

This regenerates Prisma Client based on your latest schema.

---

### ❌ Port Already in Use

If you see:
```
Error: listen EADDRINUSE
```

✅ Fix by:

- Changing `PORT` in `.env`
- Or killing the running process

---

### ❌ Environment Variables Not Loading

If `.env` values are not working:

- Make sure `.env` file is in root directory
- Restart the development server
- Confirm variable names match exactly

---

## 🚀 Pro Tip

After making schema or environment changes, always run:

```bash
npm run generate
```

Then restart your development server.

---

Keeping your environment clean and migrations organized prevents most common backend issues.

---

## 📈 Performance Optimization

To ensure scalability and high performance, the backend follows these best practices:

### 🚀 Database Optimization
- Proper indexing on frequently queried fields
- Optimized relational queries using Prisma
- Avoiding unnecessary nested queries
- Using selective field fetching (`select` / `include`)

### 📄 Pagination
- Implemented pagination for large datasets
- Prevents heavy payload responses
- Improves API response time

### ⚡ Query Optimization
- Efficient filtering & sorting
- Aggregation where needed
- Reduced N+1 query problems

### 🧠 Recommended Caching Strategies
- Redis caching for frequently accessed data
- Response-level caching for public endpoints
- Query result caching for heavy operations

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. **Fork** the repository  
2. **Create a feature branch**
   ```bash
   git checkout -b newFeature/featureName
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add featureName"
   ```
4. **Push to your branch**
   ```bash
   git push origin newFeature/featureName
   ```
5. Open a **Pull Request**

Please ensure:
- Code follows project structure
- ESLint passes successfully
- Proper commit messages are used

---

## 📄 License

This project is licensed under the **MIT License**.  
You are free to use, modify, and distribute this software.

---

## 👨‍💻 Developer

Developed with ❤️ by **Md Abu Sufian**

🔗 **Frontend Repository:**  
https://github.com/Md-Sufian-Jidan/Jj-FoodHub-Client

---

> ⚠️ **Note:**  
> This repository contains only the backend API of the FOODIE platform.  
> To run the complete application, please clone and setup the frontend repository as well.
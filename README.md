# 🦊 FoxFund - Personal Budget Tracker

A beautiful, full-stack budget tracking application built with modern technologies. Track your income, expenses, budgets, and savings goals with an intuitive interface and powerful visualizations.

![Dashboard](/screenshots/dashboard-desktop.jpeg)

## 🚀 Live Demo

**Experience the app live:** [foxfund.vercel.app](https://foxfund.vercel.app)

**Demo Account:**
- Email: `demo@foxfund.com`
- Password: `demo123`

## ✨ Features

### Core Features
- 🔐 **Authentication** - Secure sign up/login with NextAuth.js
- 💰 **Transaction Management** - Add, edit, delete income & expenses
- 🏷️ **Categories & Budgets** - Custom categories with monthly budget limits
- 📊 **Dashboard Analytics** - Income vs expenses summary with charts
- 🎯 **Spending Visualizations** - Pie charts by category, line charts for trends
- 🔍 **Advanced Filtering** - Date range, category, and text search
- 📱 **Responsive Design** - Mobile-first, desktop-optimized UI
- 📤 **CSV Export** - Export transactions for any period
- 🎨 **Demo Data** - Pre-loaded with realistic financial data

### Stretch Features
- 🌙 **Dark/Light Mode** - Toggle between themes
- 📥 **CSV Import** - Bulk import transactions
- 🎯 **Monthly Goals** - Set and track savings targets
- 👥 **Shared Budgets** - Collaborate on budgets with other users
- 🔔 **In-app Notifications** - Real-time alerts and updates

## 🛠️ Tech Stack

**Frontend:**
- Next.js 15.5.5 with App Router
- React 19.1.0 + TypeScript
- Tailwind CSS 4.0 with custom fox theme
- Recharts 3.2.1 for data visualization
- TanStack Query 5.90.5 for server state

**Backend:**
- Next.js API Routes (TypeScript)
- Prisma 6.17.1 ORM with TypeScript types
- PostgreSQL (Neon serverless database)
- NextAuth.js 4.24.11 for authentication
- bcryptjs for password hashing

**Development:**
- Jest for testing (10+ tests included)
- ESLint + Prettier for code quality
- TypeScript for type safety

## 📸 Screenshots

| Dashboard Light | Dashboard Dark | Mobile View |
|----------------|----------------|-------------|
| ![Dashboard Light](/screenshots/dashboard-desktop.jpeg) | ![Dashboard Dark](/screenshots/dashboard-desktop-dark-mode.jpeg) | ![Mobile](/screenshots/dashboard-mobile.jpeg) |

| Transactions | Budgets | Categories |
|--------------|---------|------------|
| ![Transactions](/screenshots/transactions-desktop.jpeg) | ![Budgets](/screenshots/budgets-desktop.jpeg) | ![Categories](/screenshots/categories-desktop.jpeg) |

| Goals | Shared Budgets | Dark Mode |
|-------|----------------|-----------|
| ![Goals](/screenshots/add-transaction-desktop-dark-mode.jpeg) | ![Shared Budgets](/screenshots/shared-budgets-desktop.jpeg) | ![Dark Mode](/screenshots/categories-desktop-dark-mode.jpeg) |

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or SQLite for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/foxfund.git
   cd foxfund
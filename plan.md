# Detailed Project Plan: Xyozi Store

## 🏗️ Architecture Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Shadcn UI (Custom Premium Dark Theme)
- **Database**: PostgreSQL (Supabase/Neon) + Prisma ORM
- **Auth**: NextAuth.js (Admin Access)
- **Services**: 
    - **Digiflazz**: Product provider & automation.
    - **Sukurupiah**: Payment gateway integration.

---

## 🎨 Phase 1: Frontend Development (Priority)

### 1. Landing Page (Homepage)
- **Hero Section**: Eye-catching banner with search bar for games.
- **Game Categories**: Grid of game cards (Mobile Legends, Free Fire, etc.) with premium hover effects.
- **Service Highlights**: Why choose Xyozi Store (Fast, Cheap, Secure).
- **Global Search**: Quick find for any game or service.

### 2. Product Order Page (Specific Game)
- **Input Field**: User ID & Zone ID (with validation logic for specific games).
- **Nominal Grid**: List of products (Diamonds, UC, etc.) with real-time price labels.
- **Payment Selection**: Accordion of payment methods (E-Wallet, Virtual Accounts via Sukurupiah).
- **Checkout Summary**: Sticky sidebar showing selected items and total price.

### 3. Payment & Invoice Page
- **Invoice Overview**: Status (Pending/Success/Failed), Expiry timer.
- **Payment Details**: QR Code (QRIS) or Virtual Account number display.
- **Order Status**: Real-time polling or WebSocket updates when payment is successful.

### 4. Admin Dashboard UI
- **Dashboard Overview**: Total revenue, total orders, and success rate charts.
- **Product Management**: Table with "Get Product" (Sync from Digiflazz) and pricing forms.
- **Order History**: Searchable list of all transactions with manual "Re-process" button.

---

## ⚙️ Phase 2: Backend Development

### 1. Database Schema (Prisma)
- **`User`**: Admin credentials and roles.
- **`Category`**: Name, Slug, Logo URL.
- **`Product`**: `sku_code` (Digiflazz), name, basic price, sell price, max price, status.
- **`Order`**: Reference ID, User game ID, Product ID, Payment Status, Digiflazz Status.
- **`Settings`**: API Keys (Digiflazz User/Key, Sukurupiah Key).
- **`ErrorLog`**: [NEW] Track failed API calls (Digiflazz/Sukurupiah) with response body for debugging.

### 2. Digiflazz Integration
- **Product Sync**: Cron job or manual trigger to fetch latest price list.
- **Order Automation**: POST request to Digiflazz API when payment is confirmed.
- **Retry Logic**: [NEW] Automatic retry (max 3 times, 5s interval) for failed Digiflazz requests.
- **Balance Checker**: Admin widget to monitor Digiflazz balance.

### 3. Sukurupiah Payment Integration
- **Payment Creation**: Generate transaction URL/QRIS from server-side.
- **Webhook Listener**: Secure endpoint to receive payment notifications.
- **Signature Verification**: [NEW] HMAC-SHA256 integrity check for every Sukurupiah incoming request.
- **Balance Sync**: Update local order status based on callback.

### 4. Logic & Safety
- **Pricing Engine**: Automated profit calculation (Basic Price + Margin).
- **Hard Guard (Harga Max)**: Prevent orders if Digiflazz price exceeds defined Max Price.
- **Validation API**: "Check ID" functionality for games like MLBB before proceeding to payment.

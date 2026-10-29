# Smart BIT Campus Stationery Pre-Ordering & Online Xerox Management Platform

An institutional full-stack web application designed for college campus stationery and reprographic stores (e.g. Bannari Amman / BIT Campus). Built with **React.js, HTML5, CSS3, JavaScript, Node.js, Express.js, and MongoDB**.

---

## 🌟 Key Highlights & Engineering Features

- **3 Role-Based Modules**: Dedicated experiences and protected dashboards for **Student**, **Store Staff**, and **Campus Administrator**.
- **Integrated Stationery & Online Xerox Pre-Ordering**:
  - Pre-order physical lab records, engineering instruments, pens, drafters, files, and calculators.
  - Upload PDF documents for printing/photocopy with automated page count detection, page range filtering, B&W or Colour mode, single or double-sided printing, and binding options.
- **Dynamic Xerox Cost Calculation Engine**:
  - Live per-page calculation configured by administrators (B&W per-page rate, Colour per-page rate, double-sided duplex discount, corner stapling, spiral binding, and soft binding).
- **Secure PDF Upload & Protected Document Access**:
  - Validates PDF mimetype (`application/pdf`) and enforces 30 MB file limits.
  - Documents are protected from unauthorized access: Students can only view their own uploaded documents, while authorized store staff and campus admins have secure access.
- **Real-Time Inventory Guard & Automatic Stock Management**:
  - Automatically prevents placing orders that exceed current physical stock.
  - Stock is immediately decremented and reserved upon order confirmation.
  - If a student cancels a pending pre-order or staff marks it cancelled, reserved items are automatically restored to store inventory.
- **Dynamic Stock Status Calculation**:
  - 🟢 **In Stock**: `stockQuantity > minStockThreshold`
  - 🟡 **Low Stock**: `stockQuantity > 0 && stockQuantity <= minStockThreshold` (Triggers low-stock alerts)
  - 🔴 **Out of Stock**: `stockQuantity === 0` (Blocks pre-ordering)
- **Payment & Counter Pickup (No Online Payment Gateway Required)**:
  - Students pay for both stationery and Xerox pre-orders at the campus store counter (Amenities Block Desk #02) upon pickup via Cash or Campus UPI.
  - Payment statuses: `Pending` or `Paid`.
  - Authorized store staff can verify counter payment and mark orders as `Paid`.
- **Role-Based Notifications Center**:
  - Students receive real-time notifications when stationery orders or Xerox documents are marked `Ready for Pickup`.
  - Staff and Admin receive automated notifications when items drop below threshold or new Xerox/stationery pre-orders arrive.
- **Printable Campus Reservation Tokens & Slips**:
  - Official counter pickup reservation slips for Stationery and Xerox with scheduled pickup date, time slots, student verification details, token numbers, and signature verification blocks.
- **1-Click Evaluator Demo Switcher**:
  - Quick top banner switcher to test all 3 personas instantly without typing credentials.

---

## 👥 Role-Based Modules

### 1. 🎓 Student Module
- **Registration & Login**: Secure JWT authentication with college email, roll number, department, academic year, and phone.
- **Profile Management**: View and update student identification details (roll number, department, year, phone) directly from the profile tab.
- **Browse & Search Stationery**: Explore catalog with real-time stock availability badges, syllabus/exam specs, price sorting, and category filters.
- **Pre-Order Basket**: Stock limit validation (cannot order more than available stock), quantity selectors, and scheduled counter pickup time slots:
  - *Morning Slot (08:30 AM - 09:15 AM)*
  - *Mid-Morning Slot (10:45 AM - 11:15 AM)*
  - *Lunch Break (12:45 PM - 01:45 PM)*
  - *Afternoon Slot (03:15 PM - 03:45 PM)*
  - *Evening Post-Class (04:30 PM - 05:45 PM)*
- **Online Xerox / Photocopy Pre-Ordering**:
  - Drag & drop or browse PDF documents.
  - Auto-detected page counts via `pdf-parse` backend parser.
  - Custom page range selection (e.g. `1-10`, `1,3,5-8` or `All Pages`).
  - Color mode: **Black & White** or **Full Colour**.
  - Paper format: **Single-Sided** or **Double-Sided (Back-to-Back)**.
  - Binding options: **No Binding**, **Corner Staple**, **Spiral Binding**, or **Soft Binding**.
  - Live cost breakdown estimation in ₹.
  - Schedule pickup date & break time slot.
- **Order Tracking & Digital Slips**:
  - Live status progression: `PENDING` ➔ `CONFIRMED` ➔ `PREPARING` ➔ `READY_FOR_PICKUP` ➔ `COMPLETED` (or `CANCELLED`).
  - Live Xerox status: `PENDING` ➔ `ACCEPTED` ➔ `PRINTING` ➔ `READY_FOR_PICKUP` ➔ `COMPLETED`.
  - Track payment status: `Pending` or `Paid`.
  - Print counter token slips and re-download uploaded PDF files.
  - Cancel pending pre-orders (with automatic inventory restoration for stationery).

### 2. 📦 Store Staff Module
- **Stationery Fulfillment Queue**: Process student pre-orders across workflow stages: `Pending`, `Confirmed`, `Preparing`, `Ready for Pickup`, `Completed`, or `Cancelled`.
- **Xerox Requests Queue**: Securely view and download student PDF files, check print preferences, calculate charges, mark orders `Accepted`, `Printing`, `Ready for Pickup`, `Completed`, or `Cancelled (Reject)`.
- **Payment Verification**: Mark payments as `Paid` upon collecting cash or campus UPI at the store desk.
- **Inventory & Quick Restock**: Real-time stock monitor, threshold indicators, and quick stock replenishment (`+10`, `+25`, `+50` units).
- **Fulfillment Dashboard KPIs**: Overview of pending stationery orders, pending Xerox requests, orders ready for pickup, and low-stock alerts.

### 3. ⚙️ Campus Administrator Module
- **Executive Analytics Dashboard**:
  - Total catalog products, registered users, total pre-orders, and combined financial revenue (Stationery + Xerox).
  - Current total store inventory asset valuation in ₹.
- **Products CRUD**: Add new items, edit pricing, descriptions, stock quantities, and minimum thresholds.
- **Xerox Rate Configuration**: Admin panel to configure per-page Black & White rate (₹), Colour rate (₹), double-sided discount (₹), corner staple charge (₹), spiral binding charge (₹), and soft binding charge (₹).
- **Procurement & Shortage Advisory**: Live calculated deficit and recommended procurement batch sizes for low-stock stationery.
- **User Administration & Broadcasts**: Manage system accounts and dispatch notices.

---

## 🔑 Pre-Seeded Demo Accounts

You can use the 1-click **Role Switcher** at the top of the app, or log in manually with:

| Role | Email | Password | Persona Details |
| :--- | :--- | :--- | :--- |
| **Student** | `student@bit.edu` | `student123` | Aarav Sharma (3rd Year CSE, Roll: 22BITCSE042) |
| **Student** | `priya@bit.edu` | `student123` | Priya Sundaram (2nd Year ECE, Roll: 23BITECE118) |
| **Store Staff** | `staff@bit.edu` | `staff123` | Ramesh Kannan (Central Stationery Store Desk #02) |
| **Campus Admin** | `admin@bit.edu` | `admin123` | Dr. K. Balasubramanian (Stores Superintendent) |

---

## 📁 Project Directory Structure

```
resilient-babbage/
├── client/                     # React.js Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/         # ProductModal, XeroxPricingModal, UserModal, ThresholdModal, BroadcastModal
│   │   │   ├── common/        # Navbar, SimpleNavbar, Footer, DemoAccountBanner, Badges
│   │   │   ├── staff/         # ProcessOrderModal, ProcessXeroxModal, RestockModal
│   │   │   └── student/       # ProductCard, XeroxPreOrderModal, OrderSlipModal, XeroxSlipModal
│   │   ├── context/           # AuthContext, CartContext, NotificationContext
│   │   ├── pages/             # StudentSimplePage, StaffSimplePage, AdminSimplePage, Login, Register
│   │   ├── services/          # api.js (Centralized REST API client with Xerox & Orders methods)
│   │   ├── styles/            # index.css (Institutional clean design system)
│   │   ├── App.jsx            # Protected routes & role navigation
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                     # Express.js & MongoDB Backend
│   ├── config/
│   │   └── db.js              # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── analyticsController.js # Aggregated metrics & Xerox revenue analytics
│   │   ├── authController.js      # Student/Staff/Admin authentication & profile
│   │   ├── inventoryController.js # Stock monitor & quick restock
│   │   ├── notificationController.js # Real-time alerts
│   │   ├── orderController.js     # Stationery pre-orders & stock deduction
│   │   ├── productController.js   # Products catalog CRUD
│   │   ├── userController.js      # User management
│   │   └── xeroxController.js     # PDF upload, page parse, rates calculation, status, secure streaming
│   ├── middleware/
│   │   ├── auth.js            # JWT verification & role authorization
│   │   └── errorHandler.js    # Global error handler
│   ├── models/
│   │   ├── InventoryLog.js    # Stock change audit trail
│   │   ├── Notification.js    # Role-based notification alerts
│   │   ├── Order.js           # Stationery pre-orders with pickup slots
│   │   ├── Product.js         # Auto-calculated stock status & thresholds
│   │   ├── User.js            # Password hashing & student identification
│   │   ├── XeroxOrder.js      # PDF pre-orders, print options, costs & tokens
│   │   └── XeroxSetting.js    # Admin Xerox pricing configurations
│   ├── routes/                # REST API endpoints (auth, products, orders, xerox, inventory, etc.)
│   ├── seed/
│   │   └── seedData.js        # Seeder with stationery products, Xerox orders, settings & demo accounts
│   ├── uploads/
│   │   └── xerox/             # Secure directory for student uploaded PDF documents
│   ├── .env
│   ├── package.json
│   └── server.js
├── test-app.js                 # 22/22 Automated full-stack integration test suite
├── package.json
└── README.md
```

---

## 🚀 Running the Application

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally on port 27017 (or MongoDB Atlas URI in `server/.env`)

### 2. Database Seeding
To populate realistic stationery items, Xerox print pricing configuration, sample Xerox pre-orders, and demo accounts:
```bash
npm run seed
```

### 3. Start Backend Server
```bash
npm run server
```
*Server runs on:* `http://localhost:5000`

### 4. Start React Frontend
```bash
npm run client
```
*Frontend runs on:* `http://localhost:3000`

---

## 🧪 Automated Integration Tests (22 Passed, 0 Failed)

Run the comprehensive test suite verifying stock deduction, over-order prevention, order lifecycle, cancellations, Xerox settings, admin price configuration, Xerox order queues, status transitions, payments, and PDF document security:
```bash
node test-app.js
```

**Results:**
```
====================================================
🧪 RUNNING FULL INTEGRATION TEST SUITE FOR BIT PLATFORM
====================================================

✅ PASS: Server Health Check API
✅ PASS: Student Authentication
✅ PASS: Store Staff Authentication
✅ PASS: Admin Authentication
✅ PASS: Products Search & Filtering by Category
✅ PASS: Prevent Ordering More Than Available Stock Check
✅ PASS: Student Pre-Order Creation
✅ PASS: Automatic Real-Time Stock Deduction upon Order Confirmation
✅ PASS: Student Order History & Tracking
✅ PASS: Store Staff Orders Queue Retrieval
✅ PASS: Staff Status Transition (Ready for Pickup)
✅ PASS: Admin Analytics & Dashboard Metrics Retrieval
✅ PASS: Inventory Quick Restock & Automatic Status Recomputation
✅ PASS: Order Cancellation Automatic Stock Restoration
✅ PASS: Xerox Pricing Settings Retrieval
✅ PASS: Admin Configure Xerox B&W and Colour Pricing
✅ PASS: Student My Xerox Orders Retrieval
✅ PASS: Store Staff Xerox Requests Queue Retrieval
✅ PASS: Staff Xerox Order Status Transition (Ready for Pickup)
✅ PASS: Staff Mark Xerox Order Payment as Paid
✅ PASS: Document Security: Unauthorized Student Access Prevention Check
✅ PASS: Document Security: Authorized Staff Secure Document Access Check

====================================================
TEST SUMMARY: 22 PASSED, 0 FAILED
====================================================
```

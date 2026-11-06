# StockPilot – Gadget Inventory Manager

**StockPilot** is a modern, high-performance gadget and electronics inventory management frontend web application engineered specifically for phone dealers, electronics vendors, accessory wholesalers, and retail gadget store owners.

Built exclusively with **vanilla HTML5, CSS3, and JavaScript**, StockPilot delivers a responsive, enterprise-grade SaaS dashboard with zero external dependencies, zero libraries, zero CSS variables, and persistent browser `localStorage`.

---

## Key Features

- **Executive KPI Dashboard**:
  - Live statistics for Total Products, Total Stock Units, Low Stock Alerts, Out-of-Stock Alerts, Total Inventory Valuation (Retail vs. Cost), and Sales Revenue & Gross Profit.
  - Interactive SVG sales performance charts (7-day, 14-day, 30-day views).
  - SVG category distribution doughnut chart.
  - Quick action ribbon for streamlined daily shop operations.

- **Inventory Management**:
  - Full product fields: Name, Brand, Category, Model, SKU, IMEI / Serial Number, Cost Price, Selling Price, Quantity, Min Stock Threshold, Supplier, Description, and Image.
  - 11 pre-configured gadget categories: Smartphones, Laptops, Tablets, Smartwatches, Headphones & Earbuds, Speakers, Gaming Accessories, Phone Accessories, Computer Accessories, Chargers & Power Banks, Other Gadgets.
  - Instant live search and multi-facet filtering (by category, brand, and stock status).
  - Dual view modes: Table View and Visual Product Cards Grid.
  - Local image upload with `FileReader` preview + automatic vector fallback graphics.

- **Stock Tracking & Audit Trail**:
  - Record stock adjustments: *Incoming Restock*, *Customer Return*, *Damaged Stock*, *Sale Deduction*, and *Manual Audit Adjustment*.
  - Full immutable movement audit trail logging timestamps, quantities changed, previous/new stock levels, and vendor notes.
  - Strict prevention against negative stock levels.

- **Sales Recording & Thermal Receipts**:
  - Fast sales checkout with dynamic stock validation.
  - Automatic pricing retrieval, discount deduction, and real-time margin calculation.
  - Multi-payment support: Cash, Bank Transfer, POS, Other.
  - Printable customer sales receipt formatted for thermal and standard desktop printers.
  - One-click sale reversal / cancellation with automatic stock restoration.

- **Restock & Low Stock Replenishment**:
  - Proactive safety stock monitor alerting on low, critical, and out-of-stock items.
  - Automatic calculation of suggested reorder quantities.
  - One-click restock actions linked directly to primary distributors.

- **Supplier Management**:
  - Maintain vendor directory with phone, email, registered business address, and notes.
  - Automatic tracking of products associated with each supplier.

- **Business Intelligence & CSV Exports**:
  - Comprehensive revenue, profit margin, and inventory valuation reporting.
  - Best-selling and slow-moving product rankings.
  - Instant CSV exports for Inventory Catalog, Sales Transactions, and Stock Movement Logs.

- **Settings & Data Portability**:
  - Multi-currency support: **NGN (₦)** (default), **USD ($)**, **GBP (£)**, and **EUR (€)**.
  - Full JSON backup export and restore capabilities.
  - Demo data reset and clean wipe features.

---

## Tech Stack

- **HTML5**: Semantic, accessible markup.
- **CSS3**: Pure vanilla CSS with modern SaaS aesthetic (Linear / Stripe inspired), fully responsive with zero CSS variables (`var()` or `--*`).
- **JavaScript (ES6+)**: Modular vanilla JS architecture with an event-driven reactive state store.
- **Storage**: Browser Web Storage (`localStorage`) for persistence.

---

## How to Run

No build step, Node server, or bundler required:
1. Clone or download the repository.
2. Open `index.html` in any modern web browser.
3. Start managing your gadget inventory immediately!

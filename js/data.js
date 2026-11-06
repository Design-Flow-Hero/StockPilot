/**
 * StockPilot – Gadget Inventory Manager
 * Data Models, Demo Data & Storage Helpers
 */

const STORAGE_KEYS = {
  PRODUCTS: 'stockpilot_products',
  SALES: 'stockpilot_sales',
  MOVEMENTS: 'stockpilot_movements',
  SUPPLIERS: 'stockpilot_suppliers',
  SETTINGS: 'stockpilot_settings',
  INITIALIZED: 'stockpilot_initialized_v1'
};

const CATEGORIES = [
  'Smartphones',
  'Laptops',
  'Tablets',
  'Smartwatches',
  'Headphones & Earbuds',
  'Speakers',
  'Gaming Accessories',
  'Phone Accessories',
  'Computer Accessories',
  'Chargers & Power Banks',
  'Other Gadgets'
];

const CURRENCIES = {
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' }
};

const DEFAULT_SETTINGS = {
  storeName: 'StockPilot Gadgets & Mobile Hub',
  storeTagline: 'Authorised Phones, Laptops & Premium Electronics',
  storePhone: '+234 803 123 4567',
  storeEmail: 'contact@stockpilot-hub.ng',
  storeAddress: 'Shop 42, Digital Electronics Mall, Computer Village, Ikeja, Lagos',
  currency: 'NGN',
  defaultLowStockThreshold: 5,
  receiptFooter: 'Thank you for your patronage! Please retain this receipt for warranty verification (30 days hardware guarantee).'
};

// Generates modern SVG gadget graphic as data URL
function generateGadgetSvg(category, brand, color = '#10b981') {
  let iconSvg = '';
  switch (category) {
    case 'Smartphones':
      iconSvg = `<rect x="28" y="14" width="44" height="72" rx="8" fill="none" stroke="${color}" stroke-width="4"/><circle cx="50" cy="76" r="3" fill="${color}"/><line x1="42" y1="22" x2="58" y2="22" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`;
      break;
    case 'Laptops':
      iconSvg = `<rect x="22" y="24" width="56" height="38" rx="4" fill="none" stroke="${color}" stroke-width="4"/><path d="M12 68h76a4 4 0 0 1 4 4v2H8v-2a4 4 0 0 1 4-4z" fill="${color}"/><line x1="42" y1="70" x2="58" y2="70" stroke="#ffffff" stroke-width="2"/>`;
      break;
    case 'Tablets':
      iconSvg = `<rect x="20" y="16" width="60" height="68" rx="6" fill="none" stroke="${color}" stroke-width="4"/><circle cx="50" cy="76" r="2.5" fill="${color}"/>`;
      break;
    case 'Smartwatches':
      iconSvg = `<rect x="36" y="8" width="28" height="20" rx="3" fill="#94a3b8"/><rect x="36" y="72" width="28" height="20" rx="3" fill="#94a3b8"/><rect x="26" y="24" width="48" height="52" rx="12" fill="none" stroke="${color}" stroke-width="4"/><circle cx="50" cy="50" r="14" fill="none" stroke="${color}" stroke-width="2"/><line x1="50" y1="50" x2="50" y2="42" stroke="${color}" stroke-width="2.5"/><line x1="50" y1="50" x2="57" y2="50" stroke="${color}" stroke-width="2.5"/>`;
      break;
    case 'Headphones & Earbuds':
      iconSvg = `<path d="M24 54V46a26 26 0 0 1 52 0v8" fill="none" stroke="${color}" stroke-width="4"/><rect x="18" y="52" width="12" height="22" rx="6" fill="${color}"/><rect x="70" y="52" width="12" height="22" rx="6" fill="${color}"/>`;
      break;
    case 'Speakers':
      iconSvg = `<rect x="28" y="16" width="44" height="68" rx="6" fill="none" stroke="${color}" stroke-width="4"/><circle cx="50" cy="36" r="8" fill="none" stroke="${color}" stroke-width="3"/><circle cx="50" cy="62" r="14" fill="none" stroke="${color}" stroke-width="3.5"/>`;
      break;
    case 'Gaming Accessories':
      iconSvg = `<path d="M24 38c-8 0-14 8-10 24 2 8 8 12 14 10l8-8h28l8 8c6 2 12-2 14-10 4-16-2-24-10-24H24z" fill="none" stroke="${color}" stroke-width="4"/><circle cx="34" cy="52" r="3.5" fill="${color}"/><circle cx="66" cy="52" r="3.5" fill="${color}"/><path d="M44 48h12v4H44z" fill="${color}"/>`;
      break;
    case 'Chargers & Power Banks':
      iconSvg = `<rect x="26" y="22" width="48" height="62" rx="6" fill="none" stroke="${color}" stroke-width="4"/><line x1="38" y1="12" x2="38" y2="22" stroke="${color}" stroke-width="4"/><line x1="62" y1="12" x2="62" y2="22" stroke="${color}" stroke-width="4"/><path d="M52 34l-8 14h8l-4 16 12-18h-8l4-12z" fill="${color}"/>`;
      break;
    case 'Phone Accessories':
    case 'Computer Accessories':
      iconSvg = `<rect x="30" y="20" width="40" height="60" rx="8" fill="none" stroke="${color}" stroke-width="4"/><path d="M42 45h16M42 55h16" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`;
      break;
    default:
      iconSvg = `<circle cx="50" cy="50" r="30" fill="none" stroke="${color}" stroke-width="4"/><path d="M50 32v18l12 6" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>`;
      break;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" rx="16" fill="#f8fafc"/>
    <rect width="98" height="98" x="1" y="1" rx="15" fill="none" stroke="#e2e8f0" stroke-width="1.5"/>
    ${iconSvg}
    <text x="50" y="93" text-anchor="middle" font-size="8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="bold" fill="#64748b" letter-spacing="0.5">${brand ? brand.toUpperCase() : 'GADGET'}</text>
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

const DEFAULT_SUPPLIERS = [
  {
    id: 'SUP-001',
    name: 'Apex Mobile Distro Ltd',
    businessName: 'Apex Mobile Distribution & Logistics',
    phone: '+234 802 334 9901',
    email: 'sales@apexmobile.ng',
    address: '14 Otigba St, Computer Village, Ikeja, Lagos',
    notes: 'Primary Tier-1 distributor for official Apple, Samsung, and Xiaomi hardware.',
    createdAt: '2026-01-10T09:00:00.000Z'
  },
  {
    id: 'SUP-002',
    name: 'Global Tech Imports',
    businessName: 'Global Tech Wholesale Corporation',
    phone: '+234 818 765 4321',
    email: 'orders@globaltechimports.com',
    address: 'Plot 8 Commercial Ave, Trade Fair Complex, Lagos',
    notes: 'Direct importer of MacBooks, Dell, HP and Lenovo business laptops.',
    createdAt: '2026-01-12T11:30:00.000Z'
  },
  {
    id: 'SUP-003',
    name: 'SonicWave Audio & Accessories',
    businessName: 'SonicWave Smart Accessories Ltd',
    phone: '+234 809 112 3344',
    email: 'support@sonicwave.com',
    address: '22 Pepple St, Computer Village, Ikeja, Lagos',
    notes: 'Official regional distributor for Oraimo, Anker, Baseus, JBL and Sony accessories.',
    createdAt: '2026-01-15T14:15:00.000Z'
  },
  {
    id: 'SUP-004',
    name: 'Titan Gaming & Gear',
    businessName: 'Titan Gaming Hardware Hub',
    phone: '+234 807 554 2211',
    email: 'distro@titangear.ng',
    address: '55 Awolowo Way, Ikeja, Lagos',
    notes: 'Supplier for Sony PlayStation, Nintendo, gaming accessories and wearables.',
    createdAt: '2026-01-20T10:00:00.000Z'
  }
];

const DEFAULT_PRODUCTS = [
  {
    id: 'PRD-1001',
    name: 'iPhone 15 Pro (128GB, Natural Titanium)',
    image: generateGadgetSvg('Smartphones', 'Apple', '#0284c7'),
    brand: 'Apple',
    category: 'Smartphones',
    model: 'A2848 / 128GB',
    sku: 'APL-IP15P-128',
    imei: '356984112345671',
    purchasePrice: 1350000,
    sellingPrice: 1550000,
    quantity: 8,
    minStock: 3,
    supplierName: 'Apex Mobile Distro Ltd',
    description: 'Grade-A Brand new factory unlocked Apple iPhone 15 Pro with A17 Pro chip and titanium aerospace chassis.',
    dateAdded: '2026-02-01T10:00:00.000Z'
  },
  {
    id: 'PRD-1002',
    name: 'Samsung Galaxy S24 Ultra (256GB, Titanium Gray)',
    image: generateGadgetSvg('Smartphones', 'Samsung', '#4f46e5'),
    brand: 'Samsung',
    category: 'Smartphones',
    model: 'SM-S928B',
    sku: 'SAM-S24U-256',
    imei: '359871109876543',
    purchasePrice: 1500000,
    sellingPrice: 1720000,
    quantity: 5,
    minStock: 3,
    supplierName: 'Apex Mobile Distro Ltd',
    description: 'Flagship Galaxy S24 Ultra with Galaxy AI, S-Pen embedded, 200MP camera and Snapdragon 8 Gen 3 for Galaxy.',
    dateAdded: '2026-02-03T11:20:00.000Z'
  },
  {
    id: 'PRD-1003',
    name: 'MacBook Air M2 (13.6-inch, 8GB / 256GB, Midnight)',
    image: generateGadgetSvg('Laptops', 'Apple', '#0f766e'),
    brand: 'Apple',
    category: 'Laptops',
    model: 'MLY33LL/A',
    sku: 'APL-MBA-M2',
    imei: 'C02FX1ABC789',
    purchasePrice: 1450000,
    sellingPrice: 1680000,
    quantity: 4,
    minStock: 2,
    supplierName: 'Global Tech Imports',
    description: 'Apple Silicon M2 8-core CPU, 8-core GPU, Liquid Retina display, MagSafe 3 charging and all-day 18hr battery.',
    dateAdded: '2026-02-05T09:40:00.000Z'
  },
  {
    id: 'PRD-1004',
    name: 'HP EliteBook 840 G9 (Intel Core i7, 16GB / 512GB SSD)',
    image: generateGadgetSvg('Laptops', 'HP', '#0284c7'),
    brand: 'HP',
    category: 'Laptops',
    model: 'EliteBook 840 G9',
    sku: 'HP-EB840-G9',
    imei: '5CG2408XYZ',
    purchasePrice: 950000,
    sellingPrice: 1120000,
    quantity: 3,
    minStock: 2,
    supplierName: 'Global Tech Imports',
    description: 'Enterprise business laptop with 14-inch FHD IPS display, Intel vPro Core i7, fingerprint reader and backlit keyboard.',
    dateAdded: '2026-02-06T14:10:00.000Z'
  },
  {
    id: 'PRD-1005',
    name: 'AirPods Pro 2nd Generation (USB-C MagSafe)',
    image: generateGadgetSvg('Headphones & Earbuds', 'Apple', '#10b981'),
    brand: 'Apple',
    category: 'Headphones & Earbuds',
    model: 'MTJV3ZM/A',
    sku: 'APL-APP2-USBC',
    imei: 'H1D9802KL4M',
    purchasePrice: 290000,
    sellingPrice: 345000,
    quantity: 14,
    minStock: 5,
    supplierName: 'SonicWave Audio & Accessories',
    description: 'Apple H2 chip, up to 2x more Active Noise Cancellation, Adaptive Audio, Conversation Awareness and USB-C case.',
    dateAdded: '2026-02-08T08:30:00.000Z'
  },
  {
    id: 'PRD-1006',
    name: 'Samsung Galaxy Buds 2 Pro (Graphite)',
    image: generateGadgetSvg('Headphones & Earbuds', 'Samsung', '#d97706'),
    brand: 'Samsung',
    category: 'Headphones & Earbuds',
    model: 'SM-R510',
    sku: 'SAM-BUDS2P-GR',
    imei: '',
    purchasePrice: 165000,
    sellingPrice: 210000,
    quantity: 2, // LOW STOCK
    minStock: 4,
    supplierName: 'SonicWave Audio & Accessories',
    description: '24-bit Hi-Fi audio, intelligent Active Noise Cancellation, 360 Audio with direct multi-channel support.',
    dateAdded: '2026-02-10T12:00:00.000Z'
  },
  {
    id: 'PRD-1007',
    name: 'Oraimo 27000mAh Power Bank (Traveller 3 Byte)',
    image: generateGadgetSvg('Chargers & Power Banks', 'Oraimo', '#16a34a'),
    brand: 'Oraimo',
    category: 'Chargers & Power Banks',
    model: 'OPB-P271D',
    sku: 'ORM-PB-27K',
    imei: '',
    purchasePrice: 28000,
    sellingPrice: 38500,
    quantity: 22,
    minStock: 6,
    supplierName: 'SonicWave Audio & Accessories',
    description: 'Massive 27,000mAh capacity, 12W dual fast charging output, LED display torchlight and multi-protection safety system.',
    dateAdded: '2026-02-12T15:00:00.000Z'
  },
  {
    id: 'PRD-1008',
    name: 'Anker 65W GaN Fast Wall Charger (Nano II)',
    image: generateGadgetSvg('Chargers & Power Banks', 'Anker', '#dc2626'),
    brand: 'Anker',
    category: 'Chargers & Power Banks',
    model: 'A2663',
    sku: 'ANK-GAN-65W',
    imei: '',
    purchasePrice: 32000,
    sellingPrice: 45000,
    quantity: 0, // OUT OF STOCK
    minStock: 5,
    supplierName: 'SonicWave Audio & Accessories',
    description: 'Compact 65W Gallium Nitride high-speed charger for laptops, MacBooks, tablets, iPhones and Samsung devices.',
    dateAdded: '2026-02-14T16:20:00.000Z'
  },
  {
    id: 'PRD-1009',
    name: 'Apple Watch Series 9 (45mm GPS, Midnight Aluminum)',
    image: generateGadgetSvg('Smartwatches', 'Apple', '#7c3aed'),
    brand: 'Apple',
    category: 'Smartwatches',
    model: 'MR993LL/A',
    sku: 'APL-AWS9-45',
    imei: 'FH7D1892LLP',
    purchasePrice: 520000,
    sellingPrice: 610000,
    quantity: 6,
    minStock: 3,
    supplierName: 'Titan Gaming & Gear',
    description: 'S9 SiP with Double Tap gesture, brighter 2000 nits display, on-device Siri, blood oxygen and ECG monitor.',
    dateAdded: '2026-02-16T11:45:00.000Z'
  },
  {
    id: 'PRD-1010',
    name: 'Xiaomi Redmi Note 13 (8GB RAM / 256GB Storage)',
    image: generateGadgetSvg('Smartphones', 'Xiaomi', '#ea580c'),
    brand: 'Xiaomi',
    category: 'Smartphones',
    model: '23129RAA4G',
    sku: 'XMI-RN13-256',
    imei: '864210065432190',
    purchasePrice: 245000,
    sellingPrice: 290000,
    quantity: 1, // CRITICAL LOW STOCK
    minStock: 4,
    supplierName: 'Apex Mobile Distro Ltd',
    description: '108MP triple camera, 120Hz FHD+ AMOLED display, 33W fast charging with 5000mAh battery.',
    dateAdded: '2026-02-18T13:30:00.000Z'
  },
  {
    id: 'PRD-1011',
    name: 'Apple iPad Air 5th Gen (64GB Wi-Fi, Space Gray)',
    image: generateGadgetSvg('Tablets', 'Apple', '#0284c7'),
    brand: 'Apple',
    category: 'Tablets',
    model: 'MM9C3LL/A',
    sku: 'APL-IPA5-64',
    imei: 'DMP89201L9Q',
    purchasePrice: 780000,
    sellingPrice: 890000,
    quantity: 7,
    minStock: 3,
    supplierName: 'Apex Mobile Distro Ltd',
    description: '10.9-inch Liquid Retina display, Apple M1 breakthrough chip, 12MP Ultra Wide front camera with Center Stage.',
    dateAdded: '2026-02-20T10:15:00.000Z'
  },
  {
    id: 'PRD-1012',
    name: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
    image: generateGadgetSvg('Headphones & Earbuds', 'Sony', '#dc2626'),
    brand: 'Sony',
    category: 'Headphones & Earbuds',
    model: 'WH1000XM5/B',
    sku: 'SNY-WH1000M5',
    imei: '50982310',
    purchasePrice: 480000,
    sellingPrice: 575000,
    quantity: 0, // OUT OF STOCK
    minStock: 3,
    supplierName: 'SonicWave Audio & Accessories',
    description: 'Industry-leading noise cancellation with two processors and 8 microphones, LDAC Hi-Res Audio, 30-hour battery.',
    dateAdded: '2026-02-22T09:00:00.000Z'
  },
  {
    id: 'PRD-1013',
    name: 'PS5 DualSense Wireless Controller (Midnight Black)',
    image: generateGadgetSvg('Gaming Accessories', 'Sony', '#4338ca'),
    brand: 'Sony',
    category: 'Gaming Accessories',
    model: 'CFI-ZCT1W',
    sku: 'SNY-PS5-CTRL',
    imei: '',
    purchasePrice: 95000,
    sellingPrice: 125000,
    quantity: 11,
    minStock: 4,
    supplierName: 'Titan Gaming & Gear',
    description: 'Haptic feedback, dynamic adaptive triggers, built-in microphone and headset jack with USB Type-C charging.',
    dateAdded: '2026-02-24T14:40:00.000Z'
  },
  {
    id: 'PRD-1014',
    name: 'Baseus 100W USB-C to USB-C Fast Charging Cable (2m)',
    image: generateGadgetSvg('Phone Accessories', 'Baseus', '#059669'),
    brand: 'Baseus',
    category: 'Phone Accessories',
    model: 'CATKLF-AL91',
    sku: 'BAS-CB-100W',
    imei: '',
    purchasePrice: 6500,
    sellingPrice: 12000,
    quantity: 35,
    minStock: 10,
    supplierName: 'SonicWave Audio & Accessories',
    description: 'Durable nylon braided E-Marker chip 100W Power Delivery cable for fast charging laptops, tablets and smartphones.',
    dateAdded: '2026-02-25T16:00:00.000Z'
  }
];

// Helper to generate ISO dates relative to now
function getRelativeDate(daysAgo, hour = 14, minute = 30) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const DEFAULT_SALES = [
  {
    id: 'REC-2026-0001',
    receiptNumber: 'REC-2026-0001',
    date: getRelativeDate(0, 11, 15),
    productId: 'PRD-1001',
    productName: 'iPhone 15 Pro (128GB, Natural Titanium)',
    sku: 'APL-IP15P-128',
    category: 'Smartphones',
    quantity: 1,
    unitPrice: 1550000,
    costPrice: 1350000,
    subtotal: 1550000,
    discount: 20000,
    totalAmount: 1530000,
    profit: 180000, // 1530000 - 1350000
    paymentMethod: 'Bank Transfer',
    customerName: 'Tunde Bakare',
    customerPhone: '+234 803 555 1212',
    notes: 'Sold with glass screen protector promo.',
    status: 'Completed'
  },
  {
    id: 'REC-2026-0002',
    receiptNumber: 'REC-2026-0002',
    date: getRelativeDate(0, 14, 45),
    productId: 'PRD-1007',
    productName: 'Oraimo 27000mAh Power Bank (Traveller 3 Byte)',
    sku: 'ORM-PB-27K',
    category: 'Chargers & Power Banks',
    quantity: 2,
    unitPrice: 38500,
    costPrice: 28000,
    subtotal: 77000,
    discount: 2000,
    totalAmount: 75000,
    profit: 19000, // 75000 - 56000
    paymentMethod: 'POS',
    customerName: 'Grace Adeleke',
    customerPhone: '+234 812 444 8990',
    notes: 'Walk-in customer payment via Moniepoint POS.',
    status: 'Completed'
  },
  {
    id: 'REC-2026-0003',
    receiptNumber: 'REC-2026-0003',
    date: getRelativeDate(1, 10, 20),
    productId: 'PRD-1005',
    productName: 'AirPods Pro 2nd Generation (USB-C MagSafe)',
    sku: 'APL-APP2-USBC',
    category: 'Headphones & Earbuds',
    quantity: 1,
    unitPrice: 345000,
    costPrice: 290000,
    subtotal: 345000,
    discount: 5000,
    totalAmount: 340000,
    profit: 50000,
    paymentMethod: 'Cash',
    customerName: 'Kalu Nwosu',
    customerPhone: '+234 705 998 1122',
    notes: 'Paid in cash, verified.',
    status: 'Completed'
  },
  {
    id: 'REC-2026-0004',
    receiptNumber: 'REC-2026-0004',
    date: getRelativeDate(2, 16, 10),
    productId: 'PRD-1002',
    productName: 'Samsung Galaxy S24 Ultra (256GB, Titanium Gray)',
    sku: 'SAM-S24U-256',
    category: 'Smartphones',
    quantity: 1,
    unitPrice: 1720000,
    costPrice: 1500000,
    subtotal: 1720000,
    discount: 0,
    totalAmount: 1720000,
    profit: 220000,
    paymentMethod: 'Bank Transfer',
    customerName: 'Amina Bello',
    customerPhone: '+234 809 332 2110',
    notes: 'Corporate phone purchase.',
    status: 'Completed'
  },
  {
    id: 'REC-2026-0005',
    receiptNumber: 'REC-2026-0005',
    date: getRelativeDate(3, 13, 0),
    productId: 'PRD-1013',
    productName: 'PS5 DualSense Wireless Controller (Midnight Black)',
    sku: 'SNY-PS5-CTRL',
    category: 'Gaming Accessories',
    quantity: 2,
    unitPrice: 125000,
    costPrice: 95000,
    subtotal: 250000,
    discount: 5000,
    totalAmount: 245000,
    profit: 55000,
    paymentMethod: 'POS',
    customerName: 'David Peters',
    customerPhone: '+234 816 770 0998',
    notes: 'Bought pair for gaming lounge.',
    status: 'Completed'
  },
  {
    id: 'REC-2026-0006',
    receiptNumber: 'REC-2026-0006',
    date: getRelativeDate(4, 15, 30),
    productId: 'PRD-1003',
    productName: 'MacBook Air M2 (13.6-inch, 8GB / 256GB, Midnight)',
    sku: 'APL-MBA-M2',
    category: 'Laptops',
    quantity: 1,
    unitPrice: 1680000,
    costPrice: 1450000,
    subtotal: 1680000,
    discount: 30000,
    totalAmount: 1650000,
    profit: 200000,
    paymentMethod: 'Bank Transfer',
    customerName: 'Dr. Samuel Cole',
    customerPhone: '+234 802 887 6655',
    notes: 'Pre-ordered Midnight finish.',
    status: 'Completed'
  },
  {
    id: 'REC-2026-0007',
    receiptNumber: 'REC-2026-0007',
    date: getRelativeDate(5, 11, 40),
    productId: 'PRD-1014',
    productName: 'Baseus 100W USB-C to USB-C Fast Charging Cable (2m)',
    sku: 'BAS-CB-100W',
    category: 'Phone Accessories',
    quantity: 5,
    unitPrice: 12000,
    costPrice: 6500,
    subtotal: 60000,
    discount: 3000,
    totalAmount: 57000,
    profit: 24500,
    paymentMethod: 'Cash',
    customerName: 'Tech Repair Hub',
    customerPhone: '+234 805 119 4433',
    notes: 'Wholesale lot discount.',
    status: 'Completed'
  },
  {
    id: 'REC-2026-0008',
    receiptNumber: 'REC-2026-0008',
    date: getRelativeDate(6, 17, 15),
    productId: 'PRD-1009',
    productName: 'Apple Watch Series 9 (45mm GPS, Midnight Aluminum)',
    sku: 'APL-AWS9-45',
    category: 'Smartwatches',
    quantity: 1,
    unitPrice: 610000,
    costPrice: 520000,
    subtotal: 610000,
    discount: 10000,
    totalAmount: 600000,
    profit: 80000,
    paymentMethod: 'POS',
    customerName: 'Simisola Johnson',
    customerPhone: '+234 808 662 1100',
    notes: 'Birthday gift order.',
    status: 'Completed'
  }
];

const DEFAULT_MOVEMENTS = [
  {
    id: 'MOV-1001',
    productId: 'PRD-1001',
    productName: 'iPhone 15 Pro (128GB, Natural Titanium)',
    sku: 'APL-IP15P-128',
    movementType: 'Incoming Restock',
    previousQuantity: 0,
    quantityChanged: 9,
    newQuantity: 9,
    date: getRelativeDate(7, 9, 30),
    reason: 'Initial shipment arrival from Apex Mobile Distro Ltd (Batch A91)'
  },
  {
    id: 'MOV-1002',
    productId: 'PRD-1001',
    productName: 'iPhone 15 Pro (128GB, Natural Titanium)',
    sku: 'APL-IP15P-128',
    movementType: 'Sale',
    previousQuantity: 9,
    quantityChanged: -1,
    newQuantity: 8,
    date: getRelativeDate(0, 11, 15),
    reason: 'Sale recorded (Receipt #REC-2026-0001)'
  },
  {
    id: 'MOV-1003',
    productId: 'PRD-1007',
    productName: 'Oraimo 27000mAh Power Bank (Traveller 3 Byte)',
    sku: 'ORM-PB-27K',
    movementType: 'Incoming Restock',
    previousQuantity: 0,
    quantityChanged: 24,
    newQuantity: 24,
    date: getRelativeDate(6, 10, 0),
    reason: 'Supplier restock shipment received'
  },
  {
    id: 'MOV-1004',
    productId: 'PRD-1007',
    productName: 'Oraimo 27000mAh Power Bank (Traveller 3 Byte)',
    sku: 'ORM-PB-27K',
    movementType: 'Sale',
    previousQuantity: 24,
    quantityChanged: -2,
    newQuantity: 22,
    date: getRelativeDate(0, 14, 45),
    reason: 'Sale recorded (Receipt #REC-2026-0002)'
  },
  {
    id: 'MOV-1005',
    productId: 'PRD-1008',
    productName: 'Anker 65W GaN Fast Wall Charger (Nano II)',
    sku: 'ANK-GAN-65W',
    movementType: 'Damaged',
    previousQuantity: 1,
    quantityChanged: -1,
    newQuantity: 0,
    date: getRelativeDate(1, 16, 20),
    reason: 'Faulty pin cracked during display demo testing; logged as damaged'
  },
  {
    id: 'MOV-1006',
    productId: 'PRD-1006',
    productName: 'Samsung Galaxy Buds 2 Pro (Graphite)',
    sku: 'SAM-BUDS2P-GR',
    movementType: 'Manual Adjustment',
    previousQuantity: 3,
    quantityChanged: -1,
    newQuantity: 2,
    date: getRelativeDate(2, 12, 10),
    reason: 'Stock audit physical count adjustment'
  },
  {
    id: 'MOV-1007',
    productId: 'PRD-1012',
    productName: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
    sku: 'SNY-WH1000M5',
    movementType: 'Customer Return',
    previousQuantity: 0,
    quantityChanged: 1,
    newQuantity: 1,
    date: getRelativeDate(5, 14, 0),
    reason: 'Sealed box returned by customer for store exchange'
  },
  {
    id: 'MOV-1008',
    productId: 'PRD-1012',
    productName: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
    sku: 'SNY-WH1000M5',
    movementType: 'Sale',
    previousQuantity: 1,
    quantityChanged: -1,
    newQuantity: 0,
    date: getRelativeDate(2, 15, 30),
    reason: 'Sold to walk-in client; unit now completely out of stock'
  }
];

// Seed or retrieve from localStorage
function initStorage() {
  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!isInitialized) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(DEFAULT_SUPPLIERS));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(DEFAULT_SALES));
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(DEFAULT_MOVEMENTS));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
}

// Global data access helpers
function loadStorageItem(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    console.error(`Failed to load key: ${key}`, e);
    return defaultValue;
  }
}

function saveStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`Failed to save key: ${key}`, e);
    return false;
  }
}


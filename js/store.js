/**
 * StockPilot – Gadget Inventory Manager
 * Store / State Management & Business Logic Layer
 */

class InventoryStore {
  constructor() {
    this.subscribers = [];
    this.products = [];
    this.sales = [];
    this.movements = [];
    this.suppliers = [];
    this.settings = { ...DEFAULT_SETTINGS };
    this.init();
  }

  init() {
    initStorage();
    this.products = loadStorageItem(STORAGE_KEYS.PRODUCTS, []);
    this.sales = loadStorageItem(STORAGE_KEYS.SALES, []);
    this.movements = loadStorageItem(STORAGE_KEYS.MOVEMENTS, []);
    this.suppliers = loadStorageItem(STORAGE_KEYS.SUPPLIERS, []);
    this.settings = loadStorageItem(STORAGE_KEYS.SETTINGS, { ...DEFAULT_SETTINGS });
  }

  subscribe(callback) {
    if (typeof callback === 'function') {
      this.subscribers.push(callback);
    }
    return () => {
      this.subscribers = this.subscribers.filter(fn => fn !== callback);
    };
  }

  notify(event, payload) {
    this.subscribers.forEach(cb => {
      try {
        cb(event, payload);
      } catch (err) {
        console.error('Subscriber error:', err);
      }
    });
  }

  saveAll() {
    saveStorageItem(STORAGE_KEYS.PRODUCTS, this.products);
    saveStorageItem(STORAGE_KEYS.SALES, this.sales);
    saveStorageItem(STORAGE_KEYS.MOVEMENTS, this.movements);
    saveStorageItem(STORAGE_KEYS.SUPPLIERS, this.suppliers);
    saveStorageItem(STORAGE_KEYS.SETTINGS, this.settings);
  }

  // Formatting helpers
  getCurrencySymbol() {
    const cur = CURRENCIES[this.settings.currency] || CURRENCIES.NGN;
    return cur.symbol;
  }

  formatCurrency(value) {
    const num = Number(value) || 0;
    const curCode = this.settings.currency || 'NGN';
    const symbol = this.getCurrencySymbol();
    
    // Format with commas and 2 decimals
    const formatted = num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return `${symbol} ${formatted}`;
  }

  formatDate(isoString) {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  }

  formatDateTime(isoString) {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  }

  // Stock status logic
  getStockStatus(quantity, minStock) {
    const qty = Number(quantity) || 0;
    const min = Number(minStock) || Number(this.settings.defaultLowStockThreshold) || 5;

    if (qty <= 0) {
      return { code: 'OUT_OF_STOCK', label: 'Out of Stock', severity: 'danger' };
    }
    if (qty <= Math.max(1, Math.floor(min / 2))) {
      return { code: 'CRITICAL_STOCK', label: 'Critical Stock', severity: 'danger' };
    }
    if (qty <= min) {
      return { code: 'LOW_STOCK', label: 'Low Stock', severity: 'warning' };
    }
    return { code: 'IN_STOCK', label: 'In Stock', severity: 'success' };
  }

  // Product Operations
  getProducts() {
    return [...this.products];
  }

  getProductById(id) {
    return this.products.find(p => p.id === id) || null;
  }

  getProductBySku(sku) {
    if (!sku) return null;
    const clean = sku.trim().toLowerCase();
    return this.products.find(p => p.sku && p.sku.trim().toLowerCase() === clean) || null;
  }

  addProduct(productData) {
    // Check SKU duplicate
    if (productData.sku) {
      const existing = this.getProductBySku(productData.sku);
      if (existing) {
        throw new Error(`A product with SKU "${productData.sku}" already exists (${existing.name}).`);
      }
    }

    const id = 'PRD-' + Date.now();
    const minStock = Number(productData.minStock) >= 0 
      ? Number(productData.minStock) 
      : Number(this.settings.defaultLowStockThreshold) || 5;

    const initialQty = Math.max(0, Number(productData.quantity) || 0);

    const newProduct = {
      id,
      name: (productData.name || 'Unnamed Gadget').trim(),
      image: productData.image || generateGadgetSvg(productData.category, productData.brand || 'Gadget'),
      brand: (productData.brand || '').trim(),
      category: productData.category || 'Other Gadgets',
      model: (productData.model || '').trim(),
      sku: (productData.sku || `SKU-${Date.now().toString().slice(-6)}`).trim().toUpperCase(),
      imei: (productData.imei || '').trim(),
      purchasePrice: Math.max(0, Number(productData.purchasePrice) || 0),
      sellingPrice: Math.max(0, Number(productData.sellingPrice) || 0),
      quantity: initialQty,
      minStock: minStock,
      supplierName: (productData.supplierName || '').trim(),
      description: (productData.description || '').trim(),
      dateAdded: new Date().toISOString()
    };

    this.products.unshift(newProduct);

    // Record initial stock movement if quantity > 0
    if (initialQty > 0) {
      const movement = {
        id: 'MOV-' + Date.now(),
        productId: newProduct.id,
        productName: newProduct.name,
        sku: newProduct.sku,
        movementType: 'Incoming Restock',
        previousQuantity: 0,
        quantityChanged: initialQty,
        newQuantity: initialQty,
        date: newProduct.dateAdded,
        reason: 'Initial inventory stock registered'
      };
      this.movements.unshift(movement);
    }

    this.saveAll();
    this.notify('PRODUCT_ADDED', newProduct);
    return newProduct;
  }

  updateProduct(id, updates) {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Product not found.');
    }

    const current = this.products[index];

    // Check SKU duplicate if modified
    if (updates.sku && updates.sku.trim().toLowerCase() !== (current.sku || '').trim().toLowerCase()) {
      const existing = this.getProductBySku(updates.sku);
      if (existing && existing.id !== id) {
        throw new Error(`Another product already uses SKU "${updates.sku}".`);
      }
    }

    const prevQty = current.quantity;
    const newQty = updates.quantity !== undefined ? Math.max(0, Number(updates.quantity)) : prevQty;

    const updatedProduct = {
      ...current,
      name: updates.name !== undefined ? updates.name.trim() : current.name,
      image: updates.image || current.image,
      brand: updates.brand !== undefined ? updates.brand.trim() : current.brand,
      category: updates.category || current.category,
      model: updates.model !== undefined ? updates.model.trim() : current.model,
      sku: updates.sku !== undefined ? updates.sku.trim().toUpperCase() : current.sku,
      imei: updates.imei !== undefined ? updates.imei.trim() : current.imei,
      purchasePrice: updates.purchasePrice !== undefined ? Math.max(0, Number(updates.purchasePrice)) : current.purchasePrice,
      sellingPrice: updates.sellingPrice !== undefined ? Math.max(0, Number(updates.sellingPrice)) : current.sellingPrice,
      quantity: newQty,
      minStock: updates.minStock !== undefined ? Math.max(0, Number(updates.minStock)) : current.minStock,
      supplierName: updates.supplierName !== undefined ? updates.supplierName.trim() : current.supplierName,
      description: updates.description !== undefined ? updates.description.trim() : current.description
    };

    this.products[index] = updatedProduct;

    // If quantity was altered directly in edit mode, log a stock audit movement
    if (newQty !== prevQty) {
      const diff = newQty - prevQty;
      const movement = {
        id: 'MOV-' + Date.now(),
        productId: updatedProduct.id,
        productName: updatedProduct.name,
        sku: updatedProduct.sku,
        movementType: diff > 0 ? 'Incoming Restock' : 'Manual Adjustment',
        previousQuantity: prevQty,
        quantityChanged: diff,
        newQuantity: newQty,
        date: new Date().toISOString(),
        reason: 'Quantity updated via product edit form'
      };
      this.movements.unshift(movement);
    }

    this.saveAll();
    this.notify('PRODUCT_UPDATED', updatedProduct);
    return updatedProduct;
  }

  deleteProduct(id) {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Product not found.');
    }
    const deleted = this.products.splice(index, 1)[0];
    this.saveAll();
    this.notify('PRODUCT_DELETED', deleted);
    return deleted;
  }

  // Stock Adjustment Operations
  adjustStock({ productId, movementType, quantityChange, reason }) {
    const product = this.getProductById(productId);
    if (!product) {
      throw new Error('Product not found.');
    }

    const change = Number(quantityChange);
    if (isNaN(change) || change === 0) {
      throw new Error('Quantity change must be a non-zero number.');
    }

    const previousQuantity = product.quantity;
    const newQuantity = previousQuantity + change;

    if (newQuantity < 0) {
      throw new Error(`Insufficient stock. Current stock is ${previousQuantity}, cannot reduce by ${Math.abs(change)}.`);
    }

    product.quantity = newQuantity;

    const movement = {
      id: 'MOV-' + Date.now(),
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      movementType: movementType || (change > 0 ? 'Incoming Restock' : 'Manual Adjustment'),
      previousQuantity,
      quantityChanged: change,
      newQuantity,
      date: new Date().toISOString(),
      reason: (reason || 'Manual inventory stock adjustment').trim()
    };

    this.movements.unshift(movement);
    this.saveAll();
    this.notify('STOCK_ADJUSTED', { product, movement });
    return { product, movement };
  }

  // Sales Operations
  recordSale({ productId, quantity, unitPrice, discount, paymentMethod, customerName, customerPhone, notes }) {
    const product = this.getProductById(productId);
    if (!product) {
      throw new Error('Product not found.');
    }

    const qtySold = Number(quantity);
    if (isNaN(qtySold) || qtySold <= 0) {
      throw new Error('Sale quantity must be at least 1.');
    }

    if (qtySold > product.quantity) {
      throw new Error(`Cannot sell ${qtySold} units. Only ${product.quantity} units are currently available.`);
    }

    const price = Number(unitPrice) >= 0 ? Number(unitPrice) : product.sellingPrice;
    const cost = Number(product.purchasePrice) || 0;
    const subtotal = qtySold * price;
    const disc = Math.max(0, Number(discount) || 0);

    if (disc > subtotal) {
      throw new Error(`Discount (${disc}) cannot be greater than subtotal (${subtotal}).`);
    }

    const totalAmount = subtotal - disc;
    const costTotal = qtySold * cost;
    const profit = totalAmount - costTotal;

    const year = new Date().getFullYear();
    const count = this.sales.length + 1;
    const receiptNumber = `REC-${year}-${String(count).padStart(4, '0')}`;

    // Deduct stock
    const prevQty = product.quantity;
    product.quantity -= qtySold;

    // Record stock movement
    const movement = {
      id: 'MOV-' + Date.now(),
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      movementType: 'Sale',
      previousQuantity: prevQty,
      quantityChanged: -qtySold,
      newQuantity: product.quantity,
      date: new Date().toISOString(),
      reason: `Sale recorded (${receiptNumber})`
    };
    this.movements.unshift(movement);

    const sale = {
      id: receiptNumber,
      receiptNumber,
      date: new Date().toISOString(),
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      category: product.category,
      quantity: qtySold,
      unitPrice: price,
      costPrice: cost,
      subtotal,
      discount: disc,
      totalAmount,
      profit,
      paymentMethod: paymentMethod || 'Cash',
      customerName: (customerName || 'Walk-in Customer').trim(),
      customerPhone: (customerPhone || '').trim(),
      notes: (notes || '').trim(),
      status: 'Completed'
    };

    this.sales.unshift(sale);
    this.saveAll();
    this.notify('SALE_RECORDED', sale);
    return sale;
  }

  cancelSale(saleId) {
    const sale = this.sales.find(s => s.id === saleId || s.receiptNumber === saleId);
    if (!sale) {
      throw new Error('Sale record not found.');
    }
    if (sale.status === 'Cancelled') {
      throw new Error('This sale is already cancelled.');
    }

    const product = this.getProductById(sale.productId);
    if (product) {
      const prevQty = product.quantity;
      product.quantity += sale.quantity;

      const movement = {
        id: 'MOV-' + Date.now(),
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        movementType: 'Customer Return',
        previousQuantity: prevQty,
        quantityChanged: sale.quantity,
        newQuantity: product.quantity,
        date: new Date().toISOString(),
        reason: `Reversal of cancelled sale (${sale.receiptNumber})`
      };
      this.movements.unshift(movement);
    }

    sale.status = 'Cancelled';
    this.saveAll();
    this.notify('SALE_CANCELLED', sale);
    return sale;
  }

  // Suppliers Operations
  getSuppliers() {
    return [...this.suppliers];
  }

  getSupplierById(id) {
    return this.suppliers.find(s => s.id === id) || null;
  }

  addSupplier(data) {
    const id = 'SUP-' + String(this.suppliers.length + 1).padStart(3, '0');
    const newSupplier = {
      id,
      name: (data.name || '').trim(),
      businessName: (data.businessName || data.name || '').trim(),
      phone: (data.phone || '').trim(),
      email: (data.email || '').trim(),
      address: (data.address || '').trim(),
      notes: (data.notes || '').trim(),
      createdAt: new Date().toISOString()
    };

    this.suppliers.push(newSupplier);
    this.saveAll();
    this.notify('SUPPLIER_ADDED', newSupplier);
    return newSupplier;
  }

  updateSupplier(id, data) {
    const supplier = this.getSupplierById(id);
    if (!supplier) {
      throw new Error('Supplier not found.');
    }

    supplier.name = data.name !== undefined ? data.name.trim() : supplier.name;
    supplier.businessName = data.businessName !== undefined ? data.businessName.trim() : supplier.businessName;
    supplier.phone = data.phone !== undefined ? data.phone.trim() : supplier.phone;
    supplier.email = data.email !== undefined ? data.email.trim() : supplier.email;
    supplier.address = data.address !== undefined ? data.address.trim() : supplier.address;
    supplier.notes = data.notes !== undefined ? data.notes.trim() : supplier.notes;

    this.saveAll();
    this.notify('SUPPLIER_UPDATED', supplier);
    return supplier;
  }

  deleteSupplier(id) {
    const index = this.suppliers.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Supplier not found.');
    }
    const deleted = this.suppliers.splice(index, 1)[0];
    this.saveAll();
    this.notify('SUPPLIER_DELETED', deleted);
    return deleted;
  }

  // Settings Operations
  getSettings() {
    return { ...this.settings };
  }

  updateSettings(newSettings) {
    this.settings = {
      ...this.settings,
      ...newSettings
    };
    this.saveAll();
    this.notify('SETTINGS_UPDATED', this.settings);
    return this.settings;
  }

  // Analytics & Dashboard Calculations
  getDashboardMetrics() {
    const totalProducts = this.products.length;
    let totalStockUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalInventoryValueCost = 0;
    let totalInventoryValueRetail = 0;

    const lowStockProducts = [];

    this.products.forEach(p => {
      const qty = Number(p.quantity) || 0;
      const min = Number(p.minStock) || 5;
      const cost = Number(p.purchasePrice) || 0;
      const retail = Number(p.sellingPrice) || 0;

      totalStockUnits += qty;
      totalInventoryValueCost += (qty * cost);
      totalInventoryValueRetail += (qty * retail);

      if (qty <= 0) {
        outOfStockCount++;
        lowStockProducts.push(p);
      } else if (qty <= min) {
        lowStockCount++;
        lowStockProducts.push(p);
      }
    });

    // Sort lowStockProducts: out of stock first, then lowest quantity
    lowStockProducts.sort((a, b) => a.quantity - b.quantity);

    let totalSalesRevenue = 0;
    let totalSalesProfit = 0;
    let completedSalesCount = 0;

    // Track product sales volume
    const productSalesMap = {};

    this.sales.forEach(sale => {
      if (sale.status === 'Completed') {
        completedSalesCount++;
        totalSalesRevenue += Number(sale.totalAmount) || 0;
        totalSalesProfit += Number(sale.profit) || 0;

        if (!productSalesMap[sale.productId]) {
          productSalesMap[sale.productId] = {
            id: sale.productId,
            name: sale.productName,
            sku: sale.sku,
            unitsSold: 0,
            revenue: 0
          };
        }
        productSalesMap[sale.productId].unitsSold += Number(sale.quantity) || 0;
        productSalesMap[sale.productId].revenue += Number(sale.totalAmount) || 0;
      }
    });

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    const recentSales = [...this.sales]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);

    const recentlyAdded = [...this.products]
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      .slice(0, 6);

    return {
      totalProducts,
      totalStockUnits,
      lowStockCount,
      outOfStockCount,
      totalInventoryValueRetail,
      totalInventoryValueCost,
      potentialProfit: totalInventoryValueRetail - totalInventoryValueCost,
      totalSalesRevenue,
      totalSalesProfit,
      completedSalesCount,
      recentSales,
      recentlyAdded,
      lowStockProducts,
      topSellingProducts
    };
  }

  // Reports data with filtering
  getReportData(timeframe = '30days', categoryFilter = 'All') {
    const now = new Date();
    let startDate = new Date(0);

    if (timeframe === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (timeframe === '7days') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === '30days') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeframe === 'thisMonth') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Filter sales
    const filteredSales = this.sales.filter(s => {
      const saleDate = new Date(s.date);
      const matchesTime = saleDate >= startDate;
      const matchesCat = categoryFilter === 'All' || s.category === categoryFilter;
      return matchesTime && matchesCat;
    });

    const completedSales = filteredSales.filter(s => s.status === 'Completed');

    const totalRevenue = completedSales.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0);
    const totalProfit = completedSales.reduce((acc, s) => acc + (Number(s.profit) || 0), 0);
    const totalTransactions = completedSales.length;
    const avgOrderValue = totalTransactions > 0 ? (totalRevenue / totalTransactions) : 0;
    const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;

    // Inventory metrics filtered by category
    const targetProducts = categoryFilter === 'All'
      ? this.products
      : this.products.filter(p => p.category === categoryFilter);

    let inventoryValuationCost = 0;
    let inventoryValuationRetail = 0;
    const slowMovingProducts = [];

    // Map sales units for target products
    const unitsSoldMap = {};
    completedSales.forEach(s => {
      unitsSoldMap[s.productId] = (unitsSoldMap[s.productId] || 0) + s.quantity;
    });

    targetProducts.forEach(p => {
      inventoryValuationCost += (p.quantity * p.purchasePrice);
      inventoryValuationRetail += (p.quantity * p.sellingPrice);

      const sold = unitsSoldMap[p.id] || 0;
      if (sold === 0) {
        slowMovingProducts.push({
          ...p,
          unitsSoldInPeriod: 0
        });
      }
    });

    // Best-selling
    const bestSelling = [...targetProducts]
      .map(p => ({
        ...p,
        unitsSoldInPeriod: unitsSoldMap[p.id] || 0,
        revenueInPeriod: (unitsSoldMap[p.id] || 0) * p.sellingPrice
      }))
      .filter(p => p.unitsSoldInPeriod > 0)
      .sort((a, b) => b.unitsSoldInPeriod - a.unitsSoldInPeriod)
      .slice(0, 8);

    return {
      timeframe,
      categoryFilter,
      totalRevenue,
      totalProfit,
      totalTransactions,
      avgOrderValue,
      profitMargin,
      inventoryValuationCost,
      inventoryValuationRetail,
      potentialInventoryProfit: inventoryValuationRetail - inventoryValuationCost,
      completedSales,
      bestSelling,
      slowMovingProducts: slowMovingProducts.slice(0, 8)
    };
  }

  // Backup & Restore
  exportBackupJSON() {
    const backup = {
      app: 'StockPilot',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      products: this.products,
      sales: this.sales,
      movements: this.movements,
      suppliers: this.suppliers,
      settings: this.settings
    };
    return JSON.stringify(backup, null, 2);
  }

  importBackupJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data || !Array.isArray(data.products) || !Array.isArray(data.sales)) {
        throw new Error('Invalid backup file format. Expected StockPilot JSON data structure.');
      }

      this.products = data.products;
      this.sales = data.sales || [];
      this.movements = data.movements || [];
      this.suppliers = data.suppliers || [];
      if (data.settings && typeof data.settings === 'object') {
        this.settings = { ...DEFAULT_SETTINGS, ...data.settings };
      }

      this.saveAll();
      this.notify('DATA_RESTORED', null);
      return true;
    } catch (e) {
      throw new Error(`Restore failed: ${e.message}`);
    }
  }

  resetToDemo() {
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    initStorage();
    this.init();
    this.notify('DATA_RESET', null);
  }

  clearAllData() {
    this.products = [];
    this.sales = [];
    this.movements = [];
    this.suppliers = [];
    this.saveAll();
    this.notify('DATA_CLEARED', null);
  }
}

// Global Store Instance
const store = new InventoryStore();


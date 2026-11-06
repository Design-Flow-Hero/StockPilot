/**
 * StockPilot – Gadget Inventory Manager
 * User Interface Controller & View Renderers
 */

const UI = {
  activeTab: 'dashboard',
  inventoryViewMode: 'table', // 'table' or 'grid'
  dashboardSalesRange: 7,
  alertsFilter: 'ALL',

  init() {
    this.populateCategories();
    this.setupModalClosers();
    this.bindGlobalSearch();
  },

  // Notification Toast Helper
  showToast(message, type = 'success', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else if (type === 'warning') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }

    toast.innerHTML = `
      ${iconSvg}
      <span class="toast-message">${message}</span>
      <button style="background:none;border:none;cursor:pointer;color:#94a3b8;font-size:16px;line-height:1;" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.25s ease';
        setTimeout(() => toast.remove(), 250);
      }
    }, duration);
  },

  // Confirmation Modal Helper
  showConfirm({ title = 'Confirm Action', message, confirmText = 'Confirm', isDanger = true, onConfirm }) {
    const modal = document.getElementById('modal-confirm');
    const titleEl = document.getElementById('modal-confirm-title');
    const msgEl = document.getElementById('modal-confirm-message');
    const proceedBtn = document.getElementById('modal-confirm-proceed');

    titleEl.textContent = title;
    msgEl.innerHTML = message;
    proceedBtn.textContent = confirmText;

    if (isDanger) {
      proceedBtn.className = 'btn btn-danger';
    } else {
      proceedBtn.className = 'btn btn-primary';
    }

    // Single-fire handler
    const handleProceed = () => {
      this.closeModal('modal-confirm');
      proceedBtn.removeEventListener('click', handleProceed);
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
    };

    proceedBtn.replaceWith(proceedBtn.cloneNode(true));
    document.getElementById('modal-confirm-proceed').addEventListener('click', handleProceed);

    this.openModal('modal-confirm');
  },

  // Modal Open/Close Controls
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  },

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  },

  setupModalClosers() {
    document.addEventListener('click', (e) => {
      if (e.target.hasAttribute('data-modal-close')) {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      } else if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
  },

  // Navigation Switching
  switchTab(tabId) {
    this.activeTab = tabId;

    // Update nav items
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(link => {
      if (link.dataset.tab === tabId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update section visibility
    document.querySelectorAll('.tab-section').forEach(sec => {
      if (sec.id === `tab-${tabId}`) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    // Update breadcrumb
    const titles = {
      dashboard: 'Dashboard Overview',
      inventory: 'Inventory Catalog',
      stock: 'Stock Tracking & Adjustments',
      sales: 'Sales Transactions',
      alerts: 'Low Stock & Restock Alerts',
      suppliers: 'Supplier Directory',
      reports: 'Reports & Business Intelligence',
      settings: 'Settings & Data Backup'
    };
    const breadcrumb = document.getElementById('breadcrumb-title');
    if (breadcrumb) {
      breadcrumb.textContent = titles[tabId] || 'StockPilot';
    }

    // Close mobile drawer if open
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');

    // Render tab content
    this.renderCurrentTab();
  },

  renderCurrentTab() {
    switch (this.activeTab) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'inventory':
        this.renderInventory();
        break;
      case 'stock':
        this.renderStockTracking();
        break;
      case 'sales':
        this.renderSales();
        break;
      case 'alerts':
        this.renderAlerts();
        break;
      case 'suppliers':
        this.renderSuppliers();
        break;
      case 'reports':
        this.renderReports();
        break;
      case 'settings':
        this.renderSettings();
        break;
      default:
        this.renderDashboard();
    }

    this.updateGlobalBadges();
  },

  updateGlobalBadges() {
    // Product count badge
    const pCount = document.getElementById('nav-count-products');
    if (pCount) pCount.textContent = store.products.length;

    // Alert badge
    const metrics = store.getDashboardMetrics();
    const alertTotal = metrics.lowStockCount + metrics.outOfStockCount;
    const aCount = document.getElementById('nav-count-alerts');
    if (aCount) {
      aCount.textContent = alertTotal;
      aCount.style.display = alertTotal > 0 ? 'inline-block' : 'none';
    }

    // Supplier count badge
    const sCount = document.getElementById('nav-count-suppliers');
    if (sCount) sCount.textContent = store.suppliers.length;

    // Sidebar Store Preview
    const storeName = document.getElementById('sidebar-store-name');
    if (storeName) storeName.textContent = store.settings.storeName || 'StockPilot Hub';

    const avatar = document.getElementById('sidebar-store-avatar');
    if (avatar) {
      const name = store.settings.storeName || 'StockPilot';
      avatar.textContent = name.substring(0, 2).toUpperCase();
    }
  },

  populateCategories() {
    const inventoryCat = document.getElementById('inventory-filter-category');
    const reportsCat = document.getElementById('reports-category');
    const productFormCat = document.getElementById('product-form-category');

    const optionsHtml = CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');

    if (inventoryCat) {
      inventoryCat.innerHTML = '<option value="All">All Categories</option>' + optionsHtml;
    }
    if (reportsCat) {
      reportsCat.innerHTML = '<option value="All">All Categories</option>' + optionsHtml;
    }
    if (productFormCat) {
      productFormCat.innerHTML = optionsHtml;
    }
  },

  bindGlobalSearch() {
    const input = document.getElementById('global-search-input');
    if (!input) return;

    input.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      if (query.length > 0) {
        if (this.activeTab !== 'inventory') {
          this.switchTab('inventory');
        }
        const invSearch = document.getElementById('inventory-search');
        if (invSearch) {
          invSearch.value = query;
          this.renderInventory();
        }
      }
    });
  },

  // ----------------------------------------------------
  // SECTION 1: DASHBOARD RENDERER
  // ----------------------------------------------------
  renderDashboard() {
    const metrics = store.getDashboardMetrics();

    // Top Stats
    document.getElementById('stat-total-products').textContent = metrics.totalProducts;
    
    // Unique brands count
    const brandsSet = new Set(store.products.map(p => p.brand).filter(Boolean));
    document.getElementById('stat-total-brands').textContent = `${brandsSet.size} Brands`;

    document.getElementById('stat-total-units').textContent = metrics.totalStockUnits.toLocaleString();
    document.getElementById('stat-low-stock').textContent = metrics.lowStockCount;
    document.getElementById('stat-out-of-stock').textContent = metrics.outOfStockCount;

    document.getElementById('stat-inventory-value').textContent = store.formatCurrency(metrics.totalInventoryValueRetail);
    document.getElementById('stat-inventory-cost').textContent = `Cost: ${store.formatCurrency(metrics.totalInventoryValueCost)}`;

    document.getElementById('stat-sales-revenue').textContent = store.formatCurrency(metrics.totalSalesRevenue);
    document.getElementById('stat-sales-profit').textContent = `Profit: ${store.formatCurrency(metrics.totalSalesProfit)}`;

    // Charts
    Charts.renderSalesChart('dashboard-sales-chart', store.sales, this.dashboardSalesRange);
    Charts.renderCategoryDonut('dashboard-category-chart', store.products);

    // Recent Sales Activity Table
    const recentSalesTbody = document.getElementById('dashboard-recent-sales-tbody');
    if (recentSalesTbody) {
      if (metrics.recentSales.length === 0) {
        recentSalesTbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;">No sales transactions recorded yet.</td>
          </tr>
        `;
      } else {
        recentSalesTbody.innerHTML = metrics.recentSales.map(sale => `
          <tr>
            <td>
              <span style="font-weight: 600; color: #0f172a;">${sale.receiptNumber}</span>
            </td>
            <td>
              <div style="font-weight: 500; color: #1e293b; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${sale.productName}">${sale.productName}</div>
            </td>
            <td><strong>${sale.quantity}</strong></td>
            <td><strong style="color: #0f172a;">${store.formatCurrency(sale.totalAmount)}</strong></td>
            <td>
              <span class="badge badge-neutral">${sale.paymentMethod}</span>
            </td>
            <td style="color: #64748b; font-size: 12px;">${store.formatDate(sale.date)}</td>
          </tr>
        `).join('');
      }
    }

    // Dashboard Restock Alerts List
    const alertsContainer = document.getElementById('dashboard-alerts-list');
    if (alertsContainer) {
      const alertItems = metrics.lowStockProducts.slice(0, 5);
      if (alertItems.length === 0) {
        alertsContainer.innerHTML = `
          <div style="text-align: center; color: #10b981; padding: 28px; font-size: 13px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" style="margin-bottom: 6px;">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <div>All products are comfortably stocked!</div>
          </div>
        `;
      } else {
        alertsContainer.innerHTML = alertItems.map(p => {
          const status = store.getStockStatus(p.quantity, p.minStock);
          const iconBg = status.code === 'OUT_OF_STOCK' ? '#fef2f2' : '#fef3c7';
          const iconColor = status.code === 'OUT_OF_STOCK' ? '#dc2626' : '#d97706';

          return `
            <div class="alert-item">
              <div class="alert-item-left">
                <div class="alert-icon-box" style="background-color: ${iconBg}; color: ${iconColor};">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div>
                  <div style="font-weight: 600; font-size: 13px; color: #0f172a; max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</div>
                  <div style="font-size: 11.5px; color: #64748b;">
                    Available: <strong style="color:${iconColor};">${p.quantity}</strong> units (Min: ${p.minStock})
                  </div>
                </div>
              </div>
              <div>
                <button class="btn btn-secondary btn-sm" onclick="App.openStockAdjustmentForProduct('${p.id}', 'Incoming Restock')">
                  Restock
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Top Selling Products Table
    const topSellingTbody = document.getElementById('dashboard-top-selling-tbody');
    if (topSellingTbody) {
      if (metrics.topSellingProducts.length === 0) {
        topSellingTbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #94a3b8; padding: 20px;">No sales recorded yet.</td></tr>`;
      } else {
        topSellingTbody.innerHTML = metrics.topSellingProducts.map(item => `
          <tr>
            <td>
              <div style="font-weight: 600; color: #0f172a;">${item.name}</div>
              <div style="font-size: 11.5px; color: #64748b;">SKU: ${item.sku}</div>
            </td>
            <td><span class="badge badge-success">${item.unitsSold} units</span></td>
            <td><strong style="color: #0f172a;">${store.formatCurrency(item.revenue)}</strong></td>
          </tr>
        `).join('');
      }
    }

    // Recently Added Products Table
    const recentlyAddedTbody = document.getElementById('dashboard-recently-added-tbody');
    if (recentlyAddedTbody) {
      if (metrics.recentlyAdded.length === 0) {
        recentlyAddedTbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 20px;">No products added yet.</td></tr>`;
      } else {
        recentlyAddedTbody.innerHTML = metrics.recentlyAdded.map(p => {
          const status = store.getStockStatus(p.quantity, p.minStock);
          return `
            <tr>
              <td>
                <div style="font-weight: 600; color: #0f172a; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.name}</div>
                <div style="font-size: 11.5px; color: #64748b;">${p.brand}</div>
              </td>
              <td style="font-size: 12px; color: #475569;">${p.category}</td>
              <td><strong style="color: #0f172a;">${store.formatCurrency(p.sellingPrice)}</strong></td>
              <td>
                <span class="badge badge-${status.severity}">
                  <span class="badge-dot"></span>
                  ${p.quantity} in stock
                </span>
              </td>
            </tr>
          `;
        }).join('');
      }
    }
  },

  // ----------------------------------------------------
  // SECTION 2: INVENTORY CATALOG RENDERER
  // ----------------------------------------------------
  renderInventory() {
    const searchVal = (document.getElementById('inventory-search')?.value || '').toLowerCase().trim();
    const catVal = document.getElementById('inventory-filter-category')?.value || 'All';
    const brandVal = document.getElementById('inventory-filter-brand')?.value || 'All';
    const statusVal = document.getElementById('inventory-filter-status')?.value || 'All';
    const sortVal = document.getElementById('inventory-sort-by')?.value || 'date_desc';

    // Populate dynamic Brand dropdown
    const brandSelect = document.getElementById('inventory-filter-brand');
    if (brandSelect && brandSelect.options.length <= 1) {
      const brands = Array.from(new Set(store.products.map(p => p.brand).filter(Boolean))).sort();
      brandSelect.innerHTML = '<option value="All">All Brands</option>' + 
        brands.map(b => `<option value="${b}">${b}</option>`).join('');
    }

    // Filter products
    let filtered = store.products.filter(p => {
      // Search
      const matchesSearch = !searchVal || 
        (p.name && p.name.toLowerCase().includes(searchVal)) ||
        (p.sku && p.sku.toLowerCase().includes(searchVal)) ||
        (p.brand && p.brand.toLowerCase().includes(searchVal)) ||
        (p.model && p.model.toLowerCase().includes(searchVal)) ||
        (p.imei && p.imei.toLowerCase().includes(searchVal));

      // Category
      const matchesCat = catVal === 'All' || p.category === catVal;

      // Brand
      const matchesBrand = brandVal === 'All' || p.brand === brandVal;

      // Stock Status
      const status = store.getStockStatus(p.quantity, p.minStock);
      const matchesStatus = statusVal === 'All' || 
        (statusVal === 'IN_STOCK' && status.code === 'IN_STOCK') ||
        (statusVal === 'LOW_STOCK' && (status.code === 'LOW_STOCK' || status.code === 'CRITICAL_STOCK')) ||
        (statusVal === 'OUT_OF_STOCK' && status.code === 'OUT_OF_STOCK');

      return matchesSearch && matchesCat && matchesBrand && matchesStatus;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortVal) {
        case 'name_asc': return a.name.localeCompare(b.name);
        case 'name_desc': return b.name.localeCompare(a.name);
        case 'price_asc': return a.sellingPrice - b.sellingPrice;
        case 'price_desc': return b.sellingPrice - a.sellingPrice;
        case 'qty_asc': return a.quantity - b.quantity;
        case 'qty_desc': return b.quantity - a.quantity;
        case 'date_asc': return new Date(a.dateAdded) - new Date(b.dateAdded);
        case 'date_desc':
        default:
          return new Date(b.dateAdded) - new Date(a.dateAdded);
      }
    });

    // Update summary pills
    const countEl = document.getElementById('inventory-filtered-count');
    const valueEl = document.getElementById('inventory-filtered-value');
    if (countEl) countEl.textContent = filtered.length;
    if (valueEl) {
      const totalVal = filtered.reduce((acc, p) => acc + (p.quantity * p.sellingPrice), 0);
      valueEl.textContent = store.formatCurrency(totalVal);
    }

    const tableContainer = document.getElementById('inventory-table-container');
    const gridContainer = document.getElementById('inventory-grid-container');
    const tbody = document.getElementById('inventory-products-tbody');

    if (this.inventoryViewMode === 'table') {
      tableContainer.style.display = 'block';
      gridContainer.style.display = 'none';

      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="9">
              <div class="empty-state">
                <div class="empty-state-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <div class="empty-state-title">No matching gadgets found</div>
                <div class="empty-state-description">Try adjusting your search criteria, category filters, or add a new gadget product.</div>
                <button class="btn btn-primary btn-sm" onclick="App.openAddProductModal()">Add Product</button>
              </div>
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = filtered.map(p => {
          const status = store.getStockStatus(p.quantity, p.minStock);
          return `
            <tr>
              <td>
                <div class="product-cell">
                  <img src="${p.image || generateGadgetSvg(p.category, p.brand)}" class="product-thumb" alt="${p.name}">
                  <div>
                    <div class="product-cell-name">${p.name}</div>
                    <div class="product-cell-meta">
                      <strong style="color: #475569;">${p.brand}</strong>
                      ${p.model ? `<span>• ${p.model}</span>` : ''}
                      ${p.imei ? `<span title="IMEI/SN">• SN: ${p.imei}</span>` : ''}
                    </div>
                  </div>
                </div>
              </td>
              <td><span class="badge badge-neutral">${p.category}</span></td>
              <td><code style="font-size: 11.5px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #334155;">${p.sku}</code></td>
              <td style="color: #64748b; font-size: 12.5px;">${store.formatCurrency(p.purchasePrice)}</td>
              <td><strong style="color: #0f172a;">${store.formatCurrency(p.sellingPrice)}</strong></td>
              <td>
                <span style="font-weight: 700; font-size: 14px; color: ${p.quantity === 0 ? '#ef4444' : '#0f172a'};">${p.quantity}</span>
                <span style="color: #94a3b8; font-size: 11px;"> / min ${p.minStock}</span>
              </td>
              <td>
                <span class="badge badge-${status.severity}">
                  <span class="badge-dot"></span>
                  ${status.label}
                </span>
              </td>
              <td style="font-size: 12px; color: #475569; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${p.supplierName || '—'}
              </td>
              <td style="text-align: right;">
                <div style="display: inline-flex; gap: 4px;">
                  <button class="btn-icon" title="View Details" onclick="App.openProductDetailModal('${p.id}')">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                  <button class="btn-icon" title="Restock / Adjust" onclick="App.openStockAdjustmentForProduct('${p.id}')">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                      <polyline points="17 6 23 6 23 12"/>
                    </svg>
                  </button>
                  <button class="btn-icon" title="Record Sale" onclick="App.openSaleForProduct('${p.id}')" ${p.quantity === 0 ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </button>
                  <button class="btn-icon" title="Edit Product" onclick="App.openEditProductModal('${p.id}')">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button class="btn-icon" style="color: #ef4444;" title="Delete Product" onclick="App.confirmDeleteProduct('${p.id}')">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }
    } else {
      // Grid Mode
      tableContainer.style.display = 'none';
      gridContainer.style.display = 'grid';

      if (filtered.length === 0) {
        gridContainer.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-title">No matching gadgets found</div>
          </div>
        `;
      } else {
        gridContainer.innerHTML = filtered.map(p => {
          const status = store.getStockStatus(p.quantity, p.minStock);
          return `
            <div class="product-card">
              <div class="product-card-image-wrap">
                <span class="product-card-category">${p.category}</span>
                <span class="product-card-badge">
                  <span class="badge badge-${status.severity}">
                    <span class="badge-dot"></span>
                    ${status.label}
                  </span>
                </span>
                <img src="${p.image || generateGadgetSvg(p.category, p.brand)}" class="product-card-image" alt="${p.name}">
              </div>
              <div class="product-card-content">
                <span class="product-card-brand">${p.brand}</span>
                <h4 class="product-card-title" title="${p.name}">${p.name}</h4>
                <div style="font-size: 11.5px; color: #64748b; margin-bottom: 8px;">
                  SKU: <strong>${p.sku}</strong>
                </div>
                <div class="product-card-pricing">
                  <div>
                    <div style="font-size: 10.5px; color: #94a3b8; text-transform: uppercase;">Selling Price</div>
                    <div class="product-card-price">${store.formatCurrency(p.sellingPrice)}</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 10.5px; color: #94a3b8; text-transform: uppercase;">In Stock</div>
                    <div class="product-card-stock" style="color: ${p.quantity === 0 ? '#ef4444' : '#0f172a'};">
                      ${p.quantity} units
                    </div>
                  </div>
                </div>
                <div class="product-card-actions">
                  <button class="btn btn-secondary btn-sm" onclick="App.openProductDetailModal('${p.id}')">Details</button>
                  <button class="btn btn-primary btn-sm" onclick="App.openSaleForProduct('${p.id}')" ${p.quantity === 0 ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}>Sell</button>
                  <button class="btn btn-secondary btn-sm" onclick="App.openStockAdjustmentForProduct('${p.id}')">Restock</button>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  },

  // ----------------------------------------------------
  // SECTION 3: STOCK TRACKING & ADJUSTMENTS RENDERER
  // ----------------------------------------------------
  renderStockTracking() {
    const searchVal = (document.getElementById('stock-search')?.value || '').toLowerCase().trim();
    const typeVal = document.getElementById('stock-filter-type')?.value || 'All';

    const filtered = store.movements.filter(m => {
      const matchesSearch = !searchVal ||
        (m.productName && m.productName.toLowerCase().includes(searchVal)) ||
        (m.sku && m.sku.toLowerCase().includes(searchVal)) ||
        (m.reason && m.reason.toLowerCase().includes(searchVal));

      const matchesType = typeVal === 'All' || m.movementType === typeVal;

      return matchesSearch && matchesType;
    });

    const countEl = document.getElementById('stock-movement-count');
    if (countEl) countEl.textContent = `${filtered.length} records`;

    const tbody = document.getElementById('stock-movements-tbody');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; color: #94a3b8; padding: 28px;">No stock movement records found.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(m => {
      let badgeClass = 'badge-neutral';
      let changeColor = '#0f172a';
      let changePrefix = '';

      if (m.quantityChanged > 0) {
        badgeClass = 'badge-success';
        changeColor = '#059669';
        changePrefix = '+';
      } else if (m.quantityChanged < 0) {
        if (m.movementType === 'Damaged') {
          badgeClass = 'badge-danger';
        } else if (m.movementType === 'Sale') {
          badgeClass = 'badge-info';
        } else {
          badgeClass = 'badge-warning';
        }
        changeColor = '#dc2626';
      }

      return `
        <tr>
          <td><code style="font-size: 11px; background: #f1f5f9; padding: 2px 5px; border-radius: 4px;">${m.id}</code></td>
          <td style="font-size: 12px; color: #64748b; white-space: nowrap;">${store.formatDateTime(m.date)}</td>
          <td>
            <div style="font-weight: 600; color: #0f172a; max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${m.productName}">${m.productName}</div>
            <div style="font-size: 11px; color: #64748b;">SKU: ${m.sku}</div>
          </td>
          <td>
            <span class="badge ${badgeClass}">${m.movementType}</span>
          </td>
          <td style="color: #64748b;">${m.previousQuantity}</td>
          <td>
            <strong style="color: ${changeColor}; font-size: 13.5px;">${changePrefix}${m.quantityChanged}</strong>
          </td>
          <td><strong style="color: #0f172a; font-size: 13.5px;">${m.newQuantity}</strong></td>
          <td style="font-size: 12.5px; color: #475569; max-width: 260px;">${m.reason || '—'}</td>
        </tr>
      `;
    }).join('');
  },

  // ----------------------------------------------------
  // SECTION 4: SALES TRANSACTIONS RENDERER
  // ----------------------------------------------------
  renderSales() {
    const searchVal = (document.getElementById('sales-search')?.value || '').toLowerCase().trim();
    const paymentVal = document.getElementById('sales-filter-payment')?.value || 'All';
    const statusVal = document.getElementById('sales-filter-status')?.value || 'All';

    const filtered = store.sales.filter(s => {
      const matchesSearch = !searchVal ||
        (s.receiptNumber && s.receiptNumber.toLowerCase().includes(searchVal)) ||
        (s.productName && s.productName.toLowerCase().includes(searchVal)) ||
        (s.customerName && s.customerName.toLowerCase().includes(searchVal)) ||
        (s.customerPhone && s.customerPhone.includes(searchVal));

      const matchesPayment = paymentVal === 'All' || s.paymentMethod === paymentVal;
      const matchesStatus = statusVal === 'All' || s.status === statusVal;

      return matchesSearch && matchesPayment && matchesStatus;
    });

    // Update Sales Highlight Cards
    const completedSales = store.sales.filter(s => s.status === 'Completed');
    const totalRev = completedSales.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0);
    const totalProf = completedSales.reduce((acc, s) => acc + (Number(s.profit) || 0), 0);
    const count = completedSales.length;
    const avg = count > 0 ? totalRev / count : 0;
    const margin = totalRev > 0 ? ((totalProf / totalRev) * 100).toFixed(1) : 0;

    document.getElementById('sales-stat-count').textContent = count;
    document.getElementById('sales-stat-revenue').textContent = store.formatCurrency(totalRev);
    document.getElementById('sales-stat-profit').textContent = store.formatCurrency(totalProf);
    document.getElementById('sales-stat-margin').textContent = `Margin: ${margin}%`;
    document.getElementById('sales-stat-avg').textContent = store.formatCurrency(avg);

    const tbody = document.getElementById('sales-transactions-tbody');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="12" style="text-align: center; color: #94a3b8; padding: 28px;">No sales transactions found.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(s => {
      const isCompleted = s.status === 'Completed';
      return `
        <tr>
          <td><strong style="color: #0f172a;">${s.receiptNumber}</strong></td>
          <td style="font-size: 12px; color: #64748b; white-space: nowrap;">${store.formatDateTime(s.date)}</td>
          <td>
            <div style="font-weight: 600; color: #0f172a; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${s.productName}">${s.productName}</div>
            <div style="font-size: 11px; color: #64748b;">SKU: ${s.sku}</div>
          </td>
          <td><strong>${s.quantity}</strong></td>
          <td style="font-size: 12px; color: #64748b;">${store.formatCurrency(s.unitPrice)}</td>
          <td style="font-size: 12px; color: ${s.discount > 0 ? '#ef4444' : '#94a3b8'};">
            ${s.discount > 0 ? `-${store.formatCurrency(s.discount)}` : '—'}
          </td>
          <td><strong style="color: #0f172a; font-size: 13.5px;">${store.formatCurrency(s.totalAmount)}</strong></td>
          <td style="font-size: 12px; color: #059669; font-weight: 600;">${store.formatCurrency(s.profit)}</td>
          <td><span class="badge badge-neutral">${s.paymentMethod}</span></td>
          <td style="font-size: 12px; color: #475569;">
            ${s.customerName || 'Walk-in'}
            ${s.customerPhone ? `<div style="font-size: 11px; color: #94a3b8;">${s.customerPhone}</div>` : ''}
          </td>
          <td>
            <span class="badge ${isCompleted ? 'badge-success' : 'badge-danger'}">
              <span class="badge-dot"></span>
              ${s.status}
            </span>
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <div style="display: inline-flex; gap: 4px;">
              <button class="btn btn-secondary btn-sm" title="View & Print Receipt" onclick="App.viewReceipt('${s.id}')">
                Receipt
              </button>
              ${isCompleted ? `
                <button class="btn btn-danger btn-sm" title="Cancel Sale and Restore Stock" onclick="App.confirmCancelSale('${s.id}')">
                  Cancel
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // ----------------------------------------------------
  // SECTION 5: RESTOCK & LOW STOCK ALERTS RENDERER
  // ----------------------------------------------------
  renderAlerts() {
    const filter = this.alertsFilter;

    // Filter products that need attention
    const alertProducts = store.products.filter(p => {
      const status = store.getStockStatus(p.quantity, p.minStock);
      if (filter === 'OUT_OF_STOCK') return status.code === 'OUT_OF_STOCK';
      if (filter === 'CRITICAL') return status.code === 'CRITICAL_STOCK';
      if (filter === 'LOW_STOCK') return status.code === 'LOW_STOCK';
      return status.code !== 'IN_STOCK'; // ALL alerts
    });

    // Sort: Out of stock first, then lowest quantity
    alertProducts.sort((a, b) => a.quantity - b.quantity);

    const tbody = document.getElementById('alerts-tbody');
    if (!tbody) return;

    if (alertProducts.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8">
            <div class="empty-state">
              <div class="empty-state-icon" style="background-color: #ecfdf5; color: #059669;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div class="empty-state-title">No Restock Alerts Right Now</div>
              <div class="empty-state-description">All gadget items in your catalog are currently above their configured minimum stock thresholds.</div>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = alertProducts.map(p => {
      const status = store.getStockStatus(p.quantity, p.minStock);
      const suggested = Math.max(1, (p.minStock * 2) - p.quantity);

      return `
        <tr>
          <td>
            <div class="product-cell">
              <img src="${p.image || generateGadgetSvg(p.category, p.brand)}" class="product-thumb" alt="${p.name}">
              <div>
                <div class="product-cell-name">${p.name}</div>
                <div class="product-cell-meta">
                  <strong>${p.brand}</strong> • SKU: ${p.sku}
                </div>
              </div>
            </div>
          </td>
          <td><span class="badge badge-neutral">${p.category}</span></td>
          <td>
            <strong style="color: ${p.quantity === 0 ? '#ef4444' : '#d97706'}; font-size: 15px;">
              ${p.quantity} units
            </strong>
          </td>
          <td style="color: #64748b;">${p.minStock} units</td>
          <td>
            <strong style="color: #10b981; font-size: 13.5px;">+${suggested} units</strong>
          </td>
          <td>
            <span class="badge badge-${status.severity}">
              <span class="badge-dot"></span>
              ${status.label}
            </span>
          </td>
          <td style="font-size: 12.5px; color: #334155;">
            ${p.supplierName || '—'}
          </td>
          <td style="text-align: right;">
            <button class="btn btn-primary btn-sm" onclick="App.openStockAdjustmentForProduct('${p.id}', 'Incoming Restock', ${suggested})">
              Restock Now
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  // ----------------------------------------------------
  // SECTION 6: SUPPLIER MANAGEMENT RENDERER
  // ----------------------------------------------------
  renderSuppliers() {
    const searchVal = (document.getElementById('suppliers-search')?.value || '').toLowerCase().trim();

    const filtered = store.suppliers.filter(s => {
      return !searchVal ||
        (s.name && s.name.toLowerCase().includes(searchVal)) ||
        (s.businessName && s.businessName.toLowerCase().includes(searchVal)) ||
        (s.phone && s.phone.includes(searchVal)) ||
        (s.email && s.email.toLowerCase().includes(searchVal));
    });

    const tbody = document.getElementById('suppliers-tbody');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state">
              <div class="empty-state-title">No suppliers found</div>
              <div class="empty-state-description">Add trusted hardware distributors, smartphone wholesalers, and accessory suppliers.</div>
              <button class="btn btn-primary btn-sm" onclick="App.openAddSupplierModal()">Add Supplier</button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(s => {
      // Count products linked with this supplier
      const linkedProducts = store.products.filter(p => p.supplierName && p.supplierName.trim().toLowerCase() === s.name.trim().toLowerCase());

      return `
        <tr>
          <td>
            <strong style="color: #0f172a; font-size: 13.5px;">${s.name}</strong>
            ${s.notes ? `<div style="font-size: 11px; color: #64748b; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${s.notes}</div>` : ''}
          </td>
          <td style="font-size: 12.5px; color: #334155;">${s.businessName || '—'}</td>
          <td><a href="tel:${s.phone}" style="color: #0284c7; text-decoration: none; font-weight: 500;">${s.phone}</a></td>
          <td><a href="mailto:${s.email}" style="color: #475569; text-decoration: none;">${s.email || '—'}</a></td>
          <td style="font-size: 12px; color: #64748b; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${s.address || '—'}</td>
          <td>
            <span class="badge badge-info">${linkedProducts.length} gadgets</span>
          </td>
          <td style="text-align: right;">
            <div style="display: inline-flex; gap: 4px;">
              <button class="btn-icon" title="Edit Supplier" onclick="App.openEditSupplierModal('${s.id}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="btn-icon" style="color: #ef4444;" title="Delete Supplier" onclick="App.confirmDeleteSupplier('${s.id}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // ----------------------------------------------------
  // SECTION 7: REPORTS & ANALYTICS RENDERER
  // ----------------------------------------------------
  renderReports() {
    const timeframe = document.getElementById('reports-timeframe')?.value || '30days';
    const category = document.getElementById('reports-category')?.value || 'All';

    const report = store.getReportData(timeframe, category);

    // KPI Cards
    document.getElementById('report-stat-revenue').textContent = store.formatCurrency(report.totalRevenue);
    document.getElementById('report-stat-transactions').textContent = `${report.totalTransactions} transactions (Avg: ${store.formatCurrency(report.avgOrderValue)})`;

    document.getElementById('report-stat-profit').textContent = store.formatCurrency(report.totalProfit);
    document.getElementById('report-stat-margin').textContent = `Margin: ${report.profitMargin}%`;

    document.getElementById('report-stat-inventory-retail').textContent = store.formatCurrency(report.inventoryValuationRetail);
    document.getElementById('report-stat-inventory-cost').textContent = `Cost basis: ${store.formatCurrency(report.inventoryValuationCost)}`;

    document.getElementById('report-stat-unrealized-profit').textContent = store.formatCurrency(report.potentialInventoryProfit);

    // Best-selling table
    const bestSellingTbody = document.getElementById('reports-best-selling-tbody');
    if (bestSellingTbody) {
      if (report.bestSelling.length === 0) {
        bestSellingTbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #94a3b8; padding: 20px;">No sales recorded in this period.</td></tr>`;
      } else {
        bestSellingTbody.innerHTML = report.bestSelling.map(p => `
          <tr>
            <td>
              <div style="font-weight: 600; color: #0f172a;">${p.name}</div>
              <div style="font-size: 11px; color: #64748b;">${p.brand} • ${p.category}</div>
            </td>
            <td><span class="badge badge-success">${p.unitsSoldInPeriod} units</span></td>
            <td><strong style="color: #0f172a;">${store.formatCurrency(p.revenueInPeriod)}</strong></td>
          </tr>
        `).join('');
      }
    }

    // Slow-moving table
    const slowMovingTbody = document.getElementById('reports-slow-moving-tbody');
    if (slowMovingTbody) {
      if (report.slowMovingProducts.length === 0) {
        slowMovingTbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #10b981; padding: 20px;">Great news! Every product has registered active sales.</td></tr>`;
      } else {
        slowMovingTbody.innerHTML = report.slowMovingProducts.map(p => `
          <tr>
            <td>
              <div style="font-weight: 600; color: #0f172a;">${p.name}</div>
              <div style="font-size: 11px; color: #64748b;">SKU: ${p.sku}</div>
            </td>
            <td><strong>${p.quantity} units</strong></td>
            <td style="color: #64748b;">${store.formatCurrency(p.quantity * p.sellingPrice)}</td>
          </tr>
        `).join('');
      }
    }
  },

  // ----------------------------------------------------
  // SECTION 8: SETTINGS RENDERER
  // ----------------------------------------------------
  renderSettings() {
    const s = store.settings;
    const nameEl = document.getElementById('settings-store-name');
    const taglineEl = document.getElementById('settings-store-tagline');
    const phoneEl = document.getElementById('settings-store-phone');
    const emailEl = document.getElementById('settings-store-email');
    const addressEl = document.getElementById('settings-store-address');
    const currencyEl = document.getElementById('settings-currency');
    const thresholdEl = document.getElementById('settings-low-stock-threshold');
    const footerEl = document.getElementById('settings-receipt-footer');

    if (nameEl) nameEl.value = s.storeName || '';
    if (taglineEl) taglineEl.value = s.storeTagline || '';
    if (phoneEl) phoneEl.value = s.storePhone || '';
    if (emailEl) emailEl.value = s.storeEmail || '';
    if (addressEl) addressEl.value = s.storeAddress || '';
    if (currencyEl) currencyEl.value = s.currency || 'NGN';
    if (thresholdEl) thresholdEl.value = s.defaultLowStockThreshold || 5;
    if (footerEl) footerEl.value = s.receiptFooter || '';
  },

  // ----------------------------------------------------
  // RECEIPT MODAL RENDERER
  // ----------------------------------------------------
  renderReceiptModal(sale) {
    const container = document.getElementById('receipt-container');
    if (!container || !sale) return;

    const s = store.settings;
    const isCancelled = sale.status === 'Cancelled';

    container.innerHTML = `
      <div class="receipt-header">
        <div class="receipt-store-name">${s.storeName || 'StockPilot Hub'}</div>
        <div class="receipt-store-address">${s.storeAddress || ''}</div>
        <div style="font-size: 11px; color: #64748b;">Phone: ${s.storePhone || ''} | ${s.storeEmail || ''}</div>
        ${isCancelled ? '<div style="margin-top: 8px; color: #dc2626; font-weight: 800; font-size: 14px; text-transform: uppercase;">[VOIDED / CANCELLED SALE]</div>' : ''}
      </div>

      <div class="receipt-meta">
        <div>
          <div><strong>Receipt #:</strong> ${sale.receiptNumber}</div>
          <div><strong>Date:</strong> ${store.formatDateTime(sale.date)}</div>
        </div>
        <div style="text-align: right;">
          <div><strong>Payment:</strong> ${sale.paymentMethod}</div>
          <div><strong>Customer:</strong> ${sale.customerName || 'Walk-in'}</div>
        </div>
      </div>

      <table class="receipt-table">
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div style="font-weight: 600; color: #0f172a;">${sale.productName}</div>
              <div style="font-size: 10px; color: #64748b;">SKU: ${sale.sku}</div>
            </td>
            <td style="text-align: center;">${sale.quantity}</td>
            <td style="text-align: right;">${store.formatCurrency(sale.unitPrice)}</td>
            <td style="text-align: right;">${store.formatCurrency(sale.subtotal)}</td>
          </tr>
        </tbody>
      </table>

      <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; font-size: 12px; display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; justify-content: space-between;">
          <span>Subtotal:</span>
          <span>${store.formatCurrency(sale.subtotal)}</span>
        </div>
        ${sale.discount > 0 ? `
          <div style="display: flex; justify-content: space-between; color: #ef4444;">
            <span>Discount Applied:</span>
            <span>-${store.formatCurrency(sale.discount)}</span>
          </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 800; color: #0f172a; border-top: 1px solid #0f172a; padding-top: 6px; margin-top: 4px;">
          <span>AMOUNT PAID:</span>
          <span>${store.formatCurrency(sale.totalAmount)}</span>
        </div>
      </div>

      <div class="receipt-footer-notes">
        <div>${s.receiptFooter || 'Thank you for your business!'}</div>
        <div style="margin-top: 10px; font-family: monospace; letter-spacing: 3px; font-size: 10px; color: #94a3b8;">
          * * * * ${sale.receiptNumber} * * * *
        </div>
      </div>
    `;

    this.openModal('modal-receipt');
  },

  // ----------------------------------------------------
  // CSV EXPORT UTILITY
  // ----------------------------------------------------
  exportCSV(filename, rows) {
    if (!rows || !rows.length) {
      this.showToast('No records available to export.', 'warning');
      return;
    }

    const separator = ',';
    const keys = Object.keys(rows[0]);

    const csvContent = '\uFEFF' + [
      keys.join(separator),
      ...rows.map(row => keys.map(k => {
        let val = row[k] === null || row[k] === undefined ? '' : String(row[k]);
        val = val.replace(/"/g, '""');
        if (val.search(/("|,|\n)/g) >= 0) {
          val = `"${val}"`;
        }
        return val;
      }).join(separator))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};


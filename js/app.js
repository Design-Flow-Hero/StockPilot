/**
 * StockPilot – Gadget Inventory Manager
 * Main Application Controller & Event Orchestrator
 */

const App = {
  selectedProductImageBase64: '',

  init() {
    // Initialize UI components
    UI.init();

    // Subscribe UI renderer to all store mutations
    store.subscribe((event, payload) => {
      UI.renderCurrentTab();
    });

    // Setup navigation and hash changes
    this.setupNavigation();

    // Setup form submit listeners
    this.setupProductForm();
    this.setupSaleForm();
    this.setupStockAdjustmentForm();
    this.setupSupplierForm();
    this.setupSettingsForm();

    // Setup filter and search listeners
    this.setupFilterListeners();

    // Setup backup and data buttons
    this.setupBackupAndRestore();

    // Setup CSV export triggers
    this.setupExportButtons();

    // Initial render from hash or default dashboard
    const initialTab = window.location.hash.replace('#', '') || 'dashboard';
    UI.switchTab(initialTab);
  },

  // ----------------------------------------------------
  // NAVIGATION SETUP
  // ----------------------------------------------------
  setupNavigation() {
    // Sidebar nav click delegation
    document.querySelectorAll('[data-tab]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = el.dataset.tab;
        window.location.hash = tab;
        UI.switchTab(tab);
      });
    });

    // Hash change handler
    window.addEventListener('hashchange', () => {
      const tab = window.location.hash.replace('#', '') || 'dashboard';
      UI.switchTab(tab);
    });

    // Mobile Hamburger Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (mobileMenuBtn && sidebar && overlay) {
      mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
      });

      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      });
    }

    // Top action buttons
    document.getElementById('btn-top-sale')?.addEventListener('click', () => this.openSaleModal());
    document.getElementById('btn-top-add-product')?.addEventListener('click', () => this.openAddProductModal());

    // Dashboard quick action buttons
    document.getElementById('btn-quick-add-product')?.addEventListener('click', () => this.openAddProductModal());
    document.getElementById('btn-quick-record-sale')?.addEventListener('click', () => this.openSaleModal());
    document.getElementById('btn-quick-restock')?.addEventListener('click', () => this.openStockAdjustmentModal());
    document.getElementById('btn-quick-view-products')?.addEventListener('click', () => UI.switchTab('inventory'));
    document.getElementById('btn-dashboard-view-all-sales')?.addEventListener('click', () => UI.switchTab('sales'));
    document.getElementById('btn-dashboard-view-all-alerts')?.addEventListener('click', () => UI.switchTab('alerts'));

    // View Mode Toggle (Table vs Grid)
    const btnTable = document.getElementById('view-mode-table');
    const btnGrid = document.getElementById('view-mode-grid');

    btnTable?.addEventListener('click', () => {
      UI.inventoryViewMode = 'table';
      btnTable.classList.add('active');
      btnGrid.classList.remove('active');
      UI.renderInventory();
    });

    btnGrid?.addEventListener('click', () => {
      UI.inventoryViewMode = 'grid';
      btnGrid.classList.add('active');
      btnTable.classList.remove('active');
      UI.renderInventory();
    });

    // Inventory Add Product
    document.getElementById('btn-inventory-add-product')?.addEventListener('click', () => this.openAddProductModal());
    document.getElementById('btn-open-stock-adjustment-modal')?.addEventListener('click', () => this.openStockAdjustmentModal());
    document.getElementById('btn-sales-record-modal')?.addEventListener('click', () => this.openSaleModal());
    document.getElementById('btn-add-supplier-modal')?.addEventListener('click', () => this.openAddSupplierModal());

    // Receipt Print Button
    document.getElementById('btn-print-receipt')?.addEventListener('click', () => {
      window.print();
    });
  },

  // ----------------------------------------------------
  // PRODUCT MANAGEMENT
  // ----------------------------------------------------
  setupProductForm() {
    const form = document.getElementById('product-form');
    const fileInput = document.getElementById('product-form-image-file');
    const previewImg = document.getElementById('product-form-image-preview');

    // Image Upload Handler
    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          UI.showToast('Image file too large (max 2MB)', 'warning');
          return;
        }
        const reader = new FileReader();
        reader.onload = (evt) => {
          this.selectedProductImageBase64 = evt.target.result;
          if (previewImg) previewImg.src = this.selectedProductImageBase64;
        };
        reader.readAsDataURL(file);
      }
    });

    // Form Submit (Add or Edit)
    form?.addEventListener('submit', (e) => {
      e.preventDefault();

      const productId = document.getElementById('product-form-id').value;
      const name = document.getElementById('product-form-name').value.trim();
      const category = document.getElementById('product-form-category').value;
      const brand = document.getElementById('product-form-brand').value.trim();
      const model = document.getElementById('product-form-model').value.trim();
      const sku = document.getElementById('product-form-sku').value.trim().toUpperCase();
      const imei = document.getElementById('product-form-imei').value.trim();
      const purchasePrice = parseFloat(document.getElementById('product-form-purchase-price').value);
      const sellingPrice = parseFloat(document.getElementById('product-form-selling-price').value);
      const quantity = parseInt(document.getElementById('product-form-quantity').value, 10);
      const minStock = parseInt(document.getElementById('product-form-min-stock').value, 10);
      const supplierName = document.getElementById('product-form-supplier').value;
      const description = document.getElementById('product-form-description').value.trim();

      // Validation
      if (!name) return UI.showToast('Product name is required.', 'error');
      if (!sku) return UI.showToast('SKU is required.', 'error');
      if (isNaN(purchasePrice) || purchasePrice < 0) return UI.showToast('Invalid purchase price.', 'error');
      if (isNaN(sellingPrice) || sellingPrice < 0) return UI.showToast('Invalid selling price.', 'error');
      if (isNaN(quantity) || quantity < 0) return UI.showToast('Quantity cannot be negative.', 'error');
      if (isNaN(minStock) || minStock < 0) return UI.showToast('Minimum stock cannot be negative.', 'error');

      const image = this.selectedProductImageBase64 || generateGadgetSvg(category, brand);

      try {
        if (productId) {
          // Edit existing
          store.updateProduct(productId, {
            name,
            category,
            brand,
            model,
            sku,
            imei,
            purchasePrice,
            sellingPrice,
            quantity,
            minStock,
            supplierName,
            description,
            image
          });
          UI.showToast(`Updated "${name}" successfully.`, 'success');
        } else {
          // Add new
          store.addProduct({
            name,
            category,
            brand,
            model,
            sku,
            imei,
            purchasePrice,
            sellingPrice,
            quantity,
            minStock,
            supplierName,
            description,
            image
          });
          UI.showToast(`Added "${name}" to inventory.`, 'success');
        }

        UI.closeModal('modal-product');
      } catch (err) {
        UI.showToast(err.message, 'error');
      }
    });
  },

  openAddProductModal() {
    const form = document.getElementById('product-form');
    if (!form) return;
    form.reset();

    document.getElementById('modal-product-title').textContent = 'Add New Gadget Product';
    document.getElementById('product-form-id').value = '';
    document.getElementById('product-form-quantity').disabled = false;
    document.getElementById('product-form-min-stock').value = store.settings.defaultLowStockThreshold || 5;

    // Populate suppliers dropdown
    this.populateSupplierDropdown('product-form-supplier');

    // Reset image
    this.selectedProductImageBase64 = '';
    const previewImg = document.getElementById('product-form-image-preview');
    if (previewImg) previewImg.src = generateGadgetSvg('Smartphones', 'New');

    UI.openModal('modal-product');
  },

  openEditProductModal(productId) {
    const product = store.getProductById(productId);
    if (!product) return;

    document.getElementById('modal-product-title').textContent = 'Edit Gadget Product';
    document.getElementById('product-form-id').value = product.id;
    document.getElementById('product-form-name').value = product.name;
    document.getElementById('product-form-category').value = product.category;
    document.getElementById('product-form-brand').value = product.brand;
    document.getElementById('product-form-model').value = product.model || '';
    document.getElementById('product-form-sku').value = product.sku;
    document.getElementById('product-form-imei').value = product.imei || '';
    document.getElementById('product-form-purchase-price').value = product.purchasePrice;
    document.getElementById('product-form-selling-price').value = product.sellingPrice;
    document.getElementById('product-form-quantity').value = product.quantity;
    document.getElementById('product-form-min-stock').value = product.minStock;
    document.getElementById('product-form-description').value = product.description || '';

    // Populate suppliers dropdown
    this.populateSupplierDropdown('product-form-supplier', product.supplierName);

    this.selectedProductImageBase64 = product.image || '';
    const previewImg = document.getElementById('product-form-image-preview');
    if (previewImg) {
      previewImg.src = product.image || generateGadgetSvg(product.category, product.brand);
    }

    UI.openModal('modal-product');
  },

  openProductDetailModal(productId) {
    const p = store.getProductById(productId);
    if (!p) return;

    const status = store.getStockStatus(p.quantity, p.minStock);
    const container = document.getElementById('product-detail-content');
    const editBtn = document.getElementById('btn-detail-edit');

    const margin = p.sellingPrice > 0 ? (((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100).toFixed(1) : 0;
    const totalInventoryValue = p.quantity * p.sellingPrice;

    container.innerHTML = `
      <div style="display: flex; gap: 20px; align-items: flex-start; margin-bottom: 20px;">
        <div style="width: 110px; height: 110px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;">
          <img src="${p.image || generateGadgetSvg(p.category, p.brand)}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
        </div>
        <div style="flex: 1;">
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">${p.brand} • ${p.category}</div>
          <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 4px 0 8px; line-height: 1.3;">${p.name}</h2>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <span class="badge badge-${status.severity}">
              <span class="badge-dot"></span>
              ${status.label} (${p.quantity} units)
            </span>
            <code style="font-size: 11.5px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">SKU: ${p.sku}</code>
            ${p.model ? `<code style="font-size: 11.5px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">Model: ${p.model}</code>` : ''}
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: #f8fafc; padding: 14px; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
        <div>
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Purchase Cost</div>
          <div style="font-size: 15px; font-weight: 700; color: #0f172a;">${store.formatCurrency(p.purchasePrice)}</div>
        </div>
        <div>
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Selling Price</div>
          <div style="font-size: 15px; font-weight: 700; color: #10b981;">${store.formatCurrency(p.sellingPrice)}</div>
        </div>
        <div>
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Gross Margin</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">${margin}%</div>
        </div>
      </div>

      <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
        <div><strong>Total Retail Value on Hand:</strong> ${store.formatCurrency(totalInventoryValue)}</div>
        <div><strong>Min Stock Threshold:</strong> ${p.minStock} units</div>
        ${p.imei ? `<div><strong>IMEI / Serial Number:</strong> ${p.imei}</div>` : ''}
        <div><strong>Supplier:</strong> ${p.supplierName || 'Not specified'}</div>
        <div><strong>Date Added:</strong> ${store.formatDate(p.dateAdded)}</div>
        ${p.description ? `<div style="margin-top: 6px;"><strong>Description:</strong><p style="margin-top: 4px; line-height: 1.4; color: #334155;">${p.description}</p></div>` : ''}
      </div>
    `;

    if (editBtn) {
      editBtn.onclick = () => {
        UI.closeModal('modal-product-detail');
        this.openEditProductModal(p.id);
      };
    }

    UI.openModal('modal-product-detail');
  },

  confirmDeleteProduct(productId) {
    const product = store.getProductById(productId);
    if (!product) return;

    UI.showConfirm({
      title: 'Delete Product',
      message: `Are you sure you want to delete <strong>${product.name}</strong> (SKU: ${product.sku})? This cannot be undone.`,
      confirmText: 'Delete Gadget',
      isDanger: true,
      onConfirm: () => {
        store.deleteProduct(productId);
        UI.showToast(`Deleted "${product.name}".`, 'info');
      }
    });
  },

  // ----------------------------------------------------
  // SALES MANAGEMENT & MODALS
  // ----------------------------------------------------
  setupSaleForm() {
    const form = document.getElementById('sale-form');
    const productSelect = document.getElementById('sale-form-product');
    const qtyInput = document.getElementById('sale-form-quantity');
    const unitPriceInput = document.getElementById('sale-form-unit-price');
    const discountInput = document.getElementById('sale-form-discount');

    const updateCalculations = () => {
      const selectedId = productSelect.value;
      const product = store.getProductById(selectedId);
      const qty = parseInt(qtyInput.value, 10) || 0;
      const price = parseFloat(unitPriceInput.value) || 0;
      const discount = parseFloat(discountInput.value) || 0;

      const subtotal = qty * price;
      const total = Math.max(0, subtotal - discount);

      document.getElementById('sale-calc-subtotal').textContent = store.formatCurrency(subtotal);
      document.getElementById('sale-calc-discount').textContent = `- ${store.formatCurrency(discount)}`;
      document.getElementById('sale-calc-total').textContent = store.formatCurrency(total);

      // Stock indicator pill
      const stockPill = document.getElementById('sale-stock-pill');
      if (product) {
        stockPill.style.display = 'block';
        document.getElementById('sale-stock-available').textContent = product.quantity;
        document.getElementById('sale-unit-price-display').textContent = store.formatCurrency(price);
        qtyInput.max = product.quantity;
      } else {
        stockPill.style.display = 'none';
      }
    };

    productSelect?.addEventListener('change', () => {
      const product = store.getProductById(productSelect.value);
      if (product) {
        unitPriceInput.value = product.sellingPrice;
        qtyInput.value = 1;
        qtyInput.max = product.quantity;
      }
      updateCalculations();
    });

    qtyInput?.addEventListener('input', updateCalculations);
    unitPriceInput?.addEventListener('input', updateCalculations);
    discountInput?.addEventListener('input', updateCalculations);

    // Sale Form Submit
    form?.addEventListener('submit', (e) => {
      e.preventDefault();

      const productId = productSelect.value;
      const quantity = parseInt(qtyInput.value, 10);
      const unitPrice = parseFloat(unitPriceInput.value);
      const discount = parseFloat(discountInput.value) || 0;
      const paymentMethod = document.getElementById('sale-form-payment').value;
      const customerName = document.getElementById('sale-form-customer-name').value;
      const customerPhone = document.getElementById('sale-form-customer-phone').value;
      const notes = document.getElementById('sale-form-notes').value;

      try {
        const sale = store.recordSale({
          productId,
          quantity,
          unitPrice,
          discount,
          paymentMethod,
          customerName,
          customerPhone,
          notes
        });

        UI.closeModal('modal-sale');
        form.reset();
        UI.showToast(`Sale recorded successfully! (Receipt ${sale.receiptNumber})`, 'success');
        
        // Show printable receipt modal immediately
        UI.renderReceiptModal(sale);
      } catch (err) {
        UI.showToast(err.message, 'error');
      }
    });
  },

  openSaleModal(preselectedProductId = null) {
    const form = document.getElementById('sale-form');
    if (!form) return;
    form.reset();

    const productSelect = document.getElementById('sale-form-product');
    // Populate products dropdown with in-stock products
    const inStockProducts = store.products.filter(p => p.quantity > 0);

    productSelect.innerHTML = '<option value="">-- Choose in-stock gadget --</option>' +
      inStockProducts.map(p => `
        <option value="${p.id}" ${p.id === preselectedProductId ? 'selected' : ''}>
          ${p.name} (Stock: ${p.quantity} | ${store.formatCurrency(p.sellingPrice)})
        </option>
      `).join('');

    if (inStockProducts.length === 0) {
      UI.showToast('No products are currently in stock to record a sale.', 'warning');
      return;
    }

    if (preselectedProductId) {
      const p = store.getProductById(preselectedProductId);
      if (p) {
        document.getElementById('sale-form-unit-price').value = p.sellingPrice;
        document.getElementById('sale-form-quantity').value = 1;
      }
    }

    productSelect.dispatchEvent(new Event('change'));
    UI.openModal('modal-sale');
  },

  openSaleForProduct(productId) {
    this.openSaleModal(productId);
  },

  viewReceipt(saleId) {
    const sale = store.sales.find(s => s.id === saleId || s.receiptNumber === saleId);
    if (sale) {
      UI.renderReceiptModal(sale);
    }
  },

  confirmCancelSale(saleId) {
    const sale = store.sales.find(s => s.id === saleId || s.receiptNumber === saleId);
    if (!sale) return;

    UI.showConfirm({
      title: 'Cancel Sale & Reverse Stock',
      message: `Are you sure you want to cancel receipt <strong>${sale.receiptNumber}</strong>? <br><br>This will return <strong>${sale.quantity} units</strong> of "${sale.productName}" back into available stock.`,
      confirmText: 'Yes, Cancel Sale',
      isDanger: true,
      onConfirm: () => {
        try {
          store.cancelSale(saleId);
          UI.showToast(`Sale ${sale.receiptNumber} cancelled; inventory restored.`, 'info');
        } catch (err) {
          UI.showToast(err.message, 'error');
        }
      }
    });
  },

  // ----------------------------------------------------
  // STOCK ADJUSTMENT & RESTOCK
  // ----------------------------------------------------
  setupStockAdjustmentForm() {
    const form = document.getElementById('adjustment-form');
    const productSelect = document.getElementById('adj-form-product');
    const typeSelect = document.getElementById('adj-form-type');
    const qtyInput = document.getElementById('adj-form-quantity');
    const qtyLabel = document.getElementById('adj-form-qty-label');
    const resultingStockEl = document.getElementById('adj-resulting-stock');
    const currentStockBox = document.getElementById('adj-current-stock-box');

    const updatePreview = () => {
      const product = store.getProductById(productSelect.value);
      const type = typeSelect.value;
      const rawQty = parseInt(qtyInput.value, 10) || 0;

      if (!product) {
        currentStockBox.style.display = 'none';
        resultingStockEl.textContent = '0';
        return;
      }

      currentStockBox.style.display = 'block';
      document.getElementById('adj-current-stock').textContent = product.quantity;
      document.getElementById('adj-min-stock').textContent = product.minStock;

      let change = rawQty;
      if (type === 'Damaged') {
        change = -rawQty;
        qtyLabel.textContent = 'Quantity Damaged (Stock Out -) *';
      } else if (type === 'Incoming Restock') {
        qtyLabel.textContent = 'Quantity Received (Stock In +) *';
      } else if (type === 'Customer Return') {
        qtyLabel.textContent = 'Quantity Returned (Stock In +) *';
      } else {
        qtyLabel.textContent = 'Quantity Adjustment (+/-) *';
      }

      const resulting = product.quantity + change;
      resultingStockEl.textContent = Math.max(0, resulting);
      if (resulting < 0) {
        resultingStockEl.style.color = '#dc2626';
      } else {
        resultingStockEl.style.color = '#065f46';
      }
    };

    productSelect?.addEventListener('change', updatePreview);
    typeSelect?.addEventListener('change', updatePreview);
    qtyInput?.addEventListener('input', updatePreview);

    // Form submit
    form?.addEventListener('submit', (e) => {
      e.preventDefault();

      const productId = productSelect.value;
      const type = typeSelect.value;
      const rawQty = parseInt(qtyInput.value, 10);
      const reason = document.getElementById('adj-form-reason').value.trim();

      if (!productId) return UI.showToast('Please select a gadget product.', 'error');
      if (isNaN(rawQty) || rawQty <= 0) return UI.showToast('Quantity must be greater than zero.', 'error');

      let quantityChange = rawQty;
      if (type === 'Damaged') {
        quantityChange = -rawQty;
      }

      try {
        const res = store.adjustStock({
          productId,
          movementType: type,
          quantityChange,
          reason
        });

        UI.closeModal('modal-stock-adjustment');
        form.reset();
        UI.showToast(`Stock updated for "${res.product.name}" (New Stock: ${res.product.quantity})`, 'success');
      } catch (err) {
        UI.showToast(err.message, 'error');
      }
    });
  },

  openStockAdjustmentModal(preselectedProductId = null, defaultType = 'Incoming Restock', defaultQty = 1) {
    const form = document.getElementById('adjustment-form');
    if (!form) return;
    form.reset();

    const productSelect = document.getElementById('adj-form-product');
    productSelect.innerHTML = '<option value="">-- Choose gadget product --</option>' +
      store.products.map(p => `
        <option value="${p.id}" ${p.id === preselectedProductId ? 'selected' : ''}>
          ${p.name} (Current Stock: ${p.quantity})
        </option>
      `).join('');

    if (defaultType) {
      document.getElementById('adj-form-type').value = defaultType;
    }
    if (defaultQty) {
      document.getElementById('adj-form-quantity').value = defaultQty;
    }

    productSelect.dispatchEvent(new Event('change'));
    UI.openModal('modal-stock-adjustment');
  },

  openStockAdjustmentForProduct(productId, defaultType = 'Incoming Restock', defaultQty = null) {
    const p = store.getProductById(productId);
    const suggested = defaultQty || (p ? Math.max(1, (p.minStock * 2) - p.quantity) : 1);
    this.openStockAdjustmentModal(productId, defaultType, suggested);
  },

  // ----------------------------------------------------
  // SUPPLIER MANAGEMENT
  // ----------------------------------------------------
  setupSupplierForm() {
    const form = document.getElementById('supplier-form');

    form?.addEventListener('submit', (e) => {
      e.preventDefault();

      const id = document.getElementById('supplier-form-id').value;
      const name = document.getElementById('supplier-form-name').value.trim();
      const businessName = document.getElementById('supplier-form-business').value.trim();
      const phone = document.getElementById('supplier-form-phone').value.trim();
      const email = document.getElementById('supplier-form-email').value.trim();
      const address = document.getElementById('supplier-form-address').value.trim();
      const notes = document.getElementById('supplier-form-notes').value.trim();

      if (!name) return UI.showToast('Supplier contact name is required.', 'error');
      if (!phone) return UI.showToast('Supplier phone number is required.', 'error');

      try {
        if (id) {
          store.updateSupplier(id, { name, businessName, phone, email, address, notes });
          UI.showToast(`Updated supplier "${name}".`, 'success');
        } else {
          store.addSupplier({ name, businessName, phone, email, address, notes });
          UI.showToast(`Added supplier "${name}".`, 'success');
        }

        UI.closeModal('modal-supplier');
      } catch (err) {
        UI.showToast(err.message, 'error');
      }
    });
  },

  openAddSupplierModal() {
    const form = document.getElementById('supplier-form');
    if (!form) return;
    form.reset();
    document.getElementById('modal-supplier-title').textContent = 'Add New Supplier';
    document.getElementById('supplier-form-id').value = '';
    UI.openModal('modal-supplier');
  },

  openEditSupplierModal(supplierId) {
    const s = store.getSupplierById(supplierId);
    if (!s) return;

    document.getElementById('modal-supplier-title').textContent = 'Edit Supplier';
    document.getElementById('supplier-form-id').value = s.id;
    document.getElementById('supplier-form-name').value = s.name;
    document.getElementById('supplier-form-business').value = s.businessName || '';
    document.getElementById('supplier-form-phone').value = s.phone;
    document.getElementById('supplier-form-email').value = s.email || '';
    document.getElementById('supplier-form-address').value = s.address || '';
    document.getElementById('supplier-form-notes').value = s.notes || '';

    UI.openModal('modal-supplier');
  },

  confirmDeleteSupplier(supplierId) {
    const s = store.getSupplierById(supplierId);
    if (!s) return;

    UI.showConfirm({
      title: 'Delete Supplier',
      message: `Are you sure you want to delete supplier <strong>${s.name}</strong>?`,
      confirmText: 'Delete Supplier',
      isDanger: true,
      onConfirm: () => {
        store.deleteSupplier(supplierId);
        UI.showToast(`Deleted supplier "${s.name}".`, 'info');
      }
    });
  },

  populateSupplierDropdown(selectId, selectedValue = '') {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = '<option value="">Select or leave blank</option>' +
      store.suppliers.map(s => `
        <option value="${s.name}" ${s.name === selectedValue ? 'selected' : ''}>
          ${s.name} ${s.businessName ? `(${s.businessName})` : ''}
        </option>
      `).join('');
  },

  // ----------------------------------------------------
  // SETTINGS & BACKUP/RESTORE
  // ----------------------------------------------------
  setupSettingsForm() {
    const form = document.getElementById('settings-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();

      const storeName = document.getElementById('settings-store-name').value.trim();
      const storeTagline = document.getElementById('settings-store-tagline').value.trim();
      const storePhone = document.getElementById('settings-store-phone').value.trim();
      const storeEmail = document.getElementById('settings-store-email').value.trim();
      const storeAddress = document.getElementById('settings-store-address').value.trim();
      const currency = document.getElementById('settings-currency').value;
      const defaultLowStockThreshold = parseInt(document.getElementById('settings-low-stock-threshold').value, 10) || 5;
      const receiptFooter = document.getElementById('settings-receipt-footer').value.trim();

      store.updateSettings({
        storeName,
        storeTagline,
        storePhone,
        storeEmail,
        storeAddress,
        currency,
        defaultLowStockThreshold,
        receiptFooter
      });

      UI.showToast('Store settings and currency saved.', 'success');
    });
  },

  setupBackupAndRestore() {
    // Download Backup
    document.getElementById('btn-export-backup')?.addEventListener('click', () => {
      const json = store.exportBackupJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.href = URL.createObjectURL(blob);
      link.download = `stockpilot-inventory-backup-${date}.json`;
      link.click();
      UI.showToast('JSON backup file created and downloaded.', 'success');
    });

    // Import Backup
    const fileInput = document.getElementById('backup-file-input');
    document.getElementById('btn-import-backup')?.addEventListener('click', () => {
      fileInput?.click();
    });

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            store.importBackupJSON(evt.target.result);
            UI.showToast('Data restored successfully from backup!', 'success');
          } catch (err) {
            UI.showToast(err.message, 'error');
          }
        };
        reader.readAsText(file);
      }
    });

    // Reset to Demo Data
    document.getElementById('btn-reset-demo')?.addEventListener('click', () => {
      UI.showConfirm({
        title: 'Reset to Realistic Demo Data',
        message: 'This will replace current inventory and sales with sample gadget stock. Continue?',
        confirmText: 'Reset to Demo',
        isDanger: false,
        onConfirm: () => {
          store.resetToDemo();
          UI.showToast('Demo gadgets and sample transactions restored!', 'success');
        }
      });
    });

    // Clean Wipe All Data
    document.getElementById('btn-clear-all')?.addEventListener('click', () => {
      UI.showConfirm({
        title: 'Clean Wipe All Inventory Data',
        message: '<strong>Warning:</strong> This will delete all products, sales history, stock movements, and suppliers. This action cannot be undone.',
        confirmText: 'Wipe All Data',
        isDanger: true,
        onConfirm: () => {
          store.clearAllData();
          UI.showToast('All inventory and sales data wiped clean.', 'info');
        }
      });
    });
  },

  // ----------------------------------------------------
  // FILTER & SEARCH EVENT LISTENERS
  // ----------------------------------------------------
  setupFilterListeners() {
    // Inventory filters
    document.getElementById('inventory-search')?.addEventListener('input', () => UI.renderInventory());
    document.getElementById('inventory-filter-category')?.addEventListener('change', () => UI.renderInventory());
    document.getElementById('inventory-filter-brand')?.addEventListener('change', () => UI.renderInventory());
    document.getElementById('inventory-filter-status')?.addEventListener('change', () => UI.renderInventory());
    document.getElementById('inventory-sort-by')?.addEventListener('change', () => UI.renderInventory());

    // Stock movement filters
    document.getElementById('stock-search')?.addEventListener('input', () => UI.renderStockTracking());
    document.getElementById('stock-filter-type')?.addEventListener('change', () => UI.renderStockTracking());

    // Sales filters
    document.getElementById('sales-search')?.addEventListener('input', () => UI.renderSales());
    document.getElementById('sales-filter-payment')?.addEventListener('change', () => UI.renderSales());
    document.getElementById('sales-filter-status')?.addEventListener('change', () => UI.renderSales());

    // Supplier search
    document.getElementById('suppliers-search')?.addEventListener('input', () => UI.renderSuppliers());

    // Alerts filter tabs
    document.querySelectorAll('[data-alert-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-alert-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        UI.alertsFilter = btn.dataset.alertFilter;
        UI.renderAlerts();
      });
    });

    // Dashboard sales range switcher (7, 14, 30 days)
    document.querySelectorAll('[data-sales-range]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-sales-range]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        UI.dashboardSalesRange = parseInt(btn.dataset.salesRange, 10) || 7;
        Charts.renderSalesChart('dashboard-sales-chart', store.sales, UI.dashboardSalesRange);
      });
    });

    // Reports timeframe and category filters
    document.getElementById('reports-timeframe')?.addEventListener('change', () => UI.renderReports());
    document.getElementById('reports-category')?.addEventListener('change', () => UI.renderReports());
  },

  // ----------------------------------------------------
  // CSV EXPORT HANDLERS
  // ----------------------------------------------------
  setupExportButtons() {
    // Inventory CSV Export
    const exportInventory = () => {
      const rows = store.products.map(p => {
        const status = store.getStockStatus(p.quantity, p.minStock);
        return {
          'Product ID': p.id,
          'Product Name': p.name,
          'Brand': p.brand,
          'Category': p.category,
          'Model': p.model || '',
          'SKU': p.sku,
          'IMEI/SN': p.imei || '',
          'Purchase Cost': p.purchasePrice,
          'Selling Price': p.sellingPrice,
          'Quantity In Stock': p.quantity,
          'Min Stock Threshold': p.minStock,
          'Stock Status': status.label,
          'Supplier': p.supplierName || '',
          'Total Cost Value': p.quantity * p.purchasePrice,
          'Total Retail Value': p.quantity * p.sellingPrice,
          'Date Added': p.dateAdded
        };
      });
      UI.exportCSV(`stockpilot-inventory-${new Date().toISOString().split('T')[0]}.csv`, rows);
    };

    document.getElementById('btn-export-inventory-csv')?.addEventListener('click', exportInventory);
    document.getElementById('btn-reports-export-inventory')?.addEventListener('click', exportInventory);

    // Sales CSV Export
    const exportSales = () => {
      const rows = store.sales.map(s => ({
        'Receipt Number': s.receiptNumber,
        'Date': s.date,
        'Product Name': s.productName,
        'SKU': s.sku,
        'Category': s.category,
        'Quantity Sold': s.quantity,
        'Unit Selling Price': s.unitPrice,
        'Unit Cost Price': s.costPrice,
        'Subtotal': s.subtotal,
        'Discount': s.discount,
        'Total Amount Paid': s.totalAmount,
        'Gross Profit': s.profit,
        'Payment Method': s.paymentMethod,
        'Customer Name': s.customerName || '',
        'Customer Phone': s.customerPhone || '',
        'Sale Status': s.status,
        'Notes': s.notes || ''
      }));
      UI.exportCSV(`stockpilot-sales-${new Date().toISOString().split('T')[0]}.csv`, rows);
    };

    document.getElementById('btn-export-sales-csv')?.addEventListener('click', exportSales);
    document.getElementById('btn-reports-export-sales')?.addEventListener('click', exportSales);

    // Stock Movement CSV Export
    const exportMovements = () => {
      const rows = store.movements.map(m => ({
        'Movement ID': m.id,
        'Date & Time': m.date,
        'Product Name': m.productName,
        'SKU': m.sku,
        'Movement Type': m.movementType,
        'Previous Quantity': m.previousQuantity,
        'Quantity Changed': m.quantityChanged,
        'New Quantity': m.newQuantity,
        'Reason / Notes': m.reason || ''
      }));
      UI.exportCSV(`stockpilot-stock-movements-${new Date().toISOString().split('T')[0]}.csv`, rows);
    };

    document.getElementById('btn-export-movements-csv')?.addEventListener('click', exportMovements);
    document.getElementById('btn-reports-export-movements')?.addEventListener('click', exportMovements);
  }
};

// Bootstrap application once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});


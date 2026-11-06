/**
 * StockPilot – Gadget Inventory Manager
 * Pure Vanilla Data Visualisation & Charting Module
 * Zero External Dependencies
 */

const Charts = {
  // Color palette for charts (Hex literals only - no CSS variables)
  colors: [
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#f59e0b', // Amber
    '#06b6d4', // Cyan
    '#ec4899', // Pink
    '#6366f1', // Indigo
    '#14b8a6', // Teal
    '#f97316', // Orange
    '#84cc16', // Lime
    '#64748b'  // Slate
  ],

  /**
   * Render an interactive Category Stock & Value Doughnut Chart using SVG
   */
  renderCategoryDonut(containerId, products) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Aggregate products by category
    const categoryMap = {};
    let totalStock = 0;
    let totalValue = 0;

    products.forEach(p => {
      const cat = p.category || 'Other Gadgets';
      const qty = Number(p.quantity) || 0;
      const val = qty * (Number(p.sellingPrice) || 0);

      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, quantity: 0, value: 0 };
      }
      categoryMap[cat].quantity += qty;
      categoryMap[cat].value += val;
      totalStock += qty;
      totalValue += val;
    });

    const categories = Object.values(categoryMap).filter(c => c.quantity > 0);

    if (categories.length === 0) {
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:240px;color:#94a3b8;font-size:13px;text-align:center;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" style="margin-bottom:8px;">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          No inventory stock data available
        </div>`;
      return;
    }

    // Sort categories by value descending
    categories.sort((a, b) => b.value - a.value);

    // Calculate arc angles
    const size = 260;
    const center = size / 2;
    const radius = 95;
    const innerRadius = 65;

    let currentAngle = -Math.PI / 2; // start from 12 o'clock
    const slices = [];

    categories.forEach((cat, index) => {
      const share = totalValue > 0 ? cat.value / totalValue : 1 / categories.length;
      const angle = share * 2 * Math.PI;
      const endAngle = currentAngle + angle;
      const color = this.colors[index % this.colors.length];

      // Coordinates
      const x1 = center + radius * Math.cos(currentAngle);
      const y1 = center + radius * Math.sin(currentAngle);
      const x2 = center + radius * Math.cos(endAngle);
      const y2 = center + radius * Math.sin(endAngle);

      const x3 = center + innerRadius * Math.cos(endAngle);
      const y3 = center + innerRadius * Math.sin(endAngle);
      const x4 = center + innerRadius * Math.cos(currentAngle);
      const y4 = center + innerRadius * Math.sin(currentAngle);

      const largeArc = angle > Math.PI ? 1 : 0;

      const pathData = categories.length === 1
        ? `M ${center} ${center - radius} A ${radius} ${radius} 0 1 1 ${center - 0.01} ${center - radius} A ${innerRadius} ${innerRadius} 0 1 0 ${center} ${center - innerRadius} Z`
        : `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;

      slices.push({
        ...cat,
        color,
        percentage: (share * 100).toFixed(1),
        pathData
      });

      currentAngle = endAngle;
    });

    const svgSlices = slices.map((s, idx) => `
      <path d="${s.pathData}" fill="${s.color}" class="donut-slice" data-cat="${s.category}" data-val="${store.formatCurrency(s.value)}" data-qty="${s.quantity}" data-pct="${s.percentage}%" style="transition: transform 0.2s ease, opacity 0.2s; cursor: pointer;">
        <title>${s.category}: ${s.quantity} units (${s.percentage}%) - ${store.formatCurrency(s.value)}</title>
      </path>
    `).join('');

    const legendItems = slices.slice(0, 5).map(s => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;font-size:12px;border-bottom:1px solid #f1f5f9;">
        <div style="display:flex;align-items:center;gap:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:140px;">
          <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background-color:${s.color};flex-shrink:0;"></span>
          <span style="color:#334155;font-weight:500;text-overflow:ellipsis;overflow:hidden;" title="${s.category}">${s.category}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="color:#64748b;font-size:11px;">${s.quantity} units</span>
          <span style="color:#0f172a;font-weight:600;font-size:11px;">${s.percentage}%</span>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:20px;width:100%;padding:10px 0;">
        <div style="position:relative;width:${size}px;height:${size}px;flex-shrink:0;">
          <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
            ${svgSlices}
            <circle cx="${center}" cy="${center}" r="${innerRadius - 4}" fill="#ffffff"/>
            <text x="${center}" y="${center - 6}" text-anchor="middle" font-size="11" font-weight="600" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">TOTAL STOCK</text>
            <text x="${center}" y="${center + 18}" text-anchor="middle" font-size="20" font-weight="700" fill="#0f172a" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">${totalStock}</text>
          </svg>
        </div>
        <div style="flex:1;min-width:180px;max-width:260px;">
          <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Top Categories by Value</div>
          ${legendItems}
          ${slices.length > 5 ? `<div style="text-align:right;font-size:11px;color:#94a3b8;margin-top:6px;">+${slices.length - 5} more categories</div>` : ''}
        </div>
      </div>
    `;
  },

  /**
   * Render Sales Performance Daily / Weekly Bar & Area Chart
   */
  renderSalesChart(containerId, sales, days = 7) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Build timeline for last N days
    const dayBuckets = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      dayBuckets.push({
        dateStr,
        label,
        revenue: 0,
        profit: 0,
        transactions: 0
      });
    }

    // Populate buckets with completed sales
    sales.forEach(sale => {
      if (sale.status === 'Completed' && sale.date) {
        const saleDateStr = sale.date.split('T')[0];
        const bucket = dayBuckets.find(b => b.dateStr === saleDateStr);
        if (bucket) {
          bucket.revenue += Number(sale.totalAmount) || 0;
          bucket.profit += Number(sale.profit) || 0;
          bucket.transactions += 1;
        }
      }
    });

    const maxRevenue = Math.max(...dayBuckets.map(b => b.revenue), 100000);
    // Round maxRevenue up to pleasant number
    const niceMax = Math.ceil(maxRevenue / 100000) * 100000;

    const width = 540;
    const height = 240;
    const padLeft = 70;
    const padRight = 20;
    const padTop = 30;
    const padBottom = 40;

    const chartWidth = width - padLeft - padRight;
    const chartHeight = height - padTop - padBottom;

    // Y Axis grid ticks (4 steps)
    const ticks = [0, 0.25, 0.5, 0.75, 1];
    const gridLines = ticks.map(t => {
      const y = padTop + chartHeight * (1 - t);
      const val = niceMax * t;
      const formattedVal = val >= 1000000 
        ? `${(val / 1000000).toFixed(1)}M`
        : val >= 1000 
          ? `${Math.round(val / 1000)}k` 
          : `${val}`;
      return `
        <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="#f1f5f9" stroke-width="1"/>
        <text x="${padLeft - 8}" y="${y + 3}" text-anchor="end" font-size="10" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fill="#94a3b8">${store.getCurrencySymbol()}${formattedVal}</text>
      `;
    }).join('');

    // Render bars
    const barGroupWidth = chartWidth / dayBuckets.length;
    const barWidth = Math.min(28, barGroupWidth * 0.55);

    const bars = dayBuckets.map((b, idx) => {
      const centerX = padLeft + idx * barGroupWidth + barGroupWidth / 2;
      const barX = centerX - barWidth / 2;
      const barHeight = Math.max(3, (b.revenue / niceMax) * chartHeight);
      const barY = padTop + chartHeight - barHeight;

      // Profit accent bar inside or overlay
      const profitHeight = Math.max(0, (Math.max(0, b.profit) / niceMax) * chartHeight);
      const profitY = padTop + chartHeight - profitHeight;

      return `
        <g class="chart-bar-group" style="cursor:pointer;">
          <rect x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}" rx="4" fill="#10b981" opacity="0.9">
            <title>${b.label}: Revenue ${store.formatCurrency(b.revenue)} | Profit ${store.formatCurrency(b.profit)} (${b.transactions} sales)</title>
          </rect>
          ${b.profit > 0 ? `
            <rect x="${barX + 2}" y="${profitY}" width="${barWidth - 4}" height="${profitHeight}" rx="2" fill="#047857" opacity="0.45">
              <title>Profit: ${store.formatCurrency(b.profit)}</title>
            </rect>
          ` : ''}
          <text x="${centerX}" y="${height - padBottom + 16}" text-anchor="middle" font-size="10" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" fill="#64748b">${b.label.split(',')[0]}</text>
          <text x="${centerX}" y="${height - padBottom + 28}" text-anchor="middle" font-size="9" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fill="#94a3b8">${b.label.split(',')[1] || ''}</text>
        </g>
      `;
    }).join('');

    container.innerHTML = `
      <div style="width:100%;overflow-x:auto;">
        <div style="display:flex;align-items:center;justify-content:flex-end;gap:16px;margin-bottom:8px;font-size:12px;">
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="display:inline-block;width:12px;height:12px;border-radius:3px;background-color:#10b981;"></span>
            <span style="color:#475569;font-weight:500;">Revenue</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="display:inline-block;width:12px;height:12px;border-radius:3px;background-color:#047857;opacity:0.6;"></span>
            <span style="color:#475569;font-weight:500;">Est. Gross Profit</span>
          </div>
        </div>
        <svg viewBox="0 0 ${width} ${height}" style="width:100%;height:auto;max-height:240px;display:block;">
          ${gridLines}
          ${bars}
        </svg>
      </div>
    `;
  }
};


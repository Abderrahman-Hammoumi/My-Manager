(() => {
  const MyManager = window.MyManager || (window.MyManager = {});
  const state = MyManager.state;
  const toPlainText = MyManager.toPlainText;
  const t = MyManager.t;

  function setupDashboard() {
    const refreshBtn = document.getElementById("refresh-dashboard");
    const filter = document.getElementById("dashboard-filter");
    if (!refreshBtn || !filter) return;
    if (!refreshBtn.dataset.bound) {
      refreshBtn.dataset.bound = "true";
      refreshBtn.addEventListener("click", renderDashboard);
    }
    const allLabel = t("dashboard.allWarehouses", "All warehouses");
    filter.innerHTML = `<option value="all">${allLabel}</option>` +
      state.data.warehouses.map((w) => `<option value="${w.id}">${w.name}</option>`).join("");
    if (!filter.dataset.bound) {
      filter.dataset.bound = "true";
      filter.addEventListener("change", renderDashboard);
    }
    renderDashboard();
  }

  function renderDashboard() {
    const filterElement = document.getElementById("dashboard-filter");
    const cardsContainer = document.getElementById("stats-cards");
    if (!filterElement || !cardsContainer) return;
    const filter = filterElement.value;
    const products = filter === "all"
      ? state.data.products
      : state.data.products.filter((p) => p.warehouseId === filter);
    const orders = state.data.orders;
    const totalStock = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);
    const totalValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);
    const pending = orders.filter((o) => String(o.status).toLowerCase().includes("attente")).length;
    const revenue = orders.reduce((sum, o) => {
      const prod = state.data.products.find((p) => p.id === o.productId);
      return sum + (prod ? prod.price * o.quantity : 0);
    }, 0);
    const itemsLabel = t("dashboard.items", "items");
    const cards = [
      { label: t("dashboard.stockValue", "Stock value"), value: `MAD ${totalValue.toFixed(0)}`, trend: "+8% vs last month" },
      { label: t("dashboard.totalStock", "Total stock"), value: totalStock, trend: `${products.length} ${itemsLabel}` },
      { label: t("dashboard.pendingOrders", "Pending orders"), value: pending, trend: "Supplier flow" },
      { label: t("dashboard.estimatedRevenue", "Estimated revenue"), value: `MAD ${revenue.toFixed(0)}`, trend: "Based on quantities" }
    ];
    cardsContainer.innerHTML = cards
      .map(
        (c) => `<div class="card">
          <div class="label">${c.label}</div>
          <div class="value">${c.value}</div>
          <div class="trend">${c.trend}</div>
        </div>`
      )
      .join("");
  }

  function renderEntityCharts(entity) {
    if (entity === "products") {
      drawBarChart(
        "chart-products",
        state.data.products.map((p) => p.name),
        state.data.products.map((p) => p.stock),
        "Stock by product"
      );
      return;
    }
    if (entity === "suppliers") {
      const groups = groupBy(state.data.suppliers, "address");
      drawBarChart(
        "chart-suppliers",
        Object.keys(groups),
        Object.values(groups).map((items) => items.length),
        "Suppliers by location"
      );
      return;
    }
    if (entity === "customers") {
      const groups = groupBy(state.data.customers, "status");
      drawBarChart(
        "chart-customers",
        Object.keys(groups),
        Object.values(groups).map((items) => items.length),
        "Customers by status"
      );
      return;
    }
    if (entity === "warehouses") {
      drawBarChart(
        "chart-warehouses",
        state.data.warehouses.map((w) => w.name),
        state.data.warehouses.map((w) => {
          const subset = state.data.products.filter((p) => p.warehouseId === w.id);
          return subset.reduce((sum, p) => sum + p.stock, 0);
        }),
        "Stock by warehouse"
      );
      return;
    }
    if (entity === "categories") {
      const groups = groupBy(state.data.products, "categoryId");
      drawBarChart(
        "chart-categories-entity",
        Object.keys(groups).map((id) => lookupCategoryName(id)),
        Object.values(groups).map((items) => items.length),
        "Products by category"
      );
      return;
    }
    if (entity === "orders") {
      const groups = groupBy(state.data.orders, "status");
      drawBarChart(
        "chart-orders",
        Object.keys(groups),
        Object.values(groups).map((items) => items.length),
        "Orders by status"
      );
    }
  }

function groupBy(items, key) {
  return items.reduce((acc, item) => {
    const k = item[key] ?? "Unknown";
    acc[k] = acc[k] || [];
    acc[k].push(item);
    return acc;
  }, {});
}

function lookupCategoryName(id) {
  const match = state.data.categories.find((item) => item.id === id);
  return match ? match.name : "Unknown";
}

function getTooltipElement() {
  let tooltip = document.getElementById("chart-tooltip");
  if (tooltip) return tooltip;
  tooltip = document.createElement("div");
  tooltip.id = "chart-tooltip";
  tooltip.className = "chart-tooltip";
  const title = document.createElement("div");
  title.className = "tooltip-title";
  const row = document.createElement("div");
  row.className = "tooltip-row";
  const label = document.createElement("span");
  label.className = "tooltip-label";
  const value = document.createElement("strong");
  value.className = "tooltip-value";
  row.append(label, value);
  tooltip.append(title, row);
  tooltip._titleEl = title;
  tooltip._labelEl = label;
  tooltip._valueEl = value;
  document.body.appendChild(tooltip);
  return tooltip;
}

function bindBarChartTooltip(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || canvas.dataset.tooltipBound) return;
  canvas.dataset.tooltipBound = "true";
  const tooltip = getTooltipElement();
  const hide = () => {
    tooltip.style.opacity = "0";
    tooltip.setAttribute("aria-hidden", "true");
  };
  canvas.addEventListener("mouseleave", hide);
  canvas.addEventListener("mousemove", (event) => {
    const meta = state.chartMeta[canvasId];
    if (!meta || !meta.bars.length) return hide();
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const index = meta.bars.findIndex((bar) =>
      x >= bar.x && x <= bar.x + bar.w && y >= bar.y && y <= bar.y + bar.h
    );
    if (index === -1) return hide();
    tooltip._titleEl.textContent = meta.title;
    tooltip._labelEl.textContent = toPlainText(meta.labels[index]);
    tooltip._valueEl.textContent = String(meta.values[index]);
    tooltip.style.left = `${event.clientX + 12}px`;
    tooltip.style.top = `${event.clientY + 12}px`;
    tooltip.style.opacity = "1";
    tooltip.setAttribute("aria-hidden", "false");
  });
  if (!state.tooltipScrollBound) {
    state.tooltipScrollBound = true;
    window.addEventListener("scroll", hide, { passive: true });
  }
}

function drawBarChart(canvasId, labels, values, title) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width = canvas.clientWidth;
  const h = canvas.height = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#f2f2f6";
  ctx.font = "14px Trebuchet MS";
  ctx.fillText(title, 10, 20);
  if (!labels.length) {
    state.chartMeta[canvasId] = { labels, values, title, bars: [] };
    bindBarChartTooltip(canvasId);
    return;
  }
  const max = Math.max(...values, 1);
  const barWidth = w / (labels.length * 1.8);
  const bars = [];
  labels.forEach((label, i) => {
    const x = 30 + i * (barWidth * 1.8);
    const barHeight = (values[i] / max) * (h - 70);
    const y = h - barHeight - 30;
    const gradient = ctx.createLinearGradient(0, y, 0, h);
    gradient.addColorStop(0, "#b7a8ff");
    gradient.addColorStop(1, "#9ad5ff");
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = "#a2a2b3";
    ctx.fillText(String(label).slice(0, 10), x, h - 10);
    bars.push({ x, y, w: barWidth, h: barHeight });
  });
  state.chartMeta[canvasId] = { labels, values, title, bars };
  bindBarChartTooltip(canvasId);
}

  MyManager.setupDashboard = setupDashboard;
  MyManager.renderDashboard = renderDashboard;
  MyManager.renderEntityCharts = renderEntityCharts;
})();

(() => {
  const MyManager = window.MyManager || (window.MyManager = {});
  const PAGE_SIZE = MyManager.PAGE_SIZE;
  const entityConfigs = MyManager.entityConfigs;
  const state = MyManager.state;
  const persist = MyManager.persist;
  const uid = MyManager.uid;
  const t = MyManager.t;
  const toPlainText = MyManager.toPlainText;
  const renderEntityCharts = MyManager.renderEntityCharts;

  function setupEntityForms() {
    const forms = document.querySelectorAll(".entity-form");
    forms.forEach((form) => {
      const entity = form.dataset.entity;
      const config = entityConfigs[entity];
      if (!config) return;
      const fieldsHtml = config.fields
        .map((field) => {
          if (field.type === "select" && field.options) {
            return selectField(field, field.options.map((o) => ({ value: o, label: o })));
          }
          if (field.type === "select" && field.source) {
            const options = state.data[field.source].map((item) => ({ value: item.id, label: item.name }));
            return selectField(field, options);
          }
          return inputField(field);
        })
        .join("");
      form.innerHTML = `
        <h3>${config.formTitle}</h3>
        ${fieldsHtml}
        <div class="actions">
          <button class="btn primary" type="submit" data-i18n="actions.save">${t("actions.save")}</button>
          <button class="btn ghost" type="button" data-action="cancel">${t("actions.cancel")}</button>
        </div>
      `;
      form.addEventListener("submit", (event) => handleSubmitEntity(event, entity));
      const cancel = form.querySelector('[data-action="cancel"]');
      if (cancel) cancel.addEventListener("click", () => resetForm(entity));
    });
  }

  function renderTable(entity) {
    const container = document.querySelector(`.entity-table[data-entity="${entity}"]`);
    if (!container) return;
    const config = entityConfigs[entity];
    const searchInput = document.getElementById(`${entity}-search`);
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    const sort = state.sort[entity];
    let rows = state.data[entity] || [];
    if (searchTerm) {
      rows = rows.filter((row) => Object.values(row).some((v) => String(v).toLowerCase().includes(searchTerm)));
    }
    if (sort?.key) {
      rows = [...rows].sort((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        if (av === bv) return 0;
        return sort.direction === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
      });
    }
    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    const page = Math.min(state.page[entity] || 1, totalPages);
    state.page[entity] = page;
    const paginated = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    container.innerHTML = `
      <div class="table-header">
        <h3>${config.formTitle}s</h3>
      </div>
      <table>
        <thead>
          <tr>
            ${config.columns.map((col) => `<th data-entity="${entity}" data-key="${col.key}">${col.label}</th>`).join("")}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${paginated
            .map((row) => `<tr>
              ${config.columns.map((col) => `<td>${formatCell(col, row[col.key])}</td>`).join("")}
              <td>
                <div class="table-actions">
                  <button class="btn ghost tiny" data-row-action="details" data-entity="${entity}" data-id="${row.id}">${t("actions.details")}</button>
                  <button class="btn ghost tiny" data-row-action="edit" data-entity="${entity}" data-id="${row.id}">${t("actions.edit")}</button>
                  <button class="btn danger tiny" data-row-action="delete" data-entity="${entity}" data-id="${row.id}">${t("actions.delete")}</button>
                </div>
              </td>
            </tr>`)
            .join("") || `<tr><td colspan="${config.columns.length + 1}">${t("table.empty")}</td></tr>`}
        </tbody>
      </table>
      <div class="pagination">
        <button class="btn ghost" data-page="prev">&larr;</button>
        <span class="muted tiny">Page ${page} / ${totalPages}</span>
        <button class="btn ghost" data-page="next">&rarr;</button>
      </div>
    `;
    container.querySelectorAll("th[data-key]").forEach((th) =>
      th.addEventListener("click", () => toggleSort(entity, th.dataset.key))
    );
    container.querySelector('[data-page="prev"]').addEventListener("click", () => changePage(entity, -1, totalPages));
    container.querySelector('[data-page="next"]').addEventListener("click", () => changePage(entity, 1, totalPages));
    container.querySelectorAll("[data-row-action]").forEach((btn) =>
      btn.addEventListener("click", () => handleRowAction(btn))
    );
    attachEntityActionButtons(entity);
  }

function handleSubmitEntity(event, entity) {
  event.preventDefault();
  const form = event.target;
  const config = entityConfigs[entity];
  const payload = {};
  config.fields.forEach((field) => {
    const value = form[field.key].value;
    payload[field.key] = field.type === "number" ? Number(value) : value;
  });
  const editId = form.dataset.editId;
  if (editId) {
    state.data[entity] = state.data[entity].map((item) => (item.id === editId ? { ...item, ...payload } : item));
  } else {
    state.data[entity].push({ id: uid(), ...payload });
  }
  persist(state.data);
  setupEntityForms();
  resetForm(entity);
  renderTable(entity);
  renderEntityCharts(entity);
}

function resetForm(entity) {
  const form = document.querySelector(`.entity-form[data-entity="${entity}"]`);
  if (!form) return;
  form.reset();
  delete form.dataset.editId;
  const submit = form.querySelector('[type="submit"]');
  if (submit) submit.textContent = t("actions.save");
}

function attachEntityActionButtons(entity) {
  document.querySelectorAll(`[data-entity-action="add"][data-entity="${entity}"]`).forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "true";
    btn.addEventListener("click", () => resetForm(entity));
  });
  document.querySelectorAll(`[data-entity-action="export"][data-entity="${entity}"]`).forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "true";
    btn.addEventListener("click", () => exportCsv(entity));
  });
}

function changePage(entity, delta, totalPages) {
  const next = state.page[entity] + delta;
  if (next < 1 || next > totalPages) return;
  state.page[entity] = next;
  renderTable(entity);
}

function toggleSort(entity, key) {
  const sort = state.sort[entity];
  if (sort.key === key) {
    sort.direction = sort.direction === "asc" ? "desc" : "asc";
  } else {
    sort.key = key;
    sort.direction = "asc";
  }
  renderTable(entity);
}

function handleRowAction(button) {
  const { entity, id } = button.dataset;
  const action = button.dataset.rowAction;
  const record = state.data[entity].find((item) => item.id === id);
  if (!record) return;
  if (action === "edit") {
    fillForm(entity, record);
  } else if (action === "delete") {
    if (confirm("Delete permanently?")) {
      state.data[entity] = state.data[entity].filter((item) => item.id !== id);
      persist(state.data);
      renderTable(entity);
      renderEntityCharts(entity);
    }
  } else if (action === "details") {
    showDetails(entity, record);
  }
}

function fillForm(entity, record) {
  const form = document.querySelector(`.entity-form[data-entity="${entity}"]`);
  const config = entityConfigs[entity];
  if (!form || !config) return;
  config.fields.forEach((field) => {
    form[field.key].value = record[field.key] ?? "";
  });
  form.dataset.editId = record.id;
  const submit = form.querySelector('[type="submit"]');
  if (submit) submit.textContent = t("actions.update");
  form.scrollIntoView({ behavior: "smooth", block: "center" });
}

function formatCell(col, value) {
  if (col.formatter) return col.formatter(value);
  if (col.lookup) {
    const match = state.data[col.lookup].find((item) => item.id === value);
    return match ? match.name : "-";
  }
  return value ?? "-";
}

function exportCsv(entity) {
  const rows = state.data[entity];
  const cols = entityConfigs[entity].columns;
  const header = cols.map((c) => c.label).join(",");
  const lines = rows.map((row) =>
    cols
      .map((c) => {
        const val = toPlainText(formatCell(c, row[c.key]));
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  const csv = [header, ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${entity}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function showDetails(entity, record) {
  const modal = document.getElementById("detail-modal");
  const body = document.getElementById("detail-body");
  const config = entityConfigs[entity];
  if (!modal || !body || !config) return;
  body.innerHTML = config.columns
    .map((col) => {
      const raw = toPlainText(formatCell(col, record[col.key]));
      return `<div class="row"><span>${col.label}</span><strong>${raw}</strong></div>`;
    })
    .join("");
  const title = document.getElementById("detail-title");
  if (title) title.textContent = `${config.formTitle} #${record.id.slice(-5)}`;
  modal.classList.remove("hidden");
  const close = document.getElementById("detail-close");
  const exportBtn = document.getElementById("detail-export-pdf");
  if (close) close.onclick = () => modal.classList.add("hidden");
  if (exportBtn) exportBtn.onclick = () => exportPdf(config.formTitle, body.innerHTML);
}

function exportPdf(title, htmlContent) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`
    <html><head><title>${title}</title></head>
    <body>
      <h2>${title}</h2>
      ${htmlContent}
      <script>window.print();</script>
    </body></html>
  `);
  win.document.close();
}

function inputField(field) {
  return `
    <div class="form-control">
      <label for="${field.key}">${field.label}</label>
      <input id="${field.key}" name="${field.key}" type="${field.type}" ${field.step ? `step="${field.step}"` : ""} ${field.required ? "required" : ""}>
    </div>
  `;
}

function selectField(field, options) {
  return `
    <div class="form-control">
      <label for="${field.key}">${field.label}</label>
      <select id="${field.key}" name="${field.key}" ${field.required ? "required" : ""}>
        ${options.map((opt) => `<option value="${opt.value}">${opt.label}</option>`).join("")}
      </select>
    </div>
  `;
}

  MyManager.setupEntityForms = setupEntityForms;
  MyManager.renderTable = renderTable;
})();

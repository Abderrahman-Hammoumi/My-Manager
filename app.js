(() => {
  const MyManager = window.MyManager || (window.MyManager = {});
  const SESSION_KEY = MyManager.SESSION_KEY;
  const entityConfigs = MyManager.entityConfigs;
  const state = MyManager.state;
  const setupEntityForms = MyManager.setupEntityForms;
  const renderTable = MyManager.renderTable;
  const setupDashboard = MyManager.setupDashboard;
  const renderEntityCharts = MyManager.renderEntityCharts;
  const setupLanguage = MyManager.setupLanguage;
  const applyTranslations = MyManager.applyTranslations;
  const debounce = MyManager.debounce;

  const CREDENTIALS = [
    { user: "admin", pass: "admin" },
    { user: "abderrahman", pass: "hammoumi" },
    { user: "yassmine", pass: "elmourabit"}
  ];

  document.addEventListener("DOMContentLoaded", () => {
    setupLogin();
    setupLanguage(() => {
      const entities = state.currentEntityPage ? [state.currentEntityPage] : Object.keys(entityConfigs);
      entities.forEach((entity) => renderTable(entity));
      if (state.currentEntityPage) renderEntityCharts(state.currentEntityPage);
      setupDashboard();
    });
    hydrateSession();
  });

  function getSession() {
    try {
      return sessionStorage.getItem(SESSION_KEY);
    } catch (error) {
      return null;
    }
  }

  function setSession(payload) {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    } catch (error) {
      // Ignore storage errors to keep login usable in restricted environments.
    }
  }

  function clearSession() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
      // Ignore storage errors to keep logout usable in restricted environments.
    }
  }

  function setLoginHint(form, message) {
    const hint = form.querySelector(".hint");
    if (hint) hint.textContent = message;
  }

  function setupLogin() {
    const form = document.getElementById("login-form");
    const screen = document.getElementById("login-screen");
    const app = document.getElementById("app");
    if (!form || !screen || !app) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const usernameInput = form.elements.namedItem("username");
      const passwordInput = form.elements.namedItem("password");
      if (!usernameInput || !passwordInput) return;
      const username = String(usernameInput.value ?? "").trim();
      const password = String(passwordInput.value ?? "").trim();
      const normalizedUser = username.toLowerCase();
      const normalizedPass = password.toLowerCase();
      const isValid = CREDENTIALS.some(
        (entry) => entry.user === normalizedUser && entry.pass === normalizedPass
      );
      if (isValid) {
        setLoginHint(form, "");
        setSession({ username });
        screen.classList.add("hidden");
        app.classList.remove("hidden");
        renderAll();
      } else {
        setLoginHint(form, "Identifiants invalides (essayez admin / admin)");
      }
    });
    const logout = document.getElementById("logout-btn");
    if (logout) {
      logout.addEventListener("click", () => {
        clearSession();
        window.location.reload();
      });
    }
  }

  function hydrateSession() {
    const session = getSession();
    if (!session) return;
    const screen = document.getElementById("login-screen");
    const app = document.getElementById("app");
    if (!screen || !app) return;
    screen.classList.add("hidden");
    app.classList.remove("hidden");
    renderAll();
  }

  function renderAll() {
    setupEntityForms();
    const pageEntity = document.body.dataset.entityPage;
    state.currentEntityPage = pageEntity || null;
    const entities = pageEntity ? [pageEntity] : Object.keys(entityConfigs);
    entities.forEach((entity) => {
      if (!state.sort[entity]) state.sort[entity] = { key: null, direction: "asc" };
      if (!state.page[entity]) state.page[entity] = 1;
      const searchInput = document.getElementById(`${entity}-search`);
      if (searchInput && !searchInput.dataset.bound) {
        searchInput.dataset.bound = "true";
        searchInput.addEventListener("input", () => {
          state.page[entity] = 1;
          renderTable(entity);
        });
      }
      renderTable(entity);
    });
    if (pageEntity) {
      renderEntityCharts(pageEntity);
      if (!state.chartResizeBound) {
        state.chartResizeBound = true;
        window.addEventListener("resize", debounce(() => {
          if (state.currentEntityPage) renderEntityCharts(state.currentEntityPage);
        }, 150));
      }
    }
    setupDashboard();
    applyTranslations();
  }
})();

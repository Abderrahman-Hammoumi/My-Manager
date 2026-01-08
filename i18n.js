(() => {
  const MyManager = window.MyManager || (window.MyManager = {});
  const translations = MyManager.translations;
  const state = MyManager.state;
  const LOCALE_KEY = MyManager.LOCALE_KEY;

  function readLocale() {
    try {
      return localStorage.getItem(LOCALE_KEY);
    } catch (error) {
      return null;
    }
  }

  function writeLocale(value) {
    try {
      localStorage.setItem(LOCALE_KEY, value);
    } catch (error) {
      // Ignore storage errors to keep language switching usable.
    }
  }

  function t(key, fallback = "") {
    return translations[state.locale]?.[key] ?? fallback ?? key;
  }

  function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      el.textContent = t(key, el.textContent);
    });
  }

  function setupLanguage(onChange) {
    const select = document.getElementById("language-select");
    if (!select) return;
    const stored = readLocale();
    if (stored && translations[stored] && select.value !== stored) {
      select.value = stored;
    }
    if (!select.dataset.bound) {
      select.dataset.bound = "true";
      select.addEventListener("change", () => {
        state.locale = select.value;
        writeLocale(select.value);
        applyTranslations();
        if (onChange) onChange();
      });
    }
    state.locale = select.value;
  }

  MyManager.t = t;
  MyManager.applyTranslations = applyTranslations;
  MyManager.setupLanguage = setupLanguage;
})();

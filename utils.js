(() => {
  const MyManager = window.MyManager || (window.MyManager = {});

  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  function toPlainText(value) {
    return String(value ?? "").replace(/<[^>]*>?/gm, "");
  }

  MyManager.debounce = debounce;
  MyManager.toPlainText = toPlainText;
})();

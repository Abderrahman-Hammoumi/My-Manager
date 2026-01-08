(() => {
  const MyManager = window.MyManager || (window.MyManager = {});

  MyManager.state = {
    locale: "fr",
    sort: {},
    page: {},
    chartMeta: {},
    tooltipScrollBound: false,
    chartResizeBound: false,
    currentEntityPage: null,
    data: MyManager.loadData()
  };
})();

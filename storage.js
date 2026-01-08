(() => {
  const MyManager = window.MyManager || (window.MyManager = {});
  const STORAGE_KEY = MyManager.STORAGE_KEY;

  let memoryCache = null;

  function readStorage() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return memoryCache;
    }
  }

  function writeStorage(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      memoryCache = value;
    }
  }

  function clearStorage() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      memoryCache = null;
    }
  }

  function loadData() {
    const cached = readStorage();
    if (cached) {
      let parsed = null;
      try {
        parsed = JSON.parse(cached);
      } catch (error) {
        clearStorage();
      }
      if (parsed && typeof parsed === "object") {
        const defaults = {
          customers: [
            { id: "cus-1", name: "Arquetipo Influence", industry: "Marketing", email: "hello@arquetipo.test", phone: "+33 1 33 44 55", status: "Actif" },
            { id: "cus-2", name: "Everis", industry: "Consulting", email: "contact@everis.test", phone: "+33 1 44 55 66", status: "En attente" },
            { id: "cus-3", name: "Cecotec", industry: "Retail", email: "support@cecotec.test", phone: "+33 3 22 11 00", status: "Actif" },
            { id: "cus-4", name: "Luatop Technics", industry: "Manufacturing", email: "sales@luatop.test", phone: "+33 4 88 99 00", status: "Inactif" }
          ]
        };
        let changed = false;
        Object.keys(defaults).forEach((key) => {
          if (!parsed[key]) {
            parsed[key] = defaults[key];
            changed = true;
          }
        });
        if (changed) persist(parsed);
        return parsed;
      }
    }

    const seed = {
      products: [
        { id: uid(), name: "Scanner Pro", categoryId: "hardware", warehouseId: "paris", supplierId: "sup-1", price: 249, stock: 18 },
        { id: uid(), name: "Laptop Nova", categoryId: "hardware", warehouseId: "lyon", supplierId: "sup-2", price: 1299, stock: 9 },
        { id: uid(), name: "Chair Ergo", categoryId: "furniture", warehouseId: "bordeaux", supplierId: "sup-3", price: 189, stock: 42 },
        { id: uid(), name: "Cloud Plan", categoryId: "software", warehouseId: "paris", supplierId: "sup-4", price: 59, stock: 120 },
        { id: uid(), name: "Modular Table", categoryId: "furniture", warehouseId: "lyon", supplierId: "sup-3", price: 279, stock: 15 }
      ],
      suppliers: [
        { id: "sup-1", name: "Alpha Supply", contact: "Nora B.", email: "contact@alpha.test", phone: "+33 1 22 33 44", address: "Paris" },
        { id: "sup-2", name: "DigitalWorks", contact: "Marc L.", email: "hello@digital.test", phone: "+33 1 55 77 99", address: "Lyon" },
        { id: "sup-3", name: "HomeLine", contact: "Ines C.", email: "support@homeline.test", phone: "+33 5 22 88 66", address: "Bordeaux" },
        { id: "sup-4", name: "Cloudify", contact: "Sarah V.", email: "sales@cloudify.test", phone: "+33 9 12 45 78", address: "Remote" }
      ],
      customers: [
        { id: "cus-1", name: "Arquetipo Influence", industry: "Marketing", email: "hello@arquetipo.test", phone: "+33 1 33 44 55", status: "Actif" },
        { id: "cus-2", name: "Everis", industry: "Consulting", email: "contact@everis.test", phone: "+33 1 44 55 66", status: "En attente" },
        { id: "cus-3", name: "Cecotec", industry: "Retail", email: "support@cecotec.test", phone: "+33 3 22 11 00", status: "Actif" },
        { id: "cus-4", name: "Luatop Technics", industry: "Manufacturing", email: "sales@luatop.test", phone: "+33 4 88 99 00", status: "Inactif" }
      ],
      warehouses: [
        { id: "paris", name: "Paris", location: "Paris", capacity: 1200 },
        { id: "lyon", name: "Lyon", location: "Lyon", capacity: 800 },
        { id: "bordeaux", name: "Bordeaux", location: "Bordeaux", capacity: 600 }
      ],
      categories: [
        { id: "hardware", name: "Hardware", description: "Computer hardware" },
        { id: "software", name: "Software", description: "Licenses and subscriptions" },
        { id: "furniture", name: "Furniture", description: "Chairs, tables, storage" }
      ],
      orders: [
        { id: uid(), productId: "", supplierId: "sup-2", quantity: 5, status: "En attente", orderDate: "2024-02-10" },
        { id: uid(), productId: "", supplierId: "sup-1", quantity: 12, status: "Receptionnee", orderDate: "2024-03-18" },
        { id: uid(), productId: "", supplierId: "sup-3", quantity: 8, status: "Confirmee", orderDate: "2024-04-05" }
      ]
    };
    seed.orders[0].productId = seed.products[0].id;
    seed.orders[1].productId = seed.products[2].id;
    seed.orders[2].productId = seed.products[1].id;
    persist(seed);
    return seed;
  }

  function persist(data) {
    writeStorage(JSON.stringify(data));
  }

  function uid() {
    return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  MyManager.loadData = loadData;
  MyManager.persist = persist;
  MyManager.uid = uid;
})();

(() => {
  const MyManager = window.MyManager || (window.MyManager = {});

  MyManager.PAGE_SIZE = 6;
  MyManager.STORAGE_KEY = "mymanager-data-v1";
  MyManager.SESSION_KEY = "mymanager-session";
  MyManager.LOCALE_KEY = "mymanager-locale";

  MyManager.translations = {
    fr: {
      "menu.dashboard": "Tableau de bord",
      "menu.entities": "Entites",
      "entities.products": "Produits",
      "entities.suppliers": "Fournisseurs",
      "entities.customers": "Clients",
      "entities.warehouses": "Entrepots",
      "entities.categories": "Categories",
      "entities.orders": "Commandes d'achat",
      "dashboard.allWarehouses": "Tous les entrepots",
      "dashboard.items": "articles",
      "dashboard.stockValue": "Valeur du stock",
      "dashboard.totalStock": "Stock total",
      "dashboard.pendingOrders": "Commandes en attente",
      "dashboard.estimatedRevenue": "Revenu estime",
      "validation.number": "Valeur numerique invalide",
      "validation.min": "La valeur doit etre au moins",
      "actions.add": "Ajouter",
      "actions.save": "Enregistrer",
      "actions.update": "Mettre a jour",
      "actions.cancel": "Annuler",
      "actions.exportCsv": "Export CSV",
      "actions.exportPdf": "Exporter PDF",
      "actions.refresh": "Rafraichir",
      "actions.logout": "Deconnexion",
      "actions.details": "Voir details",
      "actions.edit": "Modifier",
      "actions.delete": "Supprimer",
      "table.empty": "Aucune donnee a afficher"
    },
    en: {
      "menu.dashboard": "Dashboard",
      "menu.entities": "Entities",
      "entities.products": "Products",
      "entities.suppliers": "Suppliers",
      "entities.customers": "Customers",
      "entities.warehouses": "Warehouses",
      "entities.categories": "Categories",
      "entities.orders": "Purchase Orders",
      "dashboard.allWarehouses": "All warehouses",
      "dashboard.items": "items",
      "dashboard.stockValue": "Stock value",
      "dashboard.totalStock": "Total stock",
      "dashboard.pendingOrders": "Pending orders",
      "dashboard.estimatedRevenue": "Estimated revenue",
      "validation.number": "Enter a valid number",
      "validation.min": "Value must be at least",
      "actions.add": "Add",
      "actions.save": "Save",
      "actions.update": "Update",
      "actions.cancel": "Cancel",
      "actions.exportCsv": "Export CSV",
      "actions.exportPdf": "Export PDF",
      "actions.refresh": "Refresh",
      "actions.logout": "Logout",
      "actions.details": "See details",
      "actions.edit": "Edit",
      "actions.delete": "Delete",
      "table.empty": "No data to display"
    },
    ar: {
    }
  };

  function statusTag(status) {
    const value = String(status ?? "");
    const lowered = value.toLowerCase();
    const isWarn = lowered.includes("en attente") || lowered.includes("pending");
    return `<span class="tag ${isWarn ? "warn" : ""}">${value}</span>`;
  }

  MyManager.statusTag = statusTag;

  MyManager.entityConfigs = {
    products: {
      labelKey: "entities.products",
      formTitle: "Produit",
      fields: [
        { key: "name", label: "Nom", type: "text", required: true },
        { key: "categoryId", label: "Categorie", type: "select", source: "categories", required: true },
        { key: "warehouseId", label: "Entrepot", type: "select", source: "warehouses", required: true },
        { key: "supplierId", label: "Fournisseur", type: "select", source: "suppliers", required: true },
        { key: "price", label: "Prix (MAD)", type: "number", step: "0.01", min: 0.01, required: true },
        { key: "stock", label: "Stock", type: "number", min: 0, required: true }
      ],
      columns: [
        { key: "name", label: "Nom" },
        { key: "categoryId", label: "Categorie", lookup: "categories" },
        { key: "warehouseId", label: "Entrepot", lookup: "warehouses" },
        { key: "supplierId", label: "Fournisseur", lookup: "suppliers" },
        { key: "price", label: "Prix", formatter: (v) => `MAD ${Number(v).toFixed(2)}` },
        { key: "stock", label: "Stock" }
      ]
    },
    suppliers: {
      labelKey: "entities.suppliers",
      formTitle: "Fournisseur",
      fields: [
        { key: "name", label: "Raison sociale", type: "text", required: true },
        { key: "contact", label: "Contact", type: "text" },
        { key: "email", label: "Email", type: "email" },
        { key: "phone", label: "Telephone", type: "text" },
        { key: "address", label: "Adresse", type: "text" }
      ],
      columns: [
        { key: "name", label: "Nom" },
        { key: "contact", label: "Contact" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Telephone" }
      ]
    },
    customers: {
      labelKey: "entities.customers",
      formTitle: "Client",
      fields: [
        { key: "name", label: "Nom", type: "text", required: true },
        { key: "industry", label: "Secteur", type: "text" },
        { key: "email", label: "Email", type: "email" },
        { key: "phone", label: "Telephone", type: "text" },
        { key: "status", label: "Statut", type: "select", options: ["Actif", "En attente", "Inactif"] }
      ],
      columns: [
        { key: "name", label: "Nom" },
        { key: "industry", label: "Secteur" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Telephone" },
        { key: "status", label: "Statut", formatter: (v) => statusTag(v) }
      ]
    },
    warehouses: {
      labelKey: "entities.warehouses",
      formTitle: "Entrepot",
      fields: [
        { key: "name", label: "Nom", type: "text", required: true },
        { key: "location", label: "Ville", type: "text" },
        { key: "capacity", label: "Capacite (palettes)", type: "number", min: 1, required: true }
      ],
      columns: [
        { key: "name", label: "Nom" },
        { key: "location", label: "Ville" },
        { key: "capacity", label: "Capacite" }
      ]
    },
    categories: {
      labelKey: "entities.categories",
      formTitle: "Categorie",
      fields: [
        { key: "name", label: "Nom", type: "text", required: true },
        { key: "description", label: "Description", type: "text" }
      ],
      columns: [
        { key: "name", label: "Nom" },
        { key: "description", label: "Description" }
      ]
    },
    orders: {
      labelKey: "entities.orders",
      formTitle: "Commande",
      fields: [
        { key: "productId", label: "Produit", type: "select", source: "products", required: true },
        { key: "supplierId", label: "Fournisseur", type: "select", source: "suppliers", required: true },
        { key: "quantity", label: "Quantite", type: "number", min: 1, required: true },
        { key: "status", label: "Statut", type: "select", options: ["En attente", "Confirmee", "Receptionnee"] },
        { key: "orderDate", label: "Date", type: "date", required: true }
      ],
      columns: [
        { key: "productId", label: "Produit", lookup: "products" },
        { key: "supplierId", label: "Fournisseur", lookup: "suppliers" },
        { key: "quantity", label: "Quantite" },
        { key: "status", label: "Statut", formatter: (v) => statusTag(v) },
        { key: "orderDate", label: "Date" }
      ]
    }
  };
})();

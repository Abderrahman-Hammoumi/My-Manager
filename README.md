# MyManager Backoffice

Application front-end de gestion (produits, fournisseurs, clients, entrepots, categories, commandes) avec tableau de bord, graphiques et export.

## Fonctionnalites
- Ecran de connexion simple (session en sessionStorage)
- Tableau de bord avec KPI et filtre par entrepot
- CRUD complet par entite (ajout, edition, suppression)
- Recherche, tri et pagination
- Export CSV et impression PDF
- I18n FR / EN / AR

## Demarrage
1) Ouvrir `index.html` dans un navigateur.
2) Se connecter avec un compte demo (voir ci-dessous).

Optionnel: servir le dossier avec un serveur statique si besoin.

## Connexion (demo)
Identifiants par defaut dans `app.js` (ex: `admin / admin`).

## Donnees et stockage
- Donnees stockees en JSON dans `localStorage` (cle `mymanager-data-v1`).
- Session stockee en JSON dans `sessionStorage` (cle `mymanager-session`).
- Des donnees de demo sont injectees si rien n'est present.

## Structure rapide
- `index.html` + pages entites (`products.html`, `customers.html`, etc.)
- `app.js`: login, session, orchestration
- `storage.js`: stockage local (JSON)
- `crud.js`: formulaires, tableaux, export
- `charts.js`: graphiques canvas
- `config.js`: config et schema des entites
- `styles.css`: styles

## Limites
- Pas de backend: tout est local au navigateur.
- Les identifiants sont en clair (demo seulement).

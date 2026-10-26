# Tester maintenant, sans publier l’environnement

1. Installez **Node.js 24** sur votre ordinateur si nécessaire.
2. Extrayez l’archive ZIP et ouvrez un terminal dans le dossier extrait.
3. Exécutez :

```sh
npm ci
npm run dev
```

Ouvrez `http://127.0.0.1:3000` **sur votre ordinateur**, une fois le lanceur démarré. Le mot de passe est le champ `password` du fichier local `runtime/desktop-access.json`. Ne partagez pas ce fichier.

Connectez-vous, choisissez des dates futures (au moins sept nuits de séjour pour les valeurs par défaut), puis cliquez sur **Generate options**. Résultat attendu : demande enregistrée puis statut **blocked**, avec le détail des fournisseurs indisponibles. Actualisez la page, reconnectez-vous si le formulaire le demande : la demande est conservée tant que votre session reste la même. Arrêtez avec Ctrl-C. `npm run dev` redémarre les services et conserve SQLite.

Ce prototype ne renvoie actuellement aucun vol, hôtel ou prix. Il permet de tester la saisie, la validation et le traitement des demandes. Il n’inclut pas de fausses offres. Pour vérifier automatiquement ces composants : `npm test` et `npm run check`.

Une recherche réelle nécessitera une installation Codex autorisée dont le catalogue de plugins fonctionne, puis la validation des six fournisseurs et l’implémentation des adaptateurs. Aucun compte cloud payant n’est nécessaire pour ce test local.

## Si votre ordinateur utilise Node.js 20

Sans remplacer Node pour vos autres projets, lancez cette application avec Node 24 :

```powershell
npx --yes --package=node@24 -- node scripts/dev.mjs
```

Cette commande télécharge Node 24 dans le cache npm et l’utilise pour le serveur et le worker. Les avertissements EBADENGINE de `npm ci` exécuté avec Node 20 restent possibles ; ils ne doivent pas être confondus avec un échec de téléchargement. Ne lancez pas `npm audit fix --force` : les versions corrigées sont déjà épinglées dans le dépôt.

## Vérifier Codex sur votre propre ordinateur

Le worker ne lance pas Codex pour le moment. L’erreur HTTP 451 observée dans le sandbox cloud ne prouve pas un blocage de votre machine. Dans un deuxième terminal, exécutez `codex --version`, puis `codex login status`, puis `codex plugin list --available --json` si votre version dispose de cette commande. Ces diagnostics ne lancent pas de recherche voyage. Ne transmettez aucun jeton ni fichier d’authentification. Une découverte réussie reste à suivre d’une validation des outils et d’un adaptateur réel.

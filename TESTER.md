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

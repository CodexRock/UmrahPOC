# Exécuter les mêmes plugins depuis le worker : état documenté

Investigation du 26 octobre 2026, après la session conversationnelle décrite dans CONVERSATIONAL_PLANNER.md. Aucune intégration API fournisseur, aucun serveur MCP fournisseur séparé, aucune construction/publication de site ni ressource d’hébergement n’a été ajouté.

## Distinction vérifiée

Dans cette conversation, les appels eDreams, Booking.com et XE ont produit les données de la session Orly. Cela démontre le planificateur conversationnel, pas un accès depuis `src/worker.ts`.

Le test CLI déjà effectué sur cette même machine reste la preuve worker disponible : Codex CLI 0.163.0, connexion ChatGPT, catalogue retournant **HTTP 451 / no_biscuit_no_service**, listes installées/disponibles vides. Le code de sortie zéro n’annule pas l’erreur. Aucun appel fournisseur n’a été possible depuis ce chemin. Ce constat n’est pas une preuve d’indisponibilité générale de ces plugins sur toutes les installations.

## Voies examinées, sans changer de modèle d’intégration

### Plugins Codex installés + exécution non interactive

La [documentation officielle des plugins](https://learn.chatgpt.com/docs/plugins) indique un annuaire universel commun et un navigateur de plugins dans Codex CLI. Elle demande une installation depuis une marketplace configurée puis une nouvelle session. Elle indique aussi que certains plugins ne sont pas disponibles avec l’authentification par clé API, notamment selon leurs flux OAuth.

La [documentation du mode non interactif](https://learn.chatgpt.com/docs/non-interactive-mode) décrit `codex exec`, les événements JSON, les schémas de sortie et la réutilisation de l’authentification CLI. Ce mécanisme est documenté ; l’accès à **ces fournisseurs précis**, leurs connexions et leurs règles d’affichage n’est pas prouvé par cette description. Le catalogue 451 empêche actuellement de résoudre leurs identifiants canoniques et de vérifier leurs actions dans le worker. Aucun identifiant du chat n’a été copié ou deviné.

C’est la voie candidate pour le worker existant, mais elle reste **non démontrée**. Aucun appel libre au modèle n’a été lancé pour simuler une recherche fournisseur.

### Codex App Server

La [documentation App Server](https://learn.chatgpt.com/docs/app-server), relue, décrit `app/installed` (état activé/appelable), `app/list` (découverte) et `app/read` (résumés d’outils **display-only**). Des métadonnées ne sont pas une invocation ni une permission.

Elle marque `plugin/list`, `plugin/read` et `plugin/install` en développement avec la consigne de ne pas les appeler depuis des clients de production. Elle indique également que l’authentification App Server n’a pas été permise pour les services commerciaux ou hébergés et oriente ces usages vers Sign in with ChatGPT. Les transports expérimentaux ne sont pas une solution de production. `codex app-server --help` a été inspecté ; aucun serveur public ni login alternatif n’a été lancé. Cette voie n’est donc pas présentée comme un contournement autorisé du catalogue ou un worker hébergé opérationnel.

### Sign in with ChatGPT

La [page officielle](https://learn.chatgpt.com/codex/sign-in-with-chatgpt) distingue identité et autorisation d’utiliser le plan. Elle ne garantit pas la transmission des connexions voyage de cette conversation ni les actions de ces plugins au worker. Aucun accès n’a été demandé, token transféré ou nouvelle application partenaire créée sur cette base.

### Plugins dans ChatGPT Sites

La [documentation officielle des connexions Sites](https://learn.chatgpt.com/codex/sites/data-and-connections#bring-user-data-to-your-site-with-plugins) décrit une voie distincte pour des sites privés du workspace : identité ChatGPT du visiteur, consentement aux connexions, permissions du workspace et actions prises en charge. `getContext()` découvre des schémas en cache, pas une preuve d’appel ni un pont pour le worker Fastify existant.

La liste détaillée d’actions prises en charge est renvoyée au Help Center ; sa lecture a retourné HTTP 403 depuis cet environnement. La disponibilité des actions voyage/XE et leurs contraintes n’est donc pas établie par les sources consultées. Aucun site, prévisualisation, déploiement ou nouvelle architecture n’a été créé pour masquer cette lacune.

### Guide API « plugins »

Le [guide officiel Agents API](https://developers.openai.com/api/docs/guides/agents-api/tools/plugins) décrit des paquets fournis par le développeur, avec skills et configuration de serveurs, chargés depuis un répertoire ou une archive. Ce n’est pas une preuve d’accès aux plugins voyage hébergés de cette conversation. Reconstituer un paquet fournisseur ou ajouter un serveur/API séparé changerait le modèle demandé : cela n’a pas été fait.

## Limitation précise et décision

**Aucun chemin documenté et effectivement démontré ne permet actuellement au worker de ce projet d’appeler ces mêmes plugins voyage et XE en autonomie.** Le chemin CLI candidat échoue au catalogue ; les autres descriptions consultées n’établissent ni une disponibilité de ces outils précis ni une autorisation applicable au worker hébergé.

Le livrable utilisable est donc le **planificateur conversationnel**, ses liens et son calcul validé des prix affichés. Le worker conserve un état bloqué honnête. Hébergement, migration de stockage et polissage UI restent en pause. La prochaine preuve nécessaire est un appel réel d’un de ces mêmes plugins depuis une surface officiellement prise en charge, avant tout autre investissement d’infrastructure. Aucune API fournisseur ou intégration MCP séparée ne sera utilisée pour remplacer cette preuve.

## Nouvelle tentative de réparation CLI

La version officielle stable 0.164.0 a été installée et comparée à la version gérée 0.163.0. Le catalogue refuse les deux avec le même HTTP 451. Un test minimal sans outil révèle aussi un échec d’initialisation du runtime en lecture seule, avant toute réponse du modèle. Les réglages documentés des répertoires d’état/logs n’ont pas suffi. Voir [CLI_DIAGNOSIS.md](CLI_DIAGNOSIS.md) : deux problèmes distincts à vérifier après la mise à jour de l’environnement, sans conclure que tout accès CLI est impossible.

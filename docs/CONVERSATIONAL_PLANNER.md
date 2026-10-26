# Planificateur conversationnel exclusivement fondé sur les plugins

Session réelle du 26 octobre 2026. L’utilisateur a explicitement accepté **Paris-Orly comme variante distincte de CDG**. Aucun achat ou réservation n’a été effectué.

## Session réalisée

Deux adultes, une chambre, quatre nuits à Makkah, trois à Madinah, affichage en EUR.

| Composant | Dates et base | Montant d’origine | Équivalent EUR |
| --- | --- | --- | --- |
| Vols eDreams, Pegasus Airlines | ORY → JED : 7 décembre 15 h 45 → 8 décembre 4 h 10 ; JED → ORY : 16 décembre 5 h 30 → 14 h 40. Horaires locaux ; une escale par sens. Aller-retour **pour deux adultes**, hors Prime. | 1 002 EUR | 1 002,00 EUR |
| voco Makkah by IHG, Booking.com | Check-in 8 décembre, checkout exclusif 12 décembre ; quatre nuits, deux adultes, une chambre. Total affiché pour ce séjour. | 1 131,43 SAR | 269,83 EUR |
| Artal Taiba Hotel, Booking.com | Check-in 12 décembre, checkout exclusif 15 décembre ; trois nuits, deux adultes, une chambre. Total affiché pour ce séjour. | 960 SAR | 228,94 EUR |
| Deux hôtels | Les deux totaux de séjour sont additionnés **sans nouvelle multiplication par les nuits**. | 2 091,43 SAR | 498,77 EUR |
| **Sous-total des prix affichés** | Vols + les deux séjours | 1 002 EUR + 2 091,43 SAR | **1 500,77 EUR** |

Moyenne par adulte : **750,39 EUR**, arrondie au centime. L’addition de deux moyennes arrondies peut différer d’un centime du total groupe.

XE a effectivement converti 2 091,43 SAR. Taux médian retourné : `0.2384830521 EUR/SAR`, daté du `2026-10-26T19:55:00Z` (20 h 55 à Paris). Valeur avant arrondi : `498.770609653503 EUR`. Le taux est daté par XE ; l’heure de l’appel n’est pas présentée comme une nouvelle cotation.

Le prix eDreams est `total_booking_price = 1002`, cohérent avec `price_per_person = 501` × 2. Le prix Prime de 869 EUR n’est pas utilisé.

## Liens véritables

- [voco Makkah by IHG — Booking.com](https://www.booking.com/hotel/sa/voco-makkah.html?aid=2438770&checkin=2026-12-08&checkout=2026-12-12&no_rooms=1&group_adults=2&selected_currency=SAR)
- [Artal Taiba Hotel — Booking.com](https://www.booking.com/hotel/sa/fndq-rtl-lmdynh.html?aid=2438770&checkin=2026-12-12&checkout=2026-12-15&no_rooms=1&group_adults=2&selected_currency=SAR)
- Le clickout eDreams exact est conservé dans la réponse conversationnelle et la preuve privée ignorée par Git. Il contient `prime=true` : ses paramètres ne sont pas modifiés. Le calcul utilise le prix ordinaire explicite du résultat ; le lien n’a pas été vérifié comme ouvrant directement cet état tarifaire hors Prime.

Les liens Booking sont des pages d’établissement avec les paramètres de séjour, pas une garantie de reproduction d’une chambre ou d’une offre précise.

## Ce qui manque

Le sous-total est validé mathématiquement et les dates/occupations/aéroports ont été contrôlés. **Le montant final payable reste inconnu** : suppléments éventuels, conditions d’accès aux tarifs hôteliers et annulation ne sont pas détaillés par les réponses. Le schéma Booking définit le champ de prix comme le coût total de la requête, et `book` comme le montant légalement affiché incluant les charges obligatoirement affichables ; d’autres charges peuvent s’ajouter. Le précédent rapport déclarant toute base nuit/séjour inconnue était trop restrictif sur ce point et est corrigé ici.

- Bagage enregistré souhaité mais non confirmé par eDreams ; aéroport d’escale non fourni.
- Arrivée le 8 à 4 h 10 : aucun check-in anticipé ni chambre disponible dès l’arrivée n’est garanti.
- Dernier checkout le 15, vol le 16 à 5 h 30 : aucun hôtel n’est inclus pour la nuit du 15 au 16. Cette période est du transit/de l’attente à organiser.
- Transports JED–Makkah, Makkah–Madinah et Madinah–JED non recherchés, non chiffrés, faisabilité non confirmée.
- Visa, assurance, repas et autres coûts exclus. Conditions d’entrée et éligibilité à l’Omra non vérifiées officiellement.
- Les fournisseurs doivent confirmer prix et disponibilités ; chaque composant est réservé séparément.

## Fonctionnement réutilisable dans la conversation

1. Lire les instructions actuelles des plugins et valider les critères. Ne pas remplacer un aéroport sans accord explicite.
2. Chercher les vols avec un plugin autorisé ; contrôler les aéroports réellement retournés, les voyageurs, les horaires et la base du prix. Hors Prime par défaut.
3. Déduire les check-ins en heure saoudienne à partir du vol choisi ; chercher les deux séjours avec leur occupation complète. Conserver les montants et liens intacts.
4. Appeler XE pour la vraie paire et le montant à convertir ; calculer avec décimales sûres. Afficher un sous-total des prix retournés et les coûts/conditions inconnus.
5. Présenter une seule option si c’est la seule combinaison validée ; ne pas inventer trois variantes.

Le validateur pur `src/conversation.ts` contrôle la capture issue des appels réels ; `npm run validate:conversation` a produit le résultat ci-dessus. Les captures et clickouts sont dans `runtime/`, exclus de Git. Une capture arbitraire ne prouve pas un appel : la provenance reste le journal des outils de cette conversation. Ce validateur ne remplace pas les plugins et n’est pas un pont entre la conversation et le worker. Il calcule un sous-total affiché, conserve les inconnues et n’active aucune réservation.

Le parcours conversationnel fonctionne avec les limites exposées. Le déclenchement autonome depuis le site n’est pas démontré : voir PLUGIN_EXECUTION.md.

# Plan d'implémentation : Module Chatbot Assistant

## Vue d'ensemble

Implémentation du module Chatbot Assistant en trois phases : backend Laravel (service + contrôleur + route), frontend React (contexte + widget + service API), puis tests PHPUnit avec la bibliothèque eris/eris pour les propriétés de correction.

## Tâches

- [x] 1. Backend — `ChatbotService` : moteur de mots-clés et requêtes DB
  - Créer `backend/app/Services/ChatbotService.php`
  - Implémenter `detectCategory(string $message): string` avec la table de priorité définie dans le design (catégories DB évaluées en premier : `pending`, `derniere`, `total`, `equipe`)
  - Implémenter `handle(string $message, User $user): array` retournant `['reply' => string, 'category' => string]`
  - Implémenter les méthodes DB privées : `getDemandesEnAttente`, `getDerniereDemande`, `getTotalDemandes`, `getDemandesEquipeEnAttente` (manager uniquement)
  - Entourer les requêtes DB d'un try/catch retournant le message générique en cas d'erreur (Exigence 4.6)
  - _Exigences : 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 1.1 Test de propriété P6 — Correspondance mots-clés → catégorie
    - Utiliser `eris/eris` pour générer des messages contenant aléatoirement des mots-clés de chaque catégorie statique (`creation`, `statut`, `type`, `aide`)
    - Vérifier que `detectCategory()` retourne la catégorie attendue pour chaque message généré
    - Minimum 100 itérations
    - **Propriété 6 : Correspondance mots-clés → catégorie de réponse**
    - **Valide : Exigences 3.1, 3.2, 3.3, 3.4**

  - [ ]* 1.2 Test de propriété P7 — Fallback
    - Utiliser `eris/eris` pour générer des messages aléatoires ne contenant aucun mot-clé connu
    - Vérifier que `handle()` retourne `category === 'fallback'`
    - Minimum 100 itérations
    - **Propriété 7 : Réponse de repli (fallback)**
    - **Valide : Exigence 3.5**

  - [ ]* 1.3 Test de propriété P8 — Exactitude des données personnalisées
    - Utiliser `eris/eris` pour générer des utilisateurs avec N demandes en attente aléatoires (N entre 0 et 20)
    - Vérifier que la réponse de `handle()` pour une question `pending` contient exactement N
    - Répéter pour `total` et `derniere`
    - Minimum 100 itérations
    - **Propriété 8 : Exactitude des données personnalisées**
    - **Valide : Exigences 4.1, 4.2, 4.3**

  - [ ]* 1.4 Test de propriété P9 — Isolation des données utilisateur
    - Utiliser `eris/eris` pour générer des paires d'utilisateurs distincts (A, B) avec des demandes différentes
    - Vérifier que la réponse de `handle()` pour l'utilisateur A ne contient aucune donnée appartenant à B
    - Minimum 100 itérations
    - **Propriété 9 : Isolation des données utilisateur**
    - **Valide : Exigences 4.5, 5.3**

- [x] 2. Backend — `ChatbotController` et enregistrement de la route
  - Créer `backend/app/Http/Controllers/ChatbotController.php`
  - Injecter `ChatbotService` via le constructeur
  - Implémenter `message(Request $request): JsonResponse` :
    - Valider `message` : chaîne non vide, max 500 caractères (HTTP 422 si invalide)
    - Passer `$request->user()` au service (jamais un ID du corps de la requête — Exigence 5.3)
    - Retourner `{ reply, category }` en HTTP 200
    - Retourner HTTP 500 avec message générique en cas d'exception inattendue
  - Ajouter dans `backend/routes/api.php`, dans le groupe `auth:sanctum` :
    `Route::post('/chatbot/message', [ChatbotController::class, 'message']);`
  - Ajouter l'import `use App\Http\Controllers\ChatbotController;` dans `api.php`
  - _Exigences : 5.1, 5.2, 5.3_

  - [ ]* 2.1 Test d'intégration — Authentification de la route
    - Vérifier que `POST /api/chatbot/message` sans token retourne HTTP 401
    - Vérifier que la route est bien enregistrée dans le groupe `auth:sanctum`
    - Vérifier qu'un message valide avec token retourne HTTP 200 avec `reply` et `category`
    - _Exigences : 5.1, 5.2_

- [x] 3. Checkpoint — Tests backend
  - S'assurer que tous les tests PHPUnit passent (`php artisan test --filter Chatbot`)
  - Demander à l'utilisateur si des ajustements sont nécessaires avant de passer au frontend.

- [x] 4. Frontend — `ChatContext`
  - Créer `frontend/src/context/ChatContext.jsx`
  - Définir l'état : `messages` (tableau, max 100 éléments), `isOpen` (booléen), `isLoading` (booléen)
  - Exposer les actions : `sendMessage`, `toggleChat`, `clearHistory`
  - Implémenter la limite de 100 messages : supprimer les plus anciens en premier (Exigence 7.3)
  - Appeler `clearHistory` lors de la déconnexion en s'abonnant à `logout` de `AuthContext` (Exigence 7.2)
  - Exporter `ChatProvider` et le hook `useChat`
  - _Exigences : 1.3, 6.1, 7.1, 7.2, 7.3_

- [x] 5. Frontend — Service API chatbot
  - Ajouter dans `frontend/src/services/api.js` :
    ```js
    export const chatbotService = {
      sendMessage: (message) => api.post('/chatbot/message', { message }),
    };
    ```
  - _Exigences : 2.1, 5.1_

- [x] 6. Frontend — Composant `ChatWidget`
  - Créer `frontend/src/components/chat/ChatWidget.jsx`
  - Implémenter le bouton flottant (`position: fixed; bottom: 24px; right: 24px; z-index: 1000`) qui ouvre/ferme la fenêtre (Exigence 1.2)
  - Implémenter la fenêtre de conversation avec :
    - `ChatHeader` : titre + bouton de fermeture (Exigence 1.3)
    - `ChatMessages` : liste des bulles de messages avec distinction visuelle user/bot (Exigence 2.2) + indicateur de chargement (Exigence 2.3) + défilement automatique vers le dernier message (Exigence 2.5)
    - `ChatSuggestions` : suggestions cliquables affichées uniquement si l'historique est vide (Exigence 6.2, 6.3)
    - `ChatInput` : champ de saisie + bouton d'envoi désactivé si vide (Exigence 2.4) + envoi sur Entrée (Exigence 2.1)
  - Afficher le message de bienvenue personnalisé avec le prénom de l'utilisateur à la première ouverture (Exigence 6.1)
  - Gérer les erreurs réseau/HTTP en affichant un message d'erreur dans la fenêtre avec le style `bot` (design — Gestion des erreurs frontend)
  - _Exigences : 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 6.1, 6.2, 6.3_

- [x] 7. Frontend — Intégration dans `DashboardLayout`
  - Modifier `frontend/src/components/shared/DashboardLayout.jsx` :
    - Importer `ChatProvider` depuis `../../context/ChatContext`
    - Importer `ChatWidget` depuis `../chat/ChatWidget`
    - Entourer le contenu existant du composant avec `<ChatProvider>`
    - Ajouter `<ChatWidget />` après le bloc `<main>` (avant la fermeture de `<ChatProvider>`)
  - _Exigences : 1.1, 1.4, 7.1_

- [x] 8. Checkpoint final — Vérification complète
  - S'assurer que tous les tests PHPUnit passent
  - Vérifier que le widget s'affiche correctement dans le `DashboardLayout` pour tous les rôles
  - Vérifier que l'historique persiste lors de la navigation entre les pages
  - Demander à l'utilisateur si des ajustements sont nécessaires.

## Notes

- Les tâches marquées `*` sont optionnelles et peuvent être ignorées pour un MVP rapide
- Les tests de propriétés utilisent la bibliothèque `eris/eris` déjà installée dans le projet backend
- Chaque tâche référence les exigences spécifiques pour la traçabilité
- Les checkpoints garantissent une validation incrémentale avant de passer à la phase suivante
- Les tests de propriétés P6, P7, P8, P9 couvrent les garanties de correction du `ChatbotService`

# Document des Exigences — Module Chatbot Assistant

## Introduction

Ce document décrit les exigences fonctionnelles du module **Chatbot Assistant** à intégrer dans la plateforme de gestion des autorisations. Le chatbot permet aux utilisateurs authentifiés de poser des questions en langage naturel et d'obtenir des réponses instantanées concernant leurs demandes, les statuts, et les informations générales de la plateforme. Le système repose sur une correspondance par mots-clés (sans API d'IA externe) et peut interroger la base de données pour fournir des informations personnalisées à l'utilisateur connecté.

---

## Glossaire

- **Chatbot_Assistant** : Le module de chat automatique intégré au tableau de bord.
- **Widget_Chat** : L'interface flottante affichée dans le coin inférieur droit du DashboardLayout.
- **Moteur_Reponse** : Le composant backend responsable de l'analyse des messages et de la génération des réponses.
- **Base_Connaissances** : L'ensemble des règles de correspondance mots-clés/réponses définies côté backend.
- **Utilisateur** : Tout utilisateur authentifié (employé, manager, RH, admin).
- **Demande** : Une demande de congé, d'autorisation d'absence ou d'autorisation de sortie soumise par un employé.
- **Statut** : L'état courant d'une demande parmi : `en_attente_responsable`, `validee_responsable`, `refusee_responsable`, `validee_definitivement`, `refusee_rh`.
- **Session_Chat** : La liste des messages échangés entre l'Utilisateur et le Chatbot_Assistant durant une session de navigation.

---

## Exigences

### Exigence 1 : Affichage du Widget Chat

**User Story :** En tant qu'utilisateur authentifié, je veux voir un bouton de chat flottant dans le tableau de bord, afin de pouvoir accéder rapidement au chatbot sans quitter ma page courante.

#### Critères d'acceptation

1. THE Widget_Chat SHALL être affiché dans le coin inférieur droit du DashboardLayout pour tous les rôles (employé, manager, RH, admin).
2. WHEN l'utilisateur clique sur le bouton flottant du Widget_Chat, THE Widget_Chat SHALL s'ouvrir et afficher la fenêtre de conversation.
3. WHEN la fenêtre de conversation est ouverte et que l'utilisateur clique sur le bouton de fermeture, THE Widget_Chat SHALL se fermer sans perdre l'historique de la Session_Chat en cours.
4. THE Widget_Chat SHALL rester visible et accessible quelle que soit la page active dans le DashboardLayout.

---

### Exigence 2 : Envoi et affichage des messages

**User Story :** En tant qu'utilisateur, je veux saisir un message et recevoir une réponse affichée dans la fenêtre de chat, afin d'interagir naturellement avec le chatbot.

#### Critères d'acceptation

1. WHEN l'utilisateur saisit un message dans le champ de saisie et appuie sur Entrée ou clique sur le bouton d'envoi, THE Widget_Chat SHALL envoyer le message au Moteur_Reponse et afficher le message de l'utilisateur dans la fenêtre de conversation.
2. WHEN le Moteur_Reponse retourne une réponse, THE Widget_Chat SHALL afficher la réponse du Chatbot_Assistant dans la fenêtre de conversation avec une distinction visuelle claire entre les messages de l'utilisateur et ceux du chatbot.
3. WHILE une requête est en cours de traitement, THE Widget_Chat SHALL afficher un indicateur de chargement.
4. IF le champ de saisie est vide, THEN THE Widget_Chat SHALL désactiver le bouton d'envoi et ne pas soumettre de requête.
5. THE Widget_Chat SHALL faire défiler automatiquement la fenêtre de conversation vers le dernier message reçu.

---

### Exigence 3 : Traitement des messages par mots-clés

**User Story :** En tant qu'utilisateur, je veux que le chatbot comprenne mes questions courantes sur les demandes et la plateforme, afin d'obtenir des réponses pertinentes sans avoir à naviguer dans les menus.

#### Critères d'acceptation

1. WHEN un message contient des mots-clés liés à la création d'une demande (ex. : "créer", "nouvelle demande", "soumettre"), THE Moteur_Reponse SHALL retourner une réponse expliquant la procédure de création d'une demande.
2. WHEN un message contient des mots-clés liés au statut des demandes (ex. : "statut", "état", "en attente", "validée", "refusée"), THE Moteur_Reponse SHALL retourner une réponse décrivant les différents statuts possibles.
3. WHEN un message contient des mots-clés liés aux types de demandes (ex. : "congé", "absence", "sortie"), THE Moteur_Reponse SHALL retourner une réponse décrivant le type de demande correspondant.
4. WHEN un message contient des mots-clés liés à l'aide générale (ex. : "aide", "help", "bonjour", "comment"), THE Moteur_Reponse SHALL retourner un message de bienvenue listant les sujets disponibles.
5. IF aucun mot-clé connu n'est détecté dans le message, THEN THE Moteur_Reponse SHALL retourner un message indiquant que la question n'a pas été comprise et proposant des sujets disponibles.
6. THE Base_Connaissances SHALL être définie côté backend et ne pas nécessiter de modification du code frontend pour l'ajout de nouvelles règles.

---

### Exigence 4 : Requêtes personnalisées sur la base de données

**User Story :** En tant qu'utilisateur authentifié, je veux pouvoir demander des informations sur mes propres demandes (nombre, statut, etc.), afin d'obtenir des données à jour sans naviguer vers la liste des demandes.

#### Critères d'acceptation

1. WHEN un message contient des mots-clés liés au nombre de demandes en attente (ex. : "combien", "en attente", "pending"), THE Moteur_Reponse SHALL interroger la base de données et retourner le nombre de demandes en attente de l'utilisateur connecté.
2. WHEN un message contient des mots-clés liés aux demandes récentes (ex. : "dernière demande", "récente", "dernière"), THE Moteur_Reponse SHALL interroger la base de données et retourner les informations de la dernière demande soumise par l'utilisateur connecté (type, statut, date).
3. WHEN un message contient des mots-clés liés au total des demandes (ex. : "total", "toutes mes demandes", "historique"), THE Moteur_Reponse SHALL interroger la base de données et retourner le nombre total de demandes de l'utilisateur connecté.
4. WHERE le rôle de l'utilisateur est manager, THE Moteur_Reponse SHALL être capable de retourner le nombre de demandes en attente de traitement dans son équipe.
5. THE Moteur_Reponse SHALL uniquement accéder aux données appartenant à l'utilisateur authentifié, sans exposer les données d'autres utilisateurs.
6. IF une erreur survient lors de l'interrogation de la base de données, THEN THE Moteur_Reponse SHALL retourner un message d'erreur générique sans exposer les détails techniques.

---

### Exigence 5 : Sécurité et authentification

**User Story :** En tant qu'administrateur, je veux que le chatbot soit accessible uniquement aux utilisateurs authentifiés, afin de protéger les données personnelles des employés.

#### Critères d'acceptation

1. THE Chatbot_Assistant SHALL être accessible uniquement aux utilisateurs authentifiés via Laravel Sanctum.
2. WHEN une requête est envoyée au Moteur_Reponse sans token d'authentification valide, THE Moteur_Reponse SHALL retourner une réponse HTTP 401 sans traiter le message.
3. THE Moteur_Reponse SHALL utiliser l'identité de l'utilisateur authentifié pour filtrer les données retournées, sans accepter d'identifiant utilisateur fourni dans le corps de la requête.

---

### Exigence 6 : Message de bienvenue et suggestions

**User Story :** En tant qu'utilisateur, je veux voir un message de bienvenue et des suggestions de questions à l'ouverture du chat, afin de savoir rapidement ce que le chatbot peut faire.

#### Critères d'acceptation

1. WHEN le Widget_Chat est ouvert pour la première fois dans une session, THE Chatbot_Assistant SHALL afficher un message de bienvenue personnalisé avec le prénom de l'utilisateur connecté.
2. THE Chatbot_Assistant SHALL afficher une liste de suggestions de questions cliquables (ex. : "Combien de demandes en attente ?", "Comment créer une demande ?", "Quels sont les types de demandes ?").
3. WHEN l'utilisateur clique sur une suggestion, THE Widget_Chat SHALL envoyer automatiquement la suggestion comme message et afficher la réponse correspondante.

---

### Exigence 7 : Persistance de la session de chat

**User Story :** En tant qu'utilisateur, je veux que l'historique de ma conversation soit conservé pendant ma session de navigation, afin de ne pas perdre le contexte si je change de page.

#### Critères d'acceptation

1. WHILE l'utilisateur navigue entre les pages du DashboardLayout, THE Widget_Chat SHALL conserver l'historique de la Session_Chat sans le réinitialiser.
2. WHEN l'utilisateur se déconnecte ou ferme le navigateur, THE Chatbot_Assistant SHALL effacer l'historique de la Session_Chat.
3. THE Widget_Chat SHALL limiter l'historique affiché à 100 messages maximum par session afin de préserver les performances.

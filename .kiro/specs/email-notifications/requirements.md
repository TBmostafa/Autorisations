# Document de Exigences

## Introduction

Cette fonctionnalité ajoute des notifications par email aux notifications in-app déjà existantes sur la plateforme de gestion des demandes. Lorsqu'un employé soumet une demande, le manager concerné reçoit un email. Lorsque le manager traite la demande, le service RH reçoit un email pour validation ou suivi. L'employé est notifié par email à chaque changement de statut de sa demande. L'administrateur ne reçoit des emails que dans des cas spécifiques (anomalies, absence de manager assigné) afin d'éviter une surcharge de notifications.

Le système s'appuie sur l'infrastructure Laravel existante (Mailable, Queue) et complète le modèle `Notification` et le `NotificationController` déjà en place.

---

## Glossaire

- **Système** : L'application Laravel de gestion des demandes.
- **Employé** : Utilisateur avec le rôle `employe`, auteur d'une demande.
- **Manager** : Utilisateur avec le rôle `manager`, responsable de la première validation d'une demande.
- **RH** : Utilisateur avec le rôle `rh`, responsable de la validation définitive d'une demande.
- **Administrateur** : Utilisateur avec le rôle `admin`, superviseur de la plateforme.
- **Demande** : Instance du modèle `Demande`, représentant une demande de congé, d'autorisation d'absence ou de sortie.
- **Email_Service** : Composant Laravel responsable de la composition et de l'envoi des emails (Mailable + Queue).
- **Statut** : Valeur du champ `statut` d'une `Demande` parmi : `en_attente_responsable`, `validee_responsable`, `refusee_responsable`, `validee_definitivement`, `refusee_rh`.
- **Notification_In_App** : Enregistrement dans le modèle `Notification` affiché dans l'interface utilisateur.

---

## Exigences

### Exigence 1 : Notification email au Manager lors de la soumission d'une demande

**User Story :** En tant que Manager, je veux recevoir un email lorsqu'un employé de mon équipe soumet une demande, afin de pouvoir la traiter rapidement.

#### Critères d'acceptation

1. WHEN un Employé soumet une Demande avec un `manager_id` valide, THE Email_Service SHALL envoyer un email au Manager dont l'`id` correspond au `manager_id` de la Demande.
2. WHEN un Employé soumet une Demande, THE Email_Service SHALL inclure dans l'email le nom de l'Employé, le type de la Demande, les dates de début et de fin, et la référence de la Demande (identifiant formaté sur 5 chiffres).
3. IF un Employé soumet une Demande sans `manager_id` assigné, THEN THE Email_Service SHALL ne pas envoyer d'email de Manager et SHALL notifier l'Administrateur par email qu'une demande a été créée sans manager assigné.
4. WHEN un Employé soumet une Demande, THE Email_Service SHALL envoyer l'email de manière asynchrone via la file d'attente Laravel (Queue) afin de ne pas bloquer la réponse HTTP.

---

### Exigence 2 : Notification email au RH après validation par le Manager

**User Story :** En tant que membre du service RH, je veux recevoir un email lorsqu'un Manager valide une demande, afin de pouvoir procéder à la validation définitive sans délai.

#### Critères d'acceptation

1. WHEN le statut d'une Demande est mis à jour à `validee_responsable`, THE Email_Service SHALL envoyer un email à tous les utilisateurs actifs ayant le rôle `rh`.
2. WHEN THE Email_Service envoie un email au RH, THE Email_Service SHALL inclure le nom de l'Employé, le type de la Demande, les dates, la référence de la Demande et le nom du Manager ayant validé.
3. IF aucun utilisateur actif avec le rôle `rh` n'existe, THEN THE Email_Service SHALL notifier l'Administrateur par email qu'une demande validée par le Manager est en attente sans destinataire RH.

---

### Exigence 3 : Notification email à l'Employé lors du changement de statut

**User Story :** En tant qu'Employé, je veux recevoir un email à chaque changement de statut de ma demande, afin d'être informé de son avancement sans avoir à me connecter à la plateforme.

#### Critères d'acceptation

1. WHEN le statut d'une Demande est mis à jour, THE Email_Service SHALL envoyer un email à l'Employé propriétaire de la Demande.
2. WHEN THE Email_Service envoie un email à l'Employé, THE Email_Service SHALL inclure le nouveau statut en langage naturel, le type de la Demande, les dates et, si présent, le commentaire du Manager ou du RH.
3. THE Email_Service SHALL utiliser les libellés de statut suivants dans les emails : `validee_responsable` → "Validée par votre responsable", `refusee_responsable` → "Refusée par votre responsable", `validee_definitivement` → "Validée définitivement par le service RH", `refusee_rh` → "Refusée par le service RH".

---

### Exigence 4 : Notifications email à l'Administrateur dans les cas spécifiques uniquement

**User Story :** En tant qu'Administrateur, je veux recevoir des emails uniquement pour les anomalies ou situations nécessitant mon intervention, afin de ne pas être submergé de notifications inutiles.

#### Critères d'acceptation

1. THE Email_Service SHALL envoyer un email à l'Administrateur uniquement dans les cas suivants : (a) une Demande est soumise sans `manager_id` assigné, (b) aucun utilisateur RH actif n'est disponible pour traiter une demande validée par le Manager.
2. WHEN THE Email_Service envoie un email à l'Administrateur pour une anomalie, THE Email_Service SHALL inclure la description de l'anomalie, la référence de la Demande concernée et le nom de l'Employé.
3. IF aucun utilisateur actif avec le rôle `admin` n'existe, THEN THE Email_Service SHALL journaliser l'anomalie dans les logs Laravel sans lever d'exception.

---

### Exigence 5 : Cohérence entre notifications in-app et notifications email

**User Story :** En tant qu'utilisateur de la plateforme, je veux que les notifications email soient cohérentes avec les notifications in-app, afin d'avoir une expérience uniforme.

#### Critères d'acceptation

1. WHEN THE Email_Service envoie un email suite à un événement sur une Demande, THE Système SHALL également créer une `Notification_In_App` correspondante pour le même destinataire et le même événement.
2. THE Email_Service SHALL utiliser les mêmes libellés de type et de statut que ceux utilisés dans les `Notification_In_App` existantes.

---

### Exigence 6 : Fiabilité et gestion des erreurs d'envoi

**User Story :** En tant qu'administrateur technique, je veux que les échecs d'envoi d'email soient gérés proprement, afin que les pannes du serveur SMTP n'impactent pas le fonctionnement de la plateforme.

#### Critères d'acceptation

1. IF l'envoi d'un email échoue, THEN THE Email_Service SHALL journaliser l'erreur dans les logs Laravel avec le niveau `error`, en incluant le destinataire, le type d'email et le message d'erreur.
2. IF l'envoi d'un email échoue, THEN THE Email_Service SHALL ne pas lever d'exception qui interromprait le flux principal de traitement de la Demande.
3. WHILE un email est en file d'attente, THE Email_Service SHALL réessayer l'envoi jusqu'à 3 fois en cas d'échec avant de marquer le job comme échoué.
4. THE Système SHALL exposer la configuration SMTP (hôte, port, identifiants) exclusivement via les variables d'environnement Laravel (`.env`), sans valeurs codées en dur dans le code source.

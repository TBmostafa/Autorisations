# Plan d'implémentation : Notifications par Email

## Vue d'ensemble

Implémentation des notifications par email en PHP/Laravel, en s'appuyant sur l'infrastructure existante (Mailable, Queue, Log). Un `EmailNotificationService` centralise la logique et est intégré dans `DemandeController`.

## Tâches

- [x] 1. Créer les Mailables et les templates Blade
  - [x] 1.1 Créer `app/Mail/ManagerNewDemandeEmail.php`
    - Implémenter `ShouldQueue`, définir `$tries = 3`
    - Passer l'objet `Demande` (avec relation `employe` chargée) au constructeur
    - Utiliser le template `emails.manager_nouvelle_demande`
    - _Exigences : 1.1, 1.2, 1.4, 6.3_

  - [x] 1.2 Créer `app/Mail/RhDemandeValideeEmail.php`
    - Implémenter `ShouldQueue`, définir `$tries = 3`
    - Passer `Demande` (avec `employe` et `manager`) au constructeur
    - Utiliser le template `emails.rh_demande_validee`
    - _Exigences : 2.1, 2.2, 1.4, 6.3_

  - [x] 1.3 Créer `app/Mail/EmployeStatutEmail.php`
    - Implémenter `ShouldQueue`, définir `$tries = 3`
    - Définir la constante `STATUT_LABELS` avec les 4 libellés français exacts
    - Passer `Demande` au constructeur, exposer le libellé et le commentaire au template
    - Utiliser le template `emails.employe_statut`
    - _Exigences : 3.1, 3.2, 3.3, 1.4, 6.3_

  - [x] 1.4 Créer `app/Mail/AdminAnomalieEmail.php`
    - Implémenter `ShouldQueue`, définir `$tries = 3`
    - Passer `Demande` et `string $description` au constructeur
    - Utiliser le template `emails.admin_anomalie`
    - _Exigences : 4.1, 4.2, 1.4, 6.3_

  - [x] 1.5 Créer les 4 templates Blade dans `resources/views/emails/`
    - `manager_nouvelle_demande.blade.php` : nom employé, type, dates, référence (5 chiffres)
    - `rh_demande_validee.blade.php` : nom employé, type, dates, référence, nom manager
    - `employe_statut.blade.php` : libellé statut, type, dates, commentaire (si présent)
    - `admin_anomalie.blade.php` : description anomalie, référence demande, nom employé
    - _Exigences : 1.2, 2.2, 3.2, 4.2_

  - [x] 1.6 Écrire les tests de propriété pour le contenu des Mailables (Propriété 2)
    - **Propriété 2 : Contenu complet de l'email manager et de l'email RH**
    - Générer des demandes aléatoires avec Eris, instancier `ManagerNewDemandeEmail` et `RhDemandeValideeEmail`, vérifier que le rendu contient nom, type, dates, référence
    - **Valide : Exigences 1.2, 2.2**

  - [x] 1.7 Écrire les tests de propriété pour les libellés de statut (Propriété 6)
    - **Propriété 6 : Notification employé pour tout changement de statut avec libellé correct**
    - Générer des demandes avec statuts et commentaires aléatoires, vérifier le libellé exact dans le rendu de `EmployeStatutEmail`
    - **Valide : Exigences 3.1, 3.2, 3.3**

- [x] 2. Créer `EmailNotificationService`
  - [x] 2.1 Créer `app/Services/EmailNotificationService.php`
    - Implémenter `notifierNouvelleDemandeManager(Demande $demande): void`
    - Implémenter `notifierRhDemandeValidee(Demande $demande): void`
    - Implémenter `notifierEmployeChangementStatut(Demande $demande): void`
    - Implémenter le helper privé `dispatchSafely(callable $dispatch, string $recipient, string $emailType): void` avec `try/catch` et `Log::error`
    - Implémenter `notifierAdminAnomalie(Demande $demande, string $description): void` (privé) avec fallback `Log::warning` si aucun admin actif
    - _Exigences : 1.1, 1.3, 2.1, 2.3, 3.1, 4.1, 4.3, 6.1, 6.2_

  - [x] 2.2 Écrire les tests de propriété pour l'envoi asynchrone (Propriété 4)
    - **Propriété 4 : Envoi asynchrone via Queue pour tous les emails**
    - Utiliser `Queue::fake()`, déclencher chaque méthode du service, vérifier `Queue::assertPushed()` pour chaque Mailable
    - **Valide : Exigences 1.4**

  - [x] 2.3 Écrire les tests de propriété pour la résilience SMTP (Propriété 8)
    - **Propriété 8 : Résilience aux échecs SMTP — log sans propagation d'exception**
    - Mocker `Mail::send()` pour lever une exception, vérifier `Log::assertLogged('error')` et absence d'exception propagée
    - **Valide : Exigences 6.1, 6.2**

  - [x] 2.4 Écrire les tests de propriété pour l'envoi manager (Propriété 1)
    - **Propriété 1 : Envoi email manager pour toute demande avec manager_id valide**
    - Générer des demandes aléatoires avec `manager_id` valide, vérifier `Mail::assertQueued(ManagerNewDemandeEmail::class)` pour le bon destinataire
    - **Valide : Exigences 1.1**

  - [ ] 2.5 Écrire les tests de propriété pour l'anomalie sans manager (Propriété 3)
    - **Propriété 3 : Anomalie sans manager déclenche notification admin et aucun email manager**
    - Générer des demandes sans `manager_id`, vérifier `Mail::assertNotQueued(ManagerNewDemandeEmail::class)` et `Mail::assertQueued(AdminAnomalieEmail::class)`
    - **Valide : Exigences 1.3, 4.1**

  - [x] 2.6 Écrire les tests de propriété pour la notification RH (Propriété 5)
    - **Propriété 5 : Notification RH pour toute demande validée par manager**
    - Générer des ensembles aléatoires d'utilisateurs RH actifs, déclencher `validee_responsable`, vérifier un email par RH actif
    - **Valide : Exigences 2.1, 2.3**

- [x] 3. Checkpoint — S'assurer que tous les tests passent
  - S'assurer que tous les tests passent, demander à l'utilisateur si des questions se posent.

- [x] 4. Intégrer le service dans `DemandeController`
  - [x] 4.1 Injecter `EmailNotificationService` dans le constructeur de `DemandeController`
    - Ajouter la propriété `private EmailNotificationService $emailService`
    - Mettre à jour le constructeur pour recevoir le service via injection de dépendances
    - _Exigences : 1.1, 3.1_

  - [x] 4.2 Appeler `notifierNouvelleDemandeManager()` dans `DemandeController::store()`
    - Après la création de la notification in-app manager existante, ajouter l'appel au service email
    - _Exigences : 1.1, 1.3, 5.1_

  - [x] 4.3 Appeler `notifierEmployeChangementStatut()` et `notifierRhDemandeValidee()` dans `DemandeController::traiter()`
    - Après la création des notifications in-app existantes, ajouter les appels conditionnels au service email
    - `notifierRhDemandeValidee()` uniquement si `$request->statut === 'validee_responsable'`
    - _Exigences : 2.1, 3.1, 5.1_

  - [x] 4.4 Écrire les tests de propriété pour la cohérence email + notification in-app (Propriété 7)
    - **Propriété 7 : Cohérence email + notification in-app**
    - Pour chaque événement déclencheur, vérifier à la fois `Mail::assertQueued()` et `Notification::count()` incrémenté
    - **Valide : Exigences 5.1**

- [x] 5. Configurer la Queue et les variables d'environnement
  - [x] 5.1 Vérifier et documenter la configuration SMTP dans `.env.example`
    - Ajouter les variables `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_ENCRYPTION`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME` et `QUEUE_CONNECTION` dans `.env.example` sans valeurs codées en dur
    - _Exigences : 6.4_

  - [x] 5.2 S'assurer que la migration `jobs` / `failed_jobs` est présente pour la Queue database
    - Vérifier l'existence des tables `jobs` et `failed_jobs` dans les migrations, les créer si absentes via `php artisan queue:table`
    - _Exigences : 1.4, 6.3_

- [x] 6. Checkpoint final — S'assurer que tous les tests passent
  - S'assurer que tous les tests passent, demander à l'utilisateur si des questions se posent.

## Notes

- Les tâches marquées `*` sont optionnelles et peuvent être ignorées pour un MVP rapide
- Chaque tâche référence les exigences spécifiques pour la traçabilité
- Les tests de propriétés utilisent la bibliothèque [eris/eris](https://github.com/giorgiosironi/eris) (`composer require --dev giorgiosironi/eris`)
- Les checkpoints garantissent une validation incrémentale

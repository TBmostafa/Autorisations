# 🏢 Plateforme de Gestion des Autorisations

Application web complète de gestion des demandes d'autorisation (congés, absences, sorties) avec séparation Backend/Frontend via API REST.

---

## 🏗️ Architecture

```
autorisation-app/
├── backend/          → Laravel 10 (API REST + MySQL)
└── frontend/         → React 18 + Vite (SPA)
```

---

## 🔐 Comptes de Démonstration

| Rôle          | Email                | Mot de passe |
|---------------|----------------------|--------------|
| Administrateur| mostafa@gmail.com    | 123456       |
| RH            | laila@gmail.com      | 123456       |
| Manager       | ayoub@gmail.com      | 123456       |
| Employé       | ahmed@gmail.com      | 123456       |
| Employé       | fatima@gmail.com     | 123456       |

---

## ⚙️ Installation Backend (Laravel)

### 1. Prérequis
- PHP >= 8.1
- Composer
- MySQL (XAMPP / WAMP / phpMyAdmin)

### 2. Configuration
```bash
cd backend

# Installer les dépendances
composer install

# Copier l'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate
```

### 3. Base de données
Créez la base dans **phpMyAdmin** :
```sql
CREATE DATABASE gestion_autorisations CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Modifiez `.env` :
```env
DB_DATABASE=gestion_autorisations
DB_USERNAME=root
DB_PASSWORD=        # votre mot de passe MySQL
```

### 4. Migrations et données de test
```bash
# Créer les tables
php artisan migrate

# Insérer les données de test
php artisan db:seed

# (ou les deux ensemble)
php artisan migrate:fresh --seed
```

### 5. Démarrer le serveur
```bash
php artisan serve
# API disponible sur http://localhost:8000/api
```

---

## 🎨 Installation Frontend (React)

### 1. Prérequis
- Node.js >= 18
- npm ou yarn

### 2. Installation
```bash
cd frontend
npm install
```

### 3. Démarrer
```bash
npm run dev
# Application sur http://localhost:5173
```

### 4. Build production
```bash
npm run build
```

---

## 🗄️ Structure Base de Données

### Table `users`
| Colonne      | Type    | Description               |
|-------------|---------|---------------------------|
| id          | bigint  | Clé primaire auto-incrément|
| name        | string  | Nom complet               |
| email       | string  | Email unique              |
| password    | string  | Hash bcrypt               |
| role        | enum    | employe / manager / admin |
| departement | string  | Département (nullable)    |
| poste       | string  | Poste (nullable)          |
| telephone   | string  | Téléphone (nullable)      |
| is_active   | boolean | Compte actif/inactif      |
| timestamps  | —       | created_at, updated_at    |

### Table `demandes`
| Colonne              | Type      | Description                        |
|----------------------|-----------|------------------------------------|
| id                   | bigint    | Clé primaire                       |
| user_id              | FK→users  | Employé demandeur                  |
| manager_id           | FK→users  | Manager assigné                    |
| type                 | enum      | Type de demande (6 types)          |
| date_debut           | date      | Date de début                      |
| date_fin             | date      | Date de fin                        |
| motif                | text      | Motif de la demande                |
| statut               | enum      | en_attente / acceptee / refusee    |
| commentaire_employe  | text      | Commentaire employé (nullable)     |
| commentaire_manager  | text      | Avis manager (nullable)            |
| date_traitement      | timestamp | Date de décision (nullable)        |
| is_archived          | boolean   | Archivée après 6 mois              |
| timestamps           | —         | created_at, updated_at             |

### Table `notifications`
| Colonne    | Type       | Description                   |
|-----------|------------|-------------------------------|
| id        | bigint     | Clé primaire                  |
| user_id   | FK→users   | Destinataire                  |
| titre     | string     | Titre de la notification      |
| message   | text       | Corps du message              |
| type      | string     | info / success / warning / error |
| demande_id| FK→demandes| Demande liée (nullable)       |
| lu        | boolean    | Lu / non lu                   |
| timestamps| —          | created_at, updated_at        |

---

## 🔌 Endpoints API

### Authentification
| Méthode | URL          | Description          | Auth |
|---------|-------------|----------------------|------|
| POST    | /api/login  | Connexion → token    | ❌   |
| POST    | /api/logout | Déconnexion          | ✅   |
| GET     | /api/me     | Utilisateur courant  | ✅   |
| PUT     | /api/profile| Modifier profil      | ✅   |

### Demandes
| Méthode | URL                         | Description              | Rôles            |
|---------|-----------------------------|--------------------------|------------------|
| GET     | /api/demandes               | Liste (filtrée/paginée)  | Tous             |
| POST    | /api/demandes               | Créer une demande        | Employé          |
| GET     | /api/demandes/{id}          | Détail                   | Tous             |
| PUT     | /api/demandes/{id}          | Modifier (avant validation)| Employé        |
| DELETE  | /api/demandes/{id}          | Annuler                  | Employé          |
| PUT     | /api/demandes/{id}/traiter  | Accepter/Refuser         | Manager, Admin   |
| GET     | /api/demandes/statistiques  | Statistiques dashboard   | Tous             |
| GET     | /api/demandes/{id}/pdf      | Export PDF               | Tous             |
| POST    | /api/demandes/archiver      | Archiver anciennes       | Admin            |

### Utilisateurs (Admin)
| Méthode | URL                          | Description              |
|---------|------------------------------|--------------------------|
| GET     | /api/users                   | Liste paginée            |
| POST    | /api/users                   | Créer                    |
| GET     | /api/users/{id}              | Détail + stats           |
| PUT     | /api/users/{id}              | Modifier                 |
| DELETE  | /api/users/{id}              | Supprimer                |
| PUT     | /api/users/{id}/toggle-active| Activer/Désactiver       |

### Notifications
| Méthode | URL                               | Description          |
|---------|-----------------------------------|----------------------|
| GET     | /api/notifications                | Liste paginée        |
| GET     | /api/notifications/non-lues       | Compteur non lues    |
| PUT     | /api/notifications/{id}/lue       | Marquer lue          |
| PUT     | /api/notifications/toutes-lues    | Tout marquer lues    |

---

## 🔒 Sécurité

- **Authentification** : Laravel Sanctum (tokens Bearer)
- **Mots de passe** : Hash bcrypt via `Hash::make()`
- **Rôles** : Middleware `role:admin,manager,employe`
- **CORS** : Configuré pour autoriser le frontend
- **Throttling** : Rate limiting API intégré Laravel
- **Validation** : Règles strictes sur tous les inputs
- **SQL Injection** : Protégé par l'ORM Eloquent (paramètres liés)

---

## 📁 Structure des Fichiers

### Backend Laravel
```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── DemandeController.php
│   │   │   ├── UserController.php
│   │   │   └── NotificationController.php
│   │   └── Middleware/
│   │       └── RoleMiddleware.php
│   └── Models/
│       ├── User.php
│       ├── Demande.php
│       └── Notification.php
├── database/
│   ├── migrations/
│   └── seeders/
│       └── DatabaseSeeder.php
├── resources/views/pdf/
│   └── demande.blade.php
└── routes/
    └── api.php
```

### Frontend React
```
frontend/src/
├── assets/styles.css        → Design system CSS
├── context/AuthContext.jsx  → Gestion authentification
├── services/api.js          → Appels API (axios)
├── components/shared/
│   └── DashboardLayout.jsx  → Layout avec sidebar
└── pages/
    ├── LoginPage.jsx
    ├── Dashboard.jsx
    ├── MesDemandes.jsx
    ├── NouvelleDemande.jsx
    ├── DetailDemande.jsx
    ├── DemandesManager.jsx
    ├── GestionUtilisateurs.jsx
    ├── Notifications.jsx
    └── Profil.jsx
```

---

## 🚀 Workflow Complet

```
Employé soumet demande
        ↓
Notification envoyée au Manager
        ↓
Manager consulte et traite (Accepte / Refuse + Commentaire)
        ↓
Notification envoyée à l'Employé
        ↓
Employé consulte le résultat + peut télécharger le PDF
        ↓
Admin supervise tout + gère les utilisateurs
```

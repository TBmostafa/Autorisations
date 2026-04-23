<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Demande;
use App\Models\Departement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Départements
        $depDirection = Departement::firstOrCreate(['nom' => 'Direction']);
        $depRh = Departement::firstOrCreate(['nom' => 'Ressources Humaines']);
        $depInfo = Departement::firstOrCreate(['nom' => 'Informatique']);
        $depCompta = Departement::firstOrCreate(['nom' => 'Comptabilité']);

        // Admin
        User::create([
            'name' => 'Mostafa Admin',
            'email' => 'mostafa.taibane@gmail.com',
            'password' => Hash::make('123456'),
            'role' => 'admin',
            'departement_id' => $depDirection->id,
            'poste' => 'Administrateur Système',
            'telephone' => '0600000001',
            'is_active' => true,
        ]);

        // Manager
        $manager = User::create([
            'name' => 'Laila Manager',
            'email' => 'lailatalb52@gmail.com',
            'password' => Hash::make('123456'),
            'role' => 'manager',
            'departement_id' => $depRh->id,
            'poste' => 'Responsable RH',
            'telephone' => '0600000002',
            'is_active' => true,
        ]);

        // Employés
        $employe1 = User::create([
            'name' => 'Ahmed Benali',
            'email' => 'ahmed@gmail.com',
            'password' => Hash::make('123456'),
            'role' => 'employe',
            'departement_id' => $depInfo->id,
            'poste' => 'Développeur',
            'telephone' => '0600000003',
            'is_active' => true,
        ]);

        $employe2 = User::create([
            'name' => 'Fatima Zahra',
            'email' => 'fatima@gmail.com',
            'password' => Hash::make('123456'),
            'role' => 'employe',
            'departement_id' => $depCompta->id,
            'poste' => 'Comptable',
            'telephone' => '0600000004',
            'is_active' => true,
        ]);

        // Demandes de test
        Demande::create([
            'user_id' => $employe1->id,
            'manager_id' => $manager->id,
            'type' => 'conge',
            'date_debut' => '2024-02-10',
            'date_fin' => '2024-02-15',
            'motif' => 'Vacances familiales',
            'statut' => 'validee_definitivement',
            'commentaire_employe' => 'Je souhaite prendre mes congés.',
            'commentaire_manager' => 'Approuvé. Bon repos !',
            'date_traitement' => now(),
        ]);

        Demande::create([
            'user_id' => $employe1->id,
            'manager_id' => $manager->id,
            'type' => 'autorisation_absence',
            'date_debut' => '2024-03-05',
            'date_fin' => '2024-03-05',
            'motif' => 'Rendez-vous médical urgent',
            'statut' => 'en_attente_responsable',
            'commentaire_employe' => 'Rendez-vous chez le médecin le matin.',
        ]);

        Demande::create([
            'user_id' => $employe2->id,
            'manager_id' => $manager->id,
            'type' => 'sortie',
            'date_debut' => '2024-03-10',
            'date_fin' => '2024-03-10',
            'motif' => 'Démarches administratives à la mairie',
            'statut' => 'refusee_responsable',
            'commentaire_manager' => 'Refusé pour ce jour, forte charge de travail.',
            'date_traitement' => now(),
        ]);

        Demande::create([
            'user_id' => $employe2->id,
            'manager_id' => $manager->id,
            'type' => 'conge',
            'date_debut' => '2024-03-20',
            'date_fin' => '2024-03-25',
            'motif' => 'Grippe saisonnière avec certificat médical',
            'statut' => 'en_attente_responsable',
        ]);

        // Demandes assignées à l'Admin
        $admin = User::where('role', 'admin')->first();
        
        $demandeAdmin = Demande::create([
            'user_id' => $employe1->id,
            'manager_id' => $admin->id,
            'type' => 'autorisation_absence',
            'date_debut' => now()->addDays(2)->toDateString(),
            'date_fin' => now()->addDays(2)->toDateString(),
            'motif' => 'Formation technique avancée',
            'statut' => 'en_attente_responsable',
            'commentaire_employe' => 'Je souhaite assister à une formation React.',
        ]);

        // Notifications pour l'Admin
        \App\Models\Notification::create([
            'user_id' => $admin->id,
            'titre' => 'Nouvelle demande reçue',
            'message' => "{$employe1->name} a soumis une demande de type Autorisation d'absence",
            'type' => 'info',
            'demande_id' => $demandeAdmin->id,
            'lu' => false,
        ]);

        \App\Models\Notification::create([
            'user_id' => $admin->id,
            'titre' => 'Système mis à jour',
            'message' => "La plateforme de gestion des autorisations est maintenant opérationnelle.",
            'type' => 'success',
            'lu' => false,
        ]);
    }
}

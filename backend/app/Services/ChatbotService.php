<?php

namespace App\Services;

use App\Models\Demande;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class ChatbotService
{
    /**
     * Catégories DB évaluées en priorité pour éviter les conflits.
     */
    private const DB_CATEGORIES = [
        'total', 'derniere', 'pending', 'equipe', 'equipe_pending_rh',
        'mon_manager', 'mon_rh', 'mon_profil', 'mes_rh_liste',
        'valider_demande', 'refuser_demande', 'gerer_utilisateurs',
    ];

    /**
     * Table de mots-clés par catégorie.
     */
    private const KEYWORDS = [
        // ── DB : demandes ────────────────────────────────────────────────────
        'total'              => ['total', 'toutes mes demandes', 'combien au total', 'historique'],
        'derniere'           => ['dernière', 'derniere', 'récente', 'recente', 'dernier'],
        'pending'            => ['combien', 'en attente', 'pending', 'attente'],
        'equipe'             => ['équipe', 'equipe', 'mon équipe', 'collaborateurs'],
        'equipe_pending_rh'  => ['à valider', 'a valider', 'demandes rh', 'attente rh', 'valider rh'],

        // ── DB : personnes de la plateforme ──────────────────────────────────
        'mon_manager'        => ['mon manager', 'mon responsable', 'qui est mon manager', 'qui est mon responsable', 'responsable'],
        'mon_rh'             => ['mon rh', 'service rh', 'qui est le rh', 'ressources humaines', 'rh'],
        'mon_profil'         => ['mon nom', 'mon prénom', 'mon prenom', 'mon profil', 'qui suis-je', 'qui suis je', 'mon poste', 'mon rôle', 'mon role', 'mon email', 'mon département', 'mon departement'],
        'mes_rh_liste'       => ['liste rh', 'tous les rh', 'membres rh', 'équipe rh', 'equipe rh'],

        // ── Actions rôle ─────────────────────────────────────────────────────
        'valider_demande'    => ['valider', 'approuver', 'accepter', 'traiter demande'],
        'refuser_demande'    => ['refuser', 'rejeter', 'décliner', 'decliner'],
        'gerer_utilisateurs' => ['gérer utilisateurs', 'gerer utilisateurs', 'gérer les utilisateurs', 'gerer les utilisateurs', 'ajouter utilisateur', 'créer utilisateur', 'creer utilisateur', 'désactiver', 'desactiver', 'liste utilisateurs', 'utilisateurs'],

        // ── Statiques ────────────────────────────────────────────────────────
        'creation'           => ['créer', 'creer', 'nouvelle demande', 'soumettre', 'ajouter'],
        'statut'             => ['statut', 'état', 'etat', 'validée', 'validee', 'refusée', 'refusee'],
        'type'               => ['congé', 'conge', 'absence', 'sortie', 'autorisation'],
        'aide'               => ['aide', 'help', 'bonjour', 'comment', 'quoi', 'que puis'],
    ];

    /**
     * Réponses statiques génériques (fallback si pas de réponse rôle).
     */
    private const STATIC_RESPONSES = [
        'creation' => "Pour créer une demande, allez dans 'Mes Demandes' puis cliquez sur 'Nouvelle Demande'. Remplissez le type (congé, absence, sortie), les dates et le motif.",
        'statut'   => "Les statuts possibles sont :\n⏳ En attente responsable\n✅ Validée par responsable\n❌ Refusée par responsable\n✅ Validée définitivement\n❌ Refusée par RH.",
        'type'     => "Il existe 3 types de demandes :\n🏖️ Congé annuel\n🏥 Autorisation d'absence\n🚪 Autorisation de sortie.",
        'aide'     => "Je peux vous aider avec :\n• Créer une demande\n• Connaître les statuts et types\n• Vos statistiques personnelles\n• Qui est votre manager / RH\n• Votre profil",
        'fallback' => "Je n'ai pas compris votre question. Je peux vous aider sur : la création de demandes, les statuts, les types, votre manager, votre RH ou vos statistiques.",
    ];

    /**
     * Messages d'aide personnalisés par rôle.
     */
    private const AIDE_PAR_ROLE = [
        'employe' => "Je peux vous aider avec :\n• 📝 Créer une nouvelle demande\n• 🔍 Voir vos demandes en attente\n• 📋 Connaître les types de demandes\n• 👤 Votre profil et votre manager\n• 📊 Votre historique de demandes",
        'manager' => "Je peux vous aider avec :\n• 👥 Demandes en attente de votre équipe\n• ✅ Comment valider ou refuser une demande\n• 📊 Statistiques de votre équipe\n• 👤 Votre profil\n• 📋 Types et statuts de demandes",
        'rh'      => "Je peux vous aider avec :\n• 📥 Demandes en attente de validation finale\n• ✅ Comment valider ou refuser définitivement\n• 👥 Liste des membres RH\n• 📊 Statistiques globales\n• 👤 Votre profil",
        'admin'   => "Je peux vous aider avec :\n• 👥 Gestion des utilisateurs\n• 🏢 Gestion des départements\n• 📊 Statistiques globales\n• 📋 Toutes les demandes\n• 👤 Votre profil",
    ];

    /**
     * Messages fallback personnalisés par rôle.
     */
    private const FALLBACK_PAR_ROLE = [
        'employe' => "Je n'ai pas compris. Essayez : 'mes demandes en attente', 'créer une demande', 'mon manager', 'mon profil'.",
        'manager' => "Je n'ai pas compris. Essayez : 'demandes de mon équipe', 'comment valider', 'statistiques équipe', 'mon profil'.",
        'rh'      => "Je n'ai pas compris. Essayez : 'demandes à valider', 'comment refuser', 'liste des RH', 'mon profil'.",
        'admin'   => "Je n'ai pas compris. Essayez : 'gérer utilisateurs', 'statistiques globales', 'mon profil'.",
    ];

    /**
     * Analyse le message et retourne une réponse adaptée au rôle.
     */
    public function handle(string $message, User $user): array
    {
        $category = $this->detectCategory($message);

        $reply = match ($category) {
            'pending'            => $this->buildPendingReply($user),
            'derniere'           => $this->buildDerniereReply($user),
            'total'              => $this->buildTotalReply($user),
            'equipe'             => $this->buildEquipeReply($user),
            'equipe_pending_rh'  => $this->buildEquipePendingRhReply($user),
            'mon_manager'        => $this->buildManagerReply($user),
            'mon_rh'             => $this->buildRhReply($user),
            'mon_profil'         => $this->buildProfilReply($user),
            'mes_rh_liste'       => $this->buildRhListeReply($user),
            'valider_demande'    => $this->buildValiderDemandeReply($user),
            'refuser_demande'    => $this->buildRefuserDemandeReply($user),
            'gerer_utilisateurs' => $this->buildGererUtilisateursReply($user),
            'aide'               => $this->buildAideReply($user),
            'creation'           => $this->buildCreationReply($user),
            'statut'             => $this->buildStatutReply($user),
            'type'               => self::STATIC_RESPONSES['type'],
            default              => self::FALLBACK_PAR_ROLE[$user->role] ?? self::STATIC_RESPONSES['fallback'],
        };

        return ['reply' => $reply, 'category' => $category];
    }

    /**
     * Détecte la catégorie du message par correspondance de mots-clés.
     */
    public function detectCategory(string $message): string
    {
        $normalized = mb_strtolower($message);

        foreach (self::DB_CATEGORIES as $category) {
            foreach (self::KEYWORDS[$category] as $keyword) {
                if (str_contains($normalized, $keyword)) {
                    return $category;
                }
            }
        }

        $staticCategories = array_diff(array_keys(self::KEYWORDS), self::DB_CATEGORIES);
        foreach ($staticCategories as $category) {
            foreach (self::KEYWORDS[$category] as $keyword) {
                if (str_contains($normalized, $keyword)) {
                    return $category;
                }
            }
        }

        return 'fallback';
    }

    // ── Réponses adaptées au rôle ─────────────────────────────────────────────

    private function buildAideReply(User $user): string
    {
        return self::AIDE_PAR_ROLE[$user->role] ?? self::STATIC_RESPONSES['aide'];
    }

    private function buildCreationReply(User $user): string
    {
        if ($user->isManager() || $user->isRh() || $user->isAdmin()) {
            return "La création de demandes est réservée aux employés. En tant que {$this->getRoleLabel($user->role)}, vous pouvez consulter et traiter les demandes soumises.";
        }
        return "Pour créer une demande :\n1. Allez dans 'Mes Demandes'\n2. Cliquez sur 'Nouvelle Demande'\n3. Choisissez le type (congé, absence, sortie)\n4. Renseignez les dates et le motif\n5. Soumettez — votre manager sera notifié automatiquement. 📩";
    }

    private function buildStatutReply(User $user): string
    {
        if ($user->isManager()) {
            return "En tant que manager, vous traitez les statuts :\n⏳ En attente responsable → vous devez agir\n✅ Validée par responsable → transmise au RH\n❌ Refusée par responsable → demande clôturée";
        }
        if ($user->isRh()) {
            return "En tant que RH, vous traitez les statuts :\n✅ Validée par responsable → en attente de votre validation finale\n✅ Validée définitivement → demande approuvée\n❌ Refusée par RH → demande clôturée";
        }
        if ($user->isAdmin()) {
            return "Les statuts du workflow de validation :\n⏳ En attente responsable\n✅ Validée par responsable\n❌ Refusée par responsable\n✅ Validée définitivement\n❌ Refusée par RH";
        }
        // Employé
        return "Votre demande peut avoir ces statuts :\n⏳ En attente responsable — votre manager n'a pas encore répondu\n✅ Validée par responsable — en cours de traitement RH\n❌ Refusée par responsable — contactez votre manager\n✅ Validée définitivement — demande accordée 🎉\n❌ Refusée par RH — contactez le service RH";
    }

    private function buildValiderDemandeReply(User $user): string
    {
        if ($user->isEmploye()) {
            return "La validation des demandes est effectuée par votre manager puis par le service RH. Vous recevrez une notification dès que votre demande sera traitée. 🔔";
        }
        if ($user->isManager()) {
            return "Pour valider une demande :\n1. Allez dans 'Demandes Équipe'\n2. Cliquez sur la demande concernée\n3. Sélectionnez ✅ 'Valider'\n4. Ajoutez un commentaire si nécessaire\nLa demande sera ensuite transmise au RH pour validation finale.";
        }
        if ($user->isRh()) {
            return "Pour valider définitivement une demande :\n1. Allez dans 'Demandes'\n2. Filtrez par 'En attente RH'\n3. Cliquez sur la demande\n4. Sélectionnez ✅ 'Valider définitivement'\nL'employé sera notifié automatiquement. 📩";
        }
        return "En tant qu'admin, vous pouvez valider à toutes les étapes depuis la liste des demandes.";
    }

    private function buildRefuserDemandeReply(User $user): string
    {
        if ($user->isEmploye()) {
            return "Si votre demande est refusée, vous recevrez une notification avec le motif. Vous pouvez contacter votre manager ou le service RH pour plus d'informations.";
        }
        if ($user->isManager()) {
            return "Pour refuser une demande :\n1. Allez dans 'Demandes Équipe'\n2. Cliquez sur la demande\n3. Sélectionnez ❌ 'Refuser'\n4. Ajoutez un commentaire expliquant le motif\nL'employé sera notifié automatiquement. 📩";
        }
        if ($user->isRh()) {
            return "Pour refuser définitivement une demande :\n1. Allez dans 'Demandes'\n2. Filtrez par 'En attente RH'\n3. Cliquez sur la demande\n4. Sélectionnez ❌ 'Refuser'\n5. Précisez le motif dans le commentaire\nL'employé sera notifié automatiquement. 📩";
        }
        return "En tant qu'admin, vous pouvez refuser à toutes les étapes depuis la liste des demandes.";
    }

    private function buildGererUtilisateursReply(User $user): string
    {
        if (!$user->isAdmin()) {
            return "La gestion des utilisateurs est réservée aux administrateurs. Contactez votre administrateur si vous avez besoin d'une modification de compte.";
        }
        return "Pour gérer les utilisateurs :\n• 👤 Allez dans 'Gestion Utilisateurs'\n• ➕ Créez un compte via 'Ajouter un utilisateur'\n• ✏️ Modifiez un profil en cliquant sur l'utilisateur\n• 🔒 Désactivez un compte avec le bouton de statut\n• 🏢 Gérez les départements dans 'Départements'";
    }

    // ── Réponses DB — demandes ────────────────────────────────────────────────

    private function buildPendingReply(User $user): string
    {
        try {
            if ($user->isRh()) {
                $count = $this->getDemandesEnAttenteRh();
                return $count === 0
                    ? "Aucune demande n'attend votre validation RH actuellement. 🎉"
                    : "Il y a {$count} demande(s) en attente de votre validation finale. ⏳";
            }
            if ($user->isManager()) {
                $count = $this->getDemandesEquipeEnAttente($user);
                return $count === 0
                    ? "Aucune demande en attente dans votre équipe. 🎉"
                    : "Votre équipe a {$count} demande(s) en attente de votre traitement. ⏳";
            }
            if ($user->isAdmin()) {
                $total = Demande::whereIn('statut', ['en_attente_responsable', 'validee_responsable'])->count();
                return $total === 0
                    ? "Aucune demande en attente sur la plateforme. 🎉"
                    : "Il y a {$total} demande(s) en attente sur la plateforme (toutes étapes confondues). ⏳";
            }
            // Employé
            $count = $this->getDemandesEnAttente($user);
            return $count === 0
                ? "Vous n'avez aucune demande en attente actuellement. 🎉"
                : "Vous avez {$count} demande(s) en attente de traitement. ⏳";
        } catch (\Throwable $e) {
            Log::error('ChatbotService::buildPendingReply', ['error' => $e->getMessage()]);
            return "Une erreur est survenue. Veuillez réessayer.";
        }
    }

    private function buildEquipePendingRhReply(User $user): string
    {
        if (!$user->isRh() && !$user->isAdmin()) {
            return "Cette information est disponible uniquement pour le service RH.";
        }
        try {
            $count = $this->getDemandesEnAttenteRh();
            return $count === 0
                ? "Aucune demande n'attend votre validation RH actuellement. 🎉"
                : "Il y a {$count} demande(s) validée(s) par les managers et en attente de votre validation finale. ⏳";
        } catch (\Throwable $e) {
            Log::error('ChatbotService::buildEquipePendingRhReply', ['error' => $e->getMessage()]);
            return "Une erreur est survenue. Veuillez réessayer.";
        }
    }

    private function buildDerniereReply(User $user): string
    {
        try {
            if ($user->isManager()) {
                $demande = Demande::where('manager_id', $user->id)->orderByDesc('created_at')->first();
                if (!$demande) return "Aucune demande n'a encore été soumise à votre équipe.";
                $type   = Demande::$types[$demande->type] ?? $demande->type;
                $statut = $this->formatStatut($demande->statut);
                $date   = $demande->created_at->format('d/m/Y');
                return "Dernière demande de votre équipe : {$type} soumise le {$date} — Statut : {$statut}.";
            }
            if ($user->isRh() || $user->isAdmin()) {
                $demande = Demande::orderByDesc('created_at')->first();
                if (!$demande) return "Aucune demande n'a encore été soumise sur la plateforme.";
                $type   = Demande::$types[$demande->type] ?? $demande->type;
                $statut = $this->formatStatut($demande->statut);
                $date   = $demande->created_at->format('d/m/Y');
                return "Dernière demande sur la plateforme : {$type} soumise le {$date} — Statut : {$statut}.";
            }
            // Employé
            $demande = $this->getDerniereDemande($user);
            if (!$demande) return "Vous n'avez encore soumis aucune demande.";
            $type   = Demande::$types[$demande->type] ?? $demande->type;
            $statut = $this->formatStatut($demande->statut);
            $date   = $demande->created_at->format('d/m/Y');
            return "Votre dernière demande : {$type} soumise le {$date} — Statut : {$statut}.";
        } catch (\Throwable $e) {
            Log::error('ChatbotService::buildDerniereReply', ['error' => $e->getMessage()]);
            return "Une erreur est survenue. Veuillez réessayer.";
        }
    }

    private function buildTotalReply(User $user): string
    {
        try {
            if ($user->isManager()) {
                $total = Demande::where('manager_id', $user->id)->count();
                return $total === 0
                    ? "Aucune demande n'a encore été soumise dans votre équipe."
                    : "Votre équipe a soumis {$total} demande(s) au total.";
            }
            if ($user->isRh() || $user->isAdmin()) {
                $total = Demande::count();
                return "La plateforme compte {$total} demande(s) au total.";
            }
            // Employé
            $total = $this->getTotalDemandes($user);
            return $total === 0
                ? "Vous n'avez encore soumis aucune demande."
                : "Vous avez soumis {$total} demande(s) au total.";
        } catch (\Throwable $e) {
            Log::error('ChatbotService::buildTotalReply', ['error' => $e->getMessage()]);
            return "Une erreur est survenue. Veuillez réessayer.";
        }
    }

    private function buildEquipeReply(User $user): string
    {
        if (!$user->isManager() && !$user->isAdmin()) {
            return "Cette information est disponible uniquement pour les managers.";
        }
        try {
            $count = $this->getDemandesEquipeEnAttente($user);
            return $count === 0
                ? "Aucune demande en attente dans votre équipe. 🎉"
                : "Votre équipe a {$count} demande(s) en attente de votre traitement. ⏳";
        } catch (\Throwable $e) {
            Log::error('ChatbotService::buildEquipeReply', ['error' => $e->getMessage()]);
            return "Une erreur est survenue. Veuillez réessayer.";
        }
    }

    // ── Réponses DB — personnes ───────────────────────────────────────────────

    private function buildManagerReply(User $user): string
    {
        if ($user->isManager()) {
            return "Vous êtes vous-même manager. Votre équipe vous soumet ses demandes directement.";
        }
        if ($user->isRh() || $user->isAdmin()) {
            return "En tant que {$this->getRoleLabel($user->role)}, vous n'avez pas de manager assigné. Vous gérez les demandes de manière indépendante.";
        }
        try {
            $manager = User::find($user->manager_id);
            if (!$manager) {
                return "Aucun manager n'est assigné à votre compte. Contactez l'administrateur.";
            }
            $poste = $manager->poste ? " ({$manager->poste})" : '';
            return "👤 Votre manager est : {$manager->name}{$poste}\n📧 Email : {$manager->email}";
        } catch (\Throwable $e) {
            Log::error('ChatbotService::buildManagerReply', ['error' => $e->getMessage()]);
            return "Une erreur est survenue. Veuillez réessayer.";
        }
    }

    private function buildRhReply(User $user): string
    {
        if ($user->isRh()) {
            return "Vous faites partie du service RH. Vous êtes responsable de la validation finale des demandes.";
        }
        try {
            $rhs = User::where('role', 'rh')->where('is_active', true)->get();
            if ($rhs->isEmpty()) {
                return "Aucun membre RH actif n'est disponible actuellement.";
            }
            $lines = $rhs->map(fn($rh) => "👤 {$rh->name} — 📧 {$rh->email}")->implode("\n");
            $label = $rhs->count() === 1 ? "Le membre RH de la plateforme est" : "Les membres RH de la plateforme sont";
            return "{$label} :\n{$lines}";
        } catch (\Throwable $e) {
            Log::error('ChatbotService::buildRhReply', ['error' => $e->getMessage()]);
            return "Une erreur est survenue. Veuillez réessayer.";
        }
    }

    private function buildRhListeReply(User $user): string
    {
        return $this->buildRhReply($user);
    }

    private function buildProfilReply(User $user): string
    {
        try {
            $role  = $this->getRoleLabel($user->role);
            $poste = $user->poste ? "\n💼 Poste : {$user->poste}" : '';
            $dept  = $user->departement_id
                ? "\n🏢 Département : " . optional($user->departement)->nom
                : '';
            return "👤 Votre profil :\n"
                . "• Nom complet : {$user->name}\n"
                . "• Email : {$user->email}\n"
                . "• Rôle : {$role}"
                . $poste
                . $dept;
        } catch (\Throwable $e) {
            Log::error('ChatbotService::buildProfilReply', ['error' => $e->getMessage()]);
            return "Une erreur est survenue. Veuillez réessayer.";
        }
    }

    // ── Requêtes DB ───────────────────────────────────────────────────────────

    private function getDemandesEnAttente(User $user): int
    {
        return Demande::where('user_id', $user->id)
            ->whereIn('statut', ['en_attente_responsable', 'validee_responsable'])
            ->count();
    }

    private function getDemandesEnAttenteRh(): int
    {
        return Demande::where('statut', 'validee_responsable')->count();
    }

    private function getDerniereDemande(User $user): ?Demande
    {
        return Demande::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->first();
    }

    private function getTotalDemandes(User $user): int
    {
        return Demande::where('user_id', $user->id)->count();
    }

    private function getDemandesEquipeEnAttente(User $user): int
    {
        return Demande::where('manager_id', $user->id)
            ->where('statut', 'en_attente_responsable')
            ->count();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function getRoleLabel(string $role): string
    {
        return match ($role) {
            'employe' => 'Employé',
            'manager' => 'Manager',
            'rh'      => 'Ressources Humaines',
            'admin'   => 'Administrateur',
            default   => $role,
        };
    }

    private function formatStatut(string $statut): string
    {
        return match ($statut) {
            'en_attente_responsable' => '⏳ En attente responsable',
            'validee_responsable'    => '✅ Validée par responsable',
            'refusee_responsable'    => '❌ Refusée par responsable',
            'validee_definitivement' => '✅ Validée définitivement',
            'refusee_rh'             => '❌ Refusée par RH',
            default                  => $statut,
        };
    }
}

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
        'total', 'derniere', 'pending', 'equipe',
        'mon_manager', 'mon_rh', 'mon_profil', 'mes_rh_liste',
    ];

    /**
     * Table de mots-clés par catégorie.
     */
    private const KEYWORDS = [
        // ── DB : demandes ────────────────────────────────────────────────────
        'total'         => ['total', 'toutes mes demandes', 'combien au total', 'historique'],
        'derniere'      => ['dernière', 'derniere', 'récente', 'recente', 'dernier'],
        'pending'       => ['combien', 'en attente', 'pending', 'attente'],
        'equipe'        => ['équipe', 'equipe', 'mon équipe', 'collaborateurs'],

        // ── DB : personnes de la plateforme ──────────────────────────────────
        'mon_manager'   => ['mon manager', 'mon responsable', 'qui est mon manager', 'qui est mon responsable', 'responsable'],
        'mon_rh'        => ['mon rh', 'service rh', 'qui est le rh', 'ressources humaines', 'rh'],
        'mon_profil'    => ['mon nom', 'mon prénom', 'mon prenom', 'mon profil', 'qui suis-je', 'qui suis je', 'mon poste', 'mon rôle', 'mon role', 'mon email', 'mon département', 'mon departement'],
        'mes_rh_liste'  => ['liste rh', 'tous les rh', 'membres rh', 'équipe rh', 'equipe rh'],

        // ── Statiques ────────────────────────────────────────────────────────
        'creation'      => ['créer', 'creer', 'nouvelle demande', 'soumettre', 'ajouter'],
        'statut'        => ['statut', 'état', 'etat', 'validée', 'validee', 'refusée', 'refusee'],
        'type'          => ['congé', 'conge', 'absence', 'sortie', 'autorisation'],
        'aide'          => ['aide', 'help', 'bonjour', 'comment', 'quoi', 'que puis'],
    ];

    /**
     * Réponses statiques par catégorie.
     */
    private const STATIC_RESPONSES = [
        'creation' => "Pour créer une demande, allez dans 'Mes Demandes' puis cliquez sur 'Nouvelle Demande'. Remplissez le type (congé, absence, sortie), les dates et le motif.",
        'statut'   => "Les statuts possibles sont :\n⏳ En attente responsable\n✅ Validée par responsable\n❌ Refusée par responsable\n✅ Validée définitivement\n❌ Refusée par RH.",
        'type'     => "Il existe 3 types de demandes :\n🏖️ Congé annuel\n🏥 Autorisation d'absence\n🚪 Autorisation de sortie.",
        'aide'     => "Je peux vous aider avec :\n• Créer une demande\n• Connaître les statuts et types\n• Vos statistiques personnelles\n• Qui est votre manager / RH\n• Votre profil",
        'fallback' => "Je n'ai pas compris votre question. Je peux vous aider sur : la création de demandes, les statuts, les types, votre manager, votre RH ou vos statistiques.",
    ];

    /**
     * Analyse le message et retourne une réponse adaptée.
     */
    public function handle(string $message, User $user): array
    {
        $category = $this->detectCategory($message);

        $reply = match ($category) {
            'pending'       => $this->buildPendingReply($user),
            'derniere'      => $this->buildDerniereReply($user),
            'total'         => $this->buildTotalReply($user),
            'equipe'        => $this->buildEquipeReply($user),
            'mon_manager'   => $this->buildManagerReply($user),
            'mon_rh'        => $this->buildRhReply($user),
            'mon_profil'    => $this->buildProfilReply($user),
            'mes_rh_liste'  => $this->buildRhListeReply($user),
            default         => self::STATIC_RESPONSES[$category] ?? self::STATIC_RESPONSES['fallback'],
        };

        return ['reply' => $reply, 'category' => $category];
    }

    /**
     * Détecte la catégorie du message par correspondance de mots-clés.
     * Les catégories DB sont évaluées en premier.
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

    // ── Réponses DB — demandes ────────────────────────────────────────────────

    private function buildPendingReply(User $user): string
    {
        try {
            $count = $this->getDemandesEnAttente($user);
            return $count === 0
                ? "Vous n'avez aucune demande en attente actuellement. 🎉"
                : "Vous avez {$count} demande(s) en attente de traitement. ⏳";
        } catch (\Throwable $e) {
            Log::error('ChatbotService::buildPendingReply', ['error' => $e->getMessage()]);
            return "Une erreur est survenue. Veuillez réessayer.";
        }
    }

    private function buildDerniereReply(User $user): string
    {
        try {
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
        try {
            $manager = User::find($user->manager_id);
            if (!$manager) {
                return "Aucun manager n'est assigné à votre compte pour le moment. Contactez l'administrateur.";
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
            $roleLabels = [
                'employe' => 'Employé',
                'manager' => 'Manager',
                'rh'      => 'Ressources Humaines',
                'admin'   => 'Administrateur',
            ];
            $role  = $roleLabels[$user->role] ?? $user->role;
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

<?php

namespace App\Http\Controllers;

use App\Models\Demande;
use App\Models\User;
use App\Models\Notification;
use App\Services\EmailNotificationService;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class DemandeController extends Controller
{
    public function __construct(private EmailNotificationService $emailService) {}
    /**
     * Liste des demandes (filtrée par rôle)
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Demande::with(['employe:id,name,email,departement_id,poste', 'employe.departement:id,nom', 'manager:id,name,email'])
            ->nonArchivees();

        if ($user->isEmploye()) {
            $query->where('user_id', $user->id);
        } elseif ($user->isManager()) {
            $query->where('manager_id', $user->id);
        }
        // Admin voit tout

        // Filtres
        if ($request->filled('statut')) {
            if ($request->statut === 'traitees') {
                if ($user->isManager()) {
                    $query->whereIn('statut', ['validee_responsable', 'refusee_responsable', 'validee_definitivement', 'refusee_rh']);
                } elseif ($user->isRh()) {
                    $query->whereIn('statut', ['validee_definitivement', 'refusee_rh']);
                } else {
                    $query->whereNotIn('statut', ['en_attente_responsable', 'validee_responsable']);
                }
            } elseif ($request->statut === 'en_attente') {
                if ($user->isRh()) {
                    $query->where('statut', 'validee_responsable');
                } else {
                    $query->where('statut', 'en_attente_responsable');
                }
            } else {
                $query->where('statut', $request->statut);
            }
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('date_debut')) {
            $query->whereDate('date_debut', '>=', $request->date_debut);
        }
        if ($request->filled('date_fin')) {
            $query->whereDate('date_fin', '<=', $request->date_fin);
        }
        if ($request->filled('search')) {
            $query->whereHas('employe', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }
        if ($request->filled('user_id') && $user->isAdmin()) {
            $query->where('user_id', $request->user_id);
        }

        $demandes = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json($demandes);
    }

    /**
     * Créer une demande
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'type' => 'required|in:conge,autorisation_absence,sortie',
            'date_debut' => 'required|date|after_or_equal:today',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'motif' => 'required|string|max:1000',
            'commentaire_employe' => 'nullable|string|max:500',
            'manager_id' => 'nullable|exists:users,id',
        ]);

        // Assigner le manager de l'employé
        $managerId = $user->manager_id;

        // Si le manager n'est pas défini sur l'utilisateur, on le cherche via son département
        if (!$managerId && $user->departement_id) {
            $dept = \App\Models\Departement::find($user->departement_id);
            if ($dept && $dept->manager_id) {
                $managerId = $dept->manager_id;
            }
        }

        // Si toujours pas de manager et qu'un manager_id est passé en requête (cas particuliers)
        if (!$managerId && $request->manager_id) {
            $managerId = $request->manager_id;
        }

        $demande = Demande::create([
            'user_id' => $user->id,
            'manager_id' => $managerId,
            'type' => $request->type,
            'date_debut' => $request->date_debut,
            'date_fin' => $request->date_fin,
            'motif' => $request->motif,
            'commentaire_employe' => $request->commentaire_employe,
            'statut' => 'en_attente_responsable',
            'signature_employe' => $request->signature_employe,
        ]);

        // Notification au manager
        if ($managerId) {
            Notification::create([
                'user_id' => $managerId,
                'titre' => 'Nouvelle demande reçue',
                'message' => "{$user->name} a soumis une demande de type " . Demande::$types[$request->type] . " Réf : " . str_pad($demande->id, 5, '0', STR_PAD_LEFT),
                'type' => 'info',
                'demande_id' => $demande->id,
            ]);

            // Notification email au manager
            $this->emailService->notifierNouvelleDemandeManager($demande->load('employe'));
        }

        // Notification aux administrateurs
        $admins = User::where('role', 'admin')->where('is_active', true)->get();
        foreach ($admins as $admin) {
            if ($admin->id !== $managerId) { // Éviter les doublons si l'admin est le manager
                Notification::create([
                    'user_id' => $admin->id,
                    'titre' => 'Nouvelle demande (Admin)',
                    'message' => "Une nouvelle demande de {$user->name} a été créée.",
                    'type' => 'info',
                    'demande_id' => $demande->id,
                ]);
            }
        }

        return response()->json([
            'message' => 'Demande créée avec succès.',
            'demande' => $demande->load(['employe.departement', 'manager']),
        ], 201);
    }

    /**
     * Détail d'une demande
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $demande = Demande::with(['employe.departement', 'manager'])->findOrFail($id);

        // Vérification des accès
        if ($user->isEmploye() && $demande->user_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }
        if ($user->isManager() && $demande->manager_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        return response()->json(['demande' => $demande]);
    }

    /**
     * Modifier une demande (employé, avant validation)
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $demande = Demande::findOrFail($id);

        if ($demande->user_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        if (!$demande->isModifiable()) {
            return response()->json(['message' => 'Cette demande ne peut plus être modifiée.'], 422);
        }

        $request->validate([
            'type' => 'sometimes|in:conge_annuel,conge_maladie,autorisation_absence,sortie,conge_sans_solde,autre',
            'date_debut' => 'sometimes|date|after_or_equal:today',
            'date_fin' => 'sometimes|date|after_or_equal:date_debut',
            'motif' => 'sometimes|string|max:1000',
            'commentaire_employe' => 'nullable|string|max:500',
        ]);

        $demande->update($request->only([
            'type',
            'date_debut',
            'date_fin',
            'motif',
            'commentaire_employe'
        ]));

        return response()->json([
            'message' => 'Demande mise à jour.',
            'demande' => $demande->fresh(['employe', 'manager']),
        ]);
    }

    /**
     * Annuler une demande (employé)
     */
    public function cancel(Request $request, $id)
    {
        $user = $request->user();
        $demande = Demande::findOrFail($id);

        if ($demande->user_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        if (!$demande->isModifiable()) {
            return response()->json(['message' => 'Cette demande ne peut plus être annulée.'], 422);
        }

        $demande->delete();

        return response()->json(['message' => 'Demande annulée avec succès.']);
    }

    /**
     * Traiter une demande (manager)
     */
    public function traiter(Request $request, $id)
    {
        $user = $request->user();
        $demande = Demande::with('employe')->findOrFail($id);

        if (!$user->isManager() && !$user->isRh() && !$user->isAdmin()) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        if ($user->isManager() && $demande->manager_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $request->validate([
            'statut' => 'required|in:validee_responsable,refusee_responsable,validee_definitivement,refusee_rh',
            'commentaire_manager' => 'nullable|string|max:500',
        ]);

        $updateData = [
            'statut' => $request->statut,
            'date_traitement' => now(),
        ];

        // Seul le manager (1ère validation) signe la demande
        if ($request->statut === 'validee_responsable' && $request->has('signature_manager')) {
            $updateData['signature_manager'] = $request->signature_manager;
        }

        if ($user->isManager() || ($user->isAdmin() && in_array($request->statut, ['validee_responsable', 'refusee_responsable']))) {
            $updateData['commentaire_manager'] = $request->commentaire_manager;
        } elseif ($user->isRh() || ($user->isAdmin() && in_array($request->statut, ['validee_definitivement', 'refusee_rh']))) {
            if ($request->commentaire_manager) {
                $updateData['commentaire_manager'] = $demande->commentaire_manager
                    ? $demande->commentaire_manager . "\nRH: " . $request->commentaire_manager
                    : $request->commentaire_manager;
            }
        }

        $demande->update($updateData);

        // Notification à l'employé
        $statutLabelMapping = [
            'validee_responsable' => '✅ Validée par Manager',
            'refusee_responsable' => '❌ Refusée par Manager',
            'validee_definitivement' => '✅ Validée Définitivement',
            'refusee_rh' => '❌ Refusée par RH',
        ];

        $statutLabel = $statutLabelMapping[$request->statut] ?? $request->statut;
        $typeMessage = in_array($request->statut, ['validee_definitivement', 'validee_responsable']) ? 'success' : 'error';

        Notification::create([
            'user_id' => $demande->user_id,
            'titre' => "Demande {$statutLabel}",
            'message' => "Votre demande de " . Demande::$types[$demande->type] . " a été mise à jour : {$statutLabel}.",
            'type' => $typeMessage,
            'demande_id' => $demande->id,
        ]);

        // Notification email à l'employé
        $this->emailService->notifierEmployeChangementStatut($demande->load('employe'));

        // Notification email au RH si validée par manager
        if ($request->statut === 'validee_responsable') {
            $this->emailService->notifierRhDemandeValidee($demande->load(['employe', 'manager']));
        }

        // Si validée par manager, notifier les RH
        if ($request->statut === 'validee_responsable') {
            $rhs = User::where('role', 'rh')->where('is_active', true)->get();
            foreach ($rhs as $rh) {
                Notification::create([
                    'user_id' => $rh->id,
                    'titre' => 'Nouvelle validation (Manager)',
                    'message' => "Une demande de {$demande->employe->name} a été validée par le manager et attend votre action.",
                    'type' => 'info',
                    'demande_id' => $demande->id,
                ]);
            }
        }

        return response()->json([
            'message' => "Demande traitée avec succès.",
            'demande' => $demande->fresh(['employe.departement', 'manager']),
        ]);
    }

    /**
     * Statistiques dashboard
     */
    public function statistiques(Request $request)
    {
        $user = $request->user();

        if ($user->isEmploye()) {
            $base = Demande::where('user_id', $user->id);
        } elseif ($user->isManager()) {
            $base = Demande::where('manager_id', $user->id);
        } else {
            $base = Demande::query();
        }

        $stats = [
            'total' => (clone $base)->count(),
            'en_attente' => (clone $base)->whereIn('statut', ['en_attente_responsable', 'validee_responsable'])->count(),
            'acceptees' => (clone $base)->where('statut', 'validee_definitivement')->count(),
            'refusees' => (clone $base)->whereIn('statut', ['refusee_responsable', 'refusee_rh'])->count(),
        ];

        // Répartition par type
        $parType = (clone $base)
            ->selectRaw('type, count(*) as total')
            ->groupBy('type')
            ->get()
            ->map(fn($item) => [
                'type' => $item->type,
                'libelle' => Demande::$types[$item->type] ?? $item->type,
                'total' => $item->total,
            ]);

        // Demandes récentes
        $recentes = (clone $base)
            ->with(['employe:id,name', 'manager:id,name'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'stats' => $stats,
            'par_type' => $parType,
            'recentes' => $recentes,
        ]);
    }

    /**
     * Exporter en PDF
     */
    public function exportPdf(Request $request, $id)
    {
        ini_set('memory_limit', '1024M');
        $user = $request->user();
        $demande = Demande::with(['employe.departement', 'manager'])->findOrFail($id);

        if ($user->isEmploye() && $demande->user_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $sigEmpPath = null;
        $sigManPath = null;

        try {
            if ($demande->signature_employe) {
                $path = public_path('temp_sig_emp_' . $id . '.png');
                $data = preg_replace('#^data:image/\w+;base64,#i', '', $demande->signature_employe);
                file_put_contents($path, base64_decode($data));
                $sigEmpPath = $path;
            }

            if ($demande->signature_manager) {
                $path = public_path('temp_sig_man_' . $id . '.png');
                $data = preg_replace('#^data:image/\w+;base64,#i', '', $demande->signature_manager);
                file_put_contents($path, base64_decode($data));
                $sigManPath = $path;
            }

            $pdf = Pdf::loadView('pdf.demande', [
                'demande' => $demande,
                'sig_emp' => $sigEmpPath,
                'sig_man' => $sigManPath
            ])->setOption('isHtml5ParserEnabled', true)
                ->setOption('isRemoteEnabled', true);

            $response = $pdf->download("demande.pdf");

            if ($sigEmpPath && file_exists($sigEmpPath))
                unlink($sigEmpPath);
            if ($sigManPath && file_exists($sigManPath))
                unlink($sigManPath);

            return $response;

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("PDF Generation Error (ID $id): " . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json(['message' => 'Erreur PDF : ' . $e->getMessage()], 500);
        }
    }

    /**
     * Archiver les anciennes demandes (Admin)
     */
    public function archiver(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $count = Demande::whereNotIn('statut', ['en_attente_responsable', 'validee_responsable'])
            ->where('date_fin', '<', now()->subMonths(6))
            ->where('is_archived', false)
            ->update(['is_archived' => true]);

        return response()->json([
            'message' => "{$count} demandes archivées avec succès.",
        ]);
    }
}

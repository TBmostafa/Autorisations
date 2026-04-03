<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Departement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Liste des utilisateurs (Admin)
     */
    public function index(Request $request)
    {
        $query = User::with(['manager:id,name', 'departement']);

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $users = $query->orderBy('name')->paginate(10);

        return response()->json($users);
    }

    /**
     * Créer un utilisateur
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:employe,manager,admin,rh',
            'departement_id' => 'nullable|exists:departements,id',
            'poste' => 'nullable|string|max:100',
            'telephone' => 'nullable|string|max:20',
            'manager_id' => 'nullable|exists:users,id',
        ]);

        $managerId = $request->manager_id;
        if ($request->role === 'employe' && $request->filled('departement_id')) {
            $dept = Departement::find($request->departement_id);
            if ($dept && $dept->manager_id) {
                $managerId = $dept->manager_id;
            }
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'departement_id' => $request->departement_id,
            'poste' => $request->poste,
            'telephone' => $request->telephone,
            'is_active' => true,
            'manager_id' => $managerId,
        ]);

        return response()->json([
            'message' => 'Utilisateur créé avec succès.',
            'user' => $user,
        ], 201);
    }

    /**
     * Détail utilisateur
     */
    public function show($id)
    {
        $user = User::withCount([
            'demandes',
            'demandes as demandes_en_attente_count' => fn($q) => $q->whereIn('statut', ['en_attente_responsable', 'validee_responsable']),
            'demandes as demandes_acceptees_count' => fn($q) => $q->where('statut', 'validee_definitivement'),
            'demandes as demandes_refusees_count' => fn($q) => $q->whereIn('statut', ['refusee_responsable', 'refusee_rh']),
        ])->findOrFail($id);

        return response()->json(['user' => $user]);
    }

    /**
     * Modifier un utilisateur
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => "sometimes|email|unique:users,email,{$id}",
            'role' => 'sometimes|in:employe,manager,admin,rh',
            'departement_id' => 'nullable|exists:departements,id',
            'poste' => 'nullable|string|max:100',
            'telephone' => 'nullable|string|max:20',
            'is_active' => 'sometimes|boolean',
            'password' => 'nullable|string|min:6',
            'manager_id' => 'nullable|exists:users,id',
        ]);

        $data = $request->except('password');
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }
        if (isset($data['role']) && $data['role'] !== 'employe') {
            $data['manager_id'] = null;
        }

        if ($request->filled('departement_id')) {
            $dept = Departement::find($request->departement_id);
            if ($dept && $dept->manager_id) {
                $data['manager_id'] = $dept->manager_id;
            }
        }

        $user->update($data);

        return response()->json([
            'message' => 'Utilisateur mis à jour.',
            'user' => $user->fresh(),
        ]);
    }

    /**
     * Supprimer un utilisateur
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($user->demandes()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer : cet utilisateur a des demandes.',
            ], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé.']);
    }

    /**
     * Activer/Désactiver
     */
    public function toggleActive($id)
    {
        $user = User::findOrFail($id);
        $user->is_active = !$user->is_active;
        $user->save();

        $status = $user->is_active ? 'activé' : 'désactivé';

        return response()->json([
            'message' => "Compte {$status} avec succès.",
            'user' => $user,
        ]);
    }

    /**
     * Liste des managers (pour assignation)
     */
    public function managers()
    {
        $managers = User::where('role', 'manager')
            ->where('is_active', true)
            ->with('departement')
            ->select('id', 'name', 'email', 'departement_id')
            ->get();

        return response()->json(['managers' => $managers]);
    }

    /**
     * Liste de l'équipe du manager
     */
    public function equipe(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isManager()) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $equipe = User::where('manager_id', $user->id)
            ->with('departement')
            ->select('id', 'name', 'email', 'departement_id', 'poste', 'telephone', 'is_active')
            ->get();

        return response()->json(['equipe' => $equipe]);
    }

    /**
     * Liste des managers et leurs équipes (Admin)
     */
    public function adminEquipes(Request $request)
    {
        $managers = User::where('role', 'manager')
            ->with(['equipe' => function ($q) {
                $q->with('departement')->select('id', 'name', 'email', 'departement_id', 'poste', 'telephone', 'is_active', 'manager_id');
            }, 'departement'])
            ->select('id', 'name', 'email', 'departement_id', 'poste', 'telephone', 'is_active')
            ->orderBy('name')
            ->get();
            
        return response()->json(['managers' => $managers]);
    }
}

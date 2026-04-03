<?php

namespace App\Http\Controllers;

use App\Models\Departement;
use App\Models\User;
use Illuminate\Http\Request;

class DepartementController extends Controller
{
    public function index()
    {
        return response()->json(Departement::with('manager')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|unique:departements,nom',
            'manager_id' => 'nullable|exists:users,id',
        ]);

        $departement = Departement::create($request->only(['nom', 'manager_id']));

        // Synchroniser le manager_id pour tous les employés du département si un manager est défini
        if ($departement->manager_id) {
            User::where('departement_id', $departement->id)
                ->where('role', 'employe')
                ->update(['manager_id' => $departement->manager_id]);
        }

        return response()->json([
            'message' => 'Département créé avec succès.',
            'departement' => $departement->load('manager'),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $departement = Departement::findOrFail($id);

        $request->validate([
            'nom' => 'sometimes|required|string|unique:departements,nom,' . $id,
            'manager_id' => 'nullable|exists:users,id',
        ]);

        $oldManagerId = $departement->manager_id;
        $departement->update($request->only(['nom', 'manager_id']));

        // Si le manager a changé, mettre à jour le manager_id de tous les employés du département
        if ($departement->manager_id !== $oldManagerId) {
            User::where('departement_id', $departement->id)
                ->where('role', 'employe')
                ->update(['manager_id' => $departement->manager_id]);
        }

        return response()->json([
            'message' => 'Département mis à jour avec succès.',
            'departement' => $departement->load('manager'),
        ]);
    }

    public function destroy($id)
    {
        $departement = Departement::findOrFail($id);
        
        // Avant de supprimer, on peut mettre à jour les employés pour qu'ils n'aient plus de département
        User::where('departement_id', $departement->id)->update([
            'departement_id' => null,
            'manager_id' => null
        ]);

        $departement->delete();

        return response()->json([
            'message' => 'Département supprimé avec succès.',
        ]);
    }
}

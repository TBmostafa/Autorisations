<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Liste des notifications de l'utilisateur
     */
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->with('demande:id,type,statut')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($notifications);
    }

    /**
     * Nombre non lues
     */
    public function nonLues(Request $request)
    {
        $count = Notification::where('user_id', $request->user()->id)
            ->where('lu', false)
            ->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Marquer comme lue
     */
    public function marquerLue(Request $request, $id)
    {
        $notif = Notification::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $notif->update(['lu' => true]);

        return response()->json(['message' => 'Notification marquée comme lue.']);
    }

    /**
     * Marquer toutes comme lues
     */
    public function marquerToutesLues(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->where('lu', false)
            ->update(['lu' => true]);

        return response()->json(['message' => 'Toutes les notifications marquées comme lues.']);
    }
    /**
     * Supprimer une notification
     */
    public function destroy(Request $request, $id)
    {
        $notif = Notification::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $notif->delete();

        return response()->json(['message' => 'Notification supprimée.']);
    }

    /**
     * Supprimer une sélection de notifications
     */
    public function destroyBatch(Request $request)
    {
        $ids = $request->input('ids', []);
        
        Notification::where('user_id', $request->user()->id)
            ->whereIn('id', $ids)
            ->delete();

        return response()->json(['message' => 'Notifications supprimées.']);
    }

    /**
     * Supprimer toutes les notifications
     */
    public function destroyAll(Request $request)
    {
        Notification::where('user_id', $request->user()->id)->delete();

        return response()->json(['message' => 'Toutes les notifications ont été supprimées.']);
    }
}

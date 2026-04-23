<?php

namespace App\Services;

use App\Mail\AdminAnomalieEmail;
use App\Mail\EmployeStatutEmail;
use App\Mail\ManagerNewDemandeEmail;
use App\Mail\RhDemandeValideeEmail;
use App\Models\Demande;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailNotificationService
{
    /**
     * Notifie le manager qu'une nouvelle demande lui est assignée.
     */
    public function notifierNouvelleDemandeManager(Demande $demande): void
    {
        if ($demande->manager_id === null) {
            $this->notifierAdminAnomalie($demande, 'Demande soumise sans manager assigné');
            return;
        }

        $manager = $demande->manager;

        $this->dispatchSafely(
            fn () => Mail::to($manager)->queue(new ManagerNewDemandeEmail($demande)),
            $manager->email,
            ManagerNewDemandeEmail::class
        );
    }

    /**
     * Notifie tous les RH actifs qu'une demande a été validée par le responsable.
     */
    public function notifierRhDemandeValidee(Demande $demande): void
    {
        $rhActifs = User::where('role', 'rh')->where('is_active', true)->get();

        if ($rhActifs->isEmpty()) {
            $this->notifierAdminAnomalie($demande, 'Aucun RH actif disponible pour traiter la demande validée');
            return;
        }

        foreach ($rhActifs as $rh) {
            $this->dispatchSafely(
                fn () => Mail::to($rh)->queue(new RhDemandeValideeEmail($demande)),
                $rh->email,
                RhDemandeValideeEmail::class
            );
        }
    }

    /**
     * Notifie l'employé d'un changement de statut sur sa demande.
     */
    public function notifierEmployeChangementStatut(Demande $demande): void
    {
        $employe = $demande->employe;

        $this->dispatchSafely(
            fn () => Mail::to($employe)->queue(new EmployeStatutEmail($demande)),
            $employe->email,
            EmployeStatutEmail::class
        );
    }

    /**
     * Notifie tous les admins actifs d'une anomalie détectée.
     */
    private function notifierAdminAnomalie(Demande $demande, string $description): void
    {
        $admins = User::where('role', 'admin')->where('is_active', true)->get();

        if ($admins->isEmpty()) {
            Log::warning('Aucun admin actif pour notifier anomalie', ['demande_id' => $demande->id]);
            return;
        }

        foreach ($admins as $admin) {
            $this->dispatchSafely(
                fn () => Mail::to($admin)->queue(new AdminAnomalieEmail($demande, $description)),
                $admin->email,
                AdminAnomalieEmail::class
            );
        }
    }

    /**
     * Exécute un envoi d'email en capturant les erreurs éventuelles.
     */
    private function dispatchSafely(callable $dispatch, string $recipient, string $emailType): void
    {
        try {
            $dispatch();
        } catch (\Throwable $e) {
            Log::error('Email send failed', [
                'recipient' => $recipient,
                'type'      => $emailType,
                'error'     => $e->getMessage(),
            ]);
        }
    }
}

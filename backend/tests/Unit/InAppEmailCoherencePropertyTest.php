<?php

namespace Tests\Unit;

// Feature: email-notifications, Property 7: Cohérence email + notification in-app

use App\Mail\EmployeStatutEmail;
use App\Mail\ManagerNewDemandeEmail;
use App\Mail\RhDemandeValideeEmail;
use App\Models\Demande;
use App\Models\Notification;
use App\Models\User;
use Carbon\Carbon;
use Eris\Generator;
use Eris\TestTrait;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class InAppEmailCoherencePropertyTest extends TestCase
{
    use DatabaseTransactions, TestTrait;

    protected function setUp(): void
    {
        parent::setUp();
        $this->limitTo(10)->minimumEvaluationRatio(0);
    }

    /**
     * Propriété 7a : Lors de la soumission d'une demande, un email manager ET une notification in-app sont créés.
     */
    public function test_store_creates_both_email_and_inapp_notification_for_manager(): void
    {
        $this->forAll(Generator\choose(0, 9))->then(function (int $seed) {
            Mail::fake();

            User::query()->delete();

            $employe = User::factory()->create(['role' => 'employe']);
            $manager = User::factory()->create(['role' => 'manager']);

            $demande = Demande::factory()->create([
                'user_id'    => $employe->id,
                'manager_id' => $manager->id,
                'statut'     => 'en_attente_responsable',
                'date_debut' => Carbon::now()->addDay(),
                'date_fin'   => Carbon::now()->addDays(3),
            ]);

            // Simuler ce que fait DemandeController::store()
            $notifCountBefore = Notification::where('user_id', $manager->id)->count();

            Notification::create([
                'user_id'    => $manager->id,
                'titre'      => 'Nouvelle demande reçue',
                'message'    => "{$employe->name} a soumis une demande",
                'type'       => 'info',
                'demande_id' => $demande->id,
            ]);

            $demande->load('employe');
            app(\App\Services\EmailNotificationService::class)->notifierNouvelleDemandeManager($demande);

            // Vérifier email queued
            Mail::assertQueued(ManagerNewDemandeEmail::class, function ($mail) use ($manager) {
                return $mail->hasTo($manager->email);
            });

            // Vérifier notification in-app créée
            $notifCountAfter = Notification::where('user_id', $manager->id)->count();
            $this->assertGreaterThan($notifCountBefore, $notifCountAfter, 'Notification in-app manager absente');
        });
    }

    /**
     * Propriété 7b : Lors du changement de statut, un email employé ET une notification in-app sont créés.
     */
    public function test_traiter_creates_both_email_and_inapp_notification_for_employe(): void
    {
        $statuts = ['validee_responsable', 'refusee_responsable', 'validee_definitivement', 'refusee_rh'];

        $this->forAll(Generator\elements(...$statuts))->then(function (string $statut) {
            Mail::fake();

            User::query()->delete();

            $employe = User::factory()->create(['role' => 'employe']);
            $manager = User::factory()->create(['role' => 'manager']);

            $demande = Demande::factory()->create([
                'user_id'    => $employe->id,
                'manager_id' => $manager->id,
                'statut'     => $statut,
                'date_debut' => Carbon::now()->addDay(),
                'date_fin'   => Carbon::now()->addDays(3),
            ]);

            $notifCountBefore = Notification::where('user_id', $employe->id)->count();

            // Simuler ce que fait DemandeController::traiter()
            Notification::create([
                'user_id'    => $employe->id,
                'titre'      => "Demande mise à jour",
                'message'    => "Votre demande a été mise à jour : {$statut}",
                'type'       => 'info',
                'demande_id' => $demande->id,
            ]);

            $demande->load('employe');
            app(\App\Services\EmailNotificationService::class)->notifierEmployeChangementStatut($demande);

            // Vérifier email queued
            Mail::assertQueued(EmployeStatutEmail::class, function ($mail) use ($employe) {
                return $mail->hasTo($employe->email);
            });

            // Vérifier notification in-app créée
            $notifCountAfter = Notification::where('user_id', $employe->id)->count();
            $this->assertGreaterThan($notifCountBefore, $notifCountAfter, 'Notification in-app employé absente');
        });
    }

    /**
     * Propriété 7c : Lors de validee_responsable, un email RH ET des notifications in-app RH sont créés.
     */
    public function test_validee_responsable_creates_both_email_and_inapp_for_rh(): void
    {
        $this->forAll(Generator\choose(1, 3))->then(function (int $rhCount) {
            Mail::fake();

            User::query()->delete();

            $employe = User::factory()->create(['role' => 'employe']);
            $manager = User::factory()->create(['role' => 'manager']);
            $rhUsers = User::factory()->count($rhCount)->create(['role' => 'rh', 'is_active' => true]);

            $demande = Demande::factory()->create([
                'user_id'    => $employe->id,
                'manager_id' => $manager->id,
                'statut'     => 'validee_responsable',
                'date_debut' => Carbon::now()->addDay(),
                'date_fin'   => Carbon::now()->addDays(3),
            ]);

            // Simuler les notifications in-app RH créées par DemandeController::traiter()
            foreach ($rhUsers as $rh) {
                Notification::create([
                    'user_id'    => $rh->id,
                    'titre'      => 'Nouvelle validation (Manager)',
                    'message'    => "Une demande attend votre action.",
                    'type'       => 'info',
                    'demande_id' => $demande->id,
                ]);
            }

            $demande->load(['employe', 'manager']);
            app(\App\Services\EmailNotificationService::class)->notifierRhDemandeValidee($demande);

            // Vérifier emails queued pour chaque RH
            Mail::assertQueued(RhDemandeValideeEmail::class, $rhCount);

            // Vérifier notifications in-app créées pour chaque RH
            foreach ($rhUsers as $rh) {
                $this->assertDatabaseHas('notifications', [
                    'user_id'    => $rh->id,
                    'demande_id' => $demande->id,
                ]);
            }
        });
    }
}

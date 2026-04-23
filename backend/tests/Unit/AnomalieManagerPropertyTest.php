<?php

namespace Tests\Unit;

// Feature: email-notifications, Property 3: Anomalie sans manager déclenche notification admin et aucun email manager

use App\Mail\AdminAnomalieEmail;
use App\Mail\ManagerNewDemandeEmail;
use App\Models\Demande;
use App\Models\User;
use App\Services\EmailNotificationService;
use Carbon\Carbon;
use Eris\Generator;
use Eris\TestTrait;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AnomalieManagerPropertyTest extends TestCase
{
    use DatabaseTransactions, TestTrait;

    protected function setUp(): void
    {
        parent::setUp();
        $this->limitTo(10)->minimumEvaluationRatio(0);
    }

    private function makeService(): EmailNotificationService
    {
        return new EmailNotificationService();
    }

    /**
     * Propriété 3 : Pour toute demande sans manager_id, aucun email manager n'est envoyé
     * et un email d'anomalie est envoyé à tous les admins actifs.
     */
    public function test_no_manager_email_and_admin_anomalie_when_no_manager_id(): void
    {
        $this->forAll(Generator\choose(1, 3))->then(function (int $adminCount) {
            Mail::fake();

            // Nettoyer les users existants pour isoler chaque itération
            User::query()->delete();

            $employe = User::factory()->create(['role' => 'employe']);
            User::factory()->count($adminCount)->create(['role' => 'admin', 'is_active' => true]);

            $demande = Demande::factory()->create([
                'user_id'    => $employe->id,
                'manager_id' => null,
                'statut'     => 'en_attente_responsable',
                'date_debut' => Carbon::now()->addDay(),
                'date_fin'   => Carbon::now()->addDays(3),
            ]);
            $demande->load('employe');

            $this->makeService()->notifierNouvelleDemandeManager($demande);

            Mail::assertNotQueued(ManagerNewDemandeEmail::class);
            Mail::assertQueued(AdminAnomalieEmail::class, $adminCount);
        });
    }

    /**
     * Propriété 3b : Chaque admin actif reçoit l'email d'anomalie.
     */
    public function test_each_active_admin_receives_anomalie_email(): void
    {
        $this->forAll(Generator\choose(1, 4))->then(function (int $adminCount) {
            Mail::fake();

            User::query()->delete();

            $employe = User::factory()->create(['role' => 'employe']);
            $admins  = User::factory()->count($adminCount)->create(['role' => 'admin', 'is_active' => true]);

            $demande = Demande::factory()->create([
                'user_id'    => $employe->id,
                'manager_id' => null,
                'statut'     => 'en_attente_responsable',
                'date_debut' => Carbon::now()->addDay(),
                'date_fin'   => Carbon::now()->addDays(3),
            ]);
            $demande->load('employe');

            $this->makeService()->notifierNouvelleDemandeManager($demande);

            foreach ($admins as $admin) {
                Mail::assertQueued(AdminAnomalieEmail::class, function ($mail) use ($admin) {
                    return $mail->hasTo($admin->email);
                });
            }
        });
    }
}

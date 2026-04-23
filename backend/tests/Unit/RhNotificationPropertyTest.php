<?php

namespace Tests\Unit;

// Feature: email-notifications, Property 5: Notification RH pour toute demande validée par manager

use App\Mail\AdminAnomalieEmail;
use App\Mail\RhDemandeValideeEmail;
use App\Models\Demande;
use App\Models\User;
use App\Services\EmailNotificationService;
use Carbon\Carbon;
use Eris\Generator;
use Eris\TestTrait;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class RhNotificationPropertyTest extends TestCase
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
     * Propriété 5 : Pour tout ensemble de RH actifs, chacun reçoit un email quand statut = validee_responsable.
     */
    public function test_each_active_rh_receives_email_when_demande_validee_responsable(): void
    {
        $this->forAll(Generator\choose(1, 4))->then(function (int $rhCount) {
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
            $demande->load(['employe', 'manager']);

            $this->makeService()->notifierRhDemandeValidee($demande);

            Mail::assertQueued(RhDemandeValideeEmail::class, $rhCount);

            foreach ($rhUsers as $rh) {
                Mail::assertQueued(RhDemandeValideeEmail::class, function ($mail) use ($rh) {
                    return $mail->hasTo($rh->email);
                });
            }
        });
    }

    /**
     * Propriété 5b : Si aucun RH actif, un email d'anomalie est envoyé aux admins.
     */
    public function test_admin_anomalie_sent_when_no_active_rh(): void
    {
        $this->forAll(Generator\choose(1, 3))->then(function (int $adminCount) {
            Mail::fake();

            User::query()->delete();

            $employe = User::factory()->create(['role' => 'employe']);
            $manager = User::factory()->create(['role' => 'manager']);
            User::factory()->count($adminCount)->create(['role' => 'admin', 'is_active' => true]);

            $demande = Demande::factory()->create([
                'user_id'    => $employe->id,
                'manager_id' => $manager->id,
                'statut'     => 'validee_responsable',
                'date_debut' => Carbon::now()->addDay(),
                'date_fin'   => Carbon::now()->addDays(3),
            ]);
            $demande->load(['employe', 'manager']);

            $this->makeService()->notifierRhDemandeValidee($demande);

            Mail::assertNotQueued(RhDemandeValideeEmail::class);
            Mail::assertQueued(AdminAnomalieEmail::class, $adminCount);
        });
    }

    /**
     * Propriété 5c : Les RH inactifs ne reçoivent pas d'email.
     */
    public function test_inactive_rh_does_not_receive_email(): void
    {
        $this->forAll(
            Generator\choose(1, 3),
            Generator\choose(1, 3)
        )->then(function (int $activeCount, int $inactiveCount) {
            Mail::fake();

            User::query()->delete();

            $employe     = User::factory()->create(['role' => 'employe']);
            $manager     = User::factory()->create(['role' => 'manager']);
            User::factory()->count($activeCount)->create(['role' => 'rh', 'is_active' => true]);
            $inactiveRhs = User::factory()->count($inactiveCount)->create(['role' => 'rh', 'is_active' => false]);

            $demande = Demande::factory()->create([
                'user_id'    => $employe->id,
                'manager_id' => $manager->id,
                'statut'     => 'validee_responsable',
                'date_debut' => Carbon::now()->addDay(),
                'date_fin'   => Carbon::now()->addDays(3),
            ]);
            $demande->load(['employe', 'manager']);

            $this->makeService()->notifierRhDemandeValidee($demande);

            Mail::assertQueued(RhDemandeValideeEmail::class, $activeCount);

            foreach ($inactiveRhs as $rh) {
                Mail::assertNotQueued(RhDemandeValideeEmail::class, function ($mail) use ($rh) {
                    return $mail->hasTo($rh->email);
                });
            }
        });
    }
}

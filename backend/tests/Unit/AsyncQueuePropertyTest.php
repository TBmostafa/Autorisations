<?php

namespace Tests\Unit;

// Feature: email-notifications, Property 4: Envoi asynchrone via Queue pour tous les emails

use App\Mail\AdminAnomalieEmail;
use App\Mail\EmployeStatutEmail;
use App\Mail\ManagerNewDemandeEmail;
use App\Mail\RhDemandeValideeEmail;
use App\Models\Demande;
use App\Models\User;
use App\Services\EmailNotificationService;
use Carbon\Carbon;
use Eris\Generator;
use Eris\TestTrait;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AsyncQueuePropertyTest extends TestCase
{
    use RefreshDatabase, TestTrait;

    protected function setUp(): void
    {
        parent::setUp();
        $this->limitTo(10);
    }

    private function makeService(): EmailNotificationService
    {
        return new EmailNotificationService();
    }

    /**
     * Propriété 4a : notifierNouvelleDemandeManager pousse un ManagerNewDemandeEmail dans la queue.
     */
    public function test_manager_notification_is_queued(): void
    {
        $this->forAll(Generator\choose(0, 99))->then(function (int $seed) {
            Mail::fake();

            $employe = User::factory()->create(['role' => 'employe']);
            $manager = User::factory()->create(['role' => 'manager']);

            $demande = Demande::factory()->create([
                'user_id'    => $employe->id,
                'manager_id' => $manager->id,
                'statut'     => 'en_attente_responsable',
                'date_debut' => Carbon::now()->addDay(),
                'date_fin'   => Carbon::now()->addDays(3),
            ]);
            $demande->load('employe');

            $this->makeService()->notifierNouvelleDemandeManager($demande);

            Mail::assertQueued(ManagerNewDemandeEmail::class);
        });
    }

    /**
     * Propriété 4b : notifierRhDemandeValidee pousse un RhDemandeValideeEmail dans la queue.
     */
    public function test_rh_notification_is_queued(): void
    {
        $this->forAll(Generator\choose(0, 99))->then(function (int $seed) {
            Mail::fake();

            $employe = User::factory()->create(['role' => 'employe']);
            $manager = User::factory()->create(['role' => 'manager']);
            User::factory()->create(['role' => 'rh', 'is_active' => true]);

            $demande = Demande::factory()->create([
                'user_id'    => $employe->id,
                'manager_id' => $manager->id,
                'statut'     => 'validee_responsable',
                'date_debut' => Carbon::now()->addDay(),
                'date_fin'   => Carbon::now()->addDays(3),
            ]);
            $demande->load(['employe', 'manager']);

            $this->makeService()->notifierRhDemandeValidee($demande);

            Mail::assertQueued(RhDemandeValideeEmail::class);
        });
    }

    /**
     * Propriété 4c : notifierEmployeChangementStatut pousse un EmployeStatutEmail dans la queue.
     */
    public function test_employe_notification_is_queued(): void
    {
        $statuts = ['validee_responsable', 'refusee_responsable', 'validee_definitivement', 'refusee_rh'];

        $this->forAll(Generator\elements(...$statuts))->then(function (string $statut) {
            Mail::fake();

            $employe = User::factory()->create(['role' => 'employe']);
            $manager = User::factory()->create(['role' => 'manager']);

            $demande = Demande::factory()->create([
                'user_id'    => $employe->id,
                'manager_id' => $manager->id,
                'statut'     => $statut,
                'date_debut' => Carbon::now()->addDay(),
                'date_fin'   => Carbon::now()->addDays(3),
            ]);
            $demande->load('employe');

            $this->makeService()->notifierEmployeChangementStatut($demande);

            Mail::assertQueued(EmployeStatutEmail::class);
        });
    }

    /**
     * Propriété 4d : anomalie sans manager pousse un AdminAnomalieEmail dans la queue.
     */
    public function test_admin_anomalie_is_queued_when_no_manager(): void
    {
        $this->forAll(Generator\choose(0, 99))->then(function (int $seed) {
            Mail::fake();

            $employe = User::factory()->create(['role' => 'employe']);
            User::factory()->create(['role' => 'admin', 'is_active' => true]);

            $demande = Demande::factory()->create([
                'user_id'    => $employe->id,
                'manager_id' => null,
                'statut'     => 'en_attente_responsable',
                'date_debut' => Carbon::now()->addDay(),
                'date_fin'   => Carbon::now()->addDays(3),
            ]);
            $demande->load('employe');

            $this->makeService()->notifierNouvelleDemandeManager($demande);

            Mail::assertQueued(AdminAnomalieEmail::class);
            Mail::assertNotQueued(ManagerNewDemandeEmail::class);
        });
    }
}

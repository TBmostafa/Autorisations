<?php

namespace Tests\Unit;

// Feature: email-notifications, Property 8: Résilience aux échecs SMTP — log sans propagation d'exception

use App\Models\Demande;
use App\Models\User;
use App\Services\EmailNotificationService;
use Carbon\Carbon;
use Eris\Generator;
use Eris\TestTrait;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class SmtpResiliencePropertyTest extends TestCase
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
     * Propriété 8a : échec SMTP sur notifierNouvelleDemandeManager → log error, pas d'exception.
     */
    public function test_smtp_failure_on_manager_notification_logs_error_without_exception(): void
    {
        $errorMessages = ['Connection refused', 'SMTP timeout', 'Authentication failed'];

        $this->forAll(Generator\elements(...$errorMessages))->then(function (string $errorMsg) {
            $loggedErrors = [];
            \Illuminate\Support\Facades\Log::listen(function ($event) use (&$loggedErrors) {
                if (isset($event->level) && $event->level === 'error') {
                    $loggedErrors[] = $event->message;
                }
            });

            Mail::shouldReceive('to')->andReturnSelf();
            Mail::shouldReceive('queue')->andThrow(new \RuntimeException($errorMsg));

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
            $demande->load('employe');

            // Ne doit pas lever d'exception
            $this->makeService()->notifierNouvelleDemandeManager($demande);

            $this->assertNotEmpty($loggedErrors, 'Aucune erreur loguée lors de l\'échec SMTP');
        });
    }

    /**
     * Propriété 8b : échec SMTP sur notifierEmployeChangementStatut → log error, pas d'exception.
     */
    public function test_smtp_failure_on_employe_notification_logs_error_without_exception(): void
    {
        $statuts = ['validee_responsable', 'refusee_responsable', 'validee_definitivement', 'refusee_rh'];

        $this->forAll(Generator\elements(...$statuts))->then(function (string $statut) {
            $loggedErrors = [];
            \Illuminate\Support\Facades\Log::listen(function ($event) use (&$loggedErrors) {
                if (isset($event->level) && $event->level === 'error') {
                    $loggedErrors[] = $event->message;
                }
            });

            Mail::shouldReceive('to')->andReturnSelf();
            Mail::shouldReceive('queue')->andThrow(new \RuntimeException('SMTP error'));

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
            $demande->load('employe');

            // Ne doit pas lever d'exception
            $this->makeService()->notifierEmployeChangementStatut($demande);

            $this->assertNotEmpty($loggedErrors, 'Aucune erreur loguée lors de l\'échec SMTP');
        });
    }

    /**
     * Propriété 8c : échec SMTP sur notifierRhDemandeValidee → log error, pas d'exception.
     */
    public function test_smtp_failure_on_rh_notification_logs_error_without_exception(): void
    {
        $this->forAll(Generator\choose(1, 3))->then(function (int $rhCount) {
            $loggedErrors = [];
            \Illuminate\Support\Facades\Log::listen(function ($event) use (&$loggedErrors) {
                if (isset($event->level) && $event->level === 'error') {
                    $loggedErrors[] = $event->message;
                }
            });

            Mail::shouldReceive('to')->andReturnSelf();
            Mail::shouldReceive('queue')->andThrow(new \RuntimeException('SMTP error'));

            User::query()->delete();
            $employe = User::factory()->create(['role' => 'employe']);
            $manager = User::factory()->create(['role' => 'manager']);
            User::factory()->count($rhCount)->create(['role' => 'rh', 'is_active' => true]);

            $demande = Demande::factory()->create([
                'user_id'    => $employe->id,
                'manager_id' => $manager->id,
                'statut'     => 'validee_responsable',
                'date_debut' => Carbon::now()->addDay(),
                'date_fin'   => Carbon::now()->addDays(3),
            ]);
            $demande->load(['employe', 'manager']);

            // Ne doit pas lever d'exception
            $this->makeService()->notifierRhDemandeValidee($demande);

            $this->assertCount($rhCount, $loggedErrors, "Nombre d'erreurs loguées incorrect");
        });
    }
}

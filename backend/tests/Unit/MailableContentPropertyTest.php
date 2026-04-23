<?php

namespace Tests\Unit;

// Feature: email-notifications, Property 2: Contenu complet de l'email manager et de l'email RH

use App\Mail\ManagerNewDemandeEmail;
use App\Mail\RhDemandeValideeEmail;
use App\Models\Demande;
use App\Models\User;
use Carbon\Carbon;
use Eris\Generator;
use Eris\TestTrait;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MailableContentPropertyTest extends TestCase
{
    use RefreshDatabase, TestTrait;

    protected function setUp(): void
    {
        parent::setUp();
        $this->limitTo(10)->minimumEvaluationRatio(0);
    }

    /**
     * Propriété 2a : ManagerNewDemandeEmail contient nom employé, type, dates, référence.
     */
    public function test_manager_email_contains_required_fields(): void
    {
        $types = ['conge', 'autorisation_absence', 'sortie'];

        $this->forAll(
            Generator\choose(0, 99),
            Generator\elements(...$types),
            Generator\choose(1, 28),
            Generator\choose(1, 12),
            Generator\choose(2025, 2030)
        )->then(function (int $seed, string $type, int $day, int $month, int $year) {
            $employe = User::factory()->create([
                'name' => 'Employe_' . $seed,
                'role' => 'employe',
            ]);
            $manager = User::factory()->create(['role' => 'manager']);

            $dateDebut = Carbon::create($year, $month, $day)->startOfDay();
            $dateFin   = $dateDebut->copy()->addDays(rand(1, 5));

            $demande = Demande::factory()->create([
                'user_id'    => $employe->id,
                'manager_id' => $manager->id,
                'type'       => $type,
                'date_debut' => $dateDebut,
                'date_fin'   => $dateFin,
                'statut'     => 'en_attente_responsable',
            ]);
            $demande->load('employe');

            $mailable  = new ManagerNewDemandeEmail($demande);
            $rendered  = $mailable->render();
            $reference = str_pad((string) $demande->id, 5, '0', STR_PAD_LEFT);

            $this->assertStringContainsString($employe->name, $rendered, 'Nom employé absent');
            $this->assertStringContainsString($reference, $rendered, 'Référence absente');
            $this->assertStringContainsString($dateDebut->format('d/m/Y'), $rendered, 'Date début absente');
            $this->assertStringContainsString($dateFin->format('d/m/Y'), $rendered, 'Date fin absente');
        });
    }

    /**
     * Propriété 2b : RhDemandeValideeEmail contient nom employé, type, dates, référence, nom manager.
     */
    public function test_rh_email_contains_required_fields_including_manager_name(): void
    {
        $types = ['conge', 'autorisation_absence', 'sortie'];

        $this->forAll(
            Generator\choose(0, 99),
            Generator\elements(...$types),
            Generator\choose(1, 28),
            Generator\choose(1, 12),
            Generator\choose(2025, 2030)
        )->then(function (int $seed, string $type, int $day, int $month, int $year) {
            $employe = User::factory()->create([
                'name' => 'Employe_' . $seed,
                'role' => 'employe',
            ]);
            $manager = User::factory()->create([
                'name' => 'Manager_' . $seed,
                'role' => 'manager',
            ]);

            $dateDebut = Carbon::create($year, $month, $day)->startOfDay();
            $dateFin   = $dateDebut->copy()->addDays(rand(1, 5));

            $demande = Demande::factory()->create([
                'user_id'    => $employe->id,
                'manager_id' => $manager->id,
                'type'       => $type,
                'date_debut' => $dateDebut,
                'date_fin'   => $dateFin,
                'statut'     => 'validee_responsable',
            ]);
            $demande->load(['employe', 'manager']);

            $mailable  = new RhDemandeValideeEmail($demande);
            $rendered  = $mailable->render();
            $reference = str_pad((string) $demande->id, 5, '0', STR_PAD_LEFT);

            $this->assertStringContainsString($employe->name, $rendered, 'Nom employé absent');
            $this->assertStringContainsString($manager->name, $rendered, 'Nom manager absent');
            $this->assertStringContainsString($reference, $rendered, 'Référence absente');
            $this->assertStringContainsString($dateDebut->format('d/m/Y'), $rendered, 'Date début absente');
            $this->assertStringContainsString($dateFin->format('d/m/Y'), $rendered, 'Date fin absente');
        });
    }
}

<?php

namespace Tests\Unit;

// Feature: email-notifications, Property 6: Notification employé pour tout changement de statut avec libellé correct

use App\Mail\EmployeStatutEmail;
use App\Models\Demande;
use App\Models\User;
use Carbon\Carbon;
use Eris\Generator;
use Eris\TestTrait;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StatutLabelPropertyTest extends TestCase
{
    use RefreshDatabase, TestTrait;

    protected function setUp(): void
    {
        parent::setUp();
        $this->limitTo(10)->minimumEvaluationRatio(0);
    }

    /**
     * Propriété 6 : Pour tout statut parmi les 4 définis, le libellé français exact apparaît dans le rendu.
     */
    public function test_employe_email_contains_exact_statut_label(): void
    {
        $statuts = array_keys(EmployeStatutEmail::STATUT_LABELS);

        $this->forAll(
            Generator\elements(...$statuts),
            Generator\elements(null, 'Commentaire test', 'Refus pour motif personnel')
        )->then(function (string $statut, ?string $commentaire) {
            $employe = User::factory()->create(['role' => 'employe']);
            $manager = User::factory()->create(['role' => 'manager']);

            $demande = Demande::factory()->create([
                'user_id'            => $employe->id,
                'manager_id'         => $manager->id,
                'statut'             => $statut,
                'commentaire_manager' => $commentaire,
                'date_debut'         => Carbon::now()->addDay(),
                'date_fin'           => Carbon::now()->addDays(3),
            ]);
            $demande->load('employe');

            $mailable      = new EmployeStatutEmail($demande);
            $rendered      = $mailable->render();
            $expectedLabel = EmployeStatutEmail::STATUT_LABELS[$statut];

            $this->assertStringContainsString($expectedLabel, $rendered, "Libellé manquant pour statut: $statut");

            if ($commentaire !== null) {
                $this->assertStringContainsString($commentaire, $rendered, 'Commentaire absent du rendu');
            }
        });
    }

    /**
     * Propriété 6b : Le type de demande et les dates apparaissent dans le rendu pour tout statut.
     */
    public function test_employe_email_contains_type_and_dates(): void
    {
        $statuts = array_keys(EmployeStatutEmail::STATUT_LABELS);
        $types   = ['conge', 'autorisation_absence', 'sortie'];

        $this->forAll(
            Generator\elements(...$statuts),
            Generator\elements(...$types),
            Generator\choose(1, 28),
            Generator\choose(1, 12)
        )->then(function (string $statut, string $type, int $day, int $month) {
            $employe = User::factory()->create(['role' => 'employe']);
            $manager = User::factory()->create(['role' => 'manager']);

            $dateDebut = Carbon::create(2026, $month, $day)->startOfDay();
            $dateFin   = $dateDebut->copy()->addDays(2);

            $demande = Demande::factory()->create([
                'user_id'    => $employe->id,
                'manager_id' => $manager->id,
                'statut'     => $statut,
                'type'       => $type,
                'date_debut' => $dateDebut,
                'date_fin'   => $dateFin,
            ]);
            $demande->load('employe');

            $mailable = new EmployeStatutEmail($demande);
            $rendered = $mailable->render();

            $this->assertStringContainsString($dateDebut->format('d/m/Y'), $rendered, 'Date début absente');
            $this->assertStringContainsString($dateFin->format('d/m/Y'), $rendered, 'Date fin absente');
        });
    }
}

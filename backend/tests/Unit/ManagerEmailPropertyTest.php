<?php

namespace Tests\Unit;

// Feature: email-notifications, Property 1: Envoi email manager pour toute demande avec manager_id valide

use App\Mail\ManagerNewDemandeEmail;
use App\Models\Demande;
use App\Models\User;
use App\Services\EmailNotificationService;
use Carbon\Carbon;
use Eris\Generator;
use Eris\TestTrait;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ManagerEmailPropertyTest extends TestCase
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
     * Propriété 1 : Pour toute demande avec manager_id valide, un email est envoyé au bon manager.
     */
    public function test_manager_email_sent_to_correct_recipient_for_any_valid_demande(): void
    {
        $types = ['conge', 'autorisation_absence', 'sortie'];

        $this->forAll(
            Generator\elements(...$types),
            Generator\choose(1, 28),
            Generator\choose(1, 12)
        )->then(function (string $type, int $day, int $month) {
            Mail::fake();

            $employe = User::factory()->create(['role' => 'employe']);
            $manager = User::factory()->create(['role' => 'manager']);

            $dateDebut = Carbon::create(2026, $month, $day)->startOfDay();
            $dateFin   = $dateDebut->copy()->addDays(rand(1, 7));

            $demande = Demande::factory()->create([
                'user_id'    => $employe->id,
                'manager_id' => $manager->id,
                'type'       => $type,
                'statut'     => 'en_attente_responsable',
                'date_debut' => $dateDebut,
                'date_fin'   => $dateFin,
            ]);
            $demande->load('employe');

            $this->makeService()->notifierNouvelleDemandeManager($demande);

            Mail::assertQueued(ManagerNewDemandeEmail::class, function ($mail) use ($manager) {
                return $mail->hasTo($manager->email);
            });
        });
    }

    /**
     * Propriété 1b : Un seul email manager est envoyé (pas de doublons).
     */
    public function test_exactly_one_manager_email_sent_per_demande(): void
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

            Mail::assertQueued(ManagerNewDemandeEmail::class, 1);
        });
    }
}

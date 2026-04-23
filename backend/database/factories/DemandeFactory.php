<?php

namespace Database\Factories;

use App\Models\Demande;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

class DemandeFactory extends Factory
{
    protected $model = Demande::class;

    public function definition(): array
    {
        $dateDebut = Carbon::now()->addDays(rand(1, 10));
        $dateFin   = $dateDebut->copy()->addDays(rand(1, 5));

        return [
            'user_id'             => User::factory(),
            'manager_id'          => User::factory()->state(['role' => 'manager']),
            'type'                => $this->faker->randomElement(['conge', 'autorisation_absence', 'sortie']),
            'date_debut'          => $dateDebut,
            'date_fin'            => $dateFin,
            'motif'               => $this->faker->sentence(),
            'statut'              => 'en_attente_responsable',
            'commentaire_employe' => null,
            'commentaire_manager' => null,
            'is_archived'         => false,
        ];
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Étendre l'enum type pour inclure sortie_urgente
        DB::statement("ALTER TABLE demandes MODIFY COLUMN type ENUM(
            'conge',
            'autorisation_absence',
            'sortie',
            'sortie_urgente'
        )");

        // Ajouter la colonne justification_urgence
        DB::statement("ALTER TABLE demandes ADD COLUMN justification_urgence TEXT NULL AFTER motif");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE demandes DROP COLUMN justification_urgence");

        DB::statement("ALTER TABLE demandes MODIFY COLUMN type ENUM(
            'conge',
            'autorisation_absence',
            'sortie'
        )");
    }
};

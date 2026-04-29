<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Ajouter la colonne justification_acceptee (null = pas encore traitée, true = acceptée, false = refusée)
        DB::statement("ALTER TABLE demandes ADD COLUMN justification_acceptee TINYINT(1) NULL DEFAULT NULL AFTER justification_urgence");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE demandes DROP COLUMN justification_acceptee");
    }
};

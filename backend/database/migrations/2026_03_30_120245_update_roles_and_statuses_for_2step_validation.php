<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add 'rh' to users.role
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('employe', 'manager', 'admin', 'rh') DEFAULT 'employe'");
        
        // Update demandes.statut by expanding to VARCHAR first to avoid enum constraint errors
        DB::statement("ALTER TABLE demandes MODIFY COLUMN statut VARCHAR(255) DEFAULT 'en_attente_responsable'");
        
        // Map old values to new values
        DB::statement("UPDATE demandes SET statut = 'en_attente_responsable' WHERE statut = 'en_attente'");
        DB::statement("UPDATE demandes SET statut = 'validee_definitivement' WHERE statut = 'acceptee'");
        DB::statement("UPDATE demandes SET statut = 'refusee_responsable' WHERE statut = 'refusee'");
        
        // Enforce the new ENUM
        DB::statement("ALTER TABLE demandes MODIFY COLUMN statut ENUM('en_attente_responsable', 'refusee_responsable', 'validee_responsable', 'refusee_rh', 'validee_definitivement') DEFAULT 'en_attente_responsable'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('employe', 'manager', 'admin') DEFAULT 'employe'");
        
        // Update demandes.statut by expanding to VARCHAR first
        DB::statement("ALTER TABLE demandes MODIFY COLUMN statut VARCHAR(255) DEFAULT 'en_attente'");
        
        // Revert values
        DB::statement("UPDATE demandes SET statut = 'en_attente' WHERE statut = 'en_attente_responsable'");
        DB::statement("UPDATE demandes SET statut = 'acceptee' WHERE statut = 'validee_definitivement'");
        DB::statement("UPDATE demandes SET statut = 'refusee' WHERE statut = 'refusee_responsable'");
        
        // Revert ENUM
        DB::statement("ALTER TABLE demandes MODIFY COLUMN statut ENUM('en_attente', 'acceptee', 'refusee') DEFAULT 'en_attente'");
    }
};

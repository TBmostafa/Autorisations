<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('demandes', function (Blueprint $table) {
            // Requêtes les plus fréquentes : filtrage par user, manager, statut, archivage
            $table->index(['user_id', 'statut'],    'idx_demandes_user_statut');
            $table->index(['manager_id', 'statut'], 'idx_demandes_manager_statut');
            $table->index(['statut', 'is_archived'], 'idx_demandes_statut_archived');
            $table->index('created_at',             'idx_demandes_created_at');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index('role',       'idx_users_role');
            $table->index('manager_id', 'idx_users_manager_id');
            $table->index('is_active',  'idx_users_is_active');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['user_id', 'lu'], 'idx_notifications_user_lu');
        });
    }

    public function down(): void
    {
        Schema::table('demandes', function (Blueprint $table) {
            $table->dropIndex('idx_demandes_user_statut');
            $table->dropIndex('idx_demandes_manager_statut');
            $table->dropIndex('idx_demandes_statut_archived');
            $table->dropIndex('idx_demandes_created_at');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_role');
            $table->dropIndex('idx_users_manager_id');
            $table->dropIndex('idx_users_is_active');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('idx_notifications_user_lu');
        });
    }
};

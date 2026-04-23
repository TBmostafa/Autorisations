<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestMail extends Command
{
    protected $signature   = 'mail:test {to}';
    protected $description = 'Envoyer un email de test SMTP';

    public function handle(): void
    {
        $to = $this->argument('to');
        $this->info("Envoi d'un email de test à {$to}...");

        try {
            Mail::raw('✅ Test SMTP réussi — Gestion des Autorisations fonctionne correctement.', function ($m) use ($to) {
                $m->to($to)->subject('Test SMTP — Gestion des Autorisations');
            });
            $this->info('Email envoyé avec succès !');
        } catch (\Throwable $e) {
            $this->error('Erreur : ' . $e->getMessage());
        }
    }
}

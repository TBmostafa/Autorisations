<?php

namespace App\Mail;

use App\Models\Demande;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmployeStatutEmail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Nombre de tentatives en cas d'échec.
     */
    public int $tries = 3;

    /**
     * Libellés français pour chaque statut.
     */
    public const STATUT_LABELS = [
        'validee_responsable'    => 'Validée par votre responsable',
        'refusee_responsable'    => 'Refusée par votre responsable',
        'validee_definitivement' => 'Validée définitivement par le service RH',
        'refusee_rh'             => 'Refusée par le service RH',
    ];

    /**
     * Libellé résolu depuis STATUT_LABELS.
     */
    public string $statutLabel;

    /**
     * Référence formatée sur 5 chiffres.
     */
    public string $reference;

    /**
     * Create a new message instance.
     */
    public function __construct(public Demande $demande)
    {
        $this->statutLabel = self::STATUT_LABELS[$demande->statut] ?? $demande->statut;
        $this->reference   = str_pad((string) $demande->id, 5, '0', STR_PAD_LEFT);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Mise à jour de votre demande — Réf. ' . $this->reference,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.employe_statut',
        );
    }
}

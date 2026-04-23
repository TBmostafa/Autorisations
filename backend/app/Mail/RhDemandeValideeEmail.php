<?php

namespace App\Mail;

use App\Models\Demande;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RhDemandeValideeEmail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Nombre de tentatives en cas d'échec.
     */
    public int $tries = 3;

    /**
     * Référence formatée sur 5 chiffres.
     */
    public string $reference;

    /**
     * Create a new message instance.
     *
     * @param Demande $demande Demande avec les relations `employe` et `manager` chargées
     */
    public function __construct(public Demande $demande)
    {
        $this->reference = str_pad((string) $demande->id, 5, '0', STR_PAD_LEFT);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Demande validée — Réf. ' . $this->reference,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.rh_demande_validee',
        );
    }
}

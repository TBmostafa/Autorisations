<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Demande extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'manager_id',
        'type',
        'date_debut',
        'date_fin',
        'motif',
        'justification_urgence',
        'justification_acceptee',
        'statut',
        'commentaire_employe',
        'commentaire_manager',
        'date_traitement',
        'is_archived',
        'signature_employe',
        'signature_manager',
    ];

    protected $casts = [
        'date_debut'             => 'datetime',
        'date_fin'               => 'datetime',
        'date_traitement'        => 'datetime',
        'is_archived'            => 'boolean',
        'justification_acceptee' => 'boolean',
    ];

    protected $appends = [
        'duree',
        'type_libelle',
    ];

    public static $types = [
        'conge'                => 'Congé',
        'autorisation_absence' => 'Autorisation d\'Absence',
        'sortie'               => 'Autorisation de Sortie',
        'sortie_urgente'       => 'Sortie Urgente',
    ];

    // Relations
    public function employe()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    // Scopes
    public function scopeEnAttente($query)
    {
        return $query->whereIn('statut', ['en_attente_responsable', 'validee_responsable']);
    }

    public function scopeAcceptees($query)
    {
        return $query->where('statut', 'validee_definitivement');
    }

    public function scopeRefusees($query)
    {
        return $query->whereIn('statut', ['refusee_responsable', 'refusee_rh']);
    }

    public function scopeNonArchivees($query)
    {
        return $query->where('is_archived', false);
    }

    // Helpers
    public function getTypeLibelleAttribute(): string
    {
        return self::$types[$this->type] ?? $this->type;
    }

    public function getDureeAttribute(): int
    {
        if (!$this->date_debut || !$this->date_fin) {
            return 0;
        }
        return $this->date_debut->diffInDays($this->date_fin) + 1;
    }

    public function isModifiable(): bool
    {
        return $this->statut === 'en_attente_responsable';
    }
}

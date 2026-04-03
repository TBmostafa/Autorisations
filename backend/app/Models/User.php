<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'departement_id',
        'poste',
        'telephone',
        'is_active',
        'manager_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];

    // Relations
    public function demandes()
    {
        return $this->hasMany(Demande::class , 'user_id');
    }

    public function departement()
    {
        return $this->belongsTo(Departement::class);
    }

    public function demandesATraiter()
    {
        return $this->hasMany(Demande::class , 'manager_id');
    }

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function equipe()
    {
        return $this->hasMany(User::class, 'manager_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    // Scopes
    public function scopeEmployes($query)
    {
        return $query->where('role', 'employe');
    }

    public function scopeManagers($query)
    {
        return $query->where('role', 'manager');
    }

    public function scopeActifs($query)
    {
        return $query->where('is_active', true);
    }

    // Helpers
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isManager(): bool
    {
        return $this->role === 'manager';
    }

    public function isEmploye(): bool
    {
        return $this->role === 'employe';
    }

    public function isRh(): bool
    {
        return $this->role === 'rh';
    }
}

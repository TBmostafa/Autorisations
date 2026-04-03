<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Demande #{{ $demande->id }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 12px; color: #334155; background: #fff; padding: 40px; }
        .header-table { width: 100%; border-bottom: 2px solid #1e4080; padding-bottom: 15px; margin-bottom: 25px; }
        .logo { font-size: 24px; font-weight: 800; color: #1e4080; }
        .title { font-size: 18px; font-weight: 800; color: #1e4080; text-align: right; text-transform: uppercase; }
        .ref { font-size: 10px; color: #64748b; text-align: right; margin-top: 5px; }
        
        .section-title { font-size: 11px; font-weight: 700; color: #1e4080; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 12px; margin-top: 25px; }
        
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .info-table td { padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 12px; }
        .info-table td.label { width: 30%; background-color: #f8fafc; font-weight: 600; color: #475569; }
        
        .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-weight: 700; font-size: 11px; }
        .badge-en_attente_responsable { background: #fef3c7; color: #d97706; }
        .badge-validee_responsable { background: #dbeafe; color: #1e40af; }
        .badge-validee_definitivement { background: #d1fae5; color: #059669; }
        .badge-refusee_responsable, .badge-refusee_rh { background: #fee2e2; color: #dc2626; }
        
        .signature-grid { width: 100%; margin-top: 40px; border-collapse: collapse; }
        .signature-cell { width: 33.33%; padding: 10px; vertical-align: top; text-align: center; }
        .signature-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; min-height: 100px; background: #fff; }
        .sig-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 5px; }
        .sig-img { max-height: 50px; max-width: 100%; display: block; margin: 0 auto; }
        
        .footer { margin-top: 40px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 15px; }
    </style>
</head>
<body>

<table class="header-table">
    <tr>
        <td style="vertical-align: middle;">
            <div class="logo">GA</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Gestion des Autorisations</div>
        </td>
        <td class="title" style="vertical-align: middle;">
            DEMANDE D'AUTORISATION
            <div class="ref">
                Réf : DA-{{ str_pad($demande->id, 5, '0', \STR_PAD_LEFT) }}<br>
                Émise le {{ $demande->created_at->format('d/m/Y à H:i') }}
            </div>
        </td>
    </tr>
</table>

<!-- Statut & Traitement -->
<table style="width: 100%; margin-bottom: 20px;">
    <tr>
        <td>
            @php
                $statuts = [
                    'en_attente_responsable' => 'En attente Manager',
                    'validee_responsable' => 'Validée par Manager',
                    'refusee_responsable' => 'Refusée par Manager',
                    'validee_definitivement' => 'Validée Définitivement',
                    'refusee_rh' => 'Refusée par RH'
                ];
            @endphp
            <div style="font-size: 11px; color: #64748b; margin-bottom: 5px;">État actuel :</div>
            <span class="badge badge-{{ $demande->statut }}">{{ $statuts[$demande->statut] ?? $demande->statut }}</span>
        </td>
        @if($demande->date_traitement)
        <td style="text-align: right; vertical-align: bottom;">
            <div style="font-size: 11px; color: #64748b;">Traitée le :</div>
            <div style="font-weight: 600;">{{ $demande->date_traitement->format('d/m/Y à H:i') }}</div>
        </td>
        @endif
    </tr>
</table>

<!-- Informations Employé -->
<div class="section-title">Informations de l'Employé</div>
<table class="info-table">
    <tr>
        <td class="label">Nom & Prénom</td>
        <td>{{ $demande->employe->name }}</td>
    </tr>
    <tr>
        <td class="label">Département</td>
        <td>{{ $demande->employe->departement->nom ?? '-' }}</td>
    </tr>
    <tr>
        <td class="label">Poste Occupé</td>
        <td>{{ $demande->employe->poste ?? '-' }}</td>
    </tr>
    <tr>
        <td class="label">Contact / Email</td>
        <td>{{ $demande->employe->email }}</td>
    </tr>
</table><br><br>

<!-- Détails de la Demande -->
<div class="section-title">Détails de la Prestation / Demande</div>
<table class="info-table">
    @php
        $types = [
            'conge' => 'Congé',
            'autorisation_absence' => "Autorisation d'Absence",
            'sortie' => 'Autorisation de Sortie',
        ];
    @endphp
    <tr>
        <td class="label">Type d'autorisation</td>
        <td><strong>{{ $types[$demande->type] ?? $demande->type }}</strong></td>
    </tr>
    <tr>
        <td class="label">Période</td>
        <td>
            @if($demande->type === 'sortie')
                Le {{ $demande->date_debut->format('d/m/Y à H:i') }}
            @else
                Du {{ $demande->date_debut->format('d/m/Y') }} au {{ $demande->date_fin ? $demande->date_fin->format('d/m/Y') : '—' }}
            @endif
        </td>
    </tr>
    @if($demande->type !== 'sortie')
    <tr>
        <td class="label">Durée totale</td>
        <td style="font-weight: 700;">{{ $demande->duree }} Jours</td>
    </tr>
    @endif
    <tr>
        <td class="label">Motif invoqué</td>
        <td>{{ $demande->motif }}</td>
    </tr>
</table><br><br><br><br> 

<!-- Signatures Numériques -->
<table class="signature-grid">
    <tr>
        <td class="signature-cell">
            <div class="signature-box">
                <div class="sig-label">Signature Employé</div>
                @if(isset($sig_emp) && $sig_emp)
                    <img src="{!! $sig_emp !!}" class="sig-img" style="width: 150px; height: auto;">
                @else
                    <div style="color: #cbd5e1; padding-top: 20px;">[Non signée]</div>
                @endif
                <div style="font-size: 9px; color: #94a3b8; margin-top: 5px;">{{ $demande->employe->name }}</div>
            </div>
        </td>
        <td class="signature-cell">
            <div class="signature-box">
                <div class="sig-label">Visa Responsable</div>
                @if(isset($sig_man) && $sig_man)
                    <img src="{!! $sig_man !!}" class="sig-img" style="width: 150px; height: auto;">
                @else
                    <div style="color: #cbd5e1; padding-top: 20px;">[En attente]</div>
                @endif
                <div style="font-size: 9px; color: #94a3b8; margin-top: 5px;">{{ $demande->manager->name ?? 'Responsable' }}</div>
            </div>
        </td>
        <td class="signature-cell">
            <div class="signature-box">
                <div class="sig-label">Cachet RH / Direction</div>
                @if(in_array($demande->statut, ['validee_definitivement', 'refusee_rh']))
                    <div style="color: #1e4080; font-weight: 800; border: 2px double #1e4080; padding: 5px; transform: rotate(-5deg); display: inline-block; margin-top: 10px;">
                        {{ $demande->statut === 'validee_definitivement' ? 'APPROUVÉ RH' : 'REFUSÉ RH' }}
                    </div>
                @else
                    <div style="color: #cbd5e1; padding-top: 20px;">[Cachet]</div>
                @endif
            </div>
        </td>
    </tr>
</table><br><br><br>

<div class="footer">
    Document certifié conforme — Généré le {{ now()->format('d/m/Y à H:i') }}<br>
    © {{ date('Y') }} Gestion des Autorisations — Tous droits réservés.
</div>

</body>
</html>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Mise à jour de votre demande</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

    <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
        Mise à jour de votre demande
    </h2>

    <p>Bonjour,</p>

    <p>Le statut de votre demande a été mis à jour.</p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f2f2f2;">
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 40%;">Statut</td>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">{{ $statutLabel }}</td>
        </tr>
        <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Type de demande</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{ $demande->type_libelle }}</td>
        </tr>
        <tr style="background-color: #f2f2f2;">
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Date de début</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{ \Carbon\Carbon::parse($demande->date_debut)->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Date de fin</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{ \Carbon\Carbon::parse($demande->date_fin)->format('d/m/Y') }}</td>
        </tr>
        <tr style="background-color: #f2f2f2;">
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Référence</td>
            <td style="padding: 10px; border: 1px solid #ddd; font-family: monospace;">{{ $reference }}</td>
        </tr>
    </table>

    @if(!empty($demande->commentaire_manager))
    <div style="background-color: #fff8e1; border-left: 4px solid #f39c12; padding: 12px 16px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold; color: #e67e22;">Commentaire du responsable :</p>
        <p style="margin: 8px 0 0 0;">{{ $demande->commentaire_manager }}</p>
    </div>
    @endif

    <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
        Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
    </p>

</body>
</html>

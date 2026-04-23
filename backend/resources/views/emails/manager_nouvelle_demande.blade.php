<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Nouvelle demande à traiter</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

    <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
        Nouvelle demande à traiter
    </h2>

    <p>Bonjour,</p>

    <p>Une nouvelle demande a été soumise et nécessite votre validation.</p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f2f2f2;">
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 40%;">Employé</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{ $demande->employe->name }}</td>
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

    <p>Merci de traiter cette demande dans les meilleurs délais.</p>

    <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
        Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
    </p>

</body>
</html>

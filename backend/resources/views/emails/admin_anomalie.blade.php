<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Anomalie détectée</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

    <h2 style="color: #c0392b; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">
        Anomalie détectée
    </h2>

    <p>Bonjour,</p>

    <p>Une anomalie a été détectée et nécessite votre attention.</p>

    <div style="background-color: #fdecea; border-left: 4px solid #e74c3c; padding: 12px 16px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold; color: #c0392b;">Description de l'anomalie :</p>
        <p style="margin: 8px 0 0 0;">{{ $description }}</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f2f2f2;">
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 40%;">Employé concerné</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{ $demande->employe->name }}</td>
        </tr>
        <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Référence demande</td>
            <td style="padding: 10px; border: 1px solid #ddd; font-family: monospace;">{{ $reference }}</td>
        </tr>
    </table>

    <p>Merci de prendre les mesures nécessaires.</p>

    <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
        Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
    </p>

</body>
</html>

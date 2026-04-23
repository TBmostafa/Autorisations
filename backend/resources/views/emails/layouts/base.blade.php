<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <title>@yield('title', 'Gestion des Autorisations')</title>
    <style>
        body { margin:0; padding:0; background:#f1f5f9; font-family:'Segoe UI',Arial,sans-serif; color:#1e293b; }
        .wrapper { width:100%; background:#f1f5f9; padding:32px 0; }
        .container { max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(15,23,42,0.10); }
        .header { background:linear-gradient(135deg,#1e3a6e 0%,#1e4080 60%,#0f172a 100%); padding:32px 40px; text-align:center; }
        .header-logo { display:inline-block; background:linear-gradient(135deg,#f59e0b,#f97316); border-radius:12px; width:48px; height:48px; line-height:48px; text-align:center; font-weight:900; font-size:18px; color:#fff; margin-bottom:12px; }
        .header-title { color:#ffffff; font-size:22px; font-weight:700; margin:0; letter-spacing:-0.5px; }
        .header-subtitle { color:rgba(255,255,255,0.55); font-size:13px; margin:4px 0 0; }
        .badge-wrapper { padding:24px 40px 0; }
        .badge { display:inline-block; padding:6px 16px; border-radius:99px; font-size:12px; font-weight:700; letter-spacing:0.3px; }
        .body { padding:32px 40px; }
        .greeting { font-size:16px; color:#334155; margin:0 0 16px; }
        .intro { font-size:14px; color:#64748b; line-height:1.7; margin:0 0 24px; }
        .info-table { width:100%; border-collapse:collapse; margin:0 0 24px; border-radius:10px; overflow:hidden; }
        .info-table td { padding:12px 16px; font-size:14px; border-bottom:1px solid #f1f5f9; }
        .info-table tr:last-child td { border-bottom:none; }
        .info-table .label { color:#64748b; font-weight:600; width:42%; background:#f8fafc; }
        .info-table .value { color:#0f172a; font-weight:500; }
        .info-table .value.mono { font-family:monospace; font-size:13px; color:#1e4080; font-weight:700; }
        .comment-box { background:#fffbeb; border-left:4px solid #f59e0b; border-radius:0 8px 8px 0; padding:14px 18px; margin:0 0 24px; }
        .comment-box .comment-label { font-size:12px; font-weight:700; color:#92400e; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 6px; }
        .comment-box .comment-text { font-size:14px; color:#78350f; margin:0; line-height:1.6; }
        .alert-box { border-radius:8px; padding:14px 18px; margin:0 0 24px; }
        .alert-box.danger { background:#fef2f2; border-left:4px solid #ef4444; }
        .alert-box .alert-label { font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 6px; }
        .alert-box.danger .alert-label { color:#b91c1c; }
        .alert-box .alert-text { font-size:14px; margin:0; line-height:1.6; color:#7f1d1d; }
        .cta-wrapper { text-align:center; margin:24px 0; }
        .cta-btn { display:inline-block; padding:13px 32px; border-radius:10px; font-size:14px; font-weight:700; text-decoration:none; color:#fff; background:linear-gradient(135deg,#1e4080,#3b82f6); }
        .divider { border:none; border-top:1px solid #f1f5f9; margin:24px 0; }
        .footer { background:#f8fafc; padding:20px 40px; border-top:1px solid #f1f5f9; text-align:center; }
        .footer p { font-size:11px; color:#94a3b8; margin:4px 0; line-height:1.6; }
        .footer .brand { font-weight:700; color:#64748b; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="container">

        {{-- Header --}}
        <div class="header">
            <div class="header-logo">GA</div>
            <p class="header-title">Gestion des Autorisations</p>
            <p class="header-subtitle">Plateforme de gestion des demandes</p>
        </div>

        {{-- Badge --}}
        @hasSection('badge')
        <div class="badge-wrapper">
            @yield('badge')
        </div>
        @endif

        {{-- Body --}}
        <div class="body">
            @yield('content')
        </div>

        {{-- Footer --}}
        <div class="footer">
            <p class="brand">Gestion des Autorisations</p>
            <p>Cet email a été envoyé automatiquement — merci de ne pas y répondre.</p>
            <p>© {{ date('Y') }} — Tous droits réservés</p>
        </div>

    </div>
</div>
</body>
</html>

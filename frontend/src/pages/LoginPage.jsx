import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Connexion réussie !');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f4ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <style>{`
        @keyframes floatLaptop {
          0%, 100% { transform: translateY(0px) rotateX(8deg) rotateZ(-8deg); }
          50% { transform: translateY(-14px) rotateX(8deg) rotateZ(-8deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-input {
          width: 100%;
          padding: 13px 16px 13px 44px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          background: #f8faff;
          color: #1e293b;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .login-input:focus {
          border-color: #1e4080;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(30,64,128,0.10);
        }
        .login-input::placeholder { color: #a0aec0; }
        .input-wrapper { position: relative; }
        .input-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: #94a3b8; font-size: 16px; pointer-events: none;
        }
        .toggle-pw {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #94a3b8;
          font-size: 16px; padding: 0; line-height: 1;
        }
        .toggle-pw:hover { color: #1e4080; }
        .login-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.3px;
          box-shadow: 0 6px 20px rgba(245,158,11,0.38);
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .login-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(245,158,11,0.45); }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .card-anim { animation: fadeUp 0.5s ease both; }
        .layer-card {
          position: absolute;
          border-radius: 14px;
          box-shadow: 0 12px 40px rgba(30,64,128,0.18);
        }
      `}</style>

      {/* Main card */}
      <div style={{
        width: '100%',
        maxWidth: '940px',
        background: '#fff',
        borderRadius: '28px',
        boxShadow: '0 24px 80px rgba(15,23,42,0.13)',
        display: 'flex',
        overflow: 'hidden',
        minHeight: '540px',
        animation: 'fadeUp 0.5s ease both',
      }}>

        {/* ── LEFT: Form panel ── */}
        <div style={{
          flex: '0 0 420px',
          padding: '52px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #f59e0b, #f97316)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 14, color: '#fff',
              boxShadow: '0 4px 12px rgba(245,158,11,0.35)',
              letterSpacing: '-0.5px',
            }}>GA</div>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', letterSpacing: '-0.3px' }}>
              Gestion des Autorisations
            </span>
          </div>

          <h1 style={{
            fontSize: 26, fontWeight: 800, color: '#0f172a',
            letterSpacing: '-0.8px', marginBottom: 6, lineHeight: 1.2,
          }}>
            Bienvenue 👋
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 13.5, marginBottom: 32 }}>
            Connectez-vous en saisissant vos informations ci-dessous
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 7, letterSpacing: '0.3px' }}>
                ADRESSE EMAIL
              </label>
              <div className="input-wrapper">
                <span className="input-icon">✉</span>
                <input
                  className="login-input"
                  type="email"
                  placeholder="votre@email.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 7, letterSpacing: '0.3px' }}>
                MOT DE PASSE
              </label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  className="login-input"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

         

            {error && (
              <div style={{
                background: '#fff1f1', color: '#dc2626',
                padding: '10px 14px', borderRadius: 10,
                fontSize: 13, fontWeight: 500, border: '1px solid #fecaca'
              }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading} style={{ marginTop: 6 }}>
              {loading ? <><span className="spinner" /> Connexion...</> : 'Se connecter'}
            </button>
          </form>
        </div>

        {/* ── RIGHT: Illustration panel ── */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(135deg, #1e3a6e 0%, #1e4080 40%, #0f172a 100%)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Decorative circles */}
          <div style={{ position:'absolute', top:'-60px', right:'-60px', width:300, height:300, borderRadius:'50%', background:'rgba(245,158,11,0.08)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'-80px', left:'-40px', width:280, height:280, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', top:'30%', left:'-30px', width:180, height:180, borderRadius:'50%', background:'rgba(245,158,11,0.05)', pointerEvents:'none' }} />

          {/* Floating layered laptop illustration */}
          <div style={{
            position: 'relative',
            width: 320,
            height: 240,
            animation: 'floatLaptop 4s ease-in-out infinite',
            transformStyle: 'preserve-3d',
            perspective: '800px',
          }}>

            {/* Layer cards behind laptop */}
            <div className="layer-card" style={{
              width: 220, height: 140,
              background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
              bottom: -10, left: 40,
              transform: 'rotate(-4deg) translateY(12px)',
              opacity: 0.85,
            }} />
            <div className="layer-card" style={{
              width: 200, height: 130,
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              bottom: -18, left: 50,
              transform: 'rotate(-4deg) translateY(24px)',
              opacity: 0.7,
            }} />
            <div className="layer-card" style={{
              width: 185, height: 118,
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              bottom: -24, left: 58,
              transform: 'rotate(-4deg) translateY(36px)',
              opacity: 0.55,
            }} />

            {/* Laptop body */}
            <div style={{
              position: 'absolute',
              bottom: 20, left: 0,
              width: 280, height: 175,
              background: 'linear-gradient(160deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)',
              borderRadius: 18,
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.22)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              top,
            }}>
              {/* Screen content */}
              <div style={{ width: '80%', display: 'flex', flexDirection: 'column', gap: 8, padding: 16 }}>
                <div style={{ height: 8, borderRadius: 4, background: 'rgba(245,158,11,0.7)', width: '60%' }} />
                <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.25)', width: '90%' }} />
                <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.18)', width: '75%' }} />
                <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.18)', width: '82%' }} />
                <div style={{ marginTop: 8, height: 24, borderRadius: 8, background: 'linear-gradient(135deg, #f59e0b, #f97316)', width: '50%', boxShadow: '0 4px 12px rgba(245,158,11,0.4)' }} />
              </div>
            </div>
          </div>

          {/* Bottom text */}
          <div style={{
            position: 'absolute', bottom: 36, left: 0, right: 0, textAlign: 'center'
          }}>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, letterSpacing: '1px', textTransform: 'uppercase' }}>
              Système sécurisé · Accès autorisé uniquement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
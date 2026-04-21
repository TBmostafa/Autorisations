import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useEffect } from 'react';

const features = [
  {
    icon: '📝',
    title: 'Soumission simplifiée',
    desc: 'Créez vos demandes de congé, d\'absence ou de sortie en quelques clics depuis n\'importe quel appareil.',
    color: '#3b82f6',
    bg: '#eff6ff',
  },
  {
    icon: '⚡',
    title: 'Validation rapide',
    desc: 'Circuit de validation en deux étapes : responsable puis RH. Chaque acteur est notifié en temps réel.',
    color: '#f59e0b',
    bg: '#fffbeb',
  },
  {
    icon: '📧',
    title: 'Notifications email',
    desc: 'Emails automatiques à chaque étape du processus. Plus besoin de relancer manuellement.',
    color: '#10b981',
    bg: '#ecfdf5',
  },
  {
    icon: '📊',
    title: 'Tableau de bord',
    desc: 'Visualisez les statistiques, suivez l\'état de vos demandes et gérez votre équipe en un coup d\'œil.',
    color: '#8b5cf6',
    bg: '#f5f3ff',
  },
  {
    icon: '🔔',
    title: 'Notifications in-app',
    desc: 'Centre de notifications intégré pour ne manquer aucune mise à jour importante sur vos demandes.',
    color: '#ef4444',
    bg: '#fef2f2',
  },
  {
    icon: '📄',
    title: 'Export PDF',
    desc: 'Générez et téléchargez vos demandes validées en PDF avec signatures numériques intégrées.',
    color: '#0ea5e9',
    bg: '#f0f9ff',
  },
];

const steps = [
  { num: '01', title: 'L\'employé soumet', desc: 'Il crée sa demande avec type, dates et motif.' },
  { num: '02', title: 'Le manager valide', desc: 'Il reçoit un email et traite la demande.' },
  { num: '03', title: 'Le RH confirme', desc: 'Validation définitive ou refus motivé.' },
  { num: '04', title: 'L\'employé est notifié', desc: 'Email + notification in-app instantanés.' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#0f172a', overflowX: 'hidden' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(245,158,11,0.12); color: #b45309;
          border: 1px solid rgba(245,158,11,0.3);
          padding: 6px 16px; border-radius: 99px;
          font-size: 13px; font-weight: 600; margin-bottom: 24px;
          animation: fadeUp 0.5s ease both;
        }
        .hero-title {
          font-size: clamp(36px, 5vw, 62px);
          font-weight: 900; line-height: 1.1;
          letter-spacing: -2px; color: #0f172a;
          animation: fadeUp 0.5s 0.1s ease both; opacity: 0;
        }
        .hero-title span {
          background: linear-gradient(135deg, #1e4080, #3b82f6, #f59e0b);
          background-size: 200% 200%;
          animation: gradientShift 4s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          font-size: 18px; color: #64748b; line-height: 1.7; max-width: 560px;
          animation: fadeUp 0.5s 0.2s ease both; opacity: 0;
        }
        .hero-btns {
          display: flex; gap: 14px; flex-wrap: wrap;
          animation: fadeUp 0.5s 0.3s ease both; opacity: 0;
        }
        .btn-primary-hero {
          padding: 15px 32px; border-radius: 14px; border: none;
          background: linear-gradient(135deg, #1e4080, #2e5fa3);
          color: #fff; font-size: 15px; font-weight: 700; cursor: pointer;
          box-shadow: 0 8px 24px rgba(30,64,128,0.3);
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex; align-items: center; gap: 8px;
        }
        .btn-primary-hero:hover { transform: translateY(-3px); box-shadow: 0 14px 32px rgba(30,64,128,0.38); }
        .btn-outline-hero {
          padding: 15px 32px; border-radius: 14px;
          border: 2px solid #e2e8f0; background: #fff;
          color: #334155; font-size: 15px; font-weight: 700; cursor: pointer;
          transition: border-color 0.2s, transform 0.2s;
          display: flex; align-items: center; gap: 8px;
        }
        .btn-outline-hero:hover { border-color: #1e4080; color: #1e4080; transform: translateY(-3px); }
        .feature-card {
          background: #fff; border-radius: 20px;
          border: 1px solid #f1f5f9;
          padding: 28px; transition: transform 0.25s, box-shadow 0.25s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
        }
        .feature-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(0,0,0,0.1); }
        .step-card {
          background: #fff; border-radius: 20px; padding: 28px 24px;
          border: 1px solid #f1f5f9; position: relative; overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .step-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }
        .nav-link {
          color: #64748b; font-size: 14px; font-weight: 500;
          text-decoration: none; transition: color 0.2s;
        }
        .nav-link:hover { color: #1e4080; }
        .stat-item { text-align: center; }
        .stat-num {
          font-size: 40px; font-weight: 900; letter-spacing: -2px;
          background: linear-gradient(135deg, #1e4080, #3b82f6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .floating-card {
          background: #fff; border-radius: 16px; padding: 16px 20px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.12);
          border: 1px solid #f1f5f9;
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f1f5f9',
        padding: '0 clamp(20px, 5vw, 80px)',
        height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #f59e0b, #f97316)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 13, color: '#fff',
            boxShadow: '0 4px 12px rgba(245,158,11,0.35)',
          }}>GA</div>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', letterSpacing: '-0.3px' }}>
            Gestion des Autorisations
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <a href="#features" className="nav-link">Fonctionnalités</a>
          <a href="#how" className="nav-link">Comment ça marche</a>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary-hero"
            style={{ padding: '10px 22px', fontSize: 14, borderRadius: 10 }}
          >
            Se connecter
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(160deg, #f8faff 0%, #eef2ff 50%, #fefce8 100%)',
        padding: 'clamp(60px, 10vw, 120px) clamp(20px, 5vw, 80px)',
        display: 'flex', alignItems: 'center', gap: 60,
        flexWrap: 'wrap', minHeight: '88vh',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background blobs */}
        <div style={{ position:'absolute', top:'-100px', right:'-100px', width:500, height:500, borderRadius:'50%', background:'rgba(59,130,246,0.06)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-80px', left:'-60px', width:400, height:400, borderRadius:'50%', background:'rgba(245,158,11,0.06)', pointerEvents:'none' }} />

        {/* Left */}
        <div style={{ flex: '1 1 480px', maxWidth: 620, position: 'relative', zIndex: 1 }}>
         
          <h1 className="hero-title">
            Gérez vos demandes<br />
            <span>d'autorisation</span><br />
            sans effort
          </h1>
          <p className="hero-sub" style={{ marginTop: 20, marginBottom: 36 }}>
            Une plateforme moderne pour soumettre, valider et suivre toutes vos demandes de congé, d'absence et de sortie — avec notifications email automatiques.
          </p>
          <div className="hero-btns">
            <button className="btn-primary-hero" onClick={() => navigate('/login')}>
              Accéder à la plateforme <span>→</span>
            </button>
            <a href="#features" className="btn-outline-hero">
              Découvrir les fonctionnalités
            </a>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 40, marginTop: 52, flexWrap: 'wrap', animation: 'fadeUp 0.5s 0.4s ease both', opacity: 0 }}>
            {[['4 rôles', 'Employé, Manager, RH, Admin'], ['2 étapes', 'Validation structurée'], ['100%', 'Notifications automatiques']].map(([num, label]) => (
              <div key={num} className="stat-item">
                <div className="stat-num">{num}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — illustration */}
        <div style={{ flex: '1 1 340px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'relative', width: 340, height: 340 }}>
            {/* Main card */}
            <div style={{
              background: 'linear-gradient(135deg, #1e3a6e, #1e4080)',
              borderRadius: 28, padding: 32, color: '#fff',
              boxShadow: '0 32px 80px rgba(30,64,128,0.35)',
              animation: 'float 4s ease-in-out infinite',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📋</div>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Nouvelle demande</span>
              </div>
              {[['Type', 'Congé annuel'], ['Début', '15 mai 2025'], ['Fin', '22 mai 2025'], ['Statut', '✅ Validée']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 13 }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>{k}</span>
                  <span style={{ fontWeight: 600, color: k === 'Statut' ? '#4ade80' : '#fff' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Floating notification */}
            <div className="floating-card" style={{
              position: 'absolute', bottom: -20, right: -30,
              animationDelay: '1s', minWidth: 200,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📧</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Email envoyé</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Manager notifié</div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="floating-card" style={{
              position: 'absolute', top: -16, left: -24,
              animationDelay: '2s', padding: '10px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>🔔</span>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>3 notifications</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 80px)', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-block', background: '#eff6ff', color: '#1e40af', padding: '6px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            Fonctionnalités
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 14 }}>
            Tout ce dont vous avez besoin
          </h2>
          <p style={{ color: '#64748b', fontSize: 17, maxWidth: 520, margin: '0 auto' }}>
            Une solution complète pour digitaliser et automatiser la gestion des autorisations dans votre organisation.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div style={{ width: 52, height: 52, borderRadius: 14, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 18 }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8, color: '#0f172a' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 80px)', background: '#fff' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-block', background: '#fef3c7', color: '#92400e', padding: '6px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            Comment ça marche
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 14 }}>
            Un processus clair en 4 étapes
          </h2>
          <p style={{ color: '#64748b', fontSize: 17, maxWidth: 480, margin: '0 auto' }}>
            Du dépôt de la demande à la notification finale, chaque étape est automatisée.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, maxWidth: 1000, margin: '0 auto' }}>
          {steps.map((s, i) => (
            <div key={s.num} className="step-card">
              <div style={{
                position: 'absolute', top: -10, right: 16,
                fontSize: 64, fontWeight: 900, color: '#f1f5f9',
                lineHeight: 1, userSelect: 'none',
              }}>{s.num}</div>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'linear-gradient(135deg, #1e4080, #3b82f6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 900, fontSize: 16, marginBottom: 16,
              }}>{i + 1}</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, color: '#0f172a' }}>{s.title}</h3>
              <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 80px)',
        background: 'linear-gradient(135deg, #1e3a6e 0%, #1e4080 50%, #0f172a 100%)',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:'-80px', right:'-80px', width:400, height:400, borderRadius:'50%', background:'rgba(245,158,11,0.08)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-60px', left:'-60px', width:300, height:300, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', marginBottom: 16 }}>
            Prêt à simplifier votre gestion RH ?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 17, marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
            Accédez à la plateforme et commencez à gérer vos demandes dès maintenant.
          </p>
          <button
            className="btn-primary-hero"
            onClick={() => navigate('/login')}
            style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', boxShadow: '0 8px 28px rgba(245,158,11,0.4)', fontSize: 16, padding: '16px 40px' }}
          >
            Accéder à la plateforme →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0f172a', padding: '32px clamp(20px, 5vw, 80px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #f59e0b, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11, color: '#fff' }}>GA</div>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Gestion des Autorisations</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
          © {new Date().getFullYear()} — Tous droits réservés
        </p>
      </footer>
    </div>
  );
}

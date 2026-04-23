import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useEffect } from 'react';

const O = '#f97316'; // orange primary
const OD = '#ea580c'; // orange dark
const OL = '#fff7ed'; // orange light bg

const features = [
  { icon: '📝', title: 'Soumission simplifiée', desc: "Créez vos demandes de congé, d'absence ou de sortie en quelques clics.", accent: O },
  { icon: '⚡', title: 'Validation rapide', desc: 'Circuit en deux étapes : responsable puis RH. Chaque acteur notifié en temps réel.', accent: '#111827' },
  { icon: '📧', title: 'Notifications email', desc: 'Emails automatiques à chaque étape. Plus besoin de relancer manuellement.', accent: O },
  { icon: '📊', title: 'Tableau de bord', desc: "Visualisez les stats, suivez l'état de vos demandes et gérez votre équipe.", accent: '#111827' },
  { icon: '🔔', title: 'Notifications in-app', desc: 'Centre de notifications intégré pour ne manquer aucune mise à jour.', accent: O },
  { icon: '📄', title: 'Export PDF', desc: 'Générez vos demandes validées en PDF avec signatures numériques.', accent: '#111827' },
];

const steps = [
  { icon: '✍️', title: 'Soumission', desc: "L'employé crée sa demande avec type, dates et motif en quelques clics." },
  { icon: '👔', title: 'Validation Manager', desc: 'Le responsable reçoit un email et approuve ou refuse la demande.' },
  { icon: '🏢', title: 'Confirmation RH', desc: 'Le service RH effectue la validation définitive ou motive le refus.' },
  { icon: '✅', title: 'Notification finale', desc: "L'employé est notifié par email et in-app instantanément." },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", color: '#111827', overflowX: 'hidden', background: '#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}

        .nav-link{color:#6b7280;font-size:14px;font-weight:500;text-decoration:none;transition:color .2s;}
        .nav-link:hover{color:${O};}

        .btn-orange{
          padding:14px 32px;border-radius:12px;border:none;
          background:${O};color:#fff;font-size:15px;font-weight:800;cursor:pointer;
          font-family:inherit;transition:all .22s;
          box-shadow:0 8px 24px rgba(249,115,22,.35);
          display:inline-flex;align-items:center;gap:8px;
        }
        .btn-orange:hover{background:${OD};transform:translateY(-3px);box-shadow:0 16px 36px rgba(249,115,22,.42);}

        .btn-outline{
          padding:14px 28px;border-radius:12px;
          border:2px solid #e5e7eb;background:transparent;
          color:#374151;font-size:15px;font-weight:700;cursor:pointer;
          font-family:inherit;transition:all .2s;
          display:inline-flex;align-items:center;gap:8px;
        }
        .btn-outline:hover{border-color:${O};color:${O};background:${OL};transform:translateY(-2px);}

        .feature-card{
          background:#fff;border-radius:18px;padding:28px 24px;
          border:1.5px solid #f3f4f6;
          transition:all .3s ease;box-shadow:0 2px 8px rgba(0,0,0,.04);
        }
        .feature-card:hover{border-color:#fed7aa;box-shadow:0 16px 40px rgba(249,115,22,.1);transform:translateY(-6px);}

        .step-card{
          background:#fff;border-radius:20px;padding:32px 24px;
          border:1.5px solid #f3f4f6;box-shadow:0 2px 12px rgba(0,0,0,.04);
          transition:all .25s;text-align:center;
        }
        .step-card:hover{transform:translateY(-6px);box-shadow:0 20px 48px rgba(0,0,0,.08);border-color:#fed7aa;}

        .badge{
          display:inline-flex;align-items:center;gap:6px;
          padding:6px 14px;border-radius:99px;
          font-size:12px;font-weight:700;letter-spacing:.4px;
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position:'sticky',top:0,zIndex:100,
        background:'rgba(255,255,255,.96)',backdropFilter:'blur(16px)',
        borderBottom:'1px solid #f3f4f6',
        padding:'0 clamp(20px,6vw,100px)',
        height:68,display:'flex',alignItems:'center',justifyContent:'space-between',
      }}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{
            width:36,height:36,borderRadius:10,
            background:`linear-gradient(135deg,${O},${OD})`,
            display:'flex',alignItems:'center',justifyContent:'center',
            fontWeight:900,fontSize:12,color:'#fff',
            boxShadow:`0 4px 12px rgba(249,115,22,.35)`,
          }}>GA</div>
          <span style={{fontWeight:800,fontSize:16,color:'#111827',letterSpacing:'-.5px'}}>AutorisationsPro</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:32}}>
          <a href="#features" className="nav-link">Fonctionnalités</a>
          <a href="#how" className="nav-link">Processus</a>
          <button onClick={() => navigate('/login')} className="btn-orange" style={{padding:'10px 22px',fontSize:14,borderRadius:10}}>
            Se connecter →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight:'90vh',
        display:'grid',gridTemplateColumns:'1fr 1fr',
        alignItems:'center',
        padding:'80px clamp(20px,6vw,100px)',
        gap:60,background:'#fff',
        position:'relative',overflow:'hidden',
      }}>
        {/* Orange diagonal bg right */}
        <div style={{
          position:'absolute',top:0,right:0,
          width:'50%',height:'100%',
          background:`linear-gradient(160deg,${OL} 0%,#ffedd5 100%)`,
          zIndex:0,
          clipPath:'polygon(10% 0,100% 0,100% 100%,0% 100%)',
        }}/>

        {/* LEFT */}
        <div style={{position:'relative',zIndex:1}}>
          <div className="badge" style={{background:'#ffedd5',color:'#9a3412',marginBottom:28,animation:'fadeUp .5s ease both'}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:O,display:'inline-block',boxShadow:`0 0 0 3px rgba(249,115,22,.2)`}}/>
            Plateforme RH digitale
          </div>

          <h1 style={{
            fontSize:'clamp(38px,4.5vw,62px)',
            fontWeight:900,lineHeight:1.1,letterSpacing:'-2.5px',color:'#111827',
            animation:'fadeUp .5s .1s ease both',opacity:0,marginBottom:24,
          }}>
            Gérez vos<br/>
            <span style={{color:O,position:'relative',display:'inline-block'}}>
              autorisations
              <svg style={{position:'absolute',bottom:-6,left:0,width:'100%'}} height="8" viewBox="0 0 200 8" preserveAspectRatio="none">
                <path d="M0,6 Q50,0 100,5 Q150,10 200,4" stroke={O} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </span>
            <br/>sans effort
          </h1>

          <p style={{
            fontSize:17,color:'#6b7280',lineHeight:1.75,maxWidth:500,
            marginBottom:40,animation:'fadeUp .5s .2s ease both',opacity:0,
          }}>
            Soumettez, validez et suivez toutes vos demandes de congé, d'absence et de sortie — circuit de validation automatisé et notifications en temps réel.
          </p>

          <div style={{display:'flex',gap:14,flexWrap:'wrap',animation:'fadeUp .5s .3s ease both',opacity:0}}>
            <button className="btn-orange" onClick={() => navigate('/login')}>
              Accéder à la plateforme <span style={{fontSize:18}}>→</span>
            </button>
            <a href="#features" className="btn-outline">En savoir plus</a>
          </div>

          <div style={{display:'flex',gap:28,marginTop:52,flexWrap:'wrap',animation:'fadeUp .5s .45s ease both',opacity:0}}>
            {[{icon:'🔒',text:'Sécurisé'},{icon:'⚡',text:'Temps réel'},{icon:'📱',text:'Responsive'}].map(({icon,text})=>(
              <div key={text} style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:16}}>{icon}</span>
                <span style={{fontSize:13,fontWeight:600,color:'#6b7280'}}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Employee Dashboard Mockup */}
        <div style={{position:'relative',zIndex:1,display:'flex',justifyContent:'center',alignItems:'center',animation:'fadeUp .6s .35s ease both',opacity:0}}>
          <div style={{
            width:'100%',maxWidth:460,
            background:'#fff',borderRadius:24,
            boxShadow:'0 32px 80px rgba(0,0,0,.14),0 0 0 1px rgba(0,0,0,.05)',
            overflow:'hidden',fontFamily:'inherit',
          }}>
            {/* Browser bar */}
            <div style={{background:'#f9fafb',borderBottom:'1px solid #f3f4f6',padding:'11px 16px',display:'flex',alignItems:'center',gap:7}}>
              <div style={{width:11,height:11,borderRadius:'50%',background:'#fca5a5'}}/>
              <div style={{width:11,height:11,borderRadius:'50%',background:'#fde68a'}}/>
              <div style={{width:11,height:11,borderRadius:'50%',background:'#6ee7b7'}}/>
              <div style={{flex:1,background:'#f3f4f6',borderRadius:6,height:20,marginLeft:10,display:'flex',alignItems:'center',paddingLeft:10}}>
                <span style={{fontSize:10,color:'#9ca3af'}}>autorisations.app/mes-demandes</span>
              </div>
            </div>

            {/* App shell */}
            <div style={{display:'flex',height:370}}>
              {/* Sidebar */}
              <div style={{width:54,background:'#111827',display:'flex',flexDirection:'column',alignItems:'center',paddingTop:14,gap:4}}>
                <div style={{
                  width:32,height:32,borderRadius:9,
                  background:`linear-gradient(135deg,${O},${OD})`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:12,fontWeight:900,color:'#fff',marginBottom:14,
                  boxShadow:`0 4px 10px rgba(249,115,22,.4)`,
                }}>GA</div>
                {[
                  {icon:'🏠',active:false},
                  {icon:'📋',active:true},
                  {icon:'�',active:false},
                  {icon:'�',active:false},
                ].map(({icon,active},i)=>(
                  <div key={i} style={{
                    width:36,height:36,borderRadius:10,
                    background:active?`rgba(249,115,22,.2)`:'transparent',
                    border:active?`1.5px solid rgba(249,115,22,.4)`:'1.5px solid transparent',
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,
                  }}>{icon}</div>
                ))}
              </div>

              {/* Content */}
              <div style={{flex:1,padding:'16px 18px',background:'#f9fafb',overflowY:'auto'}}>
                {/* Header */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:800,color:'#111827'}}>Mes demandes</div>
                    <div style={{fontSize:10,color:'#9ca3af'}}>Bonjour, Mohamed 👋</div>
                  </div>
                  <div style={{display:'flex',gap:7,alignItems:'center'}}>
                    <div style={{position:'relative'}}>
                      <div style={{width:28,height:28,borderRadius:'50%',background:'#fff',border:'1px solid #f3f4f6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>🔔</div>
                      <div style={{position:'absolute',top:-2,right:-2,width:8,height:8,borderRadius:'50%',background:O,border:'1.5px solid #f9fafb'}}/>
                    </div>
                    <div style={{width:28,height:28,borderRadius:'50%',background:`linear-gradient(135deg,${O},${OD})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,color:'#fff'}}>M</div>
                  </div>
                </div>

                {/* KPIs */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:14}}>
                  {[
                    {val:'5',label:'Total',color:O,bar:'60%'},
                    {val:'2',label:'En attente',color:'#f59e0b',bar:'40%'},
                    {val:'3',label:'Validées',color:'#22c55e',bar:'60%'},
                  ].map(({val,label,color,bar})=>(
                    <div key={label} style={{background:'#fff',borderRadius:10,padding:'10px 8px',border:'1px solid #f3f4f6',boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
                      <div style={{fontSize:20,fontWeight:900,color,letterSpacing:'-1px'}}>{val}</div>
                      <div style={{fontSize:9,color:'#9ca3af',fontWeight:600,marginTop:1}}>{label}</div>
                      <div style={{marginTop:5,height:3,borderRadius:99,background:'#f3f4f6'}}>
                        <div style={{height:'100%',width:bar,background:color,borderRadius:99}}/>
                      </div>
                    </div>
                  ))}
                </div>

                {/* New request button */}
                <button style={{
                  width:'100%',padding:'9px',borderRadius:10,border:'none',
                  background:`linear-gradient(135deg,${O},${OD})`,
                  color:'#fff',fontSize:11,fontWeight:800,cursor:'pointer',
                  marginBottom:12,fontFamily:'inherit',
                  boxShadow:`0 4px 12px rgba(249,115,22,.3)`,
                  display:'flex',alignItems:'center',justifyContent:'center',gap:6,
                }}>
                  + Nouvelle demande
                </button>

                {/* Demandes list */}
                <div style={{background:'#fff',borderRadius:12,border:'1px solid #f3f4f6',overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
                  <div style={{padding:'10px 12px',borderBottom:'1px solid #f9fafb',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:11,fontWeight:800,color:'#111827'}}>Récentes</span>
                    <span style={{fontSize:9,color:O,fontWeight:700}}>Voir tout →</span>
                  </div>
                  {[
                    {type:'Congé annuel',dates:'15–22 mai',status:'Validée',sc:'#16a34a',sb:'#dcfce7'},
                    {type:'Absence médicale',dates:'2–3 juin',status:'En attente',sc:'#d97706',sb:'#fef3c7'},
                    {type:'Sortie terrain',dates:'10 juin',status:'Refusée',sc:'#dc2626',sb:'#fee2e2'},
                  ].map(({type,dates,status,sc,sb})=>(
                    <div key={type} style={{display:'flex',alignItems:'center',padding:'9px 12px',borderBottom:'1px solid #f9fafb',gap:9}}>
                      <div style={{width:26,height:26,borderRadius:7,background:'#fff7ed',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0}}>📋</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:10,fontWeight:700,color:'#374151'}}>{type}</div>
                        <div style={{fontSize:9,color:'#9ca3af'}}>{dates}</div>
                      </div>
                      <div style={{background:sb,color:sc,padding:'3px 8px',borderRadius:99,fontSize:9,fontWeight:700}}>{status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section style={{background:'#111827',padding:'48px clamp(20px,6vw,100px)'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:24,maxWidth:900,margin:'0 auto',textAlign:'center'}}>
          {[
            {val:'4',label:'Rôles utilisateurs',sub:'Employé · Manager · RH · Admin'},
            {val:'2',label:'Étapes de validation',sub:'Manager puis RH'},
            {val:'100%',label:'Automatisé',sub:'Notifications & emails'},
            {val:'PDF',label:'Export intégré',sub:'Avec signatures numériques'},
          ].map(({val,label,sub})=>(
            <div key={label}>
              <div style={{fontSize:36,fontWeight:900,color:O,letterSpacing:'-1.5px'}}>{val}</div>
              <div style={{fontSize:14,fontWeight:700,color:'rgba(255,255,255,.9)',marginTop:4}}>{label}</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.4)',marginTop:2}}>{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{padding:'clamp(80px,10vw,120px) clamp(20px,6vw,100px)',background:'#fafafa'}}>
        <div style={{textAlign:'center',marginBottom:64}}>
          <div className="badge" style={{background:'#ffedd5',color:'#9a3412',marginBottom:20}}>✦ Fonctionnalités</div>
          <h2 style={{fontSize:'clamp(28px,4vw,46px)',fontWeight:900,letterSpacing:'-2px',marginBottom:16,color:'#111827'}}>
            Tout ce dont vous avez besoin
          </h2>
          <p style={{color:'#6b7280',fontSize:17,maxWidth:500,margin:'0 auto',lineHeight:1.7}}>
            Une solution complète pour digitaliser et automatiser la gestion des autorisations.
          </p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))',gap:20,maxWidth:1100,margin:'0 auto'}}>
          {features.map((f)=>(
            <div key={f.title} className="feature-card">
              <div style={{fontSize:28,marginBottom:18}}>{f.icon}</div>
              <h3 style={{fontSize:16,fontWeight:800,marginBottom:10,color:'#111827'}}>{f.title}</h3>
              <p style={{fontSize:14,color:'#6b7280',lineHeight:1.7}}>{f.desc}</p>
              <div style={{marginTop:20,height:3,width:36,borderRadius:99,background:f.accent}}/>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{padding:'clamp(80px,10vw,120px) clamp(20px,6vw,100px)',background:'#fff'}}>
        <div style={{textAlign:'center',marginBottom:64}}>
          <div className="badge" style={{background:'#ffedd5',color:'#9a3412',marginBottom:20}}>⚙ Comment ça marche</div>
          <h2 style={{fontSize:'clamp(28px,4vw,46px)',fontWeight:900,letterSpacing:'-2px',marginBottom:16,color:'#111827'}}>
            Un processus en 4 étapes
          </h2>
          <p style={{color:'#6b7280',fontSize:17,maxWidth:460,margin:'0 auto',lineHeight:1.7}}>
            Du dépôt à la notification finale, chaque étape est automatisée.
          </p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:20,maxWidth:1000,margin:'0 auto'}}>
          {steps.map((s,i)=>(
            <div key={s.title} className="step-card">
              <div style={{
                width:60,height:60,borderRadius:18,margin:'0 auto 20px',
                background: i%2===0 ? '#fff7ed' : '#111827',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:28,border:`2px solid ${i%2===0?'#fed7aa':'#1f2937'}`,
              }}>{s.icon}</div>
              <div style={{fontSize:11,fontWeight:800,color:O,background:'#fff7ed',padding:'3px 12px',borderRadius:99,display:'inline-block',marginBottom:12,letterSpacing:'.5px'}}>
                ÉTAPE {i+1}
              </div>
              <h3 style={{fontSize:16,fontWeight:800,color:'#111827',marginBottom:10}}>{s.title}</h3>
              <p style={{fontSize:13.5,color:'#6b7280',lineHeight:1.65}}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding:'clamp(80px,10vw,120px) clamp(20px,6vw,100px)',
        background:'linear-gradient(135deg,#111827 0%,#1f2937 100%)',
        textAlign:'center',position:'relative',overflow:'hidden',
      }}>
        <div style={{position:'absolute',top:'-80px',right:'-80px',width:400,height:400,borderRadius:'50%',background:`rgba(249,115,22,.07)`,pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:'-60px',left:'-60px',width:350,height:350,borderRadius:'50%',background:`rgba(249,115,22,.04)`,pointerEvents:'none'}}/>
        <div style={{position:'relative',zIndex:1,maxWidth:580,margin:'0 auto'}}>
          <div className="badge" style={{background:'rgba(249,115,22,.15)',color:'#fdba74',marginBottom:24}}>
            🚀 Prêt à démarrer ?
          </div>
          <h2 style={{fontSize:'clamp(28px,4vw,50px)',fontWeight:900,color:'#fff',letterSpacing:'-2px',marginBottom:18,lineHeight:1.1}}>
            Simplifiez votre gestion<br/>RH dès aujourd'hui
          </h2>
          <p style={{color:'rgba(255,255,255,.5)',fontSize:17,marginBottom:40,lineHeight:1.7}}>
            Accédez à la plateforme et commencez à gérer vos demandes en quelques minutes.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="btn-orange"
            style={{fontSize:16,padding:'18px 48px',borderRadius:14}}
          >
            Accéder à la plateforme →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background:'#0f172a',padding:'28px clamp(20px,6vw,100px)',
        display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16,
      }}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:32,height:32,borderRadius:9,background:`linear-gradient(135deg,${O},${OD})`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:11,color:'#fff'}}>GA</div>
          <span style={{color:'rgba(255,255,255,.4)',fontSize:13,fontWeight:500}}>AutorisationsPro</span>
        </div>
        <p style={{color:'rgba(255,255,255,.25)',fontSize:12}}>© {new Date().getFullYear()} — Tous droits réservés</p>
      </footer>
    </div>
  );
}

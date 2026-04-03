import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authService } from '../services/api.js';
import toast from 'react-hot-toast';
import { User, Lock, Save, Mail, Phone, Building2, Briefcase } from 'lucide-react';

export default function Profil() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState('info');
  const [form, setForm] = useState({
    name: user?.name || '',
    telephone: user?.telephone || '',
  });
  const [pwForm, setPwForm] = useState({ current_password:'', new_password:'', new_password_confirmation:'' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const ROLE_LABELS = { admin:'Administrateur', manager:'Manager', employe:'Employé' };
  const ROLE_COLORS = { admin:'#7c3aed', manager:'#0284c7', employe:'#059669' };
  const roleColor = ROLE_COLORS[user?.role] || '#1e4080';

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authService.updateProfile(form);
      await refreshUser();
      toast.success('Profil mis à jour !');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally { setSaving(false); }
  };

  const handleSavePw = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.new_password_confirmation) {
      toast.error('Les mots de passe ne correspondent pas.'); return;
    }
    setSavingPw(true);
    try {
      await authService.updateProfile(pwForm);
      toast.success('Mot de passe modifié !');
      setPwForm({ current_password:'', new_password:'', new_password_confirmation:'' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally { setSavingPw(false); }
  };

  return (
    <div className="fade-in" style={{maxWidth:600}}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mon Profil</h1>
          <p className="page-subtitle">Gérez vos informations personnelles</p>
        </div>
      </div>

      {/* Profile header card */}
      <div className="card" style={{padding:'24px',marginBottom:20,display:'flex',alignItems:'center',gap:20}}>
        <div style={{
          width:72,height:72,borderRadius:20,flexShrink:0,
          background:`linear-gradient(135deg, ${roleColor}33, ${roleColor}66)`,
          border:`2px solid ${roleColor}44`,
          display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:28,fontWeight:900,color:roleColor,
        }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:20,fontWeight:800,color:'var(--gray-900)'}}>{user?.name}</div>
          <div style={{fontSize:13,color:'var(--gray-500)',marginTop:2}}>{user?.email}</div>
          <div style={{marginTop:8,display:'flex',gap:8,flexWrap:'wrap'}}>
            <span style={{
              background:`${roleColor}18`,color:roleColor,
              padding:'3px 10px',borderRadius:99,fontSize:12,fontWeight:700,
            }}>
              {ROLE_LABELS[user?.role]}
            </span>
            {user?.departement && (
              <span style={{background:'var(--gray-100)',color:'var(--gray-600)',padding:'3px 10px',borderRadius:99,fontSize:12,fontWeight:600}}>
                {user.departement?.nom || user.departement}
              </span>
            )}
            {user?.poste && (
              <span style={{background:'var(--gray-100)',color:'var(--gray-600)',padding:'3px 10px',borderRadius:99,fontSize:12,fontWeight:600}}>
                {user.poste}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:4,marginBottom:20,background:'var(--gray-100)',padding:4,borderRadius:10}}>
        {[
          { key:'info', label:'Informations', icon: User },
          { key:'password', label:'Mot de passe', icon: Lock },
        ].map(t => (
          <button key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,
              padding:'9px 16px',borderRadius:8,border:'none',cursor:'pointer',
              fontFamily:'var(--font-main)',fontSize:14,fontWeight:600,
              background: tab===t.key ? '#fff' : 'transparent',
              color: tab===t.key ? 'var(--gray-900)' : 'var(--gray-500)',
              boxShadow: tab===t.key ? 'var(--shadow-sm)' : 'none',
              transition:'all 0.15s',
            }}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* Info tab */}
      {tab === 'info' && (
        <div className="card" style={{padding:'24px 28px'}}>
          <form onSubmit={handleSaveInfo} style={{display:'flex',flexDirection:'column',gap:18}}>
            <div className="form-group">
              <label className="form-label" style={{display:'flex',alignItems:'center',gap:6}}>
                <User size={14} /> Nom complet
              </label>
              <input className="form-input" value={user?.name} disabled
                style={{background:'var(--gray-50)',color:'var(--gray-400)',cursor:'not-allowed'}} />
              <span style={{fontSize:11,color:'var(--gray-400)'}}>Le nom ne peut pas être modifié.</span>
            </div>

            <div className="form-group">
              <label className="form-label" style={{display:'flex',alignItems:'center',gap:6}}>
                <Mail size={14} /> Email
              </label>
              <input className="form-input" value={user?.email} disabled
                style={{background:'var(--gray-50)',color:'var(--gray-400)',cursor:'not-allowed'}} />
              <span style={{fontSize:11,color:'var(--gray-400)'}}>L'email ne peut pas être modifié.</span>
            </div>

            <div className="form-group">
              <label className="form-label" style={{display:'flex',alignItems:'center',gap:6}}>
                <Phone size={14} /> Téléphone
              </label>
              <input className="form-input" value={form.telephone}
                onChange={e => setForm(p=>({...p,telephone:e.target.value}))}
                placeholder="0600000000" />
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <div className="form-group">
                <label className="form-label" style={{display:'flex',alignItems:'center',gap:6}}>
                  <Building2 size={14} /> Département
                </label>
                <input className="form-input" value={user?.departement?.nom || user?.departement || ''} disabled
                  style={{background:'var(--gray-50)',color:'var(--gray-400)',cursor:'not-allowed'}} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{display:'flex',alignItems:'center',gap:6}}>
                  <Briefcase size={14} /> Poste
                </label>
                <input className="form-input" value={user?.poste || ''} disabled
                  style={{background:'var(--gray-50)',color:'var(--gray-400)',cursor:'not-allowed'}} />
              </div>
            </div>

            <div style={{paddingTop:8,borderTop:'1px solid var(--gray-100)'}}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving
                  ? <><span className="spinner" style={{width:16,height:16,borderWidth:2,borderColor:'rgba(255,255,255,0.4)',borderTopColor:'transparent'}} /> Enregistrement...</>
                  : <><Save size={16} /> Enregistrer</>
                }
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password tab */}
      {tab === 'password' && (
        <div className="card" style={{padding:'24px 28px'}}>
          <form onSubmit={handleSavePw} style={{display:'flex',flexDirection:'column',gap:18}}>
            <div style={{background:'var(--info-bg)',borderRadius:8,padding:'10px 14px',fontSize:13,color:'var(--info)',display:'flex',gap:8,alignItems:'flex-start'}}>
              <span>ℹ️</span>
              <span>Le mot de passe doit contenir au moins 6 caractères.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe actuel *</label>
              <input className="form-input" type="password"
                value={pwForm.current_password} placeholder="••••••••"
                onChange={e => setPwForm(p=>({...p,current_password:e.target.value}))} required />
            </div>

            <div className="form-group">
              <label className="form-label">Nouveau mot de passe *</label>
              <input className="form-input" type="password"
                value={pwForm.new_password} placeholder="••••••••"
                onChange={e => setPwForm(p=>({...p,new_password:e.target.value}))} required />
            </div>

            <div className="form-group">
              <label className="form-label">Confirmer le nouveau mot de passe *</label>
              <input className="form-input" type="password"
                value={pwForm.new_password_confirmation} placeholder="••••••••"
                onChange={e => setPwForm(p=>({...p,new_password_confirmation:e.target.value}))} required />
            </div>

            <div style={{paddingTop:8,borderTop:'1px solid var(--gray-100)'}}>
              <button type="submit" className="btn btn-primary" disabled={savingPw}>
                {savingPw
                  ? <><span className="spinner" style={{width:16,height:16,borderWidth:2,borderColor:'rgba(255,255,255,0.4)',borderTopColor:'transparent'}} /> Modification...</>
                  : <><Lock size={16} /> Modifier le mot de passe</>
                }
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

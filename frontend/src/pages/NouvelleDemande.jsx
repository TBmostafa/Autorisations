import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { demandeService, userService } from '../services/api.js';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import SignaturePad from '../components/shared/SignaturePad';

const TYPES = [
  { value: 'conge', label: 'Congé' },
  { value: 'autorisation_absence', label: "Autorisation d'Absence" },
  { value: 'sortie', label: 'Autorisation de Sortie' },
];

export default function NouvelleDemande({ editMode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: '', date_debut: '', date_fin: '', motif: '', commentaire_employe: '',
    heure_sortie: '', heure_retour: '', signature_employe: ''
  });
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    userService.managers().then(res => setManagers(res.data.managers)).catch(() => { });
    if (editMode && id) {
      demandeService.get(id).then(res => {
        const d = res.data.demande;
        const isSortie = d.type === 'sortie';
        setForm({
          type: d.type,
          date_debut: isSortie ? d.date_debut.split(' ')[0] : d.date_debut,
          date_fin: isSortie ? d.date_fin.split(' ')[0] : d.date_fin,
          heure_sortie: isSortie ? d.date_debut.split(' ')[1]?.substring(0, 5) || '' : '',
          heure_retour: isSortie ? d.date_fin.split(' ')[1]?.substring(0, 5) || '' : '',
          motif: d.motif, commentaire_employe: d.commentaire_employe || '',
        });
      }).catch(() => toast.error('Demande introuvable'));
    }
  }, []);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.type) errs.type = 'Veuillez choisir un type.';
    if (form.type === 'sortie') {
      if (!form.date_debut) errs.date_debut = 'Date requise.';
      if (!form.heure_sortie) errs.heure_sortie = 'Heure de sortie requise.';
      if (!form.heure_retour) errs.heure_retour = 'Heure de retour requise.';
      if (form.heure_sortie && form.heure_retour && form.heure_retour <= form.heure_sortie)
        errs.heure_retour = 'L\'heure de retour doit être après l\'heure de sortie.';
    } else {
      if (!form.date_debut) errs.date_debut = 'Date de début requise.';
      if (!form.date_fin) errs.date_fin = 'Date de fin requise.';
      if (form.date_debut && form.date_fin && form.date_fin < form.date_debut)
        errs.date_fin = 'La date de fin doit être après la date de début.';
    }
    if (!form.motif.trim()) errs.motif = 'Le motif est requis.';
    if (!form.signature_employe) errs.signature_employe = 'Votre signature est requise.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    let submitData = { ...form };
    if (submitData.type === 'sortie') {
      submitData.date_debut = `${submitData.date_debut} ${submitData.heure_sortie}:00`;
      submitData.date_fin = `${form.date_debut} ${submitData.heure_retour}:00`;
    }

    try {
      if (editMode) {
        await demandeService.update(id, submitData);
        toast.success('Demande mise à jour avec succès !');
      } else {
        await demandeService.create(submitData);
        toast.success('Demande soumise avec succès !');
      }
      navigate('/demandes');
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de la soumission.';
      const apiErrors = err.response?.data?.errors || {};
      setErrors(apiErrors);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const duree = form.date_debut && form.date_fin
    ? Math.max(0, (new Date(form.date_fin) - new Date(form.date_debut)) / 86400000 + 1)
    : null;

  return (
    <div className="fade-in" style={{ maxWidth: 680 }}>
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: 8 }} onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Retour
          </button>
          <h1 className="page-title">{editMode ? 'Modifier la Demande' : 'Nouvelle Demande'}</h1>
          <p className="page-subtitle">{editMode ? 'Modifiez les informations ci-dessous.' : 'Remplissez le formulaire pour soumettre votre demande.'}</p>
        </div>
      </div>

      <div className="card" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--gray-100)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} color="var(--info)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Formulaire de demande</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>Tous les champs marqués * sont obligatoires</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Type */}
          <div className="form-group">
            <label className="form-label">Type de demande *</label>
            <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
              <option value="">-- Choisir un type --</option>
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {errors.type && <span className="form-error">{errors.type}</span>}
          </div>

          {/* Dates */}
          {form.type === 'sortie' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input className="form-input" type="date"
                  value={form.date_debut || today}
                  readOnly title="Date du jour automatique" />
                {errors.date_debut && <span className="form-error">{errors.date_debut}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Heure de sortie *</label>
                <input className="form-input" type="time"
                  value={form.heure_sortie} onChange={e => { set('heure_sortie', e.target.value); set('date_debut', form.date_debut || today); }} />
                {errors.heure_sortie && <span className="form-error">{errors.heure_sortie}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Heure de retour *</label>
                <input className="form-input" type="time"
                  value={form.heure_retour} onChange={e => set('heure_retour', e.target.value)} />
                {errors.heure_retour && <span className="form-error">{errors.heure_retour}</span>}
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Date de début *</label>
                <input className="form-input" type="date" min={!editMode ? today : undefined}
                  value={form.date_debut} onChange={e => set('date_debut', e.target.value)} />
                {errors.date_debut && <span className="form-error">{errors.date_debut}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Date de fin *</label>
                <input className="form-input" type="date" min={form.date_debut || (!editMode ? today : undefined)}
                  value={form.date_fin} onChange={e => set('date_fin', e.target.value)} />
                {errors.date_fin && <span className="form-error">{errors.date_fin}</span>}
              </div>
            </div>
          )}

          {/* Duration indicator */}
          {duree !== null && duree > 0 && (
            <div style={{ background: 'var(--info-bg)', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: 'var(--info)', fontWeight: 600 }}>
              📅 Durée calculée : <strong>{duree} jour(s)</strong>
            </div>
          )}

          {/* Motif */}
          <div className="form-group">
            <label className="form-label">Motif *</label>
            <textarea className="form-textarea" rows={3}
              placeholder="Décrivez le motif de votre demande..."
              value={form.motif} onChange={e => set('motif', e.target.value)} />
            {errors.motif && <span className="form-error">{errors.motif}</span>}
          </div>

          {/* Signature */}
          <SignaturePad 
            label="Votre Signature *"
            onSave={(sig) => set('signature_employe', sig)}
            onClear={() => set('signature_employe', '')}
          />
          {errors.signature_employe && <span className="form-error" style={{ marginTop: -12, display: 'block' }}>{errors.signature_employe}</span>}

          {/* Auto assign message */}
          <div style={{ background: 'var(--success-bg)', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>✓</span> Le responsable sera assigné automatiquement
          </div>
 
          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, paddingTop: 8, borderTop: '1px solid var(--gray-100)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading
                ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', borderTopColor: 'transparent' }} /> Envoi...</>
                : <><Save size={16} /> {editMode ? 'Enregistrer les modifications' : 'Soumettre la demande'}</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
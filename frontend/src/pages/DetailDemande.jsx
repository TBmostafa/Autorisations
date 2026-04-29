import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { demandeService } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft, Download, Edit2, CheckCircle, XCircle, MessageSquare, PenTool, Zap, Clock } from 'lucide-react';
import SignaturePad from '../components/shared/SignaturePad';

const TYPE_LABELS = {
  conge: 'Congé',
  autorisation_absence: "Autorisation d'Absence",
  sortie: 'Sortie',
  sortie_urgente: 'Sortie Urgente ⚡',
};

export default function DetailDemande() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [traitement, setTraitement] = useState({ statut: '', commentaire_manager: '', signature_manager: '' });
  const [processingAction, setProcessingAction] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [justificationText, setJustificationText] = useState('');
  const [submittingJustif, setSubmittingJustif] = useState(false);
  const [acceptingJustif, setAcceptingJustif] = useState(false);

  const load = () => {
    demandeService.get(id)
      .then(res => setDemande(res.data.demande))
      .catch(() => { toast.error('Demande introuvable'); navigate('/demandes'); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleJustifier = async () => {
    if (justificationText.trim().length < 10) {
      toast.error('La justification doit contenir au moins 10 caractères.');
      return;
    }
    setSubmittingJustif(true);
    try {
      await demandeService.justifier(id, justificationText.trim());
      toast.success('Justification enregistrée avec succès !');
      setJustificationText('');
      load();
    } catch (err) {
      toast.error(err.friendlyMessage || 'Erreur');
    } finally {
      setSubmittingJustif(false);
    }
  };

  const handleAccepterJustification = async (acceptee) => {
    setAcceptingJustif(true);
    try {
      await demandeService.accepterJustification(id, acceptee);
      toast.success(acceptee ? 'Justification acceptée !' : 'Justification refusée.');
      load();
    } catch (err) {
      toast.error(err.friendlyMessage || 'Erreur');
    } finally {
      setAcceptingJustif(false);
    }
  };

  const handleTraiter = async (actionStr) => {
    let statut = '';
    const isRhFinalStep = user.role === 'rh';

    if (actionStr === 'accepter') {
      statut = isRhFinalStep ? 'validee_definitivement' : 'validee_responsable';
    } else {
      statut = isRhFinalStep ? 'refusee_rh' : 'refusee_responsable';
    }

    // Signature obligatoire seulement pour le manager (1ère étape)
    if (actionStr === 'accepter' && !isRhFinalStep && !traitement.signature_manager) {
      toast.error('La signature est obligatoire pour valider la demande.');
      return;
    }

    setProcessingAction(actionStr);
    try {
      await demandeService.traiter(id, { 
        statut, 
        commentaire_manager: traitement.commentaire_manager,
        signature_manager: isRhFinalStep ? null : traitement.signature_manager
      });
      toast.success(`Demande traitée avec succès !`);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.friendlyMessage || 'Erreur');
    } finally { setProcessingAction(null); }
  };

  const handleDownloadPdf = async () => {
    try {
      toast.loading('Génération du PDF...', { id: 'pdf-loading' });
      const res = await demandeService.exportPdf(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `demande_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF téléchargé !', { id: 'pdf-loading' });
    } catch (err) {
      console.error('PDF Error:', err);
      const msg = err.response?.data?.message || 'Erreur lors du téléchargement du PDF';
      toast.error(msg, { id: 'pdf-loading' });
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3, color: 'var(--primary)' }} />
    </div>
  );
  if (!demande) return null;

  const canTraiter = ((user.role === 'manager' && demande.statut === 'en_attente_responsable') || (user.role === 'rh' && demande.statut === 'validee_responsable'));

  const INFO = [
    { label: 'Type de demande', value: TYPE_LABELS[demande.type] || demande.type },
    { label: demande.type === 'sortie' || demande.type === 'sortie_urgente' ? 'Date de Sortie' : 'Date de début', value: demande.date_debut ? format(parseISO(demande.date_debut), demande.type === 'sortie' || demande.type === 'sortie_urgente' ? 'd MMMM yyyy à HH:mm' : 'd MMMM yyyy', { locale: fr }) : '-' },
    (demande.type === 'sortie' || demande.type === 'sortie_urgente') && { label: 'Heure de retour', value: demande.date_fin ? format(parseISO(demande.date_fin), 'HH:mm', { locale: fr }) : '-' },
    demande.type !== 'sortie' && demande.type !== 'sortie_urgente' && { label: 'Date de fin', value: demande.date_fin ? format(parseISO(demande.date_fin), 'd MMMM yyyy', { locale: fr }) : '-' },
    demande.type !== 'sortie' && demande.type !== 'sortie_urgente' && { label: 'Durée', value: `${demande.duree} jour(s)` },
    { label: 'Motif', value: demande.motif },
    { label: 'Créée le', value: demande.created_at ? format(parseISO(demande.created_at), 'd MMMM yyyy à HH:mm', { locale: fr }) : '-' },
    demande.date_traitement && { label: 'Traitée le', value: format(parseISO(demande.date_traitement), 'd MMMM yyyy à HH:mm', { locale: fr }) },
    demande.employe?.role !== 'manager' && { label: 'Manager', value: demande.manager?.name || '—' },
  ].filter(Boolean);

  return (
    <div className="fade-in" style={{ maxWidth: 680 }}>
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: 8 }} onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Retour
          </button>
          <h1 className="page-title">Demande #{String(demande.id).padStart(4, '0')}</h1>
          <p className="page-subtitle">Détail complet de la demande</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {user.role === 'employe' && demande.statut === 'en_attente_responsable' && (
            <Link to={`/demandes/${id}/modifier`} className="btn btn-secondary">
              <Edit2 size={15} /> Modifier
            </Link>
          )}
          {demande.statut === 'validee_definitivement' && (
            <button className="btn btn-secondary" onClick={handleDownloadPdf}>
              <Download size={15} /> PDF
            </button>
          )}
        </div>
      </div>

      {/* Status banner */}
      <div style={{
        padding: '14px 20px', borderRadius: 12, marginBottom: 20,
        background: ['validee_responsable', 'validee_definitivement'].includes(demande.statut) ? 'var(--success-bg)' : ['refusee_responsable', 'refusee_rh'].includes(demande.statut) ? 'var(--danger-bg)' : 'var(--warning-bg)',
        color: ['validee_responsable', 'validee_definitivement'].includes(demande.statut) ? 'var(--success)' : ['refusee_responsable', 'refusee_rh'].includes(demande.statut) ? 'var(--danger)' : 'var(--warning)',
        display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, fontSize: 14,
      }}>
        {['validee_responsable', 'validee_definitivement'].includes(demande.statut) && <CheckCircle size={18} />}
        {['refusee_responsable', 'refusee_rh'].includes(demande.statut) && <XCircle size={18} />}
        {demande.statut === 'en_attente_responsable' && <span style={{ fontSize: 18 }}>⏳</span>}
        {{ 
          en_attente_responsable: 'En attente de traitement (Manager)',
          validee_responsable: 'Validée par le Manager (En attente RH)',
          refusee_responsable: 'Refusée par le Manager',
          validee_definitivement: 'Validée Définitivement (RH)',
          refusee_rh: 'Refusée par le Service RH'
        }[demande.statut]}
      </div>

      {/* Badge justification pour sortie urgente — visible RH + rappel employé */}
      {demande.type === 'sortie_urgente' && (user.role === 'rh' || (user.role === 'employe' && demande.user_id === user.id)) && (
        <div style={{
          padding: '10px 16px', borderRadius: 10, marginBottom: 16,
          background: demande.justification_acceptee === true ? '#f0fdf4'
            : demande.justification_acceptee === false ? '#fef2f2'
            : demande.justification_urgence ? '#eff6ff'
            : '#fffbeb',
          border: `1.5px solid ${
            demande.justification_acceptee === true ? '#86efac'
            : demande.justification_acceptee === false ? '#fca5a5'
            : demande.justification_urgence ? '#93c5fd'
            : '#fcd34d'
          }`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          {demande.justification_acceptee === true && <CheckCircle size={16} color="#16a34a" />}
          {demande.justification_acceptee === false && <XCircle size={16} color="#dc2626" />}
          {demande.justification_acceptee === null && demande.justification_urgence && <Clock size={16} color="#2563eb" />}
          {demande.justification_acceptee === null && !demande.justification_urgence && <Clock size={16} color="#d97706" />}
          <span style={{
            fontSize: 13, fontWeight: 700,
            color: demande.justification_acceptee === true ? '#15803d'
              : demande.justification_acceptee === false ? '#b91c1c'
              : demande.justification_urgence ? '#1d4ed8'
              : '#92400e',
          }}>
            {demande.justification_acceptee === true ? 'Justifiée'
              : demande.justification_acceptee === false ? 'Justification refusée'
              : demande.justification_urgence ? 'En attente de validation RH'
              : 'En attente de justification'}
          </span>
          {!demande.justification_urgence && user.role === 'employe' && demande.user_id === user.id && (
            <span style={{ fontSize: 12, color: '#92400e', marginLeft: 4 }}>
              — Veuillez soumettre votre justification ci-dessous
            </span>
          )}
        </div>
      )}

      {/* Info employé */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: 12 }}>
          Informations de l'employé
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'var(--info-bg)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 20, fontWeight: 800, color: 'var(--info)',
          }}>
            {demande.employe?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{demande.employe?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{demande.employe?.email}</div>
            {demande.employe?.departement && (
              <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
                {demande.employe.departement?.nom || demande.employe.departement} {demande.employe.poste ? `— ${demande.employe.poste}` : ''}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Détails de la demande
        </h3>
        <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
          {INFO.map((item, i) => (
            <div key={i} style={item.label === 'Motif' ? { gridColumn: '1/-1' } : {}}>
              <dt style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
                {item.label}
              </dt>
              <dd style={{ fontSize: 14, color: 'var(--gray-800)', fontWeight: 500 }}>{item.value}</dd>
            </div>
          ))}
        </dl>

        {/* Justification urgence — visible RH uniquement */}
        {demande.type === 'sortie_urgente' && demande.justification_urgence && user.role === 'rh' && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--gray-100)' }}>
            <dt style={{ fontSize: 11, fontWeight: 600, color: '#e67e00', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              ⚡ Justification de l'urgence
            </dt>
            <div style={{ background: '#fffdf0', border: '1px solid #ffc107', borderLeft: '3px solid #e67e00', padding: '10px 14px', borderRadius: '0 8px 8px 0', fontSize: 14, color: 'var(--gray-700)', fontStyle: 'italic', marginBottom: 12 }}>
              {demande.justification_urgence}
            </div>

            {/* Boutons d'acceptation RH — uniquement si pas encore traitée */}
            {demande.justification_acceptee === null && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn btn-success btn-sm"
                  disabled={acceptingJustif}
                  onClick={() => handleAccepterJustification(true)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {acceptingJustif ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <CheckCircle size={14} />}
                  Accepter la justification
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  disabled={acceptingJustif}
                  onClick={() => handleAccepterJustification(false)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {acceptingJustif ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <XCircle size={14} />}
                  Refuser la justification
                </button>
              </div>
            )}

            {/* Résultat si déjà traitée */}
            {demande.justification_acceptee === true && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f0fdf4', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#15803d' }}>
                <CheckCircle size={15} /> Justification acceptée par le RH
              </div>
            )}
            {demande.justification_acceptee === false && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#fef2f2', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#b91c1c' }}>
                <XCircle size={15} /> Justification refusée par le RH
              </div>
            )}
          </div>
        )}
      </div>

      {/* Formulaire de soumission de justification (employé, sortie urgente sans justification) */}
      {demande.type === 'sortie_urgente' && !demande.justification_urgence && user.role === 'employe' && demande.user_id === user.id && (
        <div className="card" style={{ padding: '20px 24px', marginBottom: 16, border: '1.5px solid #fcd34d' }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={14} color="#e67e00" /> Soumettre la justification
          </h3>
          <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 14 }}>
            Votre sortie urgente a été approuvée automatiquement. Veuillez fournir une justification détaillée.
          </p>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Expliquez en détail la raison de l'urgence (situation médicale, familiale, etc.)..."
              value={justificationText}
              onChange={e => setJustificationText(e.target.value)}
              style={{ borderColor: '#fcd34d', background: '#fffdf0' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>Minimum 10 caractères</span>
              <span style={{ fontSize: 11, color: justificationText.length > 900 ? 'var(--danger)' : 'var(--gray-400)' }}>
                {justificationText.length}/1000
              </span>
            </div>
          </div>
          <button
            className="btn btn-primary"
            disabled={submittingJustif || justificationText.trim().length < 10}
            onClick={handleJustifier}
            style={{ background: '#e67e00', borderColor: '#e67e00' }}
          >
            {submittingJustif
              ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              : <Zap size={15} />
            }
            Soumettre la justification
          </button>
        </div>
      )}

      {/* Signatures Display */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {demande.signature_employe && (
          <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: 10 }}>Signature Employé</span>
            <img src={demande.signature_employe} alt="Signature employé" style={{ maxHeight: 60, width: 'auto' }} />
          </div>
        )}
        {demande.signature_manager && (
          <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: 10 }}>Signature Responsable</span>
            <img src={demande.signature_manager} alt="Signature responsable" style={{ maxHeight: 60, width: 'auto' }} />
          </div>
        )}
      </div>

      {/* Comments */}
      {(demande.commentaire_employe || demande.commentaire_manager) && (
        <div className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <MessageSquare size={14} style={{ display: 'inline', marginRight: 6 }} />
            Commentaires
          </h3>
          {demande.commentaire_employe && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-400)', marginBottom: 6 }}>
                Commentaire de l'employé
              </div>
              <div style={{ background: 'var(--gray-50)', borderLeft: '3px solid var(--primary)', padding: '10px 14px', borderRadius: '0 8px 8px 0', fontSize: 14, color: 'var(--gray-700)', fontStyle: 'italic' }}>
                {demande.commentaire_employe}
              </div>
            </div>
          )}
          {demande.commentaire_manager && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-400)', marginBottom: 6 }}>
                Avis du manager ({demande.manager?.name})
              </div>
              <div style={{ background: 'var(--success-bg)', borderLeft: '3px solid var(--success)', padding: '10px 14px', borderRadius: '0 8px 8px 0', fontSize: 14, color: 'var(--gray-700)', fontStyle: 'italic' }}>
                {demande.commentaire_manager}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Traitement form */}
      {canTraiter && (
        <div className="card" style={{ padding: '20px 24px' }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Traiter cette demande
          </h3>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Commentaire (optionnel)</label>
            <textarea className="form-textarea" rows={2}
              placeholder="Ajoutez un commentaire ou un avis..."
              value={traitement.commentaire_manager}
              onChange={e => setTraitement(p => ({ ...p, commentaire_manager: e.target.value }))}
            />
          </div>
          
          {user.role !== 'rh' && (
            <SignaturePad 
              label="Signature du Responsable *"
              onSave={(sig) => setTraitement(p => ({ ...p, signature_manager: sig }))}
              onClear={() => setTraitement(p => ({ ...p, signature_manager: '' }))}
            />
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-success" disabled={processingAction} onClick={() => handleTraiter('accepter')} style={{ flex: 1, justifyContent: 'center' }}>
              {processingAction === 'accepter' ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <CheckCircle size={16} />}
              Accepter
            </button>
            <button className="btn btn-danger" disabled={processingAction} onClick={() => handleTraiter('refuser')} style={{ flex: 1, justifyContent: 'center' }}>
              {processingAction === 'refuser' ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <XCircle size={16} />}
              Refuser
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
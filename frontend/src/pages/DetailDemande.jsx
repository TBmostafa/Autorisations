import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { demandeService } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft, Download, Edit2, CheckCircle, XCircle, MessageSquare, PenTool } from 'lucide-react';
import SignaturePad from '../components/shared/SignaturePad';

const TYPE_LABELS = {
  conge: 'Congé',
  autorisation_absence: "Autorisation d'Absence",
  sortie: 'Sortie',
};

export default function DetailDemande() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [traitement, setTraitement] = useState({ statut: '', commentaire_manager: '', signature_manager: '' });
  const [processingAction, setProcessingAction] = useState(null); // 'accepter', 'refuser' ou null
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    demandeService.get(id)
      .then(res => setDemande(res.data.demande))
      .catch(() => { toast.error('Demande introuvable'); navigate('/demandes'); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleTraiter = async (actionStr) => {
    let statut = '';
    const isRhOrAdminRh = user.role === 'rh' || (user.role === 'admin' && demande.statut === 'validee_responsable');

    if (actionStr === 'accepter') {
      statut = isRhOrAdminRh ? 'validee_definitivement' : 'validee_responsable';
    } else {
      statut = isRhOrAdminRh ? 'refusee_rh' : 'refusee_responsable';
    }

    // Signature obligatoire seulement pour le manager (1ère étape)
    if (actionStr === 'accepter' && !isRhOrAdminRh && !traitement.signature_manager) {
      toast.error('La signature est obligatoire pour valider la demande.');
      return;
    }

    setProcessingAction(actionStr);
    try {
      await demandeService.traiter(id, { 
        statut, 
        commentaire_manager: traitement.commentaire_manager,
        signature_manager: isRhOrAdminRh ? null : traitement.signature_manager
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

  const canTraiter = ((user.role === 'manager' && demande.statut === 'en_attente_responsable') || (user.role === 'rh' && demande.statut === 'validee_responsable') || (user.role === 'admin' && (demande.statut === 'en_attente_responsable' || demande.statut === 'validee_responsable')));

  const INFO = [
    { label: 'Type de demande', value: TYPE_LABELS[demande.type] || demande.type },
    { label: demande.type === 'sortie' ? 'Date de Sortie' : 'Date de début', value: demande.date_debut ? format(parseISO(demande.date_debut), demande.type === 'sortie' ? 'd MMMM yyyy à HH:mm' : 'd MMMM yyyy', { locale: fr }) : '-' },
    demande.type === 'sortie' && { label: 'Heure de retour', value: demande.date_fin ? format(parseISO(demande.date_fin), 'HH:mm', { locale: fr }) : '-' },
    demande.type !== 'sortie' && { label: 'Date de fin', value: demande.date_fin ? format(parseISO(demande.date_fin), 'd MMMM yyyy', { locale: fr }) : '-' },
    demande.type !== 'sortie' && { label: 'Durée', value: `${demande.duree} jour(s)` },
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
      </div>

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
          
          {!(user.role === 'rh' || (user.role === 'admin' && demande.statut === 'validee_responsable')) && (
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
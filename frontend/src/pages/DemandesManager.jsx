import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { demandeService } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Eye, CheckCircle, XCircle, Filter, Download, PenTool } from 'lucide-react';
import SignaturePad from '../components/shared/SignaturePad';

const TYPE_LABELS = {
  conge: 'Congé',
   autorisation_absence: "Absence",
  sortie: 'Sortie',
};
const STATUT_LABEL = {
  en_attente_responsable: 'En attente Manager',
  validee_responsable: 'Validée par Manager',
  refusee_responsable: 'Refusée par Manager',
  validee_definitivement: 'Validée (Définitive)',
  refusee_rh: 'Refusée par RH'
};

export default function DemandesManager() {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ statut: 'en_attente', type: '' });
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [quickModal, setQuickModal] = useState(null); // { demande, action }
  const [comment, setComment] = useState('');
  const [signature, setSignature] = useState('');
  const [saving, setSaving] = useState(false);

  const load = (p = 1) => {
    setLoading(true);
    demandeService.list({ page: p, ...filters })
      .then(res => { setDemandes(res.data.data); setMeta(res.data); setPage(p); })
      .catch(err => toast.error(err.friendlyMessage || 'Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, [filters]);

  const handleQuick = async () => {
    if (!quickModal) return;
    setSaving(true);
    try {
      // Signature obligatoire seulement pour la validation manager (1ère étape)
      if (quickModal.action === 'validee_responsable' && !signature) {
        toast.error('La signature est obligatoire pour valider la demande en tant que responsable.');
        setSaving(false);
        return;
      }
      await demandeService.traiter(quickModal.demande.id, {
        statut: quickModal.action,
        commentaire_manager: comment,
        signature_manager: quickModal.action === 'validee_responsable' ? signature : null,
      });
      toast.success(`Demande traitée avec succès !`);
      setQuickModal(null);
      setComment('');
      setSignature('');
      load(page);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  const isSortieTable = filters.type === 'sortie';

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des Demandes</h1>
          <p className="page-subtitle">
            {meta?.total || 0} demande(s) — {user.role === 'admin' ? 'Vue Administrateur' : user.role === 'rh' ? 'Vue RH' : 'Vue Manager'}
          </p>
        </div>
        {user.role === 'admin' && (
          <button className="btn btn-secondary" onClick={() => demandeService.archiver().then(r => toast.success(r.data.message))}>
            Archiver anciennes
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: 20, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={16} color="var(--gray-400)" />
        <select className="form-select" style={{ width: 'auto', minWidth: 155 }}
          value={filters.statut} onChange={e => setFilters(p => ({ ...p, statut: e.target.value }))}>
          <option value="">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="traitees">Traitées</option>
          <option value="refusee">Refusée</option>
        </select>
        <select className="form-select" style={{ width: 'auto', minWidth: 190 }}
          value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}>
          <option value="">Tous les types</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card">
        {demandes.length === 0 && !loading ? (
          <div className="empty-state">
            <CheckCircle size={44} />
            <p>Aucune demande{filters.statut === 'en_attente' ? ' en attente' : ''}</p>
            <span>Toutes les demandes ont été traitées</span>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>

                    <th>Employé</th>
                    {!isSortieTable && <th>Département</th>}
                    <th>Type</th>
                    {isSortieTable ? (
                      <th>Heure de sortie</th>
                    ) : (
                      <>
                        <th>Date Début</th>
                        <th>Date Fin</th>
                        <th style={{ textAlign: 'center' }}>Durée</th>
                      </>
                    )}
                    <th>Statut</th>
                    <th>Créée le</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j}><div className="skeleton" style={{ height: 20, width: '80%' }} /></td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    demandes.map((d, index) => (
                      <tr key={d.id} className={`slide-up delay-${(index % 5) + 1}`}>

                        <td>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{d.employe?.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{d.employe?.email}</div>
                        </td>
                        {!isSortieTable && <td style={{ fontSize: 13, color: 'var(--gray-500)' }}>{d.employe?.departement?.nom || '—'}</td>}
                        <td>
                          <span style={{ background: 'var(--info-bg)', color: 'var(--info)', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                            {TYPE_LABELS[d.type]}
                          </span>
                        </td>
                        {isSortieTable ? (
                          <td style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                            {d.date_debut ? format(parseISO(d.date_debut), 'd MMMM yyyy HH:mm', { locale: fr }) : '-'}
                          </td>
                        ) : (
                          <>
                            <td style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                              {d.date_debut ? format(parseISO(d.date_debut), d.type === 'sortie' ? 'd MMM yyyy HH:mm' : 'd MMM yyyy', { locale: fr }) : '-'}
                            </td>
                            <td style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                              {d.type === 'sortie' ? '-' : (d.date_fin ? format(parseISO(d.date_fin), 'd MMM yyyy', { locale: fr }) : '-')}
                            </td>
                            <td style={{ fontSize: 13, fontWeight: 600, textAlign: 'center' }}>{d.type === 'sortie' ? '-' : `${d.duree} j`}</td>
                          </>
                        )}
                        <td><span className={`badge badge-${d.statut}`}>{STATUT_LABEL[d.statut]}</span></td>
                        <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                          {d.created_at ? format(parseISO(d.created_at), 'd MMM yyyy', { locale: fr }) : '-'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                            <Link to={`/demandes/${d.id}`} className="btn btn-ghost btn-icon btn-sm" title="Voir">
                              <Eye size={15} />
                            </Link>
                            {(d.statut === 'validee_definitivement' || (d.statut === 'validee_responsable' && user.role === 'admin')) && (
                              <button className="btn btn-ghost btn-icon btn-sm" title="Télécharger" onClick={() => {
                                toast.loading('Génération du PDF...', { id: 'pdf-loading' });
                                demandeService.exportPdf(d.id).then(res => {
                                  const url = window.URL.createObjectURL(new Blob([res.data]));
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.setAttribute('download', `demande_${d.id}.pdf`);
                                  document.body.appendChild(link);
                                  link.click();
                                  link.remove();
                                  toast.success('PDF téléchargé !', { id: 'pdf-loading' });
                                }).catch(() => toast.error('Erreur', { id: 'pdf-loading' }));
                              }}>
                                <Download size={15} />
                              </button>
                            )}
                            {((user.role === 'manager' && d.statut === 'en_attente_responsable') || (user.role === 'rh' && d.statut === 'validee_responsable') || (user.role === 'admin' && (d.statut === 'en_attente_responsable' || d.statut === 'validee_responsable'))) && (
                              <>
                                <button className="btn btn-icon btn-sm" title="Accepter"
                                  style={{ background: 'var(--success-bg)', color: 'var(--success)', border: 'none' }}
                                  onClick={() => {
                                    let action = 'validee_responsable';
                                    if (user.role === 'rh' || (user.role === 'admin' && d.statut === 'validee_responsable')) action = 'validee_definitivement';
                                    setQuickModal({ demande: d, action }); setComment(''); setSignature('');
                                  }}>
                                  <CheckCircle size={15} />
                                </button>
                                <button className="btn btn-icon btn-sm" title="Refuser"
                                  style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: 'none' }}
                                  onClick={() => {
                                    let action = 'refusee_responsable';
                                    if (user.role === 'rh' || (user.role === 'admin' && d.statut === 'validee_responsable')) action = 'refusee_rh';
                                    setQuickModal({ demande: d, action }); setComment(''); setSignature('');
                                  }}>
                                  <XCircle size={15} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {meta && meta.last_page > 1 && (
              <div className="pagination" style={{ padding: '12px 0 4px' }}>
                <button disabled={page <= 1} onClick={() => load(page - 1)}>←</button>
                {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                  <button key={p} className={p === page ? 'active' : ''} onClick={() => load(p)}>{p}</button>
                ))}
                <button disabled={page >= meta.last_page} onClick={() => load(page + 1)}>→</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick action modal */}
      {quickModal && (
        <div className="modal-overlay" onClick={() => setQuickModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {['validee_responsable', 'validee_definitivement'].includes(quickModal.action) ? '✅ Accepter' : '❌ Refuser'} la demande
              </h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setQuickModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--gray-600)', marginBottom: 16, fontSize: 13, lineHeight: 1.6 }}>
                Demande de <strong>{quickModal.demande.employe?.name}</strong> — {TYPE_LABELS[quickModal.demande.type]}
                <br />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  {quickModal.demande.date_debut ? format(parseISO(quickModal.demande.date_debut), quickModal.demande.type === 'sortie' ? 'd MMM yyyy HH:mm' : 'd MMM yyyy', { locale: fr }) : '-'}
                  {quickModal.demande.type !== 'sortie' && ` → ${quickModal.demande.date_fin ? format(parseISO(quickModal.demande.date_fin), 'd MMM yyyy', { locale: fr }) : '-'}`}
                </span>
              </p>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Commentaire (optionnel)</label>
                <textarea className="form-textarea" rows={2}
                  placeholder="Ajoutez un commentaire ou un avis..."
                  value={comment} onChange={e => setComment(e.target.value)} />
              </div>

              {quickModal.action === 'validee_responsable' && (
                <SignaturePad
                  label="Signature du Responsable *"
                  onSave={(sig) => setSignature(sig)}
                  onClear={() => setSignature('')}
                />
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setQuickModal(null)}>Annuler</button>
              <button
                className={`btn ${['validee_responsable', 'validee_definitivement'].includes(quickModal.action) ? 'btn-success' : 'btn-danger'}`}
                disabled={saving}
                onClick={handleQuick}
              >
                {saving ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : null}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
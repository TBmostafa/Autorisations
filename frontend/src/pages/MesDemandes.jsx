import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { demandeService } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Eye, Edit2, Trash2, Search, Filter, Download } from 'lucide-react';

const TYPE_LABELS = {
  conge: 'Congé',
  autorisation_absence: "Absence",
  sortie: 'Sortie',
  sortie_urgente: 'Sortie Urgente ⚡',
};
const STATUT_LABEL = {
  en_attente_responsable: 'En attente Manager',
  validee_responsable: 'Validée (Manager)',
  refusee_responsable: 'Refusée (Manager)',
  validee_definitivement: 'Validée Définitive',
  refusee_rh: 'Refusée (RH)'
};

export default function MesDemandes() {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [filters, setFilters] = useState({ statut: '', type: '' });
  const [cancelId, setCancelId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = (p = 1) => {
    setLoading(true);
    demandeService.list({ page: p, ...filters })
      .then(res => {
        setDemandes(res.data.data);
        setMeta(res.data);
        setPage(p);
      })
      .catch(err => toast.error(err.friendlyMessage || 'Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, [filters]);

  const handleCancel = async (id) => {
    setCancelling(true);
    try {
      await demandeService.cancel(id);
      toast.success('Demande annulée.');
      setCancelId(null);
      load(page);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Erreur');
    } finally { setCancelling(null); }
    setLoading(false);
  };

  const handlePdf = async (id) => {
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

  const isSortieTable = filters.type === 'sortie';

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mes Demandes</h1>
          <p className="page-subtitle">{meta?.total || 0} demande(s) au total</p>
        </div>
        {user?.role === 'employe' && (
          <Link to="/demandes/nouvelle" className="btn btn-primary">
            <Plus size={16} /> Nouvelle Demande
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={16} color="var(--gray-400)" />
        <select className="form-select" style={{ width: 'auto', minWidth: 150 }}
          value={filters.statut} onChange={e => setFilters(p => ({ ...p, statut: e.target.value }))}>
          <option value="">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="acceptee">Acceptée</option>
          <option value="refusee">Refusée</option>
        </select>
        <select className="form-select" style={{ width: 'auto', minWidth: 190 }}
          value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}>
          <option value="">Tous les types</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {(filters.statut || filters.type) && (
          <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ statut: '', type: '' })}>
            Effacer filtres
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card">
        {demandes.length === 0 && !loading ? (
          <div className="empty-state">
            <Search size={44} />
            <p>Aucune demande trouvée</p>
            {user?.role === 'employe' && (
              <Link to="/demandes/nouvelle" className="btn btn-primary" style={{ marginTop: 8 }}>
                <Plus size={16} /> Créer une demande
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>

                    {user?.role !== 'employe' && <th>Employé</th>}
                    {user?.role !== 'employe' && !isSortieTable && <th>Département</th>}
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
                        {Array.from({ length: user?.role === 'employe' ? 5 : 7 }).map((_, j) => (
                          <td key={j}><div className="skeleton" style={{ height: 20, width: '80%' }} /></td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    demandes.map((d, index) => (
                      <tr key={d.id} className={`slide-up delay-${(index % 5) + 1}`}>

                        {user?.role !== 'employe' && (
                          <td>
                            <div style={{ fontWeight: 600 }}>{d.employe?.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{d.employe?.email}</div>
                          </td>
                        )}
                        {user?.role !== 'employe' && !isSortieTable && (
                          <td style={{ fontSize: 13, color: 'var(--gray-500)' }}>{d.employe?.departement?.nom || '—'}</td>
                        )}
                        <td>
                          <span style={{
                            background: 'var(--info-bg)', color: 'var(--info)',
                            padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                          }}>
                            {TYPE_LABELS[d.type] || d.type}
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
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span className={`badge badge-${d.statut}`}>{STATUT_LABEL[d.statut]}</span>
                            {d.type === 'sortie_urgente' && (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
                                background: d.justification_acceptee === true ? '#f0fdf4'
                                  : d.justification_acceptee === false ? '#fef2f2'
                                  : d.justification_urgence ? '#eff6ff'
                                  : '#fffbeb',
                                color: d.justification_acceptee === true ? '#15803d'
                                  : d.justification_acceptee === false ? '#b91c1c'
                                  : d.justification_urgence ? '#1d4ed8'
                                  : '#92400e',
                                border: `1px solid ${
                                  d.justification_acceptee === true ? '#86efac'
                                  : d.justification_acceptee === false ? '#fca5a5'
                                  : d.justification_urgence ? '#93c5fd'
                                  : '#fcd34d'
                                }`,
                                width: 'fit-content',
                              }}>
                                {d.justification_acceptee === true ? '✓ Justifiée'
                                  : d.justification_acceptee === false ? '✗ Justification refusée'
                                  : d.justification_urgence ? '⏳ En cours de vérification'
                                  : '⏳ Justification à soumettre'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                          {d.created_at ? format(parseISO(d.created_at), 'd MMM yyyy', { locale: fr }) : '-'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                            <Link to={`/demandes/${d.id}`} className="btn btn-ghost btn-icon btn-sm" title="Voir">
                              <Eye size={15} />
                            </Link>
                            {user?.role === 'employe' && d.statut === 'en_attente_responsable' && (
                              <Link to={`/demandes/${d.id}/modifier`} className="btn btn-ghost btn-icon btn-sm" title="Modifier">
                                <Edit2 size={15} />
                              </Link>
                            )}
                            {d.statut === 'validee_definitivement' && (
                              <button className="btn btn-ghost btn-icon btn-sm" title="PDF" onClick={() => handlePdf(d.id)}>
                                <Download size={15} />
                              </button>
                            )}
                            {user?.role === 'employe' && d.statut === 'en_attente_responsable' && (
                              <button className="btn btn-ghost btn-icon btn-sm" title="Annuler"
                                style={{ color: 'var(--danger)' }}
                                onClick={() => setCancelId(d.id)}>
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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

      {/* Cancel confirm modal */}
      {cancelId && (
        <div className="modal-overlay" onClick={() => setCancelId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3 className="modal-title">Confirmer l'annulation</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setCancelId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--gray-600)' }}>Êtes-vous sûr de vouloir annuler cette demande ? Cette action est irréversible.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCancelId(null)}>Non, garder</button>
              <button className="btn btn-danger" disabled={cancelling} onClick={() => handleCancel(cancelId)}>
                {cancelling ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : null}
                Oui, annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
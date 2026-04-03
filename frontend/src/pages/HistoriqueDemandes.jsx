import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { demandeService } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Eye, Filter, Download, Clock, Search } from 'lucide-react';

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

export default function HistoriqueManager() {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ statut: '', type: '', search: '' });
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

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

  const handlePdf = (id) => {
    const token = localStorage.getItem('token');
    window.open(`/api/demandes/${id}/pdf?token=${token}`, '_blank');
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Historique des Demandes</h1>
          <p className="page-subtitle">
            {meta?.total || 0} demande(s) enregistrée(s)
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} color="var(--gray-400)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 38 }}
            placeholder="Rechercher par nom d'employé..."
            value={filters.search}
            onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
          />
        </div>

        <select className="form-select" style={{ width: 'auto', minWidth: 155 }}
          value={filters.statut} onChange={e => setFilters(p => ({ ...p, statut: e.target.value }))}>
          <option value="">Tous les statuts</option>
          <option value="acceptee">Acceptées</option>
          <option value="refusee">Refusées</option>
          <option value="en_attente">En cours</option>
        </select>

        <select className="form-select" style={{ width: 'auto', minWidth: 190 }}
          value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}>
          <option value="">Tous les types</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        {(filters.statut || filters.type || filters.search) && (
          <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ statut: '', type: '', search: '' })}>
            Effacer
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card">
        {demandes.length === 0 && !loading ? (
          <div className="empty-state">
            <Search size={44} />
            <p>Aucun historique trouvé</p>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>

                    <th>Employé</th>
                    <th>Type</th>
                    <th>Période</th>
                    <th>Durée</th>
                    <th>Statut</th>
                    <th>Traitement</th>
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
                    demandes.map(d => (
                      <tr key={d.id}>

                        <td>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{d.employe?.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{d.employe?.email}</div>
                        </td>
                        <td>
                          <span style={{ background: 'var(--info-bg)', color: 'var(--info)', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                            {TYPE_LABELS[d.type] || d.type}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--gray-600)' }}>
                          {d.type === 'sortie'
                            ? format(parseISO(d.date_debut), 'd MMM yyyy HH:mm', { locale: fr })
                            : `${d.date_debut ? format(parseISO(d.date_debut), 'd MMM', { locale: fr }) : ''} → ${d.date_fin ? format(parseISO(d.date_fin), 'd MMM yyyy', { locale: fr }) : ''}`
                          }
                        </td>
                        <td style={{ fontSize: 13, fontWeight: 600 }}>{d.type === 'sortie' ? '-' : `${d.duree} j`}</td>
                        <td><span className={`badge badge-${d.statut}`}>{STATUT_LABEL[d.statut]}</span></td>
                        <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                          {d.date_traitement ? format(parseISO(d.date_traitement), 'd MMM yyyy', { locale: fr }) : '—'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <Link to={`/demandes/${d.id}`} className="btn btn-ghost btn-icon btn-sm" title="Voir">
                              <Eye size={15} />
                            </Link>
                            {d.statut === 'acceptee' && (
                              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handlePdf(d.id)} title="Télécharger PDF">
                                <Download size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )))}
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
    </div>
  );
}
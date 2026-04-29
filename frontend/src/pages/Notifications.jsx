import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notifService } from '../services/api.js';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bell, CheckCheck, ExternalLink, Trash2 } from 'lucide-react';

const TYPE_STYLES = {
  success: { bg: 'var(--success-bg)', color: 'var(--success)', icon: '✅' },
  error: { bg: 'var(--danger-bg)', color: 'var(--danger)', icon: '❌' },
  warning: { bg: 'var(--warning-bg)', color: 'var(--warning)', icon: '⚠️' },
  info: { bg: 'var(--info-bg)', color: 'var(--info)', icon: 'ℹ️' },
};

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);

  const load = (p = 1) => {
    setLoading(true);
    notifService.list({ page: p })
      .then(res => { setNotifs(res.data.data); setMeta(res.data); setPage(p); setSelectedIds([]); })
      .catch(err => toast.error(err.friendlyMessage || 'Erreur'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
    // Marquer toutes les notifications comme lues à l'ouverture
    notifService.marquerToutesLues()
      .then(() => window.dispatchEvent(new CustomEvent('notifications-updated')))
      .catch(() => {});
  }, []);

  const marquerLue = async (id) => {
    await notifService.marquerLue(id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
    window.dispatchEvent(new CustomEvent('notifications-updated'));
  };

  const supprimer = async (id, e) => {
    e.stopPropagation();
    try {
      await notifService.delete(id);
      toast.success('Notification supprimée.');
      load(notifs.length === 1 && page > 1 ? page - 1 : page);
      window.dispatchEvent(new CustomEvent('notifications-updated'));
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const deleteSelected = async () => {
    if (!selectedIds.length) return;
    try {
      await notifService.deleteBatch(selectedIds);
      toast.success(`${selectedIds.length} notification(s) supprimée(s).`);
      load(notifs.length === selectedIds.length && page > 1 ? page - 1 : page);
      window.dispatchEvent(new CustomEvent('notifications-updated'));
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const deleteAll = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer TOUTES les notifications ?')) return;
    try {
      await notifService.deleteAll();
      toast.success('Toutes les notifications ont été supprimées.');
      load(1);
      window.dispatchEvent(new CustomEvent('notifications-updated'));
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === notifs.length) setSelectedIds([]);
    else setSelectedIds(notifs.map(n => n.id));
  };

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const unread = notifs.filter(n => !n.lu).length;

  return (
    <div className="fade-in" style={{ maxWidth: 680 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unread > 0 ? `${unread} non lue(s)` : 'Tout est lu'}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {notifs.length > 0 && (
            <button className="btn btn-danger" onClick={deleteAll}>
              <Trash2 size={16} /> Tout supprimer
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3, color: 'var(--primary)' }} />
        </div>
      ) : notifs.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Bell size={48} />
            <p>Aucune notification</p>
            <span>Vous recevrez des notifications ici</span>
          </div>
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: '12px 20px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input 
                type="checkbox" 
                checked={notifs.length > 0 && selectedIds.length === notifs.length}
                onChange={toggleSelectAll}
                style={{ cursor: 'pointer', width: 18, height: 18 }}
              />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-700)' }}>
                Tout sélectionner {selectedIds.length > 0 && `(${selectedIds.length})`}
              </span>
            </div>
            {selectedIds.length > 0 && (
              <button className="btn btn-danger btn-sm" onClick={deleteSelected}>
                <Trash2 size={14} /> Supprimer la sélection
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notifs.map(n => {
              const style = TYPE_STYLES[n.type] || TYPE_STYLES.info;
              const isSelected = selectedIds.includes(n.id);
              return (
                <div key={n.id}
                  className={`notif-item ${n.lu ? 'read' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => !n.lu && marquerLue(n.id)}
                  style={{ position: 'relative', paddingLeft: 50, borderLeft: isSelected ? '4px solid var(--danger)' : undefined }}
                >
                  <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={(e) => toggleSelect(n.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ cursor: 'pointer', width: 18, height: 18 }}
                    />
                  </div>
                  <div style={{ fontSize: 22 }}>{style.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-900)' }}>{n.titre}</span>
                      {!n.lu && <div className="notif-dot" />}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.5 }}>{n.message}</p>
                    <span style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 6, display: 'block', fontWeight: 500 }}>
                      {n.created_at ? format(parseISO(n.created_at), 'd MMMM yyyy à HH:mm', { locale: fr }) : '-'}
                    </span>
                  </div>
                  {n.demande_id && (
                    <Link to={`/demandes/${n.demande_id}`}
                      className="btn btn-ghost btn-sm btn-icon"
                      style={{ color: 'var(--primary)' }}
                      title="Voir la demande"
                      onClick={e => e.stopPropagation()}>
                      <ExternalLink size={15} />
                    </Link>
                  )}
                  <button
                    className="btn btn-ghost btn-sm btn-icon btn-delete-notif"
                    title="Supprimer"
                    onClick={(e) => supprimer(n.id, e)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
          {meta && meta.last_page > 1 && (
            <div className="pagination" style={{ marginTop: 8 }}>
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
  );
}
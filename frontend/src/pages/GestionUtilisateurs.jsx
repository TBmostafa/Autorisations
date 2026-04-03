import { useState, useEffect } from 'react';
import { userService, departementService } from '../services/api.js';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Search, ToggleLeft, ToggleRight, Users, Eye, EyeOff } from 'lucide-react';

const ROLES = { employe: 'Employé', manager: 'Manager', admin: 'Admin', rh: 'RH' };
const ROLE_COLORS = { employe: '#059669', manager: '#0284c7', admin: '#7c3aed', rh: '#ea580c' };

const emptyForm = { name: '', email: '', password: '', role: 'employe', departement_id: '', poste: '', telephone: '', is_active: true, manager_id: '' };

export default function GestionUtilisateurs() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'delete'
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [managers, setManagers] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const load = (p = 1) => {
    setLoading(true);
    userService.list({ page: p, search, role: roleFilter })
      .then(res => { setUsers(res.data.data); setMeta(res.data); setPage(p); })
      .catch(() => toast.error('Erreur'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, [search, roleFilter]); 
  useEffect(() => {
    userService.managers().then(res => setManagers(res.data.managers)).catch(() => { });
    departementService.list().then(res => setDepartements(res.data)).catch(() => { });
  }, []);

  const openCreate = () => { setForm(emptyForm); setSelectedUser(null); setModal('create'); };
  const openEdit = (u) => {
    setSelectedUser(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, departement_id: u.departement_id || '', poste: u.poste || '', telephone: u.telephone || '', is_active: u.is_active, manager_id: u.manager_id || '' });
    setModal('edit');
  };
 
  const handleSave = async () => {
    if (!form.name || !form.email || (!selectedUser && !form.password)) {
      toast.error('Remplissez les champs obligatoires.'); return;
    }
    setSaving(true);
    try {
      if (selectedUser) {
        const data = { ...form };
        if (!data.password) delete data.password;
        await userService.update(selectedUser.id, data);
        toast.success('Utilisateur mis à jour.');
      } else {
        await userService.create(form);
        toast.success('Utilisateur créé !');
      }
      setModal(null);
      load(page);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur';
      toast.error(msg);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await userService.delete(selectedUser.id);
      toast.success('Utilisateur supprimé.');
      setModal(null);
      load(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally { setSaving(false); }
  };

  const handleToggle = async (u) => {
    try {
      const res = await userService.toggleActive(u.id);
      toast.success(res.data.message);
      load(page);
    } catch { toast.error('Erreur'); }
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des Utilisateurs</h1>
          <p className="page-subtitle">{meta?.total || 0} utilisateur(s)</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Ajouter un utilisateur
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: 20, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Rechercher par nom ou email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 'auto', minWidth: 140 }}
          value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">Tous les rôles</option>
          <option value="employe">Employé</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
          <option value="rh">RH</option>
        </select>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3, color: 'var(--primary)' }} />
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <Users size={44} />
            <p>Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Département</th>
                    <th>Manager</th>
                    <th>Poste</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                            background: `${ROLE_COLORS[u.role]}20`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, color: ROLE_COLORS[u.role], fontSize: 14,
                          }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--gray-500)' }}>{u.email}</td>
                      <td>
                        <span style={{
                          background: `${ROLE_COLORS[u.role]}18`, color: ROLE_COLORS[u.role],
                          padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                        }}>
                          {ROLES[u.role]}
                        </span>
                      </td>
                      <td style={{ fontSize: 13 }}>{u.departement?.nom || '—'}</td>
                      <td style={{ fontSize: 13 }}>{u.role === 'manager' ? '—' : (u.manager ? u.manager.name : '—')}</td>
                      <td style={{ fontSize: 13 }}>{u.poste || '—'}</td>
                      <td>
                        <span style={{
                          padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                          background: u.is_active ? 'var(--success-bg)' : 'var(--danger-bg)',
                          color: u.is_active ? 'var(--success)' : 'var(--danger)',
                        }}>
                          {u.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-icon btn-sm" title="Modifier" onClick={() => openEdit(u)}>
                            <Edit2 size={15} />
                          </button>
                          <button className="btn btn-ghost btn-icon btn-sm" title={u.is_active ? 'Désactiver' : 'Activer'}
                            style={{ color: u.is_active ? 'var(--warning)' : 'var(--success)' }}
                            onClick={() => handleToggle(u)}>
                            {u.is_active ? <ToggleRight size={17} /> : <ToggleLeft size={17} />}
                          </button>
                          <button className="btn btn-ghost btn-icon btn-sm" title="Supprimer"
                            style={{ color: 'var(--danger)' }}
                            onClick={() => { setSelectedUser(u); setModal('delete'); }}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

      {/* Create/Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{modal === 'create' ? 'Ajouter un utilisateur' : 'Modifier l\'utilisateur'}</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Nom complet *</label>
                  <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Prénom Nom" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@domain.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">{modal === 'edit' ? 'Nouveau mot de passe' : 'Mot de passe *'}</label>
                  <div className="input-wrapper">
                    <input
                      className="form-input form-input-has-icon"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                      placeholder={modal === 'edit' ? 'Laisser vide pour garder' : 'Votre mot de passe'}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Rôle *</label>
                  <select className="form-select" value={form.role} onChange={e => set('role', e.target.value)}>
                    <option value="employe">Employé</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Administrateur</option>
                    <option value="rh">Service RH</option>
                  </select>
                </div>
                {form.role === 'employe' && !form.departement_id && (
                  <div className="form-group" style={{ display: 'none' }}>
                    <label className="form-label">Manager (Responsable)</label>
                    <select className="form-select" value={form.manager_id || ''} onChange={e => set('manager_id', e.target.value)}>
                      <option value="">--Choisir un manager--</option>
                      {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                )}
                {form.role === 'employe' && form.departement_id && (
                  <div className="form-group">
                    <label className="form-label">Manager (Responsable)</label>
                    <div style={{ padding: '10px 12px', background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 8, fontSize: 14, color: 'var(--gray-500)' }}>
                      Défini par le département
                    </div>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Département</label>
                  <select className="form-select" value={form.departement_id} onChange={e => set('departement_id', e.target.value)}>
                    <option value="">--Choisir un département--</option>
                    {departements.map(d => (
                      <option key={d.id} value={d.id}>{d.nom}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Poste</label>
                  <input className="form-input" value={form.poste} onChange={e => set('poste', e.target.value)} placeholder="Ex : Développeur" />
                </div>
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input className="form-input" value={form.telephone} onChange={e => set('telephone', e.target.value)} placeholder="0600000000" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Annuler</button>
              <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
                {saving ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : null}
                {modal === 'create' ? 'Créer' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && selectedUser && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Supprimer l'utilisateur</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--gray-600)' }}>
                Voulez-vous supprimer <strong>{selectedUser.name}</strong> ? Cette action est irréversible.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Annuler</button>
              <button className="btn btn-danger" disabled={saving} onClick={handleDelete}>
                {saving ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : null}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

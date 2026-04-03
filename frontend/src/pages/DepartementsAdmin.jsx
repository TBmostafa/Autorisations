import { useState, useEffect } from 'react';
import { departementService, userService } from '../services/api.js';
import toast from 'react-hot-toast';
import { Building, User, Trash2, Edit2, Plus, X } from 'lucide-react';

export default function DepartementsAdmin() {
  const [departements, setDepartements] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ nom: '', manager_id: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptRes, managerRes] = await Promise.all([
        departementService.list(),
        userService.managers()
      ]);
      setDepartements(deptRes.data);
      setManagers(managerRes.data.managers);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (dept = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({ nom: dept.nom, manager_id: dept.manager_id || '' });
    } else {
      setEditingDept(null);
      setFormData({ nom: '', manager_id: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await departementService.update(editingDept.id, formData);
        toast.success('Département mis à jour');
      } else {
        await departementService.create(formData);
        toast.success('Département créé');
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Une erreur est survenue');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce département ?')) return;
    try {
      await departementService.delete(id);
      toast.success('Département supprimé');
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des Départements</h1>
          <p className="page-subtitle">Gérez les départements et assignez leurs managers responsables.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          <Plus size={18} /> Nouveau Département
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3, color: 'var(--primary)' }} />
        </div>
      ) : departements.length === 0 ? (
        <div className="empty-state">
          <Building size={44} />
          <p>Aucun département trouvé</p>
          <button onClick={() => handleOpenModal()} className="btn btn-outline" style={{ marginTop: 16 }}>
            Créer le premier département
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom du Département</th>
                <th>Manager Responsable</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departements.map(dept => (
                <tr key={dept.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ 
                        width: 40, height: 40, borderRadius: 10, background: 'var(--primary-bg)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
                      }}>
                        <Building size={20} />
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{dept.nom}</span>
                    </div>
                  </td>
                  <td>
                    {dept.manager ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                          {dept.manager.name.charAt(0)}
                        </div>
                        <span style={{ fontSize: 14 }}>{dept.manager.name}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 13, color: 'var(--gray-400)', fontStyle: 'italic' }}>Aucun manager assigné</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <button onClick={() => handleOpenModal(dept)} className="btn-icon" title="Modifier">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(dept.id)} className="btn-icon btn-icon-danger" title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingDept ? 'Modifier Département' : 'Nouveau Département'}</h2>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="form-group">
                  <label className="form-label">Nom du Département *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.nom}
                    onChange={e => setFormData({ ...formData, nom: e.target.value })}
                    required
                    placeholder="Ex: Ressources Humaines"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Manager Responsable</label>
                  <select 
                    className="form-select"
                    value={formData.manager_id}
                    onChange={e => setFormData({ ...formData, manager_id: e.target.value })}
                  >
                    <option value="">Sélectionner un manager (optionnel)</option>
                    {managers.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <p style={{ marginTop: 4, fontSize: 12, color: 'var(--gray-500)' }}>
                    Tous les employés de ce département seront rattachés à ce manager.
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Annuler</button>
                <button type="submit" className="btn btn-primary">
                  {editingDept ? 'Enregistrer les modifications' : 'Créer le département'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

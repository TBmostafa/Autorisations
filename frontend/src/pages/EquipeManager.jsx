import { useState, useEffect } from 'react';
import { userService } from '../services/api.js';
import toast from 'react-hot-toast';
import { Users, Mail, Building, Briefcase, Phone } from 'lucide-react';

export default function EquipeManager() {
  const [equipe, setEquipe] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.equipe()
      .then(res => setEquipe(res.data.equipe))
      .catch(() => toast.error('Erreur lors du chargement de l\'équipe'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mon Équipe</h1>
          <p className="page-subtitle">Liste des employés sous votre responsabilité.</p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3, color: 'var(--primary)' }} />
          </div>
        ) : equipe.length === 0 ? (
          <div className="empty-state">
            <Users size={44} />
            <p>Votre équipe est vide</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Contact</th>
                  <th>Département</th>
                  <th>Poste</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {equipe.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          background: 'var(--primary-bg)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, color: 'var(--primary)', fontSize: 14,
                        }}>
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{u.name}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--gray-600)' }}>
                          <Mail size={13} /> {u.email}
                        </div>
                        {u.telephone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--gray-600)' }}>
                            <Phone size={13} /> {u.telephone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--gray-700)' }}>
                        <Building size={14} /> {u.departement?.nom || u.departement || '—'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--gray-700)' }}>
                        <Briefcase size={14} /> {u.poste || '—'}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                        background: u.is_active ? 'var(--success-bg)' : 'var(--danger-bg)',
                        color: u.is_active ? 'var(--success)' : 'var(--danger)',
                      }}>
                        {u.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

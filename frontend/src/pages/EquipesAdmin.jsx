import { useState, useEffect } from 'react';
import { userService } from '../services/api.js';
import toast from 'react-hot-toast';
import { Users, Building, Mail, ChevronDown, ChevronUp } from 'lucide-react';

export default function EquipesAdmin() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    userService.adminEquipes()
      .then(res => setManagers(res.data.managers))
      .catch(() => toast.error('Erreur lors du chargement des équipes'))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (id) => {
    setExpanded(p => ({ ...p, [id]: !p[id] }));
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Managers et Leurs Équipes</h1>
          <p className="page-subtitle">Consultez la composition de chaque équipe.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3, color: 'var(--primary)' }} />
        </div>
      ) : managers.length === 0 ? (
        <div className="empty-state">
          <Users size={44} />
          <p>Aucun manager trouvé</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {managers.map(m => (
            <div key={m.id} className="card" style={{ overflow: 'hidden' }}>
              {/* Manager Header */}
              <div 
                style={{ 
                  display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '16px 20px', cursor: 'pointer', background: 'var(--gray-50)'
                }}
                onClick={() => toggleExpand(m.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: 'var(--primary-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, color: 'var(--primary)', fontSize: 16,
                  }}>
                    {m.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-800)' }}>
                      Manager : {m.name}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 4 }}>
                      <span style={{ fontSize: 13, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Mail size={14} /> {m.email}
                      </span>
                      {m.departement && (
                        <span style={{ fontSize: 13, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Building size={14} /> {m.departement?.nom || m.departement}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ 
                    background: 'var(--gray-200)', color: 'var(--gray-700)', 
                    padding: '4px 12px', borderRadius: 99, fontSize: 13, fontWeight: 600
                  }}>
                    {m.equipe?.length || 0} membre(s)
                  </span>
                  {expanded[m.id] ? <ChevronUp size={20} color="var(--gray-500)" /> : <ChevronDown size={20} color="var(--gray-500)" />}
                </div>
              </div>

              {/* Team List */}
              {expanded[m.id] && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--gray-100)' }}>
                  <h4 style={{ margin: '16px 0 12px', fontSize: 14, color: 'var(--gray-700)', fontWeight: 600 }}>Équipe :</h4>
                  {m.equipe?.length === 0 ? (
                    <p style={{ fontSize: 14, color: 'var(--gray-500)', fontStyle: 'italic', margin: 0 }}>Aucun employé rattaché à ce manager.</p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {m.equipe.map(emp => (
                        <li key={emp.id} style={{ 
                          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 14px', background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 8 
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 8, background: 'var(--gray-100)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 600, color: 'var(--gray-600)', fontSize: 13,
                            }}>
                              {emp.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--gray-800)' }}>{emp.name}</div>
                              {emp.poste && <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{emp.poste}</div>}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12 }}>
                            <span style={{ color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Mail size={12} /> {emp.email}
                            </span>
                            <span style={{
                              padding: '2px 8px', borderRadius: 6, fontWeight: 600,
                              background: emp.is_active ? 'var(--success-bg)' : 'var(--danger-bg)',
                              color: emp.is_active ? 'var(--success)' : 'var(--danger)',
                            }}>
                              {emp.is_active ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

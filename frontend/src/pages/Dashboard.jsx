import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { demandeService } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Clock, CheckCircle, XCircle, FileText, TrendingUp, Eye,
  Plus, ArrowRight, Users, Search,
} from 'lucide-react';

const TYPE_LABELS = {
  conge: 'Congé',
  autorisation_absence: 'Absence',
  sortie: 'Sortie',
  sortie_urgente: 'Sortie Urgente',
};

const TYPE_COLORS = {
  conge: '#1e4080',
  autorisation_absence: '#f59e0b',
  sortie: '#059669',
  sortie_urgente: '#ef4444',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchActifs, setSearchActifs] = useState('');

  useEffect(() => {
    demandeService.stats()
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const roleLabel = { 
    admin: 'Administrateur', 
    manager: 'Manager', 
    rh: 'Ressources Humaines', 
    employe: 'Employé' 
  };

  const statCards = stats ? [
    { label:'Total', value: stats.stats.total, icon: FileText, color:'#1e4080', bg:'#e0e7ff' },
    { label:'En Attente', value: stats.stats.en_attente, icon: Clock, color:'#d97706', bg:'#fef3c7' },
    { label:'Validées', value: stats.stats.acceptees, icon: CheckCircle, color:'#059669', bg:'#d1fae5' },
    { label:'Refusées', value: stats.stats.refusees, icon: XCircle, color:'#dc2626', bg:'#fee2e2' },
  ] : [];

  const pieData = stats?.par_type?.map(item => ({
    name: TYPE_LABELS[item.type] || item.type,
    value: item.total,
  })) || [];

  const barData = stats?.par_type?.map(item => ({
    name: TYPE_LABELS[item.type] || item.type,
    total: item.total,
  })) || [];

  const PIE_COLORS = ['#1e4080','#f59e0b','#059669','#ef4444','#0284c7','#94a3b8'];

  const LoadingSkeleton = () => (
    <div className="fade-in">
      <div className="skeleton" style={{ height: 100, borderRadius: 16, marginBottom: 24 }} />
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 14 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 28, width: '40%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 13, width: '60%' }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: '20px 24px', height: 250 }}>
          <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 20 }} />
          <div className="skeleton" style={{ height: '70%', width: '100%' }} />
        </div>
        <div className="card" style={{ padding: '20px 24px', height: 250 }}>
          <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 20 }} />
          <div className="skeleton" style={{ height: '70%', width: '100%' }} />
        </div>
      </div>
    </div>
  );

  if (loading) return <LoadingSkeleton />;

  const statutLabel = { 
    en_attente_responsable: 'En Attente Manager', 
    validee_responsable: 'Validée par Manager', 
    refusee_responsable: 'Refusée par Manager', 
    validee_definitivement: 'Validée (Définitive)',
    refusee_rh: 'Refusée par RH'
  };

  return (
    <div className="fade-in">
      {/* Welcome */}
      <div style={{
        background:'linear-gradient(135deg, #1e4080 0%, #2e5fa3 100%)',
        borderRadius:16,padding:'24px 28px',marginBottom:24,
        display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16,
      }}>
        <div>
          <h1 style={{color:'#fff',fontSize:22,fontWeight:800}}>
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{color:'rgba(255,255,255,0.65)',fontSize:14,marginTop:4}}>
            {roleLabel[user?.role]} — {format(new Date(),'EEEE d MMMM yyyy',{locale:fr})}
          </p>
        </div>
        {user?.role === 'employe' && (
          <Link to="/demandes/nouvelle" className="btn" style={{
            background:'#f59e0b',color:'#fff',padding:'10px 20px',fontSize:14,
            boxShadow:'0 4px 14px rgba(245,158,11,0.4)',
          }}>
            <Plus size={16}/> Nouvelle Demande
          </Link>
        )}
      </div>

      {/* Stats cards */}
      <div className="stats-grid" style={{marginBottom:24}}>
        {statCards.map((card, i) => (
          <div key={i} className={`card slide-up delay-${i+1}`} style={{padding:'20px 22px',display:'flex',alignItems:'center',gap:16}}>
            <div style={{
              width:52,height:52,borderRadius:14,
              background:card.bg,
              display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
            }}>
              <card.icon size={24} color={card.color} />
            </div>
            <div>
              <div style={{fontSize:28,fontWeight:800,color:'var(--gray-900)',lineHeight:1}}>{card.value}</div>
              <div style={{fontSize:13,color:'var(--gray-500)',marginTop:3}}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {pieData.length > 0 && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24}}>
          {/* Bar chart */}
          <div className="card" style={{padding:'20px 24px'}}>
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:16,color:'var(--gray-900)'}}>Demandes par Type</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} barSize={28}>
                <XAxis dataKey="name" tick={{fontSize:10,fill:'var(--gray-500)'}} />
                <YAxis allowDecimals={false} tick={{fontSize:11,fill:'var(--gray-500)'}} width={28} />
                <Tooltip
                  contentStyle={{fontFamily:'Plus Jakarta Sans',fontSize:12,borderRadius:8,border:'1px solid var(--gray-200)'}}
                />
                <Bar dataKey="total" fill="#1e4080" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="card" style={{padding:'20px 24px'}}>
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:16,color:'var(--gray-900)'}}>Répartition</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({name,percent})=>`${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{fontFamily:'Plus Jakarta Sans',fontSize:12,borderRadius:8}} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:11}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent demandes */}
      {stats?.recentes?.length > 0 && (
        <div className="card">
          <div style={{padding:'16px 22px',borderBottom:'1px solid var(--gray-100)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <h3 style={{fontSize:15,fontWeight:700,color:'var(--gray-900)'}}>Demandes Récentes</h3>
            <Link to="/demandes" style={{fontSize:13,color:'var(--primary)',fontWeight:600,display:'flex',alignItems:'center',gap:4}}>
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {stats.recentes.map(d => (
                  <tr key={d.id}>
                    <td style={{fontWeight:600}}>{d.employe?.name || '-'}</td>
                    <td>{TYPE_LABELS[d.type] || d.type}</td>
                    <td style={{fontSize:12,fontFamily:'var(--font-mono)',color:'var(--gray-500)'}}>
                      {new Date(d.date_debut).toLocaleDateString('fr-FR', {day:'2-digit',month:'2-digit'})} → {new Date(d.date_fin).toLocaleDateString('fr-FR', {day:'2-digit',month:'2-digit'})}
                    </td>
                    <td>
                      <span className={`badge badge-${d.statut}`}>
                        {statutLabel[d.statut]}
                      </span>
                    </td>
                    <td>
                      <Link to={`/demandes/${d.id}`} className="btn btn-ghost btn-sm btn-icon">
                        <Eye size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!stats?.recentes?.length && !loading && (
        <div className="card">
          <div className="empty-state">
            <FileText size={48} />
            <p>Aucune demande pour le moment</p>
            {user?.role === 'employe' && (
              <Link to="/demandes/nouvelle" className="btn btn-primary" style={{marginTop:8}}>
                <Plus size={16} /> Créer une demande
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Employés fréquents — admin, manager, rh */}
      {['admin','manager','rh'].includes(user?.role) && stats?.employes_frequents?.length > 0 && (
        <div className="card" style={{marginTop: 24}}>
          <div style={{padding:'16px 22px', borderBottom:'1px solid var(--gray-100)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap'}}>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <div style={{width:34, height:34, borderRadius:10, background:'#ede9fe', display:'flex', alignItems:'center', justifyContent:'center'}}>
                <Users size={18} color="#7c3aed" />
              </div>
              <div>
                <h3 style={{fontSize:15, fontWeight:700, color:'var(--gray-900)', margin:0}}>Employés les plus actifs</h3>
                <p style={{fontSize:12, color:'var(--gray-400)', margin:0}}>Top 5 par nombre de demandes soumises</p>
              </div>
            </div>
            {/* Barre de recherche */}
            <div style={{position:'relative', minWidth:200}}>
              <Search size={14} style={{position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)', pointerEvents:'none'}} />
              <input
                type="text"
                placeholder="Rechercher un employé..."
                value={searchActifs}
                onChange={e => setSearchActifs(e.target.value)}
                style={{
                  paddingLeft:30, paddingRight:10, paddingTop:7, paddingBottom:7,
                  border:'1.5px solid var(--gray-200)', borderRadius:8,
                  fontSize:12, outline:'none', width:'100%',
                  fontFamily:'inherit', color:'var(--gray-800)',
                  transition:'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor='#7c3aed'}
                onBlur={e => e.target.style.borderColor='var(--gray-200)'}
              />
            </div>
          </div>
          <div style={{padding:'8px 0'}}>
            {(() => {
              const q = searchActifs.trim().toLowerCase();
              const filtered = q
                ? stats.employes_frequents.filter(item =>
                    item.employe?.name?.toLowerCase().includes(q) ||
                    item.employe?.email?.toLowerCase().includes(q)
                  )
                : stats.employes_frequents;

              if (filtered.length === 0) return (
                <div style={{padding:'28px 22px', textAlign:'center', color:'var(--gray-400)', fontSize:13}}>
                  Aucun employé trouvé pour « {searchActifs} »
                </div>
              );

              return filtered.map((item, i) => {
                const maxTotal = stats.employes_frequents[0]?.total || 1;
                const pct = Math.round((item.total / maxTotal) * 100);
                return (
                  <div key={i} style={{
                    padding:'14px 22px',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--gray-100)' : 'none',
                  }}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
                      <div style={{display:'flex', alignItems:'center', gap:10}}>
                        <div style={{
                          width:32, height:32, borderRadius:8,
                          background:'#ede9fe', color:'#7c3aed',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontWeight:800, fontSize:13, flexShrink:0,
                        }}>
                          {item.employe?.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <div style={{fontWeight:700, fontSize:14, color:'var(--gray-900)'}}>{item.employe?.name ?? '—'}</div>
                          <div style={{fontSize:11, color:'var(--gray-400)'}}>{item.employe?.email ?? ''}</div>
                        </div>
                      </div>
                      <div style={{
                        background:'#ede9fe', color:'#7c3aed',
                        fontWeight:800, fontSize:13,
                        padding:'3px 10px', borderRadius:99,
                      }}>
                        {item.total} demande{item.total > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div style={{height:6, background:'var(--gray-100)', borderRadius:99, marginBottom:8, overflow:'hidden'}}>
                      <div style={{
                        height:'100%', width:`${pct}%`,
                        background:'linear-gradient(90deg, #7c3aed, #a78bfa)',
                        borderRadius:99, transition:'width 0.6s ease',
                      }} />
                    </div>
                    <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
                      {Object.entries(item.par_type).sort((a,b) => b[1]-a[1]).map(([type, count]) => (
                        <span key={type} style={{
                          display:'inline-flex', alignItems:'center', gap:4,
                          padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:600,
                          background: TYPE_COLORS[type] ? `${TYPE_COLORS[type]}18` : '#f1f5f9',
                          color: TYPE_COLORS[type] ?? '#64748b',
                          border: `1px solid ${TYPE_COLORS[type] ? `${TYPE_COLORS[type]}33` : '#e2e8f0'}`,
                        }}>
                          <span style={{width:6, height:6, borderRadius:'50%', background: TYPE_COLORS[type] ?? '#94a3b8', flexShrink:0}} />
                          {TYPE_LABELS[type] ?? type} · {count}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

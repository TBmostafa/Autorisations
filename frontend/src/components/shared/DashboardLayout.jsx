import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { notifService } from '../../services/api.js';
import { ChatProvider } from '../../context/ChatContext.jsx';
import ChatWidget from '../chat/ChatWidget.jsx';
import {
  LayoutDashboard,
  FileText,
  Users,
  Bell,
  User,
  LogOut,
  ClipboardList,
  Menu,
  History,
  Building,
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // PC sidebar collapse فقط
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const fetchCount = () => {
      notifService.nonLues().then((res) => setNotifCount(res.data.count)).catch(() => {});
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);

    // Mettre à jour le compteur quand les notifications changent
    window.addEventListener('notifications-updated', fetchCount);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notifications-updated', fetchCount);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    {
      to: '/dashboard',
      icon: LayoutDashboard,
      label: 'Tableau de bord',
      roles: ['employe', 'manager', 'admin', 'rh'],
    },
    {
      to: '/demandes',
      icon: FileText,
      label: 'Mes Demandes',
      roles: ['employe'],
    },
    {
      to: '/demandes/nouvelle',
      icon: ClipboardList,
      label: 'Nouvelle Demande',
      roles: ['employe'],
    },
    {
      to: '/demandes',
      icon: FileText,
      label: 'Toutes les Demandes',
      roles: ['admin'],
    },
    {
      to: '/manager/demandes',
      icon: ClipboardList,
      label: 'Demandes à Traiter',
      roles: ['manager', 'admin', 'rh'],
    },
    {
      to: '/manager/historique',
      icon: History,
      label: 'Historique',
      roles: ['manager', 'admin', 'rh'],
    },
    
    {
      to: '/admin/utilisateurs',
      icon: Users,
      label: 'Utilisateurs',
      roles: ['admin'],
    },
    {
      to: '/admin/departements',
      icon: Building,
      label: 'Départements',
      roles: ['admin'],
    },
    {
      to: '/notifications',
      icon: Bell,
      label: 'Notifications',
      roles: ['employe', 'manager', 'admin', 'rh'],
    },
    {
      to: '/profil',
      icon: User,
      label: 'Mon Profil',
      roles: ['employe', 'manager', 'admin', 'rh'],
    },
  ].filter((item) => item.roles.includes(user?.role));

  const roleLabel = {
    admin: 'Administrateur',
    manager: 'Manager',
    rh: 'Ressources Humaines',
    employe: 'Employé',
  };

  const roleColor = {
    admin: '#f59e0b',
    manager: '#3b82f6',
    rh: '#8b5cf6', // Violet pour RH
    employe: '#10b981',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <ChatProvider>
    <div
      className="app-layout"
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        background: '#f8fafc',
      }}
    >
      {/* Sidebar */}
      <aside
        className="sidebar"
        style={{
          width: sidebarCollapsed ? 88 : 270,
          transition: 'width 0.3s ease',
          background: '#0f172a',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          overflow: 'hidden',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '24px 20px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: sidebarCollapsed ? 0 : 12,
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 18,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              GA
            </div>

            {!sidebarCollapsed && (
              <div>
                <div
                  style={{
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 14,
                    lineHeight: 1.2,
                  }}
                >
                  Gestion
                </div>
                <div
                  style={{
                    color: 'rgba(255,255,255,0.45)',
                    fontSize: 11,
                  }}
                >
                  Autorisations
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User info */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: sidebarCollapsed ? 0 : 10,
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${roleColor[user?.role]}33, ${roleColor[user?.role]}66)`,
                border: `1.5px solid ${roleColor[user?.role]}55`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: roleColor[user?.role],
                fontWeight: 700,
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {getInitials(user?.name)}
            </div>

            {!sidebarCollapsed && (
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 13,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.name}
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '1px 7px',
                    borderRadius: 99,
                    fontSize: 10,
                    fontWeight: 700,
                    background: `${roleColor[user?.role]}22`,
                    color: roleColor[user?.role],
                    marginTop: 2,
                  }}
                >
                  {roleLabel[user?.role]}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav
          style={{
            padding: '12px',
            flex: 1,
            overflowY: 'auto',
          }}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to + item.label}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title={sidebarCollapsed ? item.label : ''}
              style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
            >
              <item.icon size={18} />
              {!sidebarCollapsed && <span style={{ flex: 1 }}>{item.label}</span>}

              {!sidebarCollapsed &&
                item.label === 'Notifications' &&
                notifCount > 0 && (
                  <span
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 99,
                      minWidth: 18,
                      textAlign: 'center',
                    }}
                  >
                    {notifCount > 99 ? '99+' : notifCount}
                  </span>
                )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div
          style={{
            padding: '12px 0',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            marginTop: 'auto'
          }}
        >
          <button
            onClick={handleLogout}
            title={sidebarCollapsed ? 'Déconnexion' : ''}
            className="sidebar-logout"
            style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
          >
            <LogOut size={17} />
            {!sidebarCollapsed && 'Déconnexion'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div
        className="main-content"
        style={{
          flex: 1,
          minWidth: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <header
          className="top-header"
          style={{
            height: 64,
            background: '#fff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 10,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              <Menu size={20} />
            </button>

            <h1
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                color: '#0f172a',
              }}
            >
              Dashboard
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NavLink
              to="/notifications"
              style={{
                position: 'relative',
                padding: 8,
                borderRadius: 10,
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
              }}
            >
              <Bell size={20} />
              {notifCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '1px 4px',
                    borderRadius: 99,
                    minWidth: 16,
                    textAlign: 'center',
                    lineHeight: '14px',
                  }}
                >
                  {notifCount > 9 ? '9+' : notifCount}
                </span>
              )}
            </NavLink>

            <NavLink
              to="/profil"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 10px',
                borderRadius: 10,
                color: '#334155',
                textDecoration: 'none',
              }}
            >
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#0f172a',
                    lineHeight: 1.2,
                  }}
                >
                  {user?.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#64748b',
                    textTransform: 'capitalize',
                  }}
                >
                  {user?.role}
                </div>
              </div>

              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: roleColor[user?.role] || '#4F46E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                {getInitials(user?.name)}
              </div>
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main
          className="page-content"
          style={{
            flex: 1,
            width: '100%',
            padding: 24,
          }}
        >
          <Outlet />
        </main>
      </div>
      <ChatWidget />
    </div>
    </ChatProvider>
  );
}
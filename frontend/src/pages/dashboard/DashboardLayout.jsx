import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './DashboardLayout.module.css';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Overview', icon: '🏠', exact: true },
  { path: '/dashboard/telemedicine', label: 'Telemedicine', icon: '📹' },
  { path: '/dashboard/disease-management', label: 'Disease Management', icon: '🫀' },
  { path: '/dashboard/maternal-health', label: 'Maternal Health', icon: '🤱' },
  { path: '/dashboard/health-screening', label: 'Health Screening', icon: '🔬' },
  { path: '/dashboard/symptom-checker', label: 'Symptom Checker', icon: '🩺' },
  { path: '/dashboard/ehr', label: 'EHR System', icon: '📋' },
  { path: '/dashboard/rehabilitation', label: 'Rehabilitation', icon: '🧘' },
  { path: '/dashboard/waste-management', label: 'Waste Management', icon: '♻️' },
  { path: '/dashboard/health-literacy', label: 'Health Literacy', icon: '📚' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleBadgeClass = user?.role === 'admin' ? 'badge-warning' :
    user?.role === 'doctor' ? 'badge-primary' : 'badge-success';

  return (
    <div className={styles.layout}>
      {/* Mobile overlay */}
      {mobileOpen && <div className={styles.overlay} onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}>⚕</span>
            {!collapsed && <span className={styles.brandName}>MediCare</span>}
          </div>
          <button className={styles.collapseBtn} onClick={() => setCollapsed(p => !p)}>
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <NavLink to="/dashboard/profile" className={styles.userCard} onClick={() => setMobileOpen(false)}>
            <div className={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
            {!collapsed && (
              <div className={styles.userInfo}>
                <div className={styles.userName}>{user?.name}</div>
                <span className={`badge ${roleBadgeClass}`}>{user?.role}</span>
              </div>
            )}
          </NavLink>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
            🚪{!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setMobileOpen(p => !p)}>☰</button>
          <div className={styles.topbarRight}>
            <span className={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</span>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

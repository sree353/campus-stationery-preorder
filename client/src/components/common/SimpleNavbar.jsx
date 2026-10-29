import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Package, GraduationCap, ShoppingBag, ShieldCheck, LogOut, LogIn, User } from 'lucide-react';

export const SimpleNavbar = () => {
  const { user, quickLogin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  const handleSwitchRole = async (role, path) => {
    await quickLogin(role);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
      className="no-print"
    >
      <div
        style={{
          maxWidth: '1180px',
          margin: '0 auto',
          padding: '0 1rem',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              backgroundColor: '#1e3a8a',
              borderRadius: '8px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Package size={20} />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#0f172a', lineHeight: 1.2 }}>
              BIT CAMPUS STATIONERY & XEROX
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>
              Pre-Ordering & Inventory Management Platform
            </div>
          </div>
        </Link>

        {/* 3 Separate Page Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={() => handleSwitchRole('student', '/student')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              background: currentPath === '/' || currentPath === '/student' ? '#eff6ff' : 'transparent',
              color: currentPath === '/' || currentPath === '/student' ? '#1e3a8a' : '#475569',
              transition: 'all 0.15s',
            }}
          >
            <GraduationCap size={16} /> Student Page
          </button>

          <button
            onClick={() => handleSwitchRole('staff', '/staff')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              background: currentPath.startsWith('/staff') ? '#f0fdfa' : 'transparent',
              color: currentPath.startsWith('/staff') ? '#0f766e' : '#475569',
              transition: 'all 0.15s',
            }}
          >
            <ShoppingBag size={16} /> Staff Page
          </button>

          <button
            onClick={() => handleSwitchRole('admin', '/admin')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              background: currentPath.startsWith('/admin') ? '#f1f5f9' : 'transparent',
              color: currentPath.startsWith('/admin') ? '#0f172a' : '#475569',
              transition: 'all 0.15s',
            }}
          >
            <ShieldCheck size={16} /> Admin Page
          </button>
        </nav>

        {/* User Role & Login / Logout Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '20px',
                  color: '#334155',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <User size={13} color="#64748b" />
                <span>
                  <strong>{user.name?.split(' ')[0] || user.role}</strong>{' '}
                  <span style={{ color: '#64748b', fontSize: '0.7rem' }}>({user.role})</span>
                </span>
              </div>

              <Link
                to="/login"
                style={{
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#2563eb',
                  textDecoration: 'none',
                  background: '#eff6ff',
                  borderRadius: '6px',
                }}
                title="Switch account"
              >
                Switch
              </Link>

              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.3rem',
                }}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                backgroundColor: '#1e3a8a',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: '700',
                textDecoration: 'none',
              }}
            >
              <LogIn size={14} /> Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, ShieldCheck, ShoppingBag, GraduationCap } from 'lucide-react';

export const DemoAccountBanner = () => {
  const { user, quickLogin } = useAuth();

  return (
    <div
      style={{
        backgroundColor: '#1e293b',
        color: '#f8fafc',
        padding: '0.45rem 1rem',
        fontSize: '0.78rem',
        borderBottom: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}
      className="no-print"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span
          style={{
            backgroundColor: '#3b82f6',
            color: '#fff',
            padding: '0.15rem 0.45rem',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: '700',
            letterSpacing: '0.04em',
          }}
        >
          DEMO SWITCHER
        </span>
        <span style={{ color: '#cbd5e1' }}>
          Switch role to test features:
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => quickLogin('student')}
          style={{
            backgroundColor: user?.email === 'student@bit.edu' ? '#2563eb' : '#334155',
            color: '#fff',
            padding: '0.25rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.73rem',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            transition: 'background 0.2s',
          }}
          title="Login as Aarav Sharma (3rd Year CSE)"
        >
          <GraduationCap size={13} />
          Student (Aarav)
        </button>

        <button
          onClick={() => quickLogin('priya')}
          style={{
            backgroundColor: user?.email === 'priya@bit.edu' ? '#2563eb' : '#334155',
            color: '#fff',
            padding: '0.25rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.73rem',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
          title="Login as Priya Sundaram (2nd Year ECE)"
        >
          <GraduationCap size={13} />
          Student (Priya)
        </button>

        <button
          onClick={() => quickLogin('staff')}
          style={{
            backgroundColor: user?.role === 'staff' ? '#d97706' : '#334155',
            color: '#fff',
            padding: '0.25rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.73rem',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
          title="Login as Ramesh Kannan (Stationery Desk Staff)"
        >
          <ShoppingBag size={13} />
          Store Staff (Ramesh)
        </button>

        <button
          onClick={() => quickLogin('admin')}
          style={{
            backgroundColor: user?.role === 'admin' ? '#7c3aed' : '#334155',
            color: '#fff',
            padding: '0.25rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.73rem',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
          title="Login as Dr. K. Balasubramanian (Campus Admin)"
        >
          <ShieldCheck size={13} />
          Admin (Dr. Bala)
        </button>
      </div>

      {user && (
        <div style={{ color: '#94a3b8', fontSize: '0.73rem' }}>
          Active: <strong style={{ color: '#fff' }}>{user.name}</strong> ({user.role.toUpperCase()})
        </div>
      )}
    </div>
  );
};

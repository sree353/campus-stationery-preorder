import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Lock, Mail, GraduationCap, ShoppingBag, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('student'); // 'student' | 'staff' | 'admin'
  const [email, setEmail] = useState('student@bit.edu');
  const [password, setPassword] = useState('student123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // When changing role tabs, prefill corresponding test credentials
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setError('');
    if (role === 'student') {
      setEmail('student@bit.edu');
      setPassword('student123');
    } else if (role === 'staff') {
      setEmail('staff@bit.edu');
      setPassword('staff123');
    } else if (role === 'admin') {
      setEmail('admin@bit.edu');
      setPassword('admin123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await login(email, password);
      const userRole = res.user?.role;
      if (userRole === 'staff') {
        navigate('/staff');
      } else if (userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.25rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '2rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: '#1e3a8a',
              color: '#ffffff',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem',
            }}
          >
            <Package size={24} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Stationery Portal Login
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.3rem' }}>
            Select your campus role or enter credentials to continue
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '0.35rem',
            background: '#f1f5f9',
            padding: '0.3rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
          }}
        >
          <button
            type="button"
            onClick={() => handleSelectRole('student')}
            style={{
              padding: '0.5rem 0.25rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '700',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.2rem',
              background: selectedRole === 'student' ? '#ffffff' : 'transparent',
              color: selectedRole === 'student' ? '#1e3a8a' : '#64748b',
              boxShadow: selectedRole === 'student' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <GraduationCap size={16} />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectRole('staff')}
            style={{
              padding: '0.5rem 0.25rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '700',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.2rem',
              background: selectedRole === 'staff' ? '#ffffff' : 'transparent',
              color: selectedRole === 'staff' ? '#0f766e' : '#64748b',
              boxShadow: selectedRole === 'staff' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <ShoppingBag size={16} />
            <span>Staff</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectRole('admin')}
            style={{
              padding: '0.5rem 0.25rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '700',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.2rem',
              background: selectedRole === 'admin' ? '#ffffff' : 'transparent',
              color: selectedRole === 'admin' ? '#0f172a' : '#64748b',
              boxShadow: selectedRole === 'admin' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <ShieldCheck size={16} />
            <span>Admin</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 0.8rem',
              borderRadius: '6px',
              background: '#fef2f2',
              color: '#991b1b',
              fontSize: '0.8rem',
              marginBottom: '1rem',
              border: '1px solid #fecaca',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.25rem' }}>
              College Email Address:
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.25rem' }}>
              Password:
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.65rem',
              borderRadius: '6px',
              background: selectedRole === 'staff' ? '#0f766e' : selectedRole === 'admin' ? '#0f172a' : '#1e3a8a',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            {loading ? 'Authenticating...' : `Sign In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Demo Credentials hint card */}
        <div
          style={{
            marginTop: '1.25rem',
            padding: '0.75rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: '#475569',
          }}
        >
          <div style={{ fontWeight: '700', color: '#1e293b', marginBottom: '0.2rem' }}>
            Pre-configured Demo Accounts:
          </div>
          <div>• <strong>Student:</strong> student@bit.edu / student123</div>
          <div>• <strong>Staff:</strong> staff@bit.edu / staff123</div>
          <div>• <strong>Admin:</strong> admin@bit.edu / admin123</div>
        </div>

        {/* Student Register link */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: '#64748b' }}>
          New student?{' '}
          <Link to="/register" style={{ color: '#2563eb', fontWeight: '700', textDecoration: 'none' }}>
            Register Student Account
          </Link>
        </div>
      </div>
    </div>
  );
};

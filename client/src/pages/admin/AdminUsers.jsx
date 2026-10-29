import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { RoleBadge } from '../../components/common/Badges';
import { UserModal } from '../../components/admin/UserModal';
import {
  UserPlus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Users,
} from 'lucide-react';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.users.getAllUsers({
        search: search.trim() || undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
      });
      if (res.success) {
        setUsers(res.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user account "${name}"?`)) {
      return;
    }

    try {
      const res = await api.users.deleteUser(id);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete user.');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const newStatus = !user.isActive;
      const res = await api.users.updateUser(user._id, { isActive: newStatus });
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, isActive: newStatus } : u))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle user status.');
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-dark)' }}>
            Campus User Accounts Management
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage student registrations, store staff members, and platform administrators
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedUser(null);
            setUserModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <UserPlus size={16} /> Create User Account
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <form onSubmit={handleSearchSubmit} style={{ flex: '1 1 280px', display: 'flex', gap: '0.5rem' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                placeholder="Search user by name, email, roll number..."
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">
              Search
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-muted)' }}>Role:</span>
            <select
              className="form-select"
              style={{ width: 'auto', fontSize: '0.8125rem' }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="student">Students</option>
              <option value="staff">Store Staff</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          <button onClick={fetchUsers} className="btn btn-outline btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email</th>
              <th>Assigned Role</th>
              <th>Roll Number</th>
              <th>Department / Unit</th>
              <th>Account Status</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No campus users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div style={{ fontWeight: '700' }}>{u.name}</div>
                    {u.phone && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.phone}</div>}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                  <td>
                    <RoleBadge role={u.role} />
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {u.rollNumber || '—'}
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>{u.department}</td>
                  <td>
                    <button
                      onClick={() => handleToggleActive(u)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: u.isActive ? '#059669' : '#dc2626',
                        backgroundColor: u.isActive ? '#ecfdf5' : '#fef2f2',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        border: `1px solid ${u.isActive ? '#a7f3d0' : '#fecaca'}`,
                      }}
                      title="Click to toggle Active status"
                    >
                      {u.isActive ? <CheckCircle size={13} /> : <XCircle size={13} />}
                      {u.isActive ? 'Active' : 'Suspended'}
                    </button>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setUserModalOpen(true);
                        }}
                        className="btn btn-outline btn-sm"
                        title="Edit user"
                      >
                        <Edit size={14} /> Edit
                      </button>

                      <button
                        onClick={() => handleDelete(u._id, u.name)}
                        className="btn btn-danger btn-sm"
                        style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}
                        title="Delete user"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UserModal
        isOpen={userModalOpen}
        user={selectedUser}
        onClose={() => {
          setUserModalOpen(false);
          setSelectedUser(null);
        }}
        onSaved={() => {
          fetchUsers();
        }}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { X, UserPlus, UserCheck } from 'lucide-react';

export const UserModal = ({ user, isOpen, onClose, onSaved }) => {
  if (!isOpen) return null;

  const isEditing = !!user;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    rollNumber: '',
    department: 'Computer Science & Engineering',
    year: '1st Year',
    phone: '',
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'student',
        rollNumber: user.rollNumber || '',
        department: user.department || 'Computer Science & Engineering',
        year: user.year || '1st Year',
        phone: user.phone || '',
        isActive: user.isActive !== undefined ? user.isActive : true,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: 'password123',
        role: 'student',
        rollNumber: '',
        department: 'Computer Science & Engineering',
        year: '1st Year',
        phone: '',
        isActive: true,
      });
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      let res;
      if (isEditing) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        res = await api.users.updateUser(user._id || user.id, payload);
      } else {
        res = await api.users.createUser(formData);
      }

      if (res.success) {
        onSaved(res.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to save user account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isEditing ? <UserCheck size={20} color="var(--primary)" /> : <UserPlus size={20} color="var(--primary)" />}
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800' }}>
              {isEditing ? `Edit User: ${user.name}` : 'Create New User Account'}
            </h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {error && (
              <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', fontSize: '0.8rem', padding: '0.5rem', borderRadius: '4px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  disabled={isEditing}
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  {isEditing ? 'New Password (leave blank to keep)' : 'Password *'}
                </label>
                <input
                  type="password"
                  name="password"
                  required={!isEditing}
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={isEditing ? 'Leave blank to preserve' : 'Min 6 characters'}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Role Assignment *</label>
                <select
                  name="role"
                  className="form-select"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="student">Student</option>
                  <option value="staff">Store Staff</option>
                  <option value="admin">Campus Administrator</option>
                </select>
              </div>
            </div>

            {formData.role === 'student' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Roll Number</label>
                  <input
                    type="text"
                    name="rollNumber"
                    className="form-input"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    placeholder="e.g. 23BITCSE045"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Academic Year</label>
                  <select
                    name="year"
                    className="form-select"
                    value={formData.year}
                    onChange={handleChange}
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="Final Year">Final Year</option>
                  </select>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Department</label>
                <input
                  type="text"
                  name="department"
                  className="form-input"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone Contact</label>
                <input
                  type="text"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91..."
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                style={{ width: '16px', height: '16px' }}
              />
              <label htmlFor="isActive" style={{ fontSize: '0.8125rem', fontWeight: '600' }}>
                Active Account Status (Permit login and campus store operations)
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

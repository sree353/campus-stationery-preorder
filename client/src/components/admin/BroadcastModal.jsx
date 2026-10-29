import React, { useState } from 'react';
import { api } from '../../services/api';
import { X, Send, Megaphone } from 'lucide-react';

export const BroadcastModal = ({ isOpen, onClose, onSent }) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !message) {
      setError('Please provide title and announcement message.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.notifications.broadcast({
        title,
        message,
        targetRole,
      });

      if (res.success) {
        onSent && onSent(res.notification);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to dispatch broadcast notice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Megaphone size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Broadcast Campus Store Announcement</h3>
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

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Target Audience</label>
              <select
                className="form-select"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              >
                <option value="all">All Campus Users (Students + Staff)</option>
                <option value="student">Students Only</option>
                <option value="staff">Store Staff Only</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Announcement Title *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Lab Record Notebooks Restocked for 3rd Year"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Message Content *</label>
              <textarea
                required
                rows="3"
                className="form-textarea"
                placeholder="Enter detailed message for campus students..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Send size={15} /> {loading ? 'Broadcasting...' : 'Broadcast Notice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

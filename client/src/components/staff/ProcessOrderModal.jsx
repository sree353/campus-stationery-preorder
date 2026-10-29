import React, { useState } from 'react';
import { api } from '../../services/api';
import { OrderStatusBadge } from '../common/Badges';
import { X, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export const ProcessOrderModal = ({ order, isOpen, onClose, onUpdated }) => {
  if (!isOpen || !order) return null;

  const [status, setStatus] = useState(order.status);
  const [staffNotes, setStaffNotes] = useState(order.staffNotes || '');
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus || 'UNPAID');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const res = await api.orders.updateOrderStatus(order._id, {
        status,
        staffNotes,
        paymentStatus,
      });

      if (res.success) {
        onUpdated(res.order);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to update order status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800' }}>
              Process Pre-Order #{order.orderNumber}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Update workflow stage and store counter notes
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  color: '#991b1b',
                  fontSize: '0.8rem',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {error}
              </div>
            )}

            {/* Student Card */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                fontSize: '0.8125rem',
              }}
            >
              <div style={{ fontWeight: '700', marginBottom: '0.35rem' }}>
                Student: {order.studentDetails?.name} ({order.studentDetails?.rollNumber || 'No Roll No'})
              </div>
              <div style={{ color: 'var(--text-muted)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                <div>Dept: {order.studentDetails?.department}</div>
                <div>Pickup: <strong>{new Date(order.pickupDate).toLocaleDateString()}</strong></div>
                <div style={{ gridColumn: 'span 2' }}>Slot: <strong>{order.pickupTimeSlot}</strong></div>
              </div>
              {order.studentNotes && (
                <div style={{ marginTop: '0.35rem', color: 'var(--primary)', fontStyle: 'italic' }}>
                  Note from student: "{order.studentNotes}"
                </div>
              )}
            </div>

            {/* Items List */}
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                Ordered Items ({order.items?.length})
              </div>
              <div
                style={{
                  maxHeight: '120px',
                  overflowY: 'auto',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem',
                  fontSize: '0.8rem',
                  backgroundColor: '#ffffff',
                }}
              >
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.3rem 0',
                      borderBottom: '1px solid var(--border-light)',
                    }}
                  >
                    <span>
                      {item.name} <strong style={{ color: 'var(--primary)' }}>x{item.quantity}</strong>
                    </span>
                    <span style={{ fontWeight: '700' }}>₹{item.subtotal}</span>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'right', marginTop: '0.35rem', fontWeight: '800', color: 'var(--primary-dark)' }}>
                Total: ₹{order.totalAmount}
              </div>
            </div>

            {/* Status Selector */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Update Workflow Stage</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value="PENDING">PENDING (Awaiting Verification)</option>
                <option value="CONFIRMED">CONFIRMED (Accepted by Store Desk)</option>
                <option value="PREPARING">PREPARING (Packaging Items for Counter)</option>
                <option value="READY_FOR_PICKUP">READY FOR PICKUP (Waiting at Counter Desk #02)</option>
                <option value="COMPLETED">COMPLETED (Handed Over to Student)</option>
                <option value="CANCELLED">CANCELLED (Restore Stock)</option>
              </select>
              {status === 'CANCELLED' && (
                <span className="form-hint" style={{ color: 'var(--danger)' }}>
                  ⚠️ Cancelling this order will automatically restore reserved stock to inventory!
                </span>
              )}
            </div>

            {/* Payment Status */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Payment Collection Status</label>
              <select
                className="form-select"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
              >
                <option value="PENDING">Pending (Collect ₹{order.totalAmount} at Store Counter)</option>
                <option value="PAID">Paid (Cash / Campus UPI Received)</option>
                <option value="PAID_AT_COUNTER">Paid at Counter (Verified)</option>
                <option value="UNPAID">Pending (Unpaid)</option>
              </select>
            </div>

            {/* Staff Remarks */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Staff Notes / Counter Slot Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Packed in Counter Shelf A-4; verified student ID card"
                value={staffNotes}
                onChange={(e) => setStaffNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Pre-Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

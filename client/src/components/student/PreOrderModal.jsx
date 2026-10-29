import React, { useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import confetti from 'canvas-confetti';
import { Calendar, Clock, AlertCircle, CheckCircle2, X } from 'lucide-react';

export const PreOrderModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();

  // Tomorrow's date formatted as YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const [pickupDate, setPickupDate] = useState(minDate);
  const [pickupTimeSlot, setPickupTimeSlot] = useState('Lunch Break (12:45 PM - 01:45 PM)');
  const [studentNotes, setStudentNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (cartItems.length === 0) {
      setError('Cart is empty.');
      return;
    }

    if (!pickupDate) {
      setError('Please select a pickup date.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        items: cartItems.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
          name: item.product.name,
        })),
        pickupDate,
        pickupTimeSlot,
        studentNotes,
      };

      const res = await api.orders.createOrder(payload);

      if (res.success && res.order) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        clearCart();
        onSuccess(res.order);
      }
    } catch (err) {
      setError(err.message || 'Failed to place pre-order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary-dark)' }}>
              Confirm Campus Pre-Order
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Schedule your counter pickup at the BIT Stationery Store
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#991b1b',
                  fontSize: '0.8125rem',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Student Details Verification */}
            <div
              style={{
                backgroundColor: 'var(--primary-50)',
                border: '1px solid var(--primary-100)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                fontSize: '0.8125rem',
              }}
            >
              <div style={{ fontWeight: '700', color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>
                Student Identification
              </div>
              <div style={{ color: 'var(--text-main)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                <div>Name: <strong>{user?.name}</strong></div>
                <div>Roll No: <strong>{user?.rollNumber || 'N/A'}</strong></div>
                <div>Dept: <strong>{user?.department}</strong></div>
                <div>Year: <strong>{user?.year}</strong></div>
              </div>
            </div>

            {/* Order Items Preview */}
            <div>
              <label className="form-label">Pre-Order Summary ({cartItems.length} items)</label>
              <div
                style={{
                  maxHeight: '130px',
                  overflowY: 'auto',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#f8fafc',
                  fontSize: '0.8125rem',
                }}
              >
                {cartItems.map((item) => (
                  <div
                    key={item.product._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.35rem 0',
                      borderBottom: '1px solid var(--border-light)',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: '600' }}>{item.product.name}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.35rem' }}>
                        x{item.quantity}
                      </span>
                    </div>
                    <span style={{ fontWeight: '700' }}>
                      ₹{item.product.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '0.5rem',
                  padding: '0 0.25rem',
                  fontWeight: '800',
                  fontSize: '1rem',
                  color: 'var(--primary-dark)',
                }}
              >
                <span>Total Amount Due at Counter:</span>
                <span>₹{cartTotal}</span>
              </div>
            </div>

            {/* Pickup Date Selection */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={15} color="var(--primary)" /> Scheduled Pickup Date
              </label>
              <input
                type="date"
                min={minDate}
                className="form-input"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                required
              />
              <span className="form-hint">
                Store opens Mon-Sat during campus academic hours.
              </span>
            </div>

            {/* Pickup Time Slot */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={15} color="var(--primary)" /> Store Counter Pickup Slot
              </label>
              <select
                className="form-select"
                value={pickupTimeSlot}
                onChange={(e) => setPickupTimeSlot(e.target.value)}
                required
              >
                <option value="Morning Slot (08:30 AM - 09:15 AM)">Morning Slot (08:30 AM - 09:15 AM)</option>
                <option value="Mid-Morning Slot (10:45 AM - 11:15 AM)">Mid-Morning Slot (10:45 AM - 11:15 AM)</option>
                <option value="Lunch Break (12:45 PM - 01:45 PM)">Lunch Break (12:45 PM - 01:45 PM)</option>
                <option value="Afternoon Slot (03:15 PM - 03:45 PM)">Afternoon Slot (03:15 PM - 03:45 PM)</option>
                <option value="Evening Post-Class (04:30 PM - 05:45 PM)">Evening Post-Class (04:30 PM - 05:45 PM)</option>
              </select>
            </div>

            {/* Student Remarks / Notes */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Special Notes / Requests (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Please hold if class extends; pack in paper bag"
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
              />
            </div>

            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                backgroundColor: '#f1f5f9',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              💡 <strong>Payment Policy:</strong> No online payment required! Present this pre-order confirmation at the stationery counter during your slot and pay via Cash or Campus UPI upon handover.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting Reservation...' : 'Confirm Pre-Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

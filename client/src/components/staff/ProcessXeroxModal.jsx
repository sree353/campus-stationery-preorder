import React, { useState } from 'react';
import { api } from '../../services/api';
import { XeroxStatusBadge, PaymentBadge } from '../common/Badges';
import {
  X,
  Printer,
  FileText,
  Download,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  DollarSign,
  Layers,
} from 'lucide-react';

export const ProcessXeroxModal = ({ order, isOpen, onClose, onUpdated }) => {
  if (!isOpen || !order) return null;

  const [status, setStatus] = useState(order.status || 'PENDING');
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus || 'PENDING');
  const [staffNotes, setStaffNotes] = useState(order.staffNotes || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const statuses = [
    { value: 'PENDING', label: 'Pending Review' },
    { value: 'ACCEPTED', label: 'Accepted & Queued' },
    { value: 'PRINTING', label: 'Actively Printing' },
    { value: 'READY_FOR_PICKUP', label: 'Ready for Pickup' },
    { value: 'COMPLETED', label: 'Completed (Handed Over)' },
    { value: 'CANCELLED', label: 'Cancelled / Rejected' },
  ];

  // Open PDF in new tab
  const handleViewPdf = async () => {
    try {
      const blobUrl = await api.xerox.viewDocumentBlobUrl(order._id);
      window.open(blobUrl, '_blank');
    } catch (err) {
      alert('Failed to open document: ' + err.message);
    }
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    try {
      await api.xerox.downloadDocument(order._id, order.file?.originalName);
    } catch (err) {
      alert('Failed to download document: ' + err.message);
    }
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');

      const res = await api.xerox.updateStatus(order._id, {
        status,
        staffNotes,
        paymentStatus,
      });

      if (res.success) {
        onUpdated();
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to update order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: '#0f766e',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Printer size={16} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                Process Xerox Pre-Order #{order.orderNumber}
              </h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
              Review print preferences, access secure student PDF, and update stage workflow.
            </p>
          </div>
          <button onClick={onClose} style={{ color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem' }}>
          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                marginBottom: '1rem',
              }}
            >
              {error}
            </div>
          )}

          {/* Student & Schedule Summary Card */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '1rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0.85rem',
              marginBottom: '1.25rem',
              fontSize: '0.8rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                Student Details
              </div>
              <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>
                {order.studentDetails?.name}
              </div>
              <div style={{ color: '#475569' }}>
                Roll: <strong>{order.studentDetails?.rollNumber || 'N/A'}</strong> ({order.studentDetails?.department})
              </div>
              <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Phone: {order.studentDetails?.phone || 'N/A'}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                Scheduled Pickup Slot
              </div>
              <div style={{ fontWeight: '800', color: '#1e3a8a' }}>
                {new Date(order.pickupDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  weekday: 'short',
                })}
              </div>
              <div style={{ color: '#2563eb', fontSize: '0.75rem', fontWeight: '600' }}>
                {order.pickupTimeSlot}
              </div>
            </div>
          </div>

          {/* Uploaded PDF Action Box */}
          <div
            style={{
              border: '1px solid #bfdbfe',
              backgroundColor: '#eff6ff',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <FileText size={28} color="#2563eb" />
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#1e3a8a' }}>
                  {order.file?.originalName}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {(order.file?.fileSize / 1024 / 1024).toFixed(2)} MB • {order.file?.detectedPages} original page(s)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={handleViewPdf}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #2563eb',
                  color: '#2563eb',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <ExternalLink size={13} /> View / Print PDF
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: '#2563eb',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Download size={13} /> Download
              </button>
            </div>
          </div>

          {/* Print Preferences Specifications */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              marginBottom: '1.25rem',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#ffffff' }}>
              <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>Color & Sides</div>
              <div style={{ fontWeight: '700', color: order.printConfig?.colorMode === 'COLOUR' ? '#ec4899' : '#0f172a' }}>
                {order.printConfig?.colorMode === 'COLOUR' ? 'Full Colour' : 'Black & White'}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.72rem' }}>
                {order.printConfig?.printSides === 'DOUBLE' ? 'Double-Sided' : 'Single-Sided'}
              </div>
            </div>

            <div style={{ padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#ffffff' }}>
              <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>Pages & Copies</div>
              <div style={{ fontWeight: '800', color: '#0f172a' }}>
                {order.printConfig?.calculatedPages} pages × {order.printConfig?.copies} copy/copies
              </div>
              <div style={{ color: '#64748b', fontSize: '0.72rem' }}>
                Range: {order.printConfig?.customPageRange || 'All'}
              </div>
            </div>

            <div style={{ padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#ffffff' }}>
              <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>Finishing & Due</div>
              <div style={{ fontWeight: '700', color: '#0f172a' }}>
                {order.printConfig?.binding?.replace(/_/g, ' ') || 'None'}
              </div>
              <div style={{ color: '#16a34a', fontWeight: '800', fontSize: '0.85rem' }}>
                Total: ₹{order.totalAmount}
              </div>
            </div>
          </div>

          {order.studentNotes && (
            <div
              style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: '6px',
                padding: '0.6rem 0.85rem',
                fontSize: '0.78rem',
                color: '#92400e',
                marginBottom: '1.25rem',
              }}
            >
              <strong>Student Instructions:</strong> "{order.studentNotes}"
            </div>
          )}

          {/* Workflow Status Selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
              Update Xerox Workflow Stage
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
              }}
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status Selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
              Counter Payment Status (Amount: ₹{order.totalAmount})
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid',
                  borderColor: paymentStatus === 'PENDING' ? '#f59e0b' : '#cbd5e1',
                  backgroundColor: paymentStatus === 'PENDING' ? '#fffbeb' : '#ffffff',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                }}
              >
                <input
                  type="radio"
                  name="xeroxPayment"
                  checked={paymentStatus === 'PENDING'}
                  onChange={() => setPaymentStatus('PENDING')}
                />
                <span>Pending (Unpaid)</span>
              </label>

              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid',
                  borderColor: paymentStatus === 'PAID' ? '#10b981' : '#cbd5e1',
                  backgroundColor: paymentStatus === 'PAID' ? '#ecfdf5' : '#ffffff',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  color: paymentStatus === 'PAID' ? '#047857' : '#334155',
                }}
              >
                <input
                  type="radio"
                  name="xeroxPayment"
                  checked={paymentStatus === 'PAID'}
                  onChange={() => setPaymentStatus('PAID')}
                />
                <span>Paid (Cash / UPI Received)</span>
              </label>
            </div>
          </div>

          {/* Staff Remarks */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
              Staff Remarks / Printing Machine Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Printed on Ricoh Duplicator #01, placed in tray 4"
              value={staffNotes}
              onChange={(e) => setStaffNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                fontSize: '0.82rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
              }}
            />
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#0f766e',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <CheckCircle size={15} />
              {submitting ? 'Updating Order...' : 'Update Xerox Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

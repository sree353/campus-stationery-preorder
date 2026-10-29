import React from 'react';
import { OrderStatusBadge } from '../common/Badges';
import { Printer, X, CheckCircle, Clock, MapPin } from 'lucide-react';

export const OrderSlipModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header no-print">
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--primary-dark)' }}>
              Campus Pre-Order Token & Slip
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Order Reference #{order.orderNumber}
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Printable Area */}
        <div className="printable-slip" style={{ padding: '1.75rem', backgroundColor: '#ffffff' }}>
          {/* Institutional Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
              BIT CAMPUS STATIONERY STORE
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '600' }}>
              Official Student Supply Pre-Order Reservation Slip
            </p>
            <div style={{ display: 'inline-block', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.2rem 0.6rem', borderRadius: '4px', marginTop: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: '700' }}>
              TOKEN #{order.orderNumber}
            </div>
          </div>

          {/* Pickup Banner */}
          <div
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: '#1e40af', fontWeight: '700', textTransform: 'uppercase' }}>
                Pickup Schedule
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1e3a8a' }}>
                {new Date(order.pickupDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: '600' }}>
                {order.pickupTimeSlot}
              </div>
            </div>
            <div>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>

          {/* Student & Store Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              fontSize: '0.8rem',
              marginBottom: '1.25rem',
              padding: '0.75rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div>
              <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>Student Details</div>
              <div style={{ fontWeight: '700', color: '#0f172a' }}>{order.studentDetails?.name}</div>
              <div>Roll: <strong>{order.studentDetails?.rollNumber || 'N/A'}</strong></div>
              <div>Dept: {order.studentDetails?.department}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>Store Counter</div>
              <div style={{ fontWeight: '700', color: '#0f172a' }}>Amenities Block Desk #02</div>
              <div>Payment: <strong>Pay at Counter</strong></div>
              <div>Status: {order.paymentStatus || 'UNPAID'}</div>
            </div>
          </div>

          {/* Itemized Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '0.4rem 0' }}>Code</th>
                <th style={{ padding: '0.4rem 0' }}>Item Description</th>
                <th style={{ padding: '0.4rem 0', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '0.4rem 0', textAlign: 'right' }}>Price</th>
                <th style={{ padding: '0.4rem 0', textAlign: 'right' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.5rem 0', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#475569' }}>
                    {item.itemCode}
                  </td>
                  <td style={{ padding: '0.5rem 0', fontWeight: '600' }}>{item.name}</td>
                  <td style={{ padding: '0.5rem 0', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>₹{item.price}</td>
                  <td style={{ padding: '0.5rem 0', textAlign: 'right', fontWeight: '700' }}>₹{item.subtotal}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #0f172a' }}>
                <td colSpan={4} style={{ padding: '0.75rem 0', fontWeight: '800', fontSize: '0.95rem' }}>
                  Total Amount Due:
                </td>
                <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: '800', fontSize: '1.1rem', color: '#1e3a8a' }}>
                  ₹{order.totalAmount}
                </td>
              </tr>
            </tfoot>
          </table>

          {order.studentNotes && (
            <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '1rem', fontStyle: 'italic' }}>
              Student Note: "{order.studentNotes}"
            </div>
          )}

          {/* Signatures & Instructions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              paddingTop: '1.5rem',
              borderTop: '1px dashed #cbd5e1',
              fontSize: '0.72rem',
              color: '#64748b',
            }}
          >
            <div>
              <p>• Show this slip or digital token on phone at Desk #02.</p>
              <p>• Stock is reserved automatically upon submission.</p>
            </div>
            <div style={{ textAlign: 'center', minWidth: '140px' }}>
              <div style={{ borderBottom: '1px solid #94a3b8', height: '24px', marginBottom: '4px' }}></div>
              <span>Store Officer Stamp / Initial</span>
            </div>
          </div>
        </div>

        <div className="modal-footer no-print">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          <button type="button" onClick={handlePrint} className="btn btn-primary">
            <Printer size={16} /> Print Slip
          </button>
        </div>
      </div>
    </div>
  );
};

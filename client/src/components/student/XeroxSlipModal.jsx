import React from 'react';
import { XeroxStatusBadge, PaymentBadge } from '../common/Badges';
import { Printer, X, FileText, CheckCircle, Clock, MapPin, Download } from 'lucide-react';
import { api } from '../../services/api';

export const XeroxSlipModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    api.xerox.downloadDocument(order._id, order.file?.originalName);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '620px' }}>
        <div className="modal-header no-print">
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--primary-dark)' }}>
              Campus Xerox Pickup Token & Slip
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Pre-Order Reference #{order.orderNumber}
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
              BIT CAMPUS REPROGRAPHIC & XEROX STORE
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '600' }}>
              Official Student Document Photocopy & Print Reservation Slip
            </p>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                padding: '0.25rem 0.75rem',
                borderRadius: '6px',
                marginTop: '0.4rem',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                fontWeight: '800',
                color: '#1e3a8a',
              }}
            >
              TOKEN #{order.orderNumber}
            </div>
          </div>

          {/* Pickup Banner */}
          <div
            style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: '700', textTransform: 'uppercase' }}>
                Counter Pickup Schedule
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#14532d' }}>
                {new Date(order.pickupDate).toLocaleDateString(undefined, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: '600' }}>
                {order.pickupTimeSlot}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
              <XeroxStatusBadge status={order.status} />
              <PaymentBadge status={order.paymentStatus} />
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
              <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>
                Student Identification
              </div>
              <div style={{ fontWeight: '700', color: '#0f172a' }}>{order.studentDetails?.name}</div>
              <div>Roll No: <strong>{order.studentDetails?.rollNumber || 'N/A'}</strong></div>
              <div>Dept: {order.studentDetails?.department}</div>
              <div>Phone: {order.studentDetails?.phone || 'N/A'}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>
                Store Counter
              </div>
              <div style={{ fontWeight: '700', color: '#0f172a' }}>Amenities Block Desk #02</div>
              <div>Section: <strong>Digital Xerox & Printing</strong></div>
              <div>Payment Mode: <strong>Cash / UPI at Counter</strong></div>
              <div>Amount Due: <strong style={{ color: '#1e3a8a', fontSize: '0.95rem' }}>₹{order.totalAmount}</strong></div>
            </div>
          </div>

          {/* Document & Print Specs */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: '700',
                color: '#334155',
                textTransform: 'uppercase',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '0.35rem',
                marginBottom: '0.5rem',
              }}
            >
              Document & Print Specifications
            </div>
            <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.35rem 0', color: '#64748b' }}>Uploaded File:</td>
                  <td style={{ padding: '0.35rem 0', fontWeight: '700', color: '#0f172a' }}>
                    {order.file?.originalName}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.35rem 0', color: '#64748b' }}>Pages Printed:</td>
                  <td style={{ padding: '0.35rem 0', fontWeight: '600' }}>
                    {order.printConfig?.calculatedPages} page(s) per copy (Range: {order.printConfig?.customPageRange || 'All'})
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.35rem 0', color: '#64748b' }}>Number of Copies:</td>
                  <td style={{ padding: '0.35rem 0', fontWeight: '700' }}>
                    {order.printConfig?.copies} copy/copies
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.35rem 0', color: '#64748b' }}>Color & Format:</td>
                  <td style={{ padding: '0.35rem 0', fontWeight: '600' }}>
                    {order.printConfig?.colorMode === 'COLOUR' ? 'Full Colour' : 'Black & White'} •{' '}
                    {order.printConfig?.printSides === 'DOUBLE' ? 'Double-Sided (Back-to-Back)' : 'Single-Sided'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.35rem 0', color: '#64748b' }}>Binding / Finishing:</td>
                  <td style={{ padding: '0.35rem 0', fontWeight: '600' }}>
                    {order.printConfig?.binding?.replace(/_/g, ' ') || 'None'}
                  </td>
                </tr>
                {order.studentNotes && (
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.35rem 0', color: '#64748b' }}>Student Notes:</td>
                    <td style={{ padding: '0.35rem 0', fontStyle: 'italic', color: '#334155' }}>
                      "{order.studentNotes}"
                    </td>
                  </tr>
                )}
                {order.staffNotes && (
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.35rem 0', color: '#64748b' }}>Staff Remarks:</td>
                    <td style={{ padding: '0.35rem 0', fontWeight: '600', color: '#0f766e' }}>
                      {order.staffNotes}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Total & Verification Block */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              backgroundColor: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '8px',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>
                Total Payment at Counter
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e3a8a' }}>
                ₹{order.totalAmount?.toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>
              <div>Pay via Cash or Campus UPI</div>
              <div>Collect directly at Desk #02</div>
            </div>
          </div>

          {/* Signatures Footer */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #e2e8f0',
              fontSize: '0.75rem',
              color: '#475569',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ borderBottom: '1px dotted #94a3b8', height: '24px', marginBottom: '0.4rem' }}></div>
              <div>Student Signature upon Collection</div>
            </div>
            <div>
              <div style={{ borderBottom: '1px dotted #94a3b8', height: '24px', marginBottom: '0.4rem' }}></div>
              <div>Store Officer / Cashier Seal</div>
            </div>
          </div>
        </div>

        {/* Modal Controls */}
        <div
          className="modal-footer no-print"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <button
            onClick={handleDownloadPdf}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Download size={14} /> Download Uploaded PDF
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#1e3a8a',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Printer size={15} /> Print Reservation Slip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

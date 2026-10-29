import React from 'react';

export const RoleBadge = ({ role }) => {
  const styles = {
    student: {
      bg: '#e0f2fe',
      color: '#0369a1',
      border: '#bae6fd',
      label: 'Student',
    },
    staff: {
      bg: '#fef3c7',
      color: '#b45309',
      border: '#fde68a',
      label: 'Store Staff',
    },
    admin: {
      bg: '#f3e8ff',
      color: '#6b21a8',
      border: '#e9d5ff',
      label: 'Campus Admin',
    },
  };

  const current = styles[role] || {
    bg: '#f1f5f9',
    color: '#475569',
    border: '#cbd5e1',
    label: role,
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.55rem',
        borderRadius: '9999px',
        fontSize: '0.72rem',
        fontWeight: '700',
        backgroundColor: current.bg,
        color: current.color,
        border: `1px solid ${current.border}`,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      {current.label}
    </span>
  );
};

export const StockBadge = ({ status, quantity, threshold }) => {
  if (status === 'Out of Stock' || quantity <= 0) {
    return (
      <span className="badge badge-out-of-stock">
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
        Out of Stock
      </span>
    );
  }

  if (status === 'Low Stock' || (threshold && quantity <= threshold)) {
    return (
      <span className="badge badge-low-stock">
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
        Low Stock ({quantity} left)
      </span>
    );
  }

  return (
    <span className="badge badge-in-stock">
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
      In Stock ({quantity})
    </span>
  );
};

export const OrderStatusBadge = ({ status }) => {
  const map = {
    PENDING: { className: 'badge-pending', label: 'Pending Verification' },
    CONFIRMED: { className: 'badge-confirmed', label: 'Confirmed' },
    PREPARING: { className: 'badge-confirmed', label: 'Preparing Items' },
    READY_FOR_PICKUP: { className: 'badge-ready', label: 'Ready for Pickup' },
    COMPLETED: { className: 'badge-completed', label: 'Completed' },
    CANCELLED: { className: 'badge-cancelled', label: 'Cancelled' },
  };

  const item = map[status] || { className: 'badge-pending', label: status };

  return <span className={`badge ${item.className}`}>{item.label}</span>;
};

export const XeroxStatusBadge = ({ status }) => {
  const styles = {
    PENDING: { bg: '#fef3c7', color: '#b45309', border: '#fde68a', label: 'Pending' },
    ACCEPTED: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: 'Accepted' },
    PRINTING: { bg: '#ecfeff', color: '#0e7490', border: '#a5f3fc', label: 'Printing' },
    READY_FOR_PICKUP: { bg: '#f3e8ff', color: '#7e22ce', border: '#e9d5ff', label: 'Ready for Pickup' },
    COMPLETED: { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0', label: 'Completed' },
    CANCELLED: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', label: 'Cancelled' },
  };

  const item = styles[status] || styles.PENDING;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.22rem 0.6rem',
        borderRadius: '9999px',
        fontSize: '0.72rem',
        fontWeight: '700',
        backgroundColor: item.bg,
        color: item.color,
        border: `1px solid ${item.border}`,
        letterSpacing: '0.02em',
      }}
    >
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: item.color }}></span>
      {item.label}
    </span>
  );
};

export const PaymentBadge = ({ status }) => {
  const isPaid = status === 'PAID' || status === 'PAID_AT_COUNTER';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.2rem 0.55rem',
        borderRadius: '6px',
        fontSize: '0.72rem',
        fontWeight: '700',
        backgroundColor: isPaid ? '#ecfdf5' : '#fffbeb',
        color: isPaid ? '#047857' : '#b45309',
        border: `1px solid ${isPaid ? '#a7f3d0' : '#fde68a'}`,
      }}
    >
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isPaid ? '#10b981' : '#f59e0b' }}></span>
      Payment: {isPaid ? 'Paid' : 'Pending'}
    </span>
  );
};


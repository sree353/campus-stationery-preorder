import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { OrderStatusBadge } from '../../components/common/Badges';
import { OrderSlipModal } from '../../components/student/OrderSlipModal';
import {
  FileText,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Printer,
  ChevronRight,
  Package,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [slipModalOpen, setSlipModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  const [cancellingId, setCancellingId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.orders.getMyOrders();
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this pending pre-order? Your reserved stationery will be returned to store stock.')) {
      return;
    }

    try {
      setCancellingId(orderId);
      const res = await api.orders.cancelMyOrder(orderId);
      if (res.success) {
        setActionMessage('Pre-order cancelled successfully. Reserved stock returned.');
        fetchOrders();
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'ALL') return true;
    return o.status === activeTab;
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-dark)' }}>
            My Stationery Pre-Orders
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Track counter verification, pickup times, and official digital tokens
          </p>
        </div>

        <Link to="/" className="btn btn-outline btn-sm">
          + Place New Pre-Order
        </Link>
      </div>

      {actionMessage && (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
          }}
        >
          {actionMessage}
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border)',
          marginBottom: '1.5rem',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}
      >
        {['ALL', 'PENDING', 'CONFIRMED', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.5rem 0.85rem',
              fontWeight: '700',
              fontSize: '0.8rem',
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.replace(/_/g, ' ')}
            <span
              style={{
                marginLeft: '0.35rem',
                backgroundColor: activeTab === tab ? 'var(--primary-50)' : '#f1f5f9',
                color: activeTab === tab ? 'var(--primary)' : '#64748b',
                padding: '0.1rem 0.4rem',
                borderRadius: '999px',
                fontSize: '0.7rem',
              }}
            >
              {tab === 'ALL' ? orders.length : orders.filter((o) => o.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          Loading your order history...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
          }}
        >
          <Package size={44} style={{ opacity: 0.35, margin: '0 auto 1rem', color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            No pre-orders found in this view
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {activeTab === 'ALL'
              ? "You haven't placed any stationery pre-orders yet."
              : `You have no pre-orders with status "${activeTab.replace(/_/g, ' ')}".`}
          </p>
          <Link to="/" className="btn btn-primary">
            Browse Stationery Catalog
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredOrders.map((order) => {
            const isPending = order.status === 'PENDING';
            const isReady = order.status === 'READY_FOR_PICKUP';
            return (
              <div
                key={order._id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    borderBottom: '1px solid var(--border-light)',
                    paddingBottom: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', fontSize: '1.05rem', color: 'var(--primary-dark)' }}>
                        {order.orderNumber}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setSlipModalOpen(true);
                      }}
                      className="btn btn-outline btn-sm"
                      title="View printable official pre-order token slip"
                    >
                      <Printer size={15} /> View Pre-Order Slip
                    </button>

                    {isPending && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={cancellingId === order._id}
                        className="btn btn-danger btn-sm"
                        style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}
                      >
                        {cancellingId === order._id ? 'Cancelling...' : 'Cancel Pre-Order'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Pickup Alert Callout if READY */}
                {isReady && (
                  <div
                    style={{
                      backgroundColor: 'var(--purple-50)',
                      border: '1px solid #ddd6fe',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 1rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'var(--purple-text)',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                    }}
                  >
                    <CheckCircle2 size={18} color="#7c3aed" />
                    <span>Your order is packed and ready! Present Token #{order.orderNumber} at Store Desk #02.</span>
                  </div>
                )}

                {/* Pickup details & Items */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1rem' }}>
                  {/* Left: Pickup info */}
                  <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem' }}>
                    <div style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
                      Pickup Schedule
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                      <Calendar size={15} color="var(--primary)" />
                      <span>Date: <strong>{new Date(order.pickupDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                      <Clock size={15} color="var(--primary)" />
                      <span>Slot: <strong>{order.pickupTimeSlot}</strong></span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      Payment: <strong>{order.paymentStatus === 'PAID_AT_COUNTER' ? 'Paid at Desk' : 'Pay at Counter'}</strong>
                    </div>
                    {order.staffNotes && (
                      <div style={{ marginTop: '0.5rem', color: '#1e40af', backgroundColor: '#eff6ff', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                        Store Staff Note: "{order.staffNotes}"
                      </div>
                    )}
                  </div>

                  {/* Right: Items preview */}
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                      Items ({order.items.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.8125rem',
                            padding: '0.25rem 0',
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontWeight: '800', fontSize: '0.95rem' }}>
                      <span>Total Amount:</span>
                      <span style={{ color: 'var(--primary-dark)', fontSize: '1.1rem' }}>₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Status Timeline */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Activity History
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {order.statusHistory?.map((hist, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></span>
                        <strong>{hist.status}</strong> on {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(hist.timestamp).toLocaleDateString()})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slip Modal */}
      {selectedOrder && (
        <OrderSlipModal
          isOpen={slipModalOpen}
          order={selectedOrder}
          onClose={() => {
            setSlipModalOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

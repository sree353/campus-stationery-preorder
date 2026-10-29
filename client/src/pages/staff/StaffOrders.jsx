import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { OrderStatusBadge } from '../../components/common/Badges';
import { ProcessOrderModal } from '../../components/staff/ProcessOrderModal';
import { OrderSlipModal } from '../../components/student/OrderSlipModal';
import { Search, Filter, Printer, RefreshCw, Eye, CheckCircle } from 'lucide-react';

export const StaffOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pickupDate, setPickupDate] = useState('');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [slipModalOpen, setSlipModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.orders.getAllOrders({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        pickupDate: pickupDate || undefined,
      });

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
  }, [statusFilter, pickupDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-dark)' }}>
            Store Counter Pre-Orders Queue
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Process incoming student pre-orders, confirm reservations, and verify counter pickups
          </p>
        </div>

        <button onClick={fetchOrders} className="btn btn-outline btn-sm">
          <RefreshCw size={14} /> Refresh Queue
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
          {/* Search */}
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
                placeholder="Search by order token, roll no, student name..."
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

          {/* Status Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-muted)' }}>Status:</span>
            <select
              className="form-select"
              style={{ width: 'auto', fontSize: '0.8125rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="READY_FOR_PICKUP">READY FOR PICKUP</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Pickup Date filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-muted)' }}>Pickup Date:</span>
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto', fontSize: '0.8125rem', padding: '0.4rem 0.6rem' }}
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
            />
          </div>

          {(search || statusFilter !== 'ALL' || pickupDate) && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setPickupDate('');
              }}
              style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '600' }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order Token</th>
              <th>Student Details</th>
              <th>Scheduled Pickup</th>
              <th>Items Reserved</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading pre-orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No orders match the filter criteria.
                </td>
              </tr>
            ) : (
              orders.map((ord) => (
                <tr key={ord._id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--primary-dark)' }}>
                    {ord.orderNumber}
                  </td>
                  <td>
                    <div style={{ fontWeight: '700' }}>{ord.studentDetails?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Roll: {ord.studentDetails?.rollNumber || ord.student?.rollNumber || 'N/A'} • {ord.studentDetails?.department}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: '600' }}>{new Date(ord.pickupDate).toLocaleDateString()}</div>
                    <div style={{ color: 'var(--primary)', fontSize: '0.72rem', fontWeight: '600' }}>
                      {ord.pickupTimeSlot}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                      {ord.items.length} items ({ord.items.reduce((acc, i) => acc + i.quantity, 0)} units)
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: '800', fontSize: '0.95rem' }}>₹{ord.totalAmount}</span>
                  </td>
                  <td>
                    <OrderStatusBadge status={ord.status} />
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        color: ord.paymentStatus === 'PAID_AT_COUNTER' ? '#059669' : '#d97706',
                        backgroundColor: ord.paymentStatus === 'PAID_AT_COUNTER' ? '#ecfdf5' : '#fffbeb',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                      }}
                    >
                      {ord.paymentStatus === 'PAID_AT_COUNTER' ? 'PAID AT DESK' : 'UNPAID'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setProcessModalOpen(true);
                        }}
                        className="btn btn-primary btn-sm"
                        title="Process status"
                      >
                        Process
                      </button>

                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setSlipModalOpen(true);
                        }}
                        className="btn btn-outline btn-sm"
                        title="Print order slip"
                      >
                        <Printer size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Process Order Modal */}
      {selectedOrder && (
        <ProcessOrderModal
          isOpen={processModalOpen}
          order={selectedOrder}
          onClose={() => {
            setProcessModalOpen(false);
            setSelectedOrder(null);
          }}
          onUpdated={() => {
            fetchOrders();
          }}
        />
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

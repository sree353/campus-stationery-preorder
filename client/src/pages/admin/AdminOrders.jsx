import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { OrderStatusBadge } from '../../components/common/Badges';
import { ProcessOrderModal } from '../../components/staff/ProcessOrderModal';
import { OrderSlipModal } from '../../components/student/OrderSlipModal';
import { Search, Printer, RefreshCw } from 'lucide-react';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [slipModalOpen, setSlipModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.orders.getAllOrders({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
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
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-dark)' }}>
            All Campus Pre-Orders (Admin Oversight)
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Supervisory view of all student reservations across departments
          </p>
        </div>

        <button onClick={fetchOrders} className="btn btn-outline btn-sm">
          <RefreshCw size={14} /> Refresh
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
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order Token</th>
              <th>Student</th>
              <th>Roll Number</th>
              <th>Department</th>
              <th>Pickup Slot</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((ord) => (
                <tr key={ord._id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--primary-dark)' }}>
                    {ord.orderNumber}
                  </td>
                  <td style={{ fontWeight: '700' }}>{ord.studentDetails?.name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {ord.studentDetails?.rollNumber || ord.student?.rollNumber || 'N/A'}
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>{ord.studentDetails?.department}</td>
                  <td style={{ fontSize: '0.8rem' }}>
                    <div>{new Date(ord.pickupDate).toLocaleDateString()}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{ord.pickupTimeSlot}</div>
                  </td>
                  <td>{ord.items.length} items</td>
                  <td style={{ fontWeight: '800' }}>₹{ord.totalAmount}</td>
                  <td>
                    <OrderStatusBadge status={ord.status} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setProcessModalOpen(true);
                        }}
                        className="btn btn-outline btn-sm"
                      >
                        Manage
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setSlipModalOpen(true);
                        }}
                        className="btn btn-outline btn-sm"
                        title="Print slip"
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

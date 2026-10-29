import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { OrderStatusBadge, StockBadge } from '../../components/common/Badges';
import { ProcessOrderModal } from '../../components/staff/ProcessOrderModal';
import { RestockModal } from '../../components/staff/RestockModal';
import { BroadcastModal } from '../../components/admin/BroadcastModal';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Megaphone,
  PackagePlus,
  RefreshCw,
} from 'lucide-react';

export const StaffDashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [processModalOpen, setProcessModalOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [restockModalOpen, setRestockModalOpen] = useState(false);

  const [broadcastOpen, setBroadcastOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, invRes] = await Promise.all([
        api.analytics.getDashboardStats(),
        api.orders.getAllOrders({ limit: 10 }),
        api.inventory.getInventoryOverview({ status: 'Low Stock' }),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (ordersRes.success) setOrders(ordersRes.orders || []);
      if (invRes.success) setLowStockItems(invRes.items || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const counts = stats?.counts || {};

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-dark)' }}>
            Stationery Store Desk Dashboard
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time counter fulfillment queue and stock management operations
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button onClick={loadData} className="btn btn-outline btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setBroadcastOpen(true)} className="btn btn-secondary btn-sm">
            <Megaphone size={14} /> Send Announcement
          </button>
          <Link to="/staff/orders" className="btn btn-primary btn-sm">
            Full Orders Queue →
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* Pending Orders */}
        <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#92400e', textTransform: 'uppercase' }}>
              Pending Verification
            </span>
            <Clock size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#78350f', margin: '0.5rem 0' }}>
            {counts.pendingOrders || 0}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Pre-orders awaiting packing & desk approval
          </p>
        </div>

        {/* Ready for pickup */}
        <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#5b21b6', textTransform: 'uppercase' }}>
              Ready for Pickup
            </span>
            <CheckCircle size={18} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#4c1d95', margin: '0.5rem 0' }}>
            {counts.readyOrders || 0}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Packed & waiting in store pickup bay
          </p>
        </div>

        {/* Low Stock Items */}
        <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#b91c1c', textTransform: 'uppercase' }}>
              Low / Out of Stock
            </span>
            <AlertTriangle size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#991b1b', margin: '0.5rem 0' }}>
            {(counts.lowStockCount || 0) + (counts.outOfStockCount || 0)}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {counts.lowStockCount || 0} low stock • {counts.outOfStockCount || 0} out of stock
          </p>
        </div>

        {/* Completed Handed Over */}
        <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#065f46', textTransform: 'uppercase' }}>
              Completed Handed Over
            </span>
            <Package size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#064e3b', margin: '0.5rem 0' }}>
            {counts.completedOrders || 0}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Total revenue collected: ₹{counts.totalCompletedRevenue || 0}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '2rem' }}>
        {/* Recent Pre-Orders Queue */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800' }}>Active Pre-Orders Queue</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Verify incoming student pre-orders and advance status
              </p>
            </div>
            <Link to="/staff/orders" style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '700' }}>
              View All ({counts.totalOrders || 0}) →
            </Link>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order Token</th>
                  <th>Student</th>
                  <th>Pickup Slot</th>
                  <th>Items / Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No recent pre-orders in queue
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 6).map((ord) => (
                    <tr key={ord._id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '0.8rem' }}>
                        {ord.orderNumber}
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', fontSize: '0.8125rem' }}>{ord.studentDetails?.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {ord.studentDetails?.rollNumber || ord.student?.rollNumber || 'No Roll No'}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.78rem' }}>
                        <div>{new Date(ord.pickupDate).toLocaleDateString()}</div>
                        <div style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.72rem' }}>{ord.pickupTimeSlot}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: '700' }}>₹{ord.totalAmount}</span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ord.items.length} items</div>
                      </td>
                      <td>
                        <OrderStatusBadge status={ord.status} />
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setProcessModalOpen(true);
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          Process
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts & Quick Restock */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={18} color="#ef4444" /> Low-Stock Restock Alerts
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Products at or below configured minimum inventory threshold
              </p>
            </div>
            <Link to="/staff/inventory" style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '700' }}>
              Full Inventory →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {lowStockItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f0fdf4', borderRadius: '8px', color: '#166534' }}>
                <CheckCircle size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.8 }} />
                <p style={{ fontWeight: '700', fontSize: '0.85rem' }}>All stock levels are healthy!</p>
                <p style={{ fontSize: '0.75rem' }}>No products currently below minimum thresholds.</p>
              </div>
            ) : (
              lowStockItems.slice(0, 5).map((item) => (
                <div
                  key={item._id}
                  style={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '2px' }}>
                      Code: <strong>{item.itemCode}</strong> • Current: <strong style={{ color: '#b91c1c' }}>{item.stockQuantity}</strong> (Threshold: {item.minStockThreshold})
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProduct(item);
                      setRestockModalOpen(true);
                    }}
                    className="btn btn-sm"
                    style={{ backgroundColor: '#f59e0b', color: '#ffffff' }}
                  >
                    <PackagePlus size={14} /> Quick Restock
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
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
            loadData();
          }}
        />
      )}

      {/* Restock Modal */}
      {selectedProduct && (
        <RestockModal
          isOpen={restockModalOpen}
          product={selectedProduct}
          onClose={() => {
            setRestockModalOpen(false);
            setSelectedProduct(null);
          }}
          onRestocked={() => {
            loadData();
          }}
        />
      )}

      {/* Announcement Broadcast Modal */}
      <BroadcastModal
        isOpen={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        onSent={() => alert('Announcement sent successfully!')}
      />
    </div>
  );
};

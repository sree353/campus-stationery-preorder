import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { OrderSlipModal } from '../components/student/OrderSlipModal';
import { XeroxSlipModal } from '../components/student/XeroxSlipModal';
import { ProcessOrderModal } from '../components/staff/ProcessOrderModal';
import { ProcessXeroxModal } from '../components/staff/ProcessXeroxModal';
import { OrderStatusBadge, XeroxStatusBadge, PaymentBadge, StockBadge } from '../components/common/Badges';
import {
  Package,
  Search,
  CheckCircle,
  Clock,
  Printer,
  RefreshCw,
  Plus,
  AlertTriangle,
  ArrowRight,
  Filter,
  FileText,
  Download,
  ExternalLink,
  DollarSign,
  Layers,
  Sparkles,
} from 'lucide-react';

export const StaffSimplePage = () => {
  const { user, quickLogin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [xeroxOrders, setXeroxOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'xerox' | 'stock'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [selectedOrderForProcess, setSelectedOrderForProcess] = useState(null);
  const [selectedXeroxForProcess, setSelectedXeroxForProcess] = useState(null);
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState(null);
  const [selectedXeroxForSlip, setSelectedXeroxForSlip] = useState(null);

  // Ensure user is logged in as staff for seamless experience
  useEffect(() => {
    if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
      quickLogin('staff').catch(() => {});
    }
  }, [user]);

  // Load orders
  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.orders.getAllOrders();
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load Xerox orders
  const loadXeroxOrders = async () => {
    try {
      const res = await api.xerox.getAllOrders();
      if (res.success) {
        setXeroxOrders(res.orders || []);
      }
    } catch (err) {
      console.error('Failed to load Xerox requests:', err);
    }
  };

  // Load inventory
  const loadInventory = async () => {
    try {
      const res = await api.inventory.getInventoryOverview();
      if (res.success) {
        setInventory(res.items || []);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'staff' || user.role === 'admin')) {
      loadOrders();
      loadXeroxOrders();
      loadInventory();
    }
  }, [user]);

  // Quick stationery order status transition
  const handleQuickStationeryStatus = async (orderId, newStatus) => {
    try {
      const res = await api.orders.updateOrderStatus(orderId, {
        status: newStatus,
        paymentStatus: newStatus === 'COMPLETED' ? 'PAID' : undefined,
      });
      if (res.success) {
        loadOrders();
        loadInventory();
      }
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  // Quick mark payment as paid
  const handleMarkStationeryPaid = async (orderId) => {
    try {
      const res = await api.orders.updatePayment(orderId, {
        paymentStatus: 'PAID',
        paymentMethod: 'Cash / UPI Received at Desk',
      });
      if (res.success) {
        loadOrders();
      }
    } catch (err) {
      alert(err.message || 'Failed to update payment status');
    }
  };

  // Quick Xerox status transition
  const handleQuickXeroxStatus = async (xeroxId, newStatus) => {
    try {
      const res = await api.xerox.updateStatus(xeroxId, {
        status: newStatus,
        paymentStatus: newStatus === 'COMPLETED' ? 'PAID' : undefined,
      });
      if (res.success) {
        loadXeroxOrders();
      }
    } catch (err) {
      alert(err.message || 'Failed to update Xerox status');
    }
  };

  // Quick mark Xerox payment as paid
  const handleMarkXeroxPaid = async (xeroxId) => {
    try {
      const res = await api.xerox.updatePayment(xeroxId, {
        paymentStatus: 'PAID',
        paymentMethod: 'Cash / UPI Received at Desk',
      });
      if (res.success) {
        loadXeroxOrders();
      }
    } catch (err) {
      alert(err.message || 'Failed to update payment status');
    }
  };

  // Quick Restock
  const handleQuickRestock = async (productId, units) => {
    try {
      const res = await api.inventory.quickRestock({
        productId,
        quantityAdded: units,
        reason: 'Staff Counter Quick Restock',
      });
      if (res.success) {
        loadInventory();
      }
    } catch (err) {
      alert(err.message || 'Restock failed');
    }
  };

  // Filtered Stationery orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesSearch =
      search === '' ||
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.studentDetails?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.studentDetails?.rollNumber?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filtered Xerox orders
  const filteredXeroxOrders = xeroxOrders.filter((xo) => {
    const matchesStatus = statusFilter === 'ALL' || xo.status === statusFilter;
    const matchesSearch =
      search === '' ||
      xo.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      xo.studentDetails?.name?.toLowerCase().includes(search.toLowerCase()) ||
      xo.studentDetails?.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
      xo.file?.originalName?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Metric counts
  const pendingStationeryCount = orders.filter((o) => o.status === 'PENDING').length;
  const pendingXeroxCount = xeroxOrders.filter((xo) => xo.status === 'PENDING').length;
  const readyStationeryCount = orders.filter((o) => o.status === 'READY_FOR_PICKUP').length;
  const readyXeroxCount = xeroxOrders.filter((xo) => xo.status === 'READY_FOR_PICKUP').length;
  const lowStockCount = inventory.filter((i) => i.stockQuantity <= i.minStockThreshold).length;

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '1.75rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 12px rgba(15, 118, 110, 0.15)',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255,255,255,0.2)',
              padding: '0.2rem 0.6rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
            }}
          >
            <Package size={13} color="#99f6e4" /> STORE STAFF FULFILLMENT DESK
          </div>
          <h1 style={{ fontSize: '1.55rem', fontWeight: '800', margin: 0 }}>
            Counter Orders & Xerox Processing
          </h1>
          <p style={{ margin: '0.35rem 0 0', opacity: 0.9, fontSize: '0.85rem' }}>
            Verify student pickup tokens, print Xerox documents, confirm counter payments, and manage physical inventory.
          </p>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(0,0,0,0.25)', padding: '0.3rem', borderRadius: '10px' }}>
          <button
            onClick={() => {
              setActiveTab('orders');
              setStatusFilter('ALL');
            }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'orders' ? '#ffffff' : 'transparent',
              color: activeTab === 'orders' ? '#0f766e' : '#ffffff',
              transition: 'all 0.15s',
            }}
          >
            Stationery Queue ({orders.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('xerox');
              setStatusFilter('ALL');
            }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'xerox' ? '#ffffff' : 'transparent',
              color: activeTab === 'xerox' ? '#0f766e' : '#ffffff',
              transition: 'all 0.15s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Printer size={15} /> Xerox Requests ({xeroxOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('stock')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'stock' ? '#ffffff' : 'transparent',
              color: activeTab === 'stock' ? '#0f766e' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s',
            }}
          >
            Inventory Stock {lowStockCount > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '10px' }}>
                {lowStockCount} Low
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
            Pending Stationery
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f59e0b', marginTop: '0.2rem' }}>
            {pendingStationeryCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Awaiting desk verification</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
            Pending Xerox Requests
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#06b6d4', marginTop: '0.2rem' }}>
            {pendingXeroxCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Queued for printing</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
            Ready for Pickup
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#8b5cf6', marginTop: '0.2rem' }}>
            {readyStationeryCount + readyXeroxCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            {readyStationeryCount} items + {readyXeroxCount} printouts
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
            Low Stock Alerts
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: lowStockCount > 0 ? '#ef4444' : '#10b981', marginTop: '0.2rem' }}>
            {lowStockCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Items below minimum threshold</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STATIONERY ORDERS QUEUE */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div>
          {/* Controls Filter Bar */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              marginBottom: '1rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
              <Search size={18} color="#64748b" />
              <input
                type="text"
                placeholder="Search token #, student name, roll number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '0.85rem', width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '0.45rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.8rem',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PREPARING">PREPARING</option>
                <option value="READY_FOR_PICKUP">READY FOR PICKUP</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>

              <button
                onClick={loadOrders}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
          </div>

          {/* Orders List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <RefreshCw size={24} className="spinning" style={{ margin: '0 auto 0.5rem' }} />
              <div>Loading stationery orders queue...</div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: '700', fontSize: '1rem', color: '#0f172a' }}>No orders found in queue</div>
              <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                Try switching the status filter or clearing your search.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredOrders.map((ord) => (
                <div
                  key={ord._id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '0.95rem', color: '#1e3a8a' }}>
                        #{ord.orderNumber}
                      </span>
                      <OrderStatusBadge status={ord.status} />
                      <PaymentBadge status={ord.paymentStatus} />
                    </div>

                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                      {ord.studentDetails?.name}{' '}
                      <span style={{ color: '#64748b', fontWeight: '400', fontSize: '0.78rem' }}>
                        (Roll: {ord.studentDetails?.rollNumber || 'N/A'}, {ord.studentDetails?.department})
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.2rem' }}>
                      Pickup: <strong>{new Date(ord.pickupDate).toLocaleDateString()}</strong> ({ord.pickupTimeSlot})
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      {ord.items?.map((it) => `${it.name} (×${it.quantity})`).join(', ')}
                    </div>
                  </div>

                  {/* Actions Block */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right', marginRight: '0.5rem' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Due Amount</div>
                      <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>₹{ord.totalAmount}</div>
                    </div>

                    {/* Mark Payment as Paid */}
                    {ord.paymentStatus !== 'PAID' && ord.paymentStatus !== 'PAID_AT_COUNTER' && (
                      <button
                        onClick={() => handleMarkStationeryPaid(ord._id)}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: '6px',
                          backgroundColor: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          color: '#047857',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        ✓ Mark Paid
                      </button>
                    )}

                    {/* Quick stage transition buttons */}
                    {ord.status === 'PENDING' && (
                      <button
                        onClick={() => handleQuickStationeryStatus(ord._id, 'CONFIRMED')}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: '6px',
                          backgroundColor: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          color: '#1d4ed8',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        Confirm
                      </button>
                    )}

                    {ord.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleQuickStationeryStatus(ord._id, 'PREPARING')}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: '6px',
                          backgroundColor: '#f0fdfa',
                          border: '1px solid #99f6e4',
                          color: '#0f766e',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        Start Prep
                      </button>
                    )}

                    {(ord.status === 'CONFIRMED' || ord.status === 'PREPARING') && (
                      <button
                        onClick={() => handleQuickStationeryStatus(ord._id, 'READY_FOR_PICKUP')}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: '6px',
                          backgroundColor: '#f3e8ff',
                          border: '1px solid #e9d5ff',
                          color: '#7e22ce',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        Ready for Pickup
                      </button>
                    )}

                    {ord.status === 'READY_FOR_PICKUP' && (
                      <button
                        onClick={() => handleQuickStationeryStatus(ord._id, 'COMPLETED')}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: '6px',
                          backgroundColor: '#10b981',
                          border: 'none',
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        Complete Handover
                      </button>
                    )}

                    {/* Modal Process button */}
                    <button
                      onClick={() => setSelectedOrderForProcess(ord)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      Process Order
                    </button>

                    {/* Token Slip */}
                    <button
                      onClick={() => setSelectedOrderForSlip(ord)}
                      style={{
                        padding: '0.4rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#f8fafc',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                      title="Print Official Slip"
                    >
                      <Printer size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: XEROX PRINT REQUESTS QUEUE */}
      {/* ========================================================================= */}
      {activeTab === 'xerox' && (
        <div>
          {/* Controls Filter Bar */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              marginBottom: '1rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
              <Search size={18} color="#64748b" />
              <input
                type="text"
                placeholder="Search Xerox token #, student name, roll #, PDF title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '0.85rem', width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '0.45rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.8rem',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="ALL">All Xerox Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="PRINTING">PRINTING</option>
                <option value="READY_FOR_PICKUP">READY FOR PICKUP</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>

              <button
                onClick={loadXeroxOrders}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
          </div>

          {/* Xerox Orders List */}
          {filteredXeroxOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <Printer size={36} color="#94a3b8" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontWeight: '700', fontSize: '1rem', color: '#0f172a' }}>No Xerox requests in queue</div>
              <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                When students submit PDF documents for photocopy, they appear here for processing and printing.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredXeroxOrders.map((xord) => (
                <div
                  key={xord._id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '0.95rem', color: '#1e3a8a' }}>
                        #{xord.orderNumber}
                      </span>
                      <XeroxStatusBadge status={xord.status} />
                      <PaymentBadge status={xord.paymentStatus} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.2rem 0' }}>
                      <FileText size={16} color="#2563eb" />
                      <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>
                        {xord.file?.originalName}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        ({xord.file?.detectedPages} pgs • {(xord.file?.fileSize / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#334155' }}>
                      Student: <strong>{xord.studentDetails?.name}</strong> (Roll: {xord.studentDetails?.rollNumber || 'N/A'}, {xord.studentDetails?.department})
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.2rem' }}>
                      <strong>Print Options:</strong>{' '}
                      <span style={{ color: xord.printConfig?.colorMode === 'COLOUR' ? '#ec4899' : '#0f172a', fontWeight: '700' }}>
                        {xord.printConfig?.colorMode === 'COLOUR' ? 'Full Colour' : 'B&W'}
                      </span>{' '}
                      • {xord.printConfig?.printSides === 'DOUBLE' ? 'Double-Sided' : 'Single-Sided'} •{' '}
                      {xord.printConfig?.calculatedPages} pages × {xord.printConfig?.copies} copy/copies •{' '}
                      Binding: {xord.printConfig?.binding?.replace(/_/g, ' ') || 'None'}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Pickup: <strong>{new Date(xord.pickupDate).toLocaleDateString()}</strong> ({xord.pickupTimeSlot})
                    </div>
                  </div>

                  {/* Actions Block */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right', marginRight: '0.5rem' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Charges</div>
                      <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#1e3a8a' }}>₹{xord.totalAmount}</div>
                    </div>

                    {/* View / Download PDF buttons */}
                    <button
                      onClick={async () => {
                        try {
                          const url = await api.xerox.viewDocumentBlobUrl(xord._id);
                          window.open(url, '_blank');
                        } catch (err) {
                          alert(err.message);
                        }
                      }}
                      style={{
                        padding: '0.4rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        color: '#2563eb',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                      title="View PDF Document"
                    >
                      <ExternalLink size={13} /> View PDF
                    </button>

                    <button
                      onClick={() => api.xerox.downloadDocument(xord._id, xord.file?.originalName)}
                      style={{
                        padding: '0.4rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        color: '#334155',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                      title="Download PDF"
                    >
                      <Download size={13} />
                    </button>

                    {/* Mark Xerox Payment as Paid */}
                    {xord.paymentStatus !== 'PAID' && (
                      <button
                        onClick={() => handleMarkXeroxPaid(xord._id)}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: '6px',
                          backgroundColor: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          color: '#047857',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        ✓ Mark Paid
                      </button>
                    )}

                    {/* Quick stage transition */}
                    {xord.status === 'PENDING' && (
                      <button
                        onClick={() => handleQuickXeroxStatus(xord._id, 'ACCEPTED')}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: '6px',
                          backgroundColor: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          color: '#1d4ed8',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        Accept
                      </button>
                    )}

                    {xord.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleQuickXeroxStatus(xord._id, 'PRINTING')}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: '6px',
                          backgroundColor: '#ecfeff',
                          border: '1px solid #a5f3fc',
                          color: '#0e7490',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        Start Printing
                      </button>
                    )}

                    {(xord.status === 'ACCEPTED' || xord.status === 'PRINTING') && (
                      <button
                        onClick={() => handleQuickXeroxStatus(xord._id, 'READY_FOR_PICKUP')}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: '6px',
                          backgroundColor: '#f3e8ff',
                          border: '1px solid #e9d5ff',
                          color: '#7e22ce',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        Ready for Pickup
                      </button>
                    )}

                    {xord.status === 'READY_FOR_PICKUP' && (
                      <button
                        onClick={() => handleQuickXeroxStatus(xord._id, 'COMPLETED')}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: '6px',
                          backgroundColor: '#10b981',
                          border: 'none',
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        Complete Handover
                      </button>
                    )}

                    {/* Process Modal */}
                    <button
                      onClick={() => setSelectedXeroxForProcess(xord)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      Process
                    </button>

                    {/* Token Slip */}
                    <button
                      onClick={() => setSelectedXeroxForSlip(xord)}
                      style={{
                        padding: '0.4rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#f8fafc',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                      title="Print Token Slip"
                    >
                      <Printer size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: INVENTORY STOCK & QUICK RESTOCK */}
      {/* ========================================================================= */}
      {activeTab === 'stock' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Live Store Inventory Monitor</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Stock automatically deducts upon pre-order confirmation and restores if cancelled.
              </p>
            </div>
            <button
              onClick={loadInventory}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <RefreshCw size={13} /> Refresh Stock
            </button>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Item Code & Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Physical Stock</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Threshold</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Counter Quick Restock</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const isLow = item.stockQuantity > 0 && item.stockQuantity <= item.minStockThreshold;
                  const isOut = item.stockQuantity <= 0;

                  return (
                    <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{item.name}</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#64748b' }}>
                          {item.itemCode}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{item.category}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: '800', fontSize: '0.95rem' }}>
                        {item.stockQuantity} {item.unit || 'units'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{item.minStockThreshold} units</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <StockBadge status={item.status} quantity={item.stockQuantity} threshold={item.minStockThreshold} />
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          {[10, 25, 50].map((units) => (
                            <button
                              key={units}
                              onClick={() => handleQuickRestock(item._id, units)}
                              style={{
                                padding: '0.25rem 0.55rem',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                background: '#f8fafc',
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                color: '#1e3a8a',
                                cursor: 'pointer',
                              }}
                            >
                              +{units}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stationery Process Order Modal */}
      <ProcessOrderModal
        order={selectedOrderForProcess}
        isOpen={!!selectedOrderForProcess}
        onClose={() => setSelectedOrderForProcess(null)}
        onUpdated={() => {
          loadOrders();
          loadInventory();
        }}
      />

      {/* Xerox Process Order Modal */}
      <ProcessXeroxModal
        order={selectedXeroxForProcess}
        isOpen={!!selectedXeroxForProcess}
        onClose={() => setSelectedXeroxForProcess(null)}
        onUpdated={() => {
          loadXeroxOrders();
        }}
      />

      {/* Stationery Printable Receipt Modal */}
      <OrderSlipModal
        order={selectedOrderForSlip}
        isOpen={!!selectedOrderForSlip}
        onClose={() => setSelectedOrderForSlip(null)}
      />

      {/* Xerox Printable Receipt Modal */}
      <XeroxSlipModal
        order={selectedXeroxForSlip}
        isOpen={!!selectedXeroxForSlip}
        onClose={() => setSelectedXeroxForSlip(null)}
      />
    </div>
  );
};

export default StaffSimplePage;

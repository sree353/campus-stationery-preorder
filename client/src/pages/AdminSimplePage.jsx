import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { OrderSlipModal } from '../components/student/OrderSlipModal';
import { XeroxSlipModal } from '../components/student/XeroxSlipModal';
import { XeroxPricingModal } from '../components/admin/XeroxPricingModal';
import { ProcessOrderModal } from '../components/staff/ProcessOrderModal';
import { ProcessXeroxModal } from '../components/staff/ProcessXeroxModal';
import { OrderStatusBadge, XeroxStatusBadge, PaymentBadge, StockBadge } from '../components/common/Badges';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  Package,
  Search,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  X,
  Printer,
  DollarSign,
  Settings,
  FileText,
  BarChart3,
  ExternalLink,
  Download,
  Sliders,
  TrendingUp,
} from 'lucide-react';

export const AdminSimplePage = () => {
  const { user, quickLogin } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [xeroxOrders, setXeroxOrders] = useState([]);
  const [xeroxSettings, setXeroxSettings] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'orders' | 'xerox' | 'xerox-config' | 'reports'
  const [search, setSearch] = useState('');

  // Add/Edit Product Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    itemCode: '',
    category: 'Notebooks & Registers',
    price: '',
    stockQuantity: '',
    minStockThreshold: 10,
    description: '',
  });

  // Xerox Pricing Inline Form
  const [pricingForm, setPricingForm] = useState({
    bwPricePerPage: 2.0,
    colorPricePerPage: 10.0,
    doubleSidedDiscountPerPage: 0.5,
    cornerStapleCharge: 2.0,
    spiralBindingCharge: 30.0,
    softBindingCharge: 50.0,
  });
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingSuccessMsg, setPricingSuccessMsg] = useState('');

  // Selected Order for Slip View
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState(null);
  const [selectedXeroxForSlip, setSelectedXeroxForSlip] = useState(null);
  const [selectedOrderForProcess, setSelectedOrderForProcess] = useState(null);
  const [selectedXeroxForProcess, setSelectedXeroxForProcess] = useState(null);

  // Auto-login as admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      quickLogin('admin').catch(() => {});
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, ordRes, xordRes, statsRes, setRes] = await Promise.all([
        api.products.getProducts(),
        api.orders.getAllOrders(),
        api.xerox.getAllOrders(),
        api.analytics.getDashboardStats(),
        api.xerox.getSettings(),
      ]);

      if (prodRes.success) setProducts(prodRes.products || []);
      if (ordRes.success) setOrders(ordRes.orders || []);
      if (xordRes.success) setXeroxOrders(xordRes.orders || []);
      if (statsRes.success) setStats(statsRes.data || null);
      if (setRes.success && setRes.settings) {
        setXeroxSettings(setRes.settings);
        setPricingForm({
          bwPricePerPage: setRes.settings.bwPricePerPage ?? 2.0,
          colorPricePerPage: setRes.settings.colorPricePerPage ?? 10.0,
          doubleSidedDiscountPerPage: setRes.settings.doubleSidedDiscountPerPage ?? 0.5,
          cornerStapleCharge: setRes.settings.cornerStapleCharge ?? 2.0,
          spiralBindingCharge: setRes.settings.spiralBindingCharge ?? 30.0,
          softBindingCharge: setRes.settings.softBindingCharge ?? 50.0,
        });
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadData();
    }
  }, [user]);

  // Open modal for add
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      itemCode: `BIT-SUP-${Date.now().toString().slice(-4)}`,
      category: 'Notebooks & Registers',
      price: '',
      stockQuantity: '',
      minStockThreshold: 10,
      description: '',
    });
    setModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      itemCode: prod.itemCode,
      category: prod.category,
      price: prod.price,
      stockQuantity: prod.stockQuantity,
      minStockThreshold: prod.minStockThreshold,
      description: prod.description || '',
    });
    setModalOpen(true);
  };

  // Save product (create or update)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.products.updateProduct(editingProduct._id, {
          ...formData,
          price: Number(formData.price),
          stockQuantity: Number(formData.stockQuantity),
          minStockThreshold: Number(formData.minStockThreshold),
        });
      } else {
        await api.products.createProduct({
          ...formData,
          price: Number(formData.price),
          stockQuantity: Number(formData.stockQuantity),
          minStockThreshold: Number(formData.minStockThreshold),
        });
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to save product');
    }
  };

  // Delete product
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from store inventory?`)) return;
    try {
      await api.products.deleteProduct(id);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  // Save Xerox Pricing
  const handleSavePricing = async (e) => {
    e.preventDefault();
    try {
      setPricingSaving(true);
      setPricingSuccessMsg('');
      const res = await api.xerox.updateSettings(pricingForm);
      if (res.success) {
        setXeroxSettings(res.settings);
        setPricingSuccessMsg('Xerox per-page and binding prices updated successfully!');
        setTimeout(() => setPricingSuccessMsg(''), 3500);
      }
    } catch (err) {
      alert(err.message || 'Failed to update Xerox pricing');
    } finally {
      setPricingSaving(false);
    }
  };

  // Filtered inventory
  const filteredProducts = products.filter(
    (p) =>
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.itemCode.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  // Filtered Xerox Orders
  const filteredXeroxOrders = xeroxOrders.filter(
    (xo) =>
      search === '' ||
      xo.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      xo.studentDetails?.name?.toLowerCase().includes(search.toLowerCase()) ||
      xo.studentDetails?.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
      xo.file?.originalName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalValuation = products.reduce((sum, p) => sum + p.price * p.stockQuantity, 0);
  const totalStockUnits = products.reduce((sum, p) => sum + p.stockQuantity, 0);
  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockThreshold).length;

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '1.75rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255,255,255,0.15)',
              padding: '0.2rem 0.6rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
            }}
          >
            <ShieldCheck size={13} color="#93c5fd" /> CAMPUS ADMINISTRATOR
          </div>
          <h1 style={{ fontSize: '1.55rem', fontWeight: '800', margin: 0 }}>
            Stationery & Xerox Administration
          </h1>
          <p style={{ margin: '0.35rem 0 0', opacity: 0.85, fontSize: '0.85rem' }}>
            Catalogue CRUD, Xerox print rate configuration, pre-orders oversight, and stock valuation audits.
          </p>
        </div>

        {/* 5 Admin Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(255,255,255,0.1)', padding: '0.3rem', borderRadius: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('inventory')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '0.82rem',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'inventory' ? '#ffffff' : 'transparent',
              color: activeTab === 'inventory' ? '#0f172a' : '#ffffff',
            }}
          >
            Catalog ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '0.82rem',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'orders' ? '#ffffff' : 'transparent',
              color: activeTab === 'orders' ? '#0f172a' : '#ffffff',
            }}
          >
            Stationery Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('xerox')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '0.82rem',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'xerox' ? '#ffffff' : 'transparent',
              color: activeTab === 'xerox' ? '#0f172a' : '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Printer size={13} /> Xerox Orders ({xeroxOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('xerox-config')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '0.82rem',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'xerox-config' ? '#ffffff' : 'transparent',
              color: activeTab === 'xerox-config' ? '#0f172a' : '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Settings size={13} /> Xerox Pricing
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '0.82rem',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'reports' ? '#ffffff' : 'transparent',
              color: activeTab === 'reports' ? '#0f172a' : '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <BarChart3 size={13} /> Reports
          </button>
        </div>
      </div>

      {/* Admin KPI Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
            Catalog Products
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
            {products.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{totalStockUnits} total stock units</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
            Total Asset Valuation
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: '800', color: '#1e3a8a', marginTop: '0.2rem' }}>
            ₹{totalValuation.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Current store inventory asset</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
            Total Pre-Orders
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: '800', color: '#0f766e', marginTop: '0.2rem' }}>
            {orders.length + xeroxOrders.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
            {orders.length} Stationery + {xeroxOrders.length} Xerox
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
            Low Stock Warnings
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: '800', color: lowStockCount > 0 ? '#ef4444' : '#10b981', marginTop: '0.2rem' }}>
            {lowStockCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Needs procurement restock</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INVENTORY CATALOG CRUD */}
      {/* ========================================================================= */}
      {activeTab === 'inventory' && (
        <div>
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
              <Search size={18} color="#64748b" />
              <input
                type="text"
                placeholder="Search products by title, item code, or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '0.85rem', width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={loadData}
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

              <button
                onClick={handleOpenAdd}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '6px',
                  backgroundColor: '#1e3a8a',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Plus size={15} /> Add Stationery Item
              </button>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Code & Product</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Unit Price</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Stock</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Threshold</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: '800', color: '#0f172a' }}>{p.name}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#1e3a8a' }}>
                        {p.itemCode}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{p.category}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>₹{p.price}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '800', fontSize: '0.9rem' }}>
                      {p.stockQuantity}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{p.minStockThreshold}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <StockBadge status={p.status} quantity={p.stockQuantity} threshold={p.minStockThreshold} />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          style={{
                            padding: '0.3rem 0.6rem',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            background: '#f8fafc',
                            color: '#1e293b',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p._id, p.name)}
                          style={{
                            padding: '0.3rem 0.6rem',
                            borderRadius: '4px',
                            border: '1px solid #fecdd3',
                            background: '#fff1f2',
                            color: '#e11d48',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ALL STATIONERY PRE-ORDERS */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {orders.map((ord) => (
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

                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Items: {ord.items?.map((it) => `${it.name} (×${it.quantity})`).join(', ')}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ textAlign: 'right', marginRight: '0.5rem' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Total</div>
                  <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>₹{ord.totalAmount}</div>
                </div>

                <button
                  onClick={() => setSelectedOrderForProcess(ord)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Manage
                </button>

                <button
                  onClick={() => setSelectedOrderForSlip(ord)}
                  style={{
                    padding: '0.4rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                  title="Print Slip"
                >
                  <Printer size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ALL XEROX PRE-ORDERS MASTER LOG */}
      {/* ========================================================================= */}
      {activeTab === 'xerox' && (
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0.2rem 0' }}>
                  <FileText size={15} color="#2563eb" />
                  <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>
                    {xord.file?.originalName}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    ({xord.file?.detectedPages} pgs • {(xord.file?.fileSize / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                  Student: <strong>{xord.studentDetails?.name}</strong> (Roll: {xord.studentDetails?.rollNumber || 'N/A'}, {xord.studentDetails?.department})
                </div>

                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Specs: {xord.printConfig?.colorMode === 'COLOUR' ? 'Colour' : 'B&W'} •{' '}
                  {xord.printConfig?.printSides === 'DOUBLE' ? 'Double-Sided' : 'Single-Sided'} •{' '}
                  {xord.printConfig?.calculatedPages} pages × {xord.printConfig?.copies} copies • Binding:{' '}
                  {xord.printConfig?.binding?.replace(/_/g, ' ') || 'None'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ textAlign: 'right', marginRight: '0.5rem' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Charges</div>
                  <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#1e3a8a' }}>₹{xord.totalAmount}</div>
                </div>

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
                    background: '#ffffff',
                    color: '#2563eb',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <ExternalLink size={13} /> View
                </button>

                <button
                  onClick={() => api.xerox.downloadDocument(xord._id, xord.file?.originalName)}
                  style={{
                    padding: '0.4rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                  title="Download PDF"
                >
                  <Download size={13} />
                </button>

                <button
                  onClick={() => setSelectedXeroxForProcess(xord)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#0f766e',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Process
                </button>

                <button
                  onClick={() => setSelectedXeroxForSlip(xord)}
                  style={{
                    padding: '0.4rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
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

      {/* ========================================================================= */}
      {/* TAB 4: XEROX PRICING & CONFIGURATION */}
      {/* ========================================================================= */}
      {activeTab === 'xerox-config' && (
        <div style={{ maxWidth: '640px', margin: '0 auto', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#1e3a8a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
                Xerox Printing Rate Configuration
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Tune per-page Black & White, Colour, and Binding charges. Changes reflect instantly across all pre-order calculations.
              </p>
            </div>
          </div>

          {pricingSuccessMsg && (
            <div
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#047857',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <CheckCircle size={16} />
              <span>{pricingSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSavePricing} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Black & White Rate (₹ / page)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={pricingForm.bwPricePerPage}
                  onChange={(e) => setPricingForm({ ...pricingForm, bwPricePerPage: parseFloat(e.target.value) || 0 })}
                  required
                  style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '700' }}
                />
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Standard campus photocopy rate</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Colour Print Rate (₹ / page)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={pricingForm.colorPricePerPage}
                  onChange={(e) => setPricingForm({ ...pricingForm, colorPricePerPage: parseFloat(e.target.value) || 0 })}
                  required
                  style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '700' }}
                />
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>High-resolution colour output</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Double-Sided Discount (₹ / page)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={pricingForm.doubleSidedDiscountPerPage}
                  onChange={(e) => setPricingForm({ ...pricingForm, doubleSidedDiscountPerPage: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '700' }}
                />
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Saved per page on duplex printing</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Corner Staple Charge (₹)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={pricingForm.cornerStapleCharge}
                  onChange={(e) => setPricingForm({ ...pricingForm, cornerStapleCharge: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '700' }}
                />
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Heavy-duty staple per set</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Spiral Binding (₹)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={pricingForm.spiralBindingCharge}
                  onChange={(e) => setPricingForm({ ...pricingForm, spiralBindingCharge: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '700' }}
                />
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Plastic comb with front transparent sheet</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Soft Binding (₹)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={pricingForm.softBindingCharge}
                  onChange={(e) => setPricingForm({ ...pricingForm, softBindingCharge: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '700' }}
                />
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Thesis spine tape binding</span>
              </div>
            </div>

            <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
              <button
                type="submit"
                disabled={pricingSaving}
                style={{
                  padding: '0.6rem 1.4rem',
                  backgroundColor: '#1e3a8a',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: pricingSaving ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                {pricingSaving ? 'Saving Changes...' : 'Save Xerox Configuration'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: EXECUTIVE REPORTS & VALUATION */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && stats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Revenue Breakdown Card */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
              Financial Revenue & Asset Summary
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Stationery Revenue (Completed)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#059669', marginTop: '0.2rem' }}>
                  ₹{stats.counts?.totalCompletedRevenue?.toLocaleString() || 0}
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Xerox Revenue (Completed)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0284c7', marginTop: '0.2rem' }}>
                  ₹{stats.counts?.xeroxCompletedRevenue?.toLocaleString() || 0}
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '0.72rem', color: '#1e40af', fontWeight: '700', textTransform: 'uppercase' }}>Grand Combined Revenue</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e3a8a', marginTop: '0.2rem' }}>
                  ₹{stats.counts?.grandTotalRevenue?.toLocaleString() || 0}
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#fdf4ff', borderRadius: '8px', border: '1px solid #f0abfc' }}>
                <div style={{ fontSize: '0.72rem', color: '#86198f', fontWeight: '700', textTransform: 'uppercase' }}>Inventory Asset Valuation</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#a21caf', marginTop: '0.2rem' }}>
                  ₹{stats.counts?.totalInventoryValue?.toLocaleString() || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Low Stock Reorder Advisory */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
              Procurement & Re-Order Advisory (Shortage Deficit)
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1rem' }}>
              Items currently at or below minimum threshold requiring central store replenishment.
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Item Code & Name</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Category</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Physical Stock</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Threshold</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Shortage Deficit</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Recommended Batch</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .filter((p) => p.stockQuantity <= p.minStockThreshold)
                    .map((item) => {
                      const deficit = item.minStockThreshold - item.stockQuantity;
                      const recommendedOrder = Math.max(25, deficit + 20);

                      return (
                        <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.65rem 0.85rem' }}>
                            <div style={{ fontWeight: '700', color: '#0f172a' }}>{item.name}</div>
                            <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#64748b' }}>{item.itemCode}</div>
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>{item.category}</td>
                          <td style={{ padding: '0.65rem 0.85rem', fontWeight: '800', color: item.stockQuantity === 0 ? '#ef4444' : '#f59e0b' }}>
                            {item.stockQuantity} {item.unit || 'units'}
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', color: '#64748b' }}>{item.minStockThreshold}</td>
                          <td style={{ padding: '0.65rem 0.85rem', color: '#ef4444', fontWeight: '700' }}>
                            {deficit <= 0 ? 'At Threshold' : `-${deficit} units`}
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', fontWeight: '800', color: '#1e3a8a' }}>
                            +{recommendedOrder} units
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800' }}>
                {editingProduct ? 'Edit Stationery Item' : 'Add New Stationery Item'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                    Item Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                      Item Code <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.itemCode}
                      onChange={(e) => setFormData({ ...formData, itemCode: e.target.value.toUpperCase() })}
                      style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'monospace' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff' }}
                    >
                      <option value="Notebooks & Registers">Notebooks & Registers</option>
                      <option value="Drawing & Engineering">Drawing & Engineering</option>
                      <option value="Pens & Writing">Pens & Writing</option>
                      <option value="Calculators & Tech">Calculators & Tech</option>
                      <option value="Files & Folders">Files & Folders</option>
                      <option value="Lab & Examination Supplies">Lab & Examination Supplies</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                      Price (₹) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                      Stock Quantity <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                      Min Threshold
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.minStockThreshold}
                      onChange={(e) => setFormData({ ...formData, minStockThreshold: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                    Description
                  </label>
                  <textarea
                    rows="2"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  ></textarea>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: '0.45rem 0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.45rem 1.1rem', borderRadius: '6px', background: '#1e3a8a', color: '#ffffff', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stationery Process Order Modal */}
      <ProcessOrderModal
        order={selectedOrderForProcess}
        isOpen={!!selectedOrderForProcess}
        onClose={() => setSelectedOrderForProcess(null)}
        onUpdated={loadData}
      />

      {/* Xerox Process Order Modal */}
      <ProcessXeroxModal
        order={selectedXeroxForProcess}
        isOpen={!!selectedXeroxForProcess}
        onClose={() => setSelectedXeroxForProcess(null)}
        onUpdated={loadData}
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

export default AdminSimplePage;

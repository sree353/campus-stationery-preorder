import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { OrderSlipModal } from '../components/student/OrderSlipModal';
import { XeroxSlipModal } from '../components/student/XeroxSlipModal';
import { XeroxPreOrderModal } from '../components/student/XeroxPreOrderModal';
import { OrderStatusBadge, XeroxStatusBadge, PaymentBadge, StockBadge } from '../components/common/Badges';
import {
  ShoppingBag,
  Search,
  CheckCircle,
  Clock,
  Printer,
  XCircle,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  RefreshCw,
  User,
  Calendar,
  FileText,
  UploadCloud,
  Download,
  Bell,
  Trash2,
  Save,
  Check,
  AlertCircle,
  Info,
} from 'lucide-react';

export const StudentSimplePage = () => {
  const { user, quickLogin, updateProfile } = useAuth();
  const [products, setProducts] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [myXeroxOrders, setMyXeroxOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'orders' | 'xerox' | 'profile'
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Pre-order basket state
  const [cart, setCart] = useState([]); // [{ product, quantity }]
  const [pickupSlot, setPickupSlot] = useState('Lunch Break (12:45 PM - 01:45 PM)');
  const [pickupDate, setPickupDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Modals state
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState(null);
  const [selectedXeroxForSlip, setSelectedXeroxForSlip] = useState(null);
  const [xeroxModalOpen, setXeroxModalOpen] = useState(false);
  const [xeroxSuccess, setXeroxSuccess] = useState(null);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    rollNumber: user?.rollNumber || '',
    department: user?.department || 'Computer Science & Engineering',
    year: user?.year || '3rd Year',
    phone: user?.phone || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Synchronize profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        rollNumber: user.rollNumber || '',
        department: user.department || 'Computer Science & Engineering',
        year: user.year || '3rd Year',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // Ensure user is logged in as student for seamless experience
  useEffect(() => {
    if (!user || user.role !== 'student') {
      quickLogin('student').catch(() => {});
    }
  }, [user]);

  // Load products
  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.products.getProducts();
      if (res.success) {
        setProducts(res.products || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load student stationery orders
  const loadMyOrders = async () => {
    try {
      const res = await api.orders.getMyOrders();
      if (res.success) {
        setMyOrders(res.orders || []);
      }
    } catch (err) {
      console.error('Failed to load student orders:', err);
    }
  };

  // Load student Xerox orders
  const loadMyXeroxOrders = async () => {
    try {
      const res = await api.xerox.getMyOrders();
      if (res.success) {
        setMyXeroxOrders(res.orders || []);
      }
    } catch (err) {
      console.error('Failed to load Xerox orders:', err);
    }
  };

  useEffect(() => {
    loadProducts();
    if (user && user.role === 'student') {
      loadMyOrders();
      loadMyXeroxOrders();
    }
  }, [user]);

  // Categories list
  const categories = [
    'All',
    'Notebooks & Registers',
    'Drawing & Engineering',
    'Pens & Writing',
    'Calculators & Tech',
    'Files & Folders',
    'Lab & Examination Supplies',
  ];

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'In Stock' && p.stockQuantity > p.minStockThreshold) ||
      (statusFilter === 'Low Stock' && p.stockQuantity > 0 && p.stockQuantity <= p.minStockThreshold) ||
      (statusFilter === 'Out of Stock' && p.stockQuantity <= 0);

    const matchesSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.itemCode.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Cart operations
  const addToCart = (product) => {
    if (product.stockQuantity <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) return prev; // stock limit guard
        return prev.map((item) =>
          item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product._id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stockQuantity) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product._id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Submit pre-order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    try {
      setSubmitting(true);
      const payload = {
        items: cart.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
        pickupTimeSlot: pickupSlot,
        pickupDate: pickupDate,
        studentNotes: notes,
      };

      const res = await api.orders.createOrder(payload);
      if (res.success) {
        setCart([]);
        setNotes('');
        setOrderSuccess(res.order);
        setActiveTab('orders');
        loadMyOrders();
        loadProducts(); // refresh stock numbers
      }
    } catch (err) {
      alert(err.message || 'Failed to place pre-order');
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel order
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this pending pre-order?')) return;
    try {
      const res = await api.orders.cancelMyOrder(orderId);
      if (res.success) {
        loadMyOrders();
        loadProducts();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel order');
    }
  };

  // Cancel Xerox Order
  const handleCancelXeroxOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this pending Xerox pre-order?')) return;
    try {
      const res = await api.xerox.cancelOrder(orderId);
      if (res.success) {
        loadMyXeroxOrders();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel Xerox pre-order');
    }
  };

  // Handle Xerox Pre-order Created
  const handleXeroxOrderCreated = (newOrder) => {
    setXeroxSuccess(newOrder);
    setActiveTab('xerox');
    loadMyXeroxOrders();
  };

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      setProfileMsg('');
      await updateProfile(profileData);
      setProfileMsg('Student profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 3500);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  // Check for Ready for Pickup items to alert student
  const readyStationeryOrders = myOrders.filter((o) => o.status === 'READY_FOR_PICKUP');
  const readyXeroxOrders = myXeroxOrders.filter((o) => o.status === 'READY_FOR_PICKUP');
  const hasReadyItems = readyStationeryOrders.length > 0 || readyXeroxOrders.length > 0;

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '1.25rem 1rem 3rem' }}>
      {/* Ready for Pickup Alert Banner */}
      {hasReadyItems && (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            border: '2px solid #34d399',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={22} />
            </div>
            <div>
              <div style={{ fontWeight: '800', color: '#065f46', fontSize: '1rem' }}>
                🔔 Orders Ready for Counter Pickup!
              </div>
              <div style={{ fontSize: '0.82rem', color: '#047857' }}>
                {readyStationeryOrders.length > 0 &&
                  `${readyStationeryOrders.length} stationery order(s) `}
                {readyStationeryOrders.length > 0 && readyXeroxOrders.length > 0 && 'and '}
                {readyXeroxOrders.length > 0 &&
                  `${readyXeroxOrders.length} Xerox document(s) `}
                are waiting at <strong>Amenities Block Desk #02</strong>. Pay at counter and collect!
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {readyStationeryOrders.length > 0 && (
              <button
                onClick={() => {
                  setSelectedOrderForSlip(readyStationeryOrders[0]);
                }}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Printer size={14} /> View Stationery Token
              </button>
            )}
            {readyXeroxOrders.length > 0 && (
              <button
                onClick={() => {
                  setSelectedXeroxForSlip(readyXeroxOrders[0]);
                }}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: '#047857',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Printer size={14} /> View Xerox Token
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Student Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          borderRadius: '14px',
          padding: '1.75rem',
          color: '#ffffff',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 12px rgba(30, 58, 138, 0.15)',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255,255,255,0.18)',
              padding: '0.2rem 0.65rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '700',
              marginBottom: '0.4rem',
            }}
          >
            <Sparkles size={13} color="#fde047" /> STUDENT PORTAL • BIT CAMPUS
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
            Stationery & Online Xerox Pre-Ordering
          </h1>
          <p style={{ margin: '0.35rem 0 0', opacity: 0.9, fontSize: '0.88rem' }}>
            Pre-order official lab records, stationery & upload PDFs for photocopy. Skip counter queues during rush breaks!
          </p>
        </div>

        {/* Quick Action Button to Upload Xerox */}
        <button
          onClick={() => setXeroxModalOpen(true)}
          style={{
            padding: '0.65rem 1.25rem',
            backgroundColor: '#ffffff',
            color: '#1e3a8a',
            borderRadius: '8px',
            fontWeight: '800',
            fontSize: '0.88rem',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <UploadCloud size={18} color="#2563eb" />
          <span>Upload PDF for Xerox</span>
        </button>
      </div>

      {/* 4 Dedicated Student Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          padding: '0.4rem',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => setActiveTab('browse')}
          style={{
            padding: '0.55rem 1.1rem',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '0.85rem',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'browse' ? '#eff6ff' : 'transparent',
            color: activeTab === 'browse' ? '#1e3a8a' : '#64748b',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <ShoppingBag size={16} /> 1. Browse Stationery
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '0.55rem 1.1rem',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '0.85rem',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'orders' ? '#eff6ff' : 'transparent',
            color: activeTab === 'orders' ? '#1e3a8a' : '#64748b',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Clock size={16} /> 2. Stationery Orders ({myOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('xerox')}
          style={{
            padding: '0.55rem 1.1rem',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '0.85rem',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'xerox' ? '#eff6ff' : 'transparent',
            color: activeTab === 'xerox' ? '#1e3a8a' : '#64748b',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Printer size={16} /> 3. Xerox Pre-Orders ({myXeroxOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '0.55rem 1.1rem',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '0.85rem',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'profile' ? '#eff6ff' : 'transparent',
            color: activeTab === 'profile' ? '#1e3a8a' : '#64748b',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <User size={16} /> 4. Student Profile
        </button>
      </div>

      {/* Success banner if stationery pre-order newly placed */}
      {orderSuccess && activeTab === 'orders' && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle color="#059669" size={24} />
            <div>
              <div style={{ fontWeight: '800', color: '#065f46', fontSize: '0.95rem' }}>
                Stationery Pre-Order Placed Successfully! Token: #{orderSuccess.orderNumber}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#047857' }}>
                Scheduled for {orderSuccess.pickupTimeSlot} on {new Date(orderSuccess.pickupDate).toLocaleDateString()}.
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedOrderForSlip(orderSuccess)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              backgroundColor: '#1e3a8a',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Printer size={14} /> Print Pickup Token Slip
          </button>
        </div>
      )}

      {/* Success banner if Xerox pre-order newly placed */}
      {xeroxSuccess && activeTab === 'xerox' && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle color="#059669" size={24} />
            <div>
              <div style={{ fontWeight: '800', color: '#065f46', fontSize: '0.95rem' }}>
                Xerox Pre-Order Submitted! Token: #{xeroxSuccess.orderNumber}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#047857' }}>
                "{xeroxSuccess.file?.originalName}" • Scheduled for {xeroxSuccess.pickupTimeSlot} (Pay ₹{xeroxSuccess.totalAmount} at Desk #02).
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedXeroxForSlip(xeroxSuccess)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              backgroundColor: '#1e3a8a',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Printer size={14} /> Print Xerox Slip
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: BROWSE STATIONERY & PRE-ORDER BASKET */}
      {/* ========================================================================= */}
      {activeTab === 'browse' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: cart.length > 0 ? '1fr 340px' : '1fr',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* Products Column */}
          <div>
            {/* Search and Category filters */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
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
                  placeholder="Search lab records, drafters, calculators, pens..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.88rem',
                    width: '100%',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: '0.4rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8rem',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                  }}
                >
                  <option value="All">All Stock Statuses</option>
                  <option value="In Stock">In Stock Only</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                    border: '1px solid',
                    borderColor: selectedCategory === cat ? '#1e3a8a' : '#cbd5e1',
                    background: selectedCategory === cat ? '#1e3a8a' : '#ffffff',
                    color: selectedCategory === cat ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                <RefreshCw size={24} className="spinning" style={{ margin: '0 auto 0.5rem' }} />
                <div>Loading official campus stationery inventory...</div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>No products match your search</div>
                <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.25rem' }}>
                  Try adjusting filters or searching for item codes e.g. BIT-NOTE-01
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                {filteredProducts.map((p) => {
                  const inCart = cart.find((item) => item.product._id === p._id);
                  const isOutOfStock = p.stockQuantity <= 0;
                  const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= p.minStockThreshold;

                  return (
                    <div
                      key={p._id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'box-shadow 0.2s',
                      }}
                    >
                      <div style={{ position: 'relative', height: '140px', backgroundColor: '#f1f5f9' }}>
                        <img
                          src={p.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500'}
                          alt={p.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
                          <StockBadge status={p.status} quantity={p.stockQuantity} threshold={p.minStockThreshold} />
                        </div>
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '6px',
                            right: '6px',
                            background: 'rgba(15, 23, 42, 0.85)',
                            color: '#ffffff',
                            fontSize: '0.65rem',
                            fontWeight: '700',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                          }}
                        >
                          {p.itemCode}
                        </div>
                      </div>

                      <div style={{ padding: '0.85rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                            {p.category}
                          </div>
                          <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a', margin: '0.2rem 0' }}>
                            {p.name}
                          </div>
                          <p style={{ fontSize: '0.75rem', color: '#475569', margin: '0 0 0.5rem', lineHeight: 1.3 }}>
                            {p.description?.slice(0, 75)}...
                          </p>
                        </div>

                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Store Price</span>
                            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1e3a8a' }}>
                              ₹{p.price}
                            </div>
                          </div>

                          {inCart ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#eff6ff', padding: '0.2rem 0.4rem', borderRadius: '6px' }}>
                              <button
                                onClick={() => updateCartQuantity(p._id, -1)}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '4px',
                                  border: 'none',
                                  background: '#ffffff',
                                  color: '#1e3a8a',
                                  fontWeight: '800',
                                  cursor: 'pointer',
                                }}
                              >
                                -
                              </button>
                              <span style={{ fontWeight: '800', fontSize: '0.85rem', minWidth: '18px', textAlign: 'center', color: '#1e3a8a' }}>
                                {inCart.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(p._id, 1)}
                                disabled={inCart.quantity >= p.stockQuantity}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '4px',
                                  border: 'none',
                                  background: inCart.quantity >= p.stockQuantity ? '#cbd5e1' : '#ffffff',
                                  color: '#1e3a8a',
                                  fontWeight: '800',
                                  cursor: inCart.quantity >= p.stockQuantity ? 'not-allowed' : 'pointer',
                                }}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(p)}
                              disabled={isOutOfStock}
                              style={{
                                padding: '0.4rem 0.8rem',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: '700',
                                border: 'none',
                                background: isOutOfStock ? '#cbd5e1' : '#1e3a8a',
                                color: '#ffffff',
                                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                              }}
                            >
                              <Plus size={14} /> Add to Basket
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sticky Pre-Order Basket Sidebar */}
          {cart.length > 0 && (
            <div
              style={{
                position: 'sticky',
                top: '80px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '1.25rem',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '0.85rem' }}>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a' }}>
                  Pre-Order Basket ({cartTotalItems})
                </div>
                <button
                  onClick={() => setCart([])}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600' }}
                >
                  Clear All
                </button>
              </div>

              {/* Items List */}
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
                {cart.map((item) => (
                  <div key={item.product._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                    <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{item.product.name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.72rem' }}>
                        ₹{item.product.price} × {item.quantity}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: '800', color: '#1e3a8a' }}>
                        ₹{item.product.price * item.quantity}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.product._id)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pickup Schedule Inputs */}
              <form onSubmit={handlePlaceOrder}>
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                    Counter Time Slot
                  </label>
                  <select
                    value={pickupSlot}
                    onChange={(e) => setPickupSlot(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff' }}
                  >
                    <option value="Morning Slot (08:30 AM - 09:15 AM)">Morning Slot (08:30 AM - 09:15 AM)</option>
                    <option value="Mid-Morning Slot (10:45 AM - 11:15 AM)">Mid-Morning Slot (10:45 AM - 11:15 AM)</option>
                    <option value="Lunch Break (12:45 PM - 01:45 PM)">Lunch Break (12:45 PM - 01:45 PM)</option>
                    <option value="Afternoon Slot (03:15 PM - 03:45 PM)">Afternoon Slot (03:15 PM - 03:45 PM)</option>
                    <option value="Evening Post-Class (04:30 PM - 05:45 PM)">Evening Post-Class (04:30 PM - 05:45 PM)</option>
                  </select>
                </div>

                {/* Total and Submit */}
                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Total Pay at Desk</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e3a8a' }}>₹{cartTotal}</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    backgroundColor: '#1e3a8a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '800',
                    fontSize: '0.88rem',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  {submitting ? 'Reserving Items...' : `Confirm Pre-Order (₹${cartTotal})`}
                </button>

                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center', marginTop: '0.4rem' }}>
                  No online payment needed • Pay at counter upon pickup
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MY STATIONERY PRE-ORDERS */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>My Stationery Pre-Orders</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Track real-time packaging, pickup slots, and print official counter tokens</p>
            </div>
            <button
              onClick={loadMyOrders}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          {myOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <Clock size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: '700', fontSize: '1rem', color: '#0f172a' }}>No stationery pre-orders yet</div>
              <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.25rem' }}>
                Browse our stationery catalog and pre-order supplies for your next lab or lecture session!
              </p>
              <button
                onClick={() => setActiveTab('browse')}
                style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '6px', background: '#1e3a8a', color: '#ffffff', border: 'none', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Browse Stationery Products
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {myOrders.map((ord) => {
                const isPending = ord.status === 'PENDING';
                const isReady = ord.status === 'READY_FOR_PICKUP';

                return (
                  <div
                    key={ord._id}
                    style={{
                      backgroundColor: isReady ? '#f8fafc' : '#ffffff',
                      border: isReady ? '2px solid #8b5cf6' : '1px solid #e2e8f0',
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '0.95rem', color: '#1e3a8a' }}>
                          #{ord.orderNumber}
                        </span>
                        <OrderStatusBadge status={ord.status} />
                        <PaymentBadge status={ord.paymentStatus} />
                      </div>

                      <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                        Scheduled Pickup: <strong>{new Date(ord.pickupDate).toLocaleDateString()}</strong> during{' '}
                        <span style={{ color: '#2563eb', fontWeight: '600' }}>{ord.pickupTimeSlot}</span>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                        <strong>Items:</strong> {ord.items?.map((it) => `${it.name} (×${it.quantity})`).join(', ')}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ textAlign: 'right', marginRight: '0.5rem' }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Total at Desk</div>
                        <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>
                          ₹{ord.totalAmount}
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedOrderForSlip(ord)}
                        style={{
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          background: '#f1f5f9',
                          color: '#1e293b',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          border: '1px solid #cbd5e1',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <Printer size={14} /> Token Slip
                      </button>

                      {isPending && (
                        <button
                          onClick={() => handleCancelOrder(ord._id)}
                          style={{
                            padding: '0.45rem 0.85rem',
                            borderRadius: '6px',
                            background: '#fff1f2',
                            color: '#e11d48',
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            border: '1px solid #fecdd3',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ONLINE XEROX PRE-ORDERS */}
      {/* ========================================================================= */}
      {activeTab === 'xerox' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                Online Xerox / Photocopy Pre-Orders
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Upload PDF documents, choose B&W or Colour, single/double sided printing & collect at Amenities Desk #02
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={loadMyXeroxOrders}
                style={{
                  padding: '0.45rem 0.8rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <RefreshCw size={13} /> Refresh
              </button>
              <button
                onClick={() => setXeroxModalOpen(true)}
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
                  gap: '0.4rem',
                }}
              >
                <UploadCloud size={16} /> New Xerox Pre-Order
              </button>
            </div>
          </div>

          {myXeroxOrders.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3.5rem 1.5rem',
                background: '#ffffff',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
              }}
            >
              <FileText size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#0f172a' }}>
                No Xerox pre-orders placed yet
              </div>
              <p style={{ color: '#64748b', fontSize: '0.82rem', maxWidth: '440px', margin: '0.4rem auto 1.25rem' }}>
                Upload your lab observation sheets, assignment questions, or project reports to have them printed and ready for pickup!
              </p>
              <button
                onClick={() => setXeroxModalOpen(true)}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '8px',
                  background: '#1e3a8a',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <UploadCloud size={16} /> Upload PDF Document
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {myXeroxOrders.map((xord) => {
                const isPending = xord.status === 'PENDING';
                const isReady = xord.status === 'READY_FOR_PICKUP';

                return (
                  <div
                    key={xord._id}
                    style={{
                      backgroundColor: isReady ? '#f8faff' : '#ffffff',
                      border: isReady ? '2px solid #8b5cf6' : '1px solid #e2e8f0',
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '0.95rem', color: '#1e3a8a' }}>
                          #{xord.orderNumber}
                        </span>
                        <XeroxStatusBadge status={xord.status} />
                        <PaymentBadge status={xord.paymentStatus} />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.3rem 0' }}>
                        <FileText size={16} color="#2563eb" />
                        <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>
                          {xord.file?.originalName}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          ({(xord.file?.fileSize / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                        <strong>Print Specs:</strong> {xord.printConfig?.colorMode === 'COLOUR' ? 'Colour' : 'B&W'} •{' '}
                        {xord.printConfig?.printSides === 'DOUBLE' ? 'Double-Sided' : 'Single-Sided'} •{' '}
                        {xord.printConfig?.calculatedPages} page(s) × {xord.printConfig?.copies} copy/copies •{' '}
                        Binding: {xord.printConfig?.binding?.replace(/_/g, ' ') || 'None'}
                      </div>

                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                        Pickup: <strong>{new Date(xord.pickupDate).toLocaleDateString()}</strong> during{' '}
                        <span style={{ color: '#2563eb', fontWeight: '600' }}>{xord.pickupTimeSlot}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ textAlign: 'right', marginRight: '0.5rem' }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Amount Due</div>
                        <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#1e3a8a' }}>
                          ₹{xord.totalAmount}
                        </div>
                      </div>

                      {/* Download PDF */}
                      <button
                        onClick={() => api.xerox.downloadDocument(xord._id, xord.file?.originalName)}
                        title="Download uploaded PDF"
                        style={{
                          padding: '0.45rem 0.65rem',
                          borderRadius: '6px',
                          background: '#f8fafc',
                          color: '#475569',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          border: '1px solid #cbd5e1',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <Download size={14} /> PDF
                      </button>

                      {/* Printable Slip Token */}
                      <button
                        onClick={() => setSelectedXeroxForSlip(xord)}
                        style={{
                          padding: '0.45rem 0.8rem',
                          borderRadius: '6px',
                          background: '#f1f5f9',
                          color: '#1e293b',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          border: '1px solid #cbd5e1',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <Printer size={14} /> Token Slip
                      </button>

                      {isPending && (
                        <button
                          onClick={() => handleCancelXeroxOrder(xord._id)}
                          style={{
                            padding: '0.45rem 0.75rem',
                            borderRadius: '6px',
                            background: '#fff1f2',
                            color: '#e11d48',
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            border: '1px solid #fecdd3',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: STUDENT PROFILE & IDENTIFICATION */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: '640px', margin: '0 auto', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#eff6ff',
                color: '#1e3a8a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                fontWeight: '800',
              }}
            >
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>{user?.name}</h2>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{user?.email} • Student Account</div>
            </div>
          </div>

          {profileMsg && (
            <div
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
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
              <span>{profileMsg}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                required
                style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Roll Number
                </label>
                <input
                  type="text"
                  value={profileData.rollNumber}
                  onChange={(e) => setProfileData({ ...profileData, rollNumber: e.target.value })}
                  placeholder="e.g. 22BITCSE042"
                  style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Academic Year
                </label>
                <select
                  value={profileData.year}
                  onChange={(e) => setProfileData({ ...profileData, year: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff' }}
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="Final Year">Final Year</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Department
                </label>
                <input
                  type="text"
                  value={profileData.department}
                  onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                  placeholder="Computer Science & Engineering"
                  style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Phone Contact
                </label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="+91..."
                  style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
              <button
                type="submit"
                disabled={profileSaving}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '6px',
                  backgroundColor: '#1e3a8a',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  border: 'none',
                  cursor: profileSaving ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Save size={15} />
                {profileSaving ? 'Saving Profile...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

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

      {/* Student Xerox Pre-Order Modal */}
      <XeroxPreOrderModal
        isOpen={xeroxModalOpen}
        onClose={() => setXeroxModalOpen(false)}
        onSuccess={handleXeroxOrderCreated}
      />
    </div>
  );
};

export default StudentSimplePage;

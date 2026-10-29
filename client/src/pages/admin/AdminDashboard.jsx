import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { OrderStatusBadge, StockBadge } from '../../components/common/Badges';
import { ProductModal } from '../../components/admin/ProductModal';
import { UserModal } from '../../components/admin/UserModal';
import { BroadcastModal } from '../../components/admin/BroadcastModal';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileText,
  BarChart2,
  PieChart,
  Plus,
  Megaphone,
  UserPlus,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await api.analytics.getDashboardStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const counts = stats?.counts || {};
  const ordersByStatus = stats?.ordersByStatus || [];
  const stockHealth = stats?.stockHealth || [];
  const topProducts = stats?.topProducts || [];
  const categoryBreakdown = stats?.categoryBreakdown || [];

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
            Campus Administration & Stores Overview
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            System-wide stationery catalogue metrics, order analytics, and inventory thresholds
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={loadStats} className="btn btn-outline btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setBroadcastOpen(true)} className="btn btn-outline btn-sm">
            <Megaphone size={14} /> Broadcast Notice
          </button>
          <button onClick={() => setUserModalOpen(true)} className="btn btn-secondary btn-sm">
            <UserPlus size={14} /> + New User
          </button>
          <button onClick={() => setProductModalOpen(true)} className="btn btn-primary btn-sm">
            <Plus size={14} /> + Add Product
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* Total Products */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Products
            </span>
            <Package size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--primary-dark)', margin: '0.4rem 0' }}>
            {counts.totalProducts || 0}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {counts.totalStockUnits || 0} physical units in stock
          </p>
        </div>

        {/* Total Orders */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Pre-Orders
            </span>
            <ShoppingBag size={18} color="#2563eb" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#1e40af', margin: '0.4rem 0' }}>
            {counts.totalOrders || 0}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {counts.pendingOrders || 0} pending • {counts.completedOrders || 0} completed
          </p>
        </div>

        {/* Total Registered Users */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Campus Users
            </span>
            <Users size={18} color="#0d9488" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f766e', margin: '0.4rem 0' }}>
            {counts.totalUsers || 0}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {counts.studentCount || 0} Students • {counts.staffCount || 0} Staff
          </p>
        </div>

        {/* Inventory Total Value */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Inventory Valuation
            </span>
            <TrendingUp size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#047857', margin: '0.4rem 0' }}>
            ₹{counts.totalInventoryValue?.toLocaleString() || 0}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Total value of stationery on campus
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#b91c1c', textTransform: 'uppercase' }}>
              Stock Alerts
            </span>
            <AlertTriangle size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#991b1b', margin: '0.4rem 0' }}>
            {(counts.lowStockCount || 0) + (counts.outOfStockCount || 0)}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {counts.lowStockCount || 0} Low Stock • {counts.outOfStockCount || 0} Out of Stock
          </p>
        </div>
      </div>

      {/* Analytics Visualizations Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Chart 1: Orders By Status */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.25rem' }}>
            Orders Distribution by Status
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Fulfillment breakdown across student pre-orders
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {ordersByStatus.map((item) => {
              const total = counts.totalOrders || 1;
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={item.status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                    <span>{item.status}</span>
                    <span>
                      {item.count} orders ({pct}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor: item.color,
                        borderRadius: '4px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Inventory Health */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.25rem' }}>
            Stock Health Breakdown
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Status of stationery products against minimum thresholds
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stockHealth.map((item) => {
              const total = counts.totalProducts || 1;
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }} />
                    <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{item.label}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: '800', fontSize: '0.95rem' }}>{item.count} items</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
            <Link to="/admin/inventory" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700' }}>
              Manage Minimum Thresholds & Stock Audit Logs →
            </Link>
          </div>
        </div>
      </div>

      {/* Row 2: Top Selling Products & Category Valuation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Top Selling Products */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.25rem' }}>
            Most Popular Stationery Items
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Ranked by units ordered by students
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {topProducts.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No sales recorded yet.</p>
            ) : (
              topProducts.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '6px',
                    backgroundColor: idx === 0 ? '#eff6ff' : '#ffffff',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: idx === 0 ? 'var(--primary)' : '#e2e8f0', color: idx === 0 ? '#fff' : 'var(--text-main)', fontSize: '0.7rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {idx + 1}
                    </span>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.8125rem' }}>{p._id}</div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{p.itemCode}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '800', fontSize: '0.85rem' }}>{p.totalSold} sold</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>₹{p.totalRevenue}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.25rem' }}>
            Stationery by Category
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Distribution of items and catalogue inventory value
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
            {categoryBreakdown.map((cat, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem 0.75rem',
                  borderBottom: '1px solid var(--border-light)',
                  fontSize: '0.8125rem',
                }}
              >
                <div>
                  <span style={{ fontWeight: '700' }}>{cat.category}</span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{cat.count} products • {cat.totalStock} units</div>
                </div>
                <div style={{ fontWeight: '800', color: 'var(--primary-dark)' }}>
                  ₹{cat.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSaved={() => loadStats()}
      />

      <UserModal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        onSaved={() => loadStats()}
      />

      <BroadcastModal
        isOpen={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        onSent={() => alert('Announcement sent successfully to campus users!')}
      />
    </div>
  );
};

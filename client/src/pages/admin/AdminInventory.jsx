import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StockBadge } from '../../components/common/Badges';
import { ThresholdModal } from '../../components/admin/ThresholdModal';
import { RestockModal } from '../../components/staff/RestockModal';
import {
  SlidersHorizontal,
  PackagePlus,
  History,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Search,
} from 'lucide-react';

export const AdminInventory = () => {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTab, setViewTab] = useState('inventory'); // 'inventory' | 'logs'

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [thresholdModalOpen, setThresholdModalOpen] = useState(false);
  const [restockModalOpen, setRestockModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, logsRes] = await Promise.all([
        api.inventory.getInventoryOverview(),
        api.inventory.getInventoryLogs({ limit: 40 }),
      ]);

      if (invRes.success) {
        setItems(invRes.items || []);
        setSummary(invRes.summary);
      }
      if (logsRes.success) {
        setLogs(logsRes.logs || []);
      }
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-dark)' }}>
            Inventory Levels & Threshold Control
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Configure low-stock alert triggers, monitor asset valuation, and review audit trail
          </p>
        </div>

        <button onClick={loadData} className="btn btn-outline btn-sm">
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
          <div className="card">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>TOTAL PHYSICAL STOCK</span>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--primary-dark)', margin: '0.25rem 0' }}>
              {summary.totalStockUnits} units
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Across {summary.totalProducts} catalog products</span>
          </div>

          <div className="card">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>TOTAL STOCK VALUATION</span>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#047857', margin: '0.25rem 0' }}>
              ₹{summary.totalInventoryValue?.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#047857' }}>Campus stationery asset value</span>
          </div>

          <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <span style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: '700' }}>LOW STOCK ITEMS</span>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#b45309', margin: '0.25rem 0' }}>
              {summary.lowStockCount} items
            </div>
            <span style={{ fontSize: '0.72rem', color: '#92400e' }}>Triggered automated alert</span>
          </div>

          <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
            <span style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: '700' }}>OUT OF STOCK ITEMS</span>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#b91c1c', margin: '0.25rem 0' }}>
              {summary.outOfStockCount} items
            </div>
            <span style={{ fontSize: '0.72rem', color: '#991b1b' }}>Pre-ordering blocked</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setViewTab('inventory')}
          style={{
            padding: '0.6rem 1rem',
            fontWeight: '700',
            fontSize: '0.85rem',
            color: viewTab === 'inventory' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: viewTab === 'inventory' ? '2px solid var(--primary)' : '2px solid transparent',
          }}
        >
          Inventory Items & Thresholds ({items.length})
        </button>

        <button
          onClick={() => setViewTab('logs')}
          style={{
            padding: '0.6rem 1rem',
            fontWeight: '700',
            fontSize: '0.85rem',
            color: viewTab === 'logs' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: viewTab === 'logs' ? '2px solid var(--primary)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <History size={16} /> Stock Change Audit Logs ({logs.length})
        </button>
      </div>

      {viewTab === 'inventory' ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Item</th>
                <th>Item Code</th>
                <th>Unit Price</th>
                <th>Current Stock</th>
                <th>Min Alert Threshold</th>
                <th>Status</th>
                <th>Total Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((prod) => (
                <tr key={prod._id}>
                  <td>
                    <div style={{ fontWeight: '700' }}>{prod.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{prod.category}</div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {prod.itemCode}
                  </td>
                  <td>₹{prod.price}</td>
                  <td>
                    <strong style={{ fontSize: '1rem', color: prod.stockQuantity <= prod.minStockThreshold ? '#dc2626' : 'inherit' }}>
                      {prod.stockQuantity}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> units</span>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedProduct(prod);
                        setThresholdModalOpen(true);
                      }}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '0.2rem 0.5rem' }}
                      title="Adjust threshold"
                    >
                      {prod.minStockThreshold} <SlidersHorizontal size={12} />
                    </button>
                  </td>
                  <td>
                    <StockBadge status={prod.status} quantity={prod.stockQuantity} threshold={prod.minStockThreshold} />
                  </td>
                  <td style={{ fontWeight: '800' }}>
                    ₹{(prod.stockQuantity * prod.price).toLocaleString()}
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedProduct(prod);
                        setRestockModalOpen(true);
                      }}
                      className="btn btn-sm btn-primary"
                    >
                      <PackagePlus size={14} /> Restock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Product</th>
                <th>Action Type</th>
                <th>Previous Stock</th>
                <th>New Stock</th>
                <th>Units Changed</th>
                <th>Audit Notes</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No audit logs available yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <div style={{ fontWeight: '700' }}>{log.product?.name || 'Unknown Item'}</div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {log.product?.itemCode}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor:
                            log.action === 'RESTOCK'
                              ? '#ecfdf5'
                              : log.action === 'PRE_ORDER_DEDUCT'
                              ? '#eff6ff'
                              : log.action === 'ORDER_CANCELLED_RESTORE'
                              ? '#fffbeb'
                              : '#f1f5f9',
                          color:
                            log.action === 'RESTOCK'
                              ? '#065f46'
                              : log.action === 'PRE_ORDER_DEDUCT'
                              ? '#1e40af'
                              : log.action === 'ORDER_CANCELLED_RESTORE'
                              ? '#92400e'
                              : '#475569',
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td>{log.previousStock}</td>
                    <td>
                      <strong>{log.newStock}</strong>
                    </td>
                    <td style={{ fontWeight: '800', color: log.quantityChanged > 0 ? '#059669' : '#dc2626' }}>
                      {log.quantityChanged > 0 ? `+${log.quantityChanged}` : log.quantityChanged}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{log.note}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {selectedProduct && (
        <ThresholdModal
          isOpen={thresholdModalOpen}
          product={selectedProduct}
          onClose={() => {
            setThresholdModalOpen(false);
            setSelectedProduct(null);
          }}
          onUpdated={() => {
            loadData();
          }}
        />
      )}

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
    </div>
  );
};

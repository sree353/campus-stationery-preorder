import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StockBadge } from '../../components/common/Badges';
import { RestockModal } from '../../components/staff/RestockModal';
import { ThresholdModal } from '../../components/admin/ThresholdModal';
import {
  Search,
  PackagePlus,
  SlidersHorizontal,
  RefreshCw,
  AlertTriangle,
  Package,
} from 'lucide-react';

export const StaffInventory = () => {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [thresholdModalOpen, setThresholdModalOpen] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.inventory.getInventoryOverview({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
      });

      if (res.success) {
        setItems(res.items || []);
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInventory();
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-dark)' }}>
            Campus Stationery Inventory
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Live physical stock levels, alert thresholds, and replenishment logs
          </p>
        </div>

        <button onClick={fetchInventory} className="btn btn-outline btn-sm">
          <RefreshCw size={14} /> Refresh Stock
        </button>
      </div>

      {/* Summary Chips */}
      {summary && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div className="card" style={{ padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Catalogue Items</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-dark)', marginTop: '0.25rem' }}>
              {summary.totalProducts}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>{summary.totalStockUnits} total physical units</span>
          </div>

          <div className="card" style={{ padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: '600' }}>In Healthy Stock</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#15803d', marginTop: '0.25rem' }}>
              {summary.healthyStockCount}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#166534' }}>Above threshold</span>
          </div>

          <div className="card" style={{ padding: '1rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
            <span style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: '600' }}>Low Stock Items</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#b45309', marginTop: '0.25rem' }}>
              {summary.lowStockCount}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#92400e' }}>Below minimum threshold</span>
          </div>

          <div className="card" style={{ padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
            <span style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: '600' }}>Out of Stock</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#b91c1c', marginTop: '0.25rem' }}>
              {summary.outOfStockCount}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#991b1b' }}>0 units remaining</span>
          </div>
        </div>
      )}

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
                placeholder="Search stationery by name, item code, brand..."
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
              <option value="ALL">All Items</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-muted)' }}>Category:</span>
            <select
              className="form-select"
              style={{ width: 'auto', fontSize: '0.8125rem' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Notebooks & Registers">Notebooks & Registers</option>
              <option value="Drawing & Engineering">Drawing & Engineering</option>
              <option value="Pens & Writing">Pens & Writing</option>
              <option value="Calculators & Tech">Calculators & Tech</option>
              <option value="Files & Folders">Files & Folders</option>
              <option value="Lab & Examination Supplies">Lab & Examination Supplies</option>
              <option value="Adhesives & Tools">Adhesives & Tools</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Stationery Item</th>
              <th>Item Code</th>
              <th>Category</th>
              <th>Unit Price</th>
              <th>Physical Stock</th>
              <th>Min Threshold</th>
              <th>Status</th>
              <th>Stock Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading inventory data...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No inventory items found.
                </td>
              </tr>
            ) : (
              items.map((prod) => (
                <tr key={prod._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={prod.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60'}
                        alt={prod.name}
                        style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: '700' }}>{prod.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{prod.brand} • {prod.unit}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {prod.itemCode}
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>{prod.category}</td>
                  <td style={{ fontWeight: '700' }}>₹{prod.price}</td>
                  <td>
                    <span style={{ fontSize: '1rem', fontWeight: '800', color: prod.stockQuantity <= prod.minStockThreshold ? '#dc2626' : 'var(--text-main)' }}>
                      {prod.stockQuantity}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>units</span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    <button
                      onClick={() => {
                        setSelectedProduct(prod);
                        setThresholdModalOpen(true);
                      }}
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--primary)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontWeight: '600',
                      }}
                      title="Adjust alert threshold"
                    >
                      {prod.minStockThreshold} <SlidersHorizontal size={12} />
                    </button>
                  </td>
                  <td>
                    <StockBadge status={prod.status} quantity={prod.stockQuantity} threshold={prod.minStockThreshold} />
                  </td>
                  <td style={{ fontWeight: '700', fontSize: '0.85rem' }}>
                    ₹{prod.stockQuantity * prod.price}
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedProduct(prod);
                        setRestockModalOpen(true);
                      }}
                      className="btn btn-sm"
                      style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}
                    >
                      <PackagePlus size={14} /> Restock
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
            fetchInventory();
          }}
        />
      )}

      {/* Threshold Modal */}
      {selectedProduct && (
        <ThresholdModal
          isOpen={thresholdModalOpen}
          product={selectedProduct}
          onClose={() => {
            setThresholdModalOpen(false);
            setSelectedProduct(null);
          }}
          onUpdated={() => {
            fetchInventory();
          }}
        />
      )}
    </div>
  );
};

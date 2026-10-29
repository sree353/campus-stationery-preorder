import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StockBadge } from '../../components/common/Badges';
import { ProductModal } from '../../components/admin/ProductModal';
import { ThresholdModal } from '../../components/admin/ThresholdModal';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  SlidersHorizontal,
  RefreshCw,
  Package,
} from 'lucide-react';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [thresholdModalOpen, setThresholdModalOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.products.getProducts({
        search: search.trim() || undefined,
        category: category !== 'All' ? category : undefined,
      });
      if (res.success) {
        setProducts(res.products || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}" from the stationery catalogue?`)) {
      return;
    }

    try {
      const res = await api.products.deleteProduct(id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete product.');
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-dark)' }}>
            Stationery Products Management (CRUD)
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Add, update, adjust prices, edit thresholds, and maintain campus supplies
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedProduct(null);
            setProductModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={16} /> Add New Product
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
                placeholder="Search products by title, code, brand..."
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
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-muted)' }}>Category:</span>
            <select
              className="form-select"
              style={{ width: 'auto', fontSize: '0.8125rem' }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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

          <button onClick={fetchProducts} className="btn btn-outline btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Products Table */}
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No stationery products found.
                </td>
              </tr>
            ) : (
              products.map((prod) => (
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
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--primary-dark)', fontWeight: '600' }}>
                    {prod.itemCode}
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>{prod.category}</td>
                  <td style={{ fontWeight: '700' }}>₹{prod.price}</td>
                  <td>
                    <span style={{ fontSize: '1rem', fontWeight: '800', color: prod.stockQuantity <= prod.minStockThreshold ? '#dc2626' : 'var(--text-main)' }}>
                      {prod.stockQuantity}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedProduct(prod);
                        setThresholdModalOpen(true);
                      }}
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--primary)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontWeight: '600',
                      }}
                      title="Adjust threshold"
                    >
                      {prod.minStockThreshold} <SlidersHorizontal size={12} />
                    </button>
                  </td>
                  <td>
                    <StockBadge status={prod.status} quantity={prod.stockQuantity} threshold={prod.minStockThreshold} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => {
                          setSelectedProduct(prod);
                          setProductModalOpen(true);
                        }}
                        className="btn btn-outline btn-sm"
                        title="Edit product"
                      >
                        <Edit size={14} /> Edit
                      </button>

                      <button
                        onClick={() => handleDelete(prod._id, prod.name)}
                        className="btn btn-danger btn-sm"
                        style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}
                        title="Delete product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={productModalOpen}
        product={selectedProduct}
        onClose={() => {
          setProductModalOpen(false);
          setSelectedProduct(null);
        }}
        onSaved={() => {
          fetchProducts();
        }}
      />

      {/* Threshold Modal */}
      <ThresholdModal
        isOpen={thresholdModalOpen}
        product={selectedProduct}
        onClose={() => {
          setThresholdModalOpen(false);
          setSelectedProduct(null);
        }}
        onUpdated={() => {
          fetchProducts();
        }}
      />
    </div>
  );
};

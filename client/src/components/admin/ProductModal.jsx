import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { X, Layers, AlertCircle } from 'lucide-react';

export const ProductModal = ({ product, isOpen, onClose, onSaved }) => {
  if (!isOpen) return null;

  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: '',
    itemCode: '',
    category: 'Notebooks & Registers',
    brand: '',
    unit: 'Piece',
    price: '',
    stockQuantity: '',
    minStockThreshold: '10',
    description: '',
    image: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        itemCode: product.itemCode || '',
        category: product.category || 'Notebooks & Registers',
        brand: product.brand || '',
        unit: product.unit || 'Piece',
        price: product.price || '',
        stockQuantity: product.stockQuantity || '0',
        minStockThreshold: product.minStockThreshold || '10',
        description: product.description || '',
        image: product.image || '',
      });
    } else {
      setFormData({
        name: '',
        itemCode: `BIT-STN-${Math.floor(100 + Math.random() * 900)}`,
        category: 'Notebooks & Registers',
        brand: 'Classmate',
        unit: 'Piece',
        price: '',
        stockQuantity: '20',
        minStockThreshold: '10',
        description: '',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60',
      });
    }
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const payload = {
        ...formData,
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        minStockThreshold: Number(formData.minStockThreshold),
      };

      let res;
      if (isEditing) {
        res = await api.products.updateProduct(product._id, payload);
      } else {
        res = await api.products.createProduct(payload);
      }

      if (res.success) {
        onSaved(res.product);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800' }}>
              {isEditing ? `Edit Stationery Product: ${product.name}` : 'Add New Stationery Product'}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Configure product details, catalogue pricing, and stock thresholds
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {error && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  color: '#991b1b',
                  fontSize: '0.8rem',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Official Lab Record Notebook"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Item Code *</label>
                <input
                  type="text"
                  name="itemCode"
                  required
                  className="form-input"
                  value={formData.itemCode}
                  onChange={handleChange}
                  placeholder="BIT-STN-101"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Category *</label>
                <select
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="Notebooks & Registers">Notebooks & Registers</option>
                  <option value="Drawing & Engineering">Drawing & Engineering</option>
                  <option value="Pens & Writing">Pens & Writing</option>
                  <option value="Calculators & Tech">Calculators & Tech</option>
                  <option value="Files & Folders">Files & Folders</option>
                  <option value="Lab & Examination Supplies">Lab & Examination Supplies</option>
                  <option value="Adhesives & Tools">Adhesives & Tools</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Brand</label>
                <input
                  type="text"
                  name="brand"
                  className="form-input"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g. Classmate, Casio, Pilot"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Unit Type</label>
                <input
                  type="text"
                  name="unit"
                  className="form-input"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="Piece, Pack"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.5"
                  required
                  className="form-input"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="₹"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Stock Qty *</label>
                <input
                  type="number"
                  name="stockQuantity"
                  min="0"
                  required
                  className="form-input"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Min Threshold *</label>
                <input
                  type="number"
                  name="minStockThreshold"
                  min="1"
                  required
                  className="form-input"
                  value={formData.minStockThreshold}
                  onChange={handleChange}
                  title="Stock <= threshold triggers Low Stock alerts"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Image URL</label>
              <input
                type="url"
                name="image"
                className="form-input"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Description & Syllabus Specifications</label>
              <textarea
                name="description"
                rows="2"
                className="form-textarea"
                value={formData.description}
                onChange={handleChange}
                placeholder="Item specification, semester subject relevance, page count..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

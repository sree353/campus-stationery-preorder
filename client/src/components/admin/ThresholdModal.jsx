import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { X, SlidersHorizontal } from 'lucide-react';
import { StockBadge } from '../common/Badges';

export const ThresholdModal = ({ product, isOpen, onClose, onUpdated }) => {
  if (!isOpen || !product) return null;

  const [threshold, setThreshold] = useState(product.minStockThreshold || 10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setThreshold(product.minStockThreshold || 10);
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (threshold < 1) {
      setError('Threshold must be at least 1.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.inventory.updateThreshold(product._id, {
        minStockThreshold: Number(threshold),
      });

      if (res.success) {
        onUpdated(res.product);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to update threshold.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SlidersHorizontal size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Set Low-Stock Threshold</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '0.8rem', padding: '0.5rem', borderRadius: '4px' }}>
                {error}
              </div>
            )}

            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: '700', fontSize: '0.875rem' }}>{product.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Code: {product.itemCode} • Current In Stock: <strong>{product.stockQuantity} units</strong>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Minimum Stock Alert Threshold (units)</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                required
              />
              <span className="form-hint">
                When inventory falls to or below this count, automatic alerts are dispatched to store staff and admin.
              </span>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Status with new threshold: {product.stockQuantity <= 0 ? 'Out of Stock' : product.stockQuantity <= threshold ? '⚠️ Low Stock' : '✅ In Stock'}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Update Threshold'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

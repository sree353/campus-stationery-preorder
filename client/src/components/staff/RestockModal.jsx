import React, { useState } from 'react';
import { api } from '../../services/api';
import { X, PackagePlus, AlertCircle } from 'lucide-react';
import { StockBadge } from '../common/Badges';

export const RestockModal = ({ product, isOpen, onClose, onRestocked }) => {
  if (!isOpen || !product) return null;

  const [quantity, setQuantity] = useState(10);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (quantity <= 0) {
      setError('Please specify at least 1 unit to restock.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.inventory.quickRestock({
        productId: product._id,
        addedQuantity: Number(quantity),
        note,
      });

      if (res.success) {
        onRestocked(res.product);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to restock product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: 'var(--success-50)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PackagePlus size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Quick Inventory Restock</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Add physical stock to campus store inventory
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  color: '#991b1b',
                  fontSize: '0.8rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {error}
              </div>
            )}

            {/* Product summary */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
              }}
            >
              <div style={{ fontWeight: '700', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                {product.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span>Code: <strong style={{ color: 'var(--text-main)' }}>{product.itemCode}</strong></span>
                <span>Category: <strong>{product.category}</strong></span>
              </div>
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem' }}>
                  Current In Store: <strong>{product.stockQuantity} units</strong> (Min: {product.minStockThreshold})
                </span>
                <StockBadge status={product.status} quantity={product.stockQuantity} threshold={product.minStockThreshold} />
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="form-label">Add Stock Quantity</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {[5, 10, 25, 50, 100].map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => setQuantity(preset)}
                    style={{
                      flex: 1,
                      padding: '0.4rem 0',
                      border: quantity === preset ? '2px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: quantity === preset ? 'var(--primary-50)' : '#ffffff',
                      color: quantity === preset ? 'var(--primary-dark)' : 'var(--text-main)',
                      fontWeight: '700',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                    }}
                  >
                    +{preset}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                className="form-input"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Replenishment Note / Vendor Invoice</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Received weekly batch from Campus Central Store"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div
              style={{
                backgroundColor: 'var(--success-50)',
                color: 'var(--success-text)',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.75rem',
              }}
            >
              Estimated new stock level: <strong>{product.stockQuantity + Number(quantity || 0)} units</strong>. Status will automatically update to <strong>In Stock</strong> if above minimum threshold ({product.minStockThreshold}).
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Restocking...' : `Add +${quantity} Units`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

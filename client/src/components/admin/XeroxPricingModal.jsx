import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { X, Settings, DollarSign, CheckCircle, AlertCircle, Save } from 'lucide-react';

export const XeroxPricingModal = ({ isOpen, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    bwPricePerPage: 2.0,
    colorPricePerPage: 10.0,
    doubleSidedDiscountPerPage: 0.5,
    cornerStapleCharge: 2.0,
    spiralBindingCharge: 30.0,
    softBindingCharge: 50.0,
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMsg('');
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.xerox.getSettings();
      if (res.success && res.settings) {
        setFormData({
          bwPricePerPage: res.settings.bwPricePerPage ?? 2.0,
          colorPricePerPage: res.settings.colorPricePerPage ?? 10.0,
          doubleSidedDiscountPerPage: res.settings.doubleSidedDiscountPerPage ?? 0.5,
          cornerStapleCharge: res.settings.cornerStapleCharge ?? 2.0,
          spiralBindingCharge: res.settings.spiralBindingCharge ?? 30.0,
          softBindingCharge: res.settings.softBindingCharge ?? 50.0,
        });
      }
    } catch (err) {
      setError('Failed to load current Xerox pricing.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      setSuccessMsg('');

      const res = await api.xerox.updateSettings(formData);
      if (res.success) {
        setSuccessMsg('Xerox print pricing configuration updated successfully!');
        if (onUpdated) onUpdated(res.settings);
        setTimeout(() => {
          onClose();
        }, 900);
      }
    } catch (err) {
      setError(err.message || 'Failed to update pricing settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: '#1e3a8a',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Settings size={16} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                Xerox & Print Pricing Configuration
              </h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
              Set campus standard per-page prices for Black & White, Colour, and Binding.
            </p>
          </div>
          <button onClick={onClose} style={{ color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem' }}>
          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '0.65rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                marginBottom: '1rem',
              }}
            >
              {error}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#047857',
                padding: '0.65rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <CheckCircle size={15} />
              <span>{successMsg}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* B&W Price */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                Black & White (₹ / page) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                name="bwPricePerPage"
                step="0.1"
                min="0.1"
                value={formData.bwPricePerPage}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.65rem',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                }}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Default single-side B&W</span>
            </div>

            {/* Colour Price */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                Full Colour (₹ / page) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                name="colorPricePerPage"
                step="0.5"
                min="0.5"
                value={formData.colorPricePerPage}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.65rem',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                }}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Inkjet/laser colour printing</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Double Sided Discount */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                2-Sided Discount (₹ / page)
              </label>
              <input
                type="number"
                name="doubleSidedDiscountPerPage"
                step="0.1"
                min="0"
                value={formData.doubleSidedDiscountPerPage}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.65rem',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                }}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Deducted per page on duplex</span>
            </div>

            {/* Corner Staple */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                Corner Staple (₹)
              </label>
              <input
                type="number"
                name="cornerStapleCharge"
                step="0.5"
                min="0"
                value={formData.cornerStapleCharge}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.65rem',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                }}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Stapling per document copy</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Spiral Binding */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                Spiral Binding (₹)
              </label>
              <input
                type="number"
                name="spiralBindingCharge"
                step="1"
                min="0"
                value={formData.spiralBindingCharge}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.65rem',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                }}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>With OHP transparent sheet</span>
            </div>

            {/* Soft Binding */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                Soft Binding (₹)
              </label>
              <input
                type="number"
                name="softBindingCharge"
                step="1"
                min="0"
                value={formData.softBindingCharge}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.65rem',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                }}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Project thesis spine taping</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loading}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#1e3a8a',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Save size={15} />
              {submitting ? 'Saving Prices...' : 'Save Xerox Pricing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

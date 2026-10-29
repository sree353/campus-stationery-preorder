import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  X,
  UploadCloud,
  FileText,
  Printer,
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  Sparkles,
  Layers,
  Copy,
  DollarSign,
  Palette,
} from 'lucide-react';

export const XeroxPreOrderModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [detectedPages, setDetectedPages] = useState(1);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [settings, setSettings] = useState({
    bwPricePerPage: 2.0,
    colorPricePerPage: 10.0,
    doubleSidedDiscountPerPage: 0.5,
    cornerStapleCharge: 2.0,
    spiralBindingCharge: 30.0,
    softBindingCharge: 50.0,
  });

  // Print Configuration Options
  const [pageRangeType, setPageRangeType] = useState('ALL'); // 'ALL' | 'CUSTOM'
  const [customPageRange, setCustomPageRange] = useState('');
  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState('BW'); // 'BW' | 'COLOUR'
  const [printSides, setPrintSides] = useState('SINGLE'); // 'SINGLE' | 'DOUBLE'
  const [binding, setBinding] = useState('NONE'); // 'NONE' | 'CORNER_STAPLE' | 'SPIRAL_BINDING' | 'SOFT_BINDING'
  const [pickupDate, setPickupDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [pickupSlot, setPickupSlot] = useState('Lunch Break (12:45 PM - 01:45 PM)');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const pickupSlots = [
    'Morning Slot (08:30 AM - 09:15 AM)',
    'Mid-Morning Slot (10:45 AM - 11:15 AM)',
    'Lunch Break (12:45 PM - 01:45 PM)',
    'Afternoon Slot (03:15 PM - 03:45 PM)',
    'Evening Post-Class (04:30 PM - 05:45 PM)',
  ];

  // Load pricing configuration
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.xerox.getSettings();
        if (res.success && res.settings) {
          setSettings(res.settings);
        }
      } catch (err) {
        console.error('Failed to load Xerox settings:', err);
      }
    };
    if (isOpen) {
      fetchSettings();
      setErrorMessage('');
    }
  }, [isOpen]);

  // Handle file selection
  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please select a valid PDF file (.pdf).');
      return;
    }

    if (selected.size > 30 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 30MB limit.');
      return;
    }

    setFile(selected);
    setErrorMessage('');

    // Call preview endpoint to extract page count
    const formData = new FormData();
    formData.append('pdfFile', selected);

    try {
      setLoadingPreview(true);
      const res = await api.xerox.previewPdf(formData);
      if (res.success && res.file) {
        setDetectedPages(res.file.detectedPages || 1);
        if (res.settings) setSettings(res.settings);
      }
    } catch (err) {
      console.warn('Could not auto-extract PDF page count:', err);
      setDetectedPages(1); // fallback
    } finally {
      setLoadingPreview(false);
    }
  };

  // Helper to parse page range and estimate total pages printed per copy
  const calculateEffectivePages = () => {
    if (pageRangeType === 'ALL' || !customPageRange.trim()) {
      return detectedPages;
    }

    const parts = customPageRange.split(',').map((p) => p.trim()).filter(Boolean);
    const selectedPages = new Set();

    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end) && start >= 1 && start <= end) {
          for (let p = start; p <= Math.min(end, detectedPages || 9999); p++) {
            selectedPages.add(p);
          }
        }
      } else {
        const pageNum = parseInt(part, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= (detectedPages || 9999)) {
          selectedPages.add(pageNum);
        }
      }
    }

    return selectedPages.size > 0 ? selectedPages.size : detectedPages;
  };

  const pagesPerCopy = calculateEffectivePages();

  // Price Calculation
  const baseRate = colorMode === 'COLOUR' ? settings.colorPricePerPage : settings.bwPricePerPage;
  const effectiveRate =
    printSides === 'DOUBLE'
      ? Math.max(0.5, baseRate - (settings.doubleSidedDiscountPerPage || 0.5))
      : baseRate;

  let bindingCharge = 0;
  if (binding === 'CORNER_STAPLE') bindingCharge = settings.cornerStapleCharge || 2;
  else if (binding === 'SPIRAL_BINDING') bindingCharge = settings.spiralBindingCharge || 30;
  else if (binding === 'SOFT_BINDING') bindingCharge = settings.softBindingCharge || 50;

  const costPerCopy = pagesPerCopy * effectiveRate + bindingCharge;
  const totalEstimatedCost = Math.round(costPerCopy * copies * 100) / 100;

  // Submit Xerox Pre-Order
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Please select a PDF document to upload.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');

      const formData = new FormData();
      formData.append('pdfFile', file);
      formData.append('pageRangeType', pageRangeType);
      formData.append('customPageRange', pageRangeType === 'CUSTOM' ? customPageRange : '');
      formData.append('copies', copies);
      formData.append('colorMode', colorMode);
      formData.append('printSides', printSides);
      formData.append('binding', binding);
      formData.append('pickupDate', pickupDate);
      formData.append('pickupTimeSlot', pickupSlot);
      formData.append('studentNotes', notes);

      const res = await api.xerox.createOrder(formData);

      if (res.success) {
        onSuccess(res.order);
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit Xerox pre-order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Printer size={16} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>
                Online Xerox / Photocopy Pre-Order
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
              Upload your PDF, select print preferences, calculate exact charges, and collect at Store Desk #02.
            </p>
          </div>
          <button onClick={onClose} style={{ color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem' }}>
          {errorMessage && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* PDF File Upload Zone */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
              Upload PDF Document <span style={{ color: '#ef4444' }}>*</span>
            </label>

            <div
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '10px',
                padding: '1.25rem 1rem',
                textAlign: 'center',
                backgroundColor: file ? '#eff6ff' : '#f8fafc',
                borderColor: file ? '#3b82f6' : '#cbd5e1',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer',
                  width: '100%',
                  height: '100%',
                }}
              />
              {file ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                  <FileText size={32} color="#2563eb" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1e3a8a' }}>{file.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB •{' '}
                      {loadingPreview ? 'Analyzing pages...' : `${detectedPages} page(s) detected`}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: '700', textDecoration: 'underline' }}>
                    Change
                  </span>
                </div>
              ) : (
                <div>
                  <UploadCloud size={36} color="#64748b" style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#334155' }}>
                    Click or drag & drop PDF here
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                    Standard PDF documents up to 30 MB (Lab manuals, projects, assignments, notes)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preferences Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Color Mode */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                Color Preference
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setColorMode('BW')}
                  style={{
                    padding: '0.55rem 0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    border: '1px solid',
                    borderColor: colorMode === 'BW' ? '#1e3a8a' : '#cbd5e1',
                    backgroundColor: colorMode === 'BW' ? '#eff6ff' : '#ffffff',
                    color: colorMode === 'BW' ? '#1e3a8a' : '#475569',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <span>Black & White</span>
                </button>
                <button
                  type="button"
                  onClick={() => setColorMode('COLOUR')}
                  style={{
                    padding: '0.55rem 0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    border: '1px solid',
                    borderColor: colorMode === 'COLOUR' ? '#ec4899' : '#cbd5e1',
                    backgroundColor: colorMode === 'COLOUR' ? '#fdf2f8' : '#ffffff',
                    color: colorMode === 'COLOUR' ? '#be185d' : '#475569',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Palette size={14} />
                  <span>Full Colour</span>
                </button>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>
                Rate: ₹{colorMode === 'COLOUR' ? settings.colorPricePerPage : settings.bwPricePerPage}/pg
              </div>
            </div>

            {/* Print Sides */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                Print Sides
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setPrintSides('SINGLE')}
                  style={{
                    padding: '0.55rem 0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    border: '1px solid',
                    borderColor: printSides === 'SINGLE' ? '#1e3a8a' : '#cbd5e1',
                    backgroundColor: printSides === 'SINGLE' ? '#eff6ff' : '#ffffff',
                    color: printSides === 'SINGLE' ? '#1e3a8a' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Single-Sided
                </button>
                <button
                  type="button"
                  onClick={() => setPrintSides('DOUBLE')}
                  style={{
                    padding: '0.55rem 0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    border: '1px solid',
                    borderColor: printSides === 'DOUBLE' ? '#0f766e' : '#cbd5e1',
                    backgroundColor: printSides === 'DOUBLE' ? '#f0fdfa' : '#ffffff',
                    color: printSides === 'DOUBLE' ? '#0f766e' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Double-Sided
                </button>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>
                {printSides === 'DOUBLE'
                  ? `Save ₹${settings.doubleSidedDiscountPerPage || 0.5}/pg on 2-sided`
                  : 'Standard 1 page per sheet'}
              </div>
            </div>
          </div>

          {/* Page Range & Copies */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Page Range */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                Page Range
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="pageRangeType"
                    checked={pageRangeType === 'ALL'}
                    onChange={() => setPageRangeType('ALL')}
                  />
                  <span>All Pages ({detectedPages})</span>
                </label>
                <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="pageRangeType"
                    checked={pageRangeType === 'CUSTOM'}
                    onChange={() => setPageRangeType('CUSTOM')}
                  />
                  <span>Custom Range</span>
                </label>
              </div>
              {pageRangeType === 'CUSTOM' && (
                <input
                  type="text"
                  placeholder="e.g. 1-5, 8, 10-12"
                  value={customPageRange}
                  onChange={(e) => setCustomPageRange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.82rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                  }}
                />
              )}
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>
                Printing <strong>{pagesPerCopy}</strong> pages per copy
              </div>
            </div>

            {/* Copies */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                Number of Copies
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setCopies((c) => Math.max(1, c - 1))}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    fontWeight: '700',
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  style={{
                    width: '54px',
                    textAlign: 'center',
                    padding: '0.4rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontWeight: '700',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setCopies((c) => c + 1)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    fontWeight: '700',
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Binding Option */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
              Finishing & Binding
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {[
                { id: 'NONE', label: 'No Binding', price: 0 },
                { id: 'CORNER_STAPLE', label: 'Corner Staple', price: settings.cornerStapleCharge || 2 },
                { id: 'SPIRAL_BINDING', label: 'Spiral Binding', price: settings.spiralBindingCharge || 30 },
                { id: 'SOFT_BINDING', label: 'Soft Binding', price: settings.softBindingCharge || 50 },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setBinding(opt.id)}
                  style={{
                    padding: '0.5rem 0.35rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    border: '1px solid',
                    borderColor: binding === opt.id ? '#1e3a8a' : '#cbd5e1',
                    backgroundColor: binding === opt.id ? '#eff6ff' : '#ffffff',
                    color: binding === opt.id ? '#1e3a8a' : '#475569',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <div>{opt.label}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '500' }}>
                    {opt.price === 0 ? 'Free' : `+₹${opt.price}`}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pickup Date & Slot */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                Pickup Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="date"
                value={pickupDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setPickupDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.65rem',
                  fontSize: '0.82rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                Pickup Time Slot <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={pickupSlot}
                onChange={(e) => setPickupSlot(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.65rem',
                  fontSize: '0.82rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                }}
              >
                {pickupSlots.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Special Instructions */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
              Special Instructions for Store Staff (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Please staple top-left, first page in colour, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.65rem',
                fontSize: '0.82rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
              }}
            />
          </div>

          {/* Cost Estimation Summary Card */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Estimated Xerox Charges</span>
              <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '700' }}>
                Pay ₹{totalEstimatedCost} at Counter
              </span>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  Printing: {pagesPerCopy} pgs × ₹{effectiveRate}/pg × {copies} copy/copies
                </span>
                <span>₹{(pagesPerCopy * effectiveRate * copies).toFixed(2)}</span>
              </div>
              {bindingCharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Binding Charge ({binding.replace(/_/g, ' ')})</span>
                  <span>₹{(bindingCharge * copies).toFixed(2)}</span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px dashed #cbd5e1',
                  paddingTop: '0.5rem',
                  marginTop: '0.25rem',
                  fontWeight: '800',
                  fontSize: '1rem',
                  color: '#0f172a',
                }}
              >
                <span>Total Pre-Order Amount</span>
                <span style={{ color: '#1e3a8a' }}>₹{totalEstimatedCost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '8px',
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
              disabled={submitting || !file}
              style={{
                padding: '0.55rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: !file ? '#94a3b8' : '#1e3a8a',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: !file ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Printer size={16} />
              {submitting ? 'Submitting Pre-Order...' : `Submit Xerox Pre-Order (₹${totalEstimatedCost})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

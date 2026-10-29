import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { StockBadge } from '../../components/common/Badges';
import {
  ArrowLeft,
  ShoppingBag,
  Heart,
  Check,
  ShieldCheck,
  Clock,
  Layers,
  AlertTriangle,
  Building,
} from 'lucide-react';

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInWishlist, toggleWishlist } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [cartError, setCartError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.products.getProductById(id);
        if (res.success) {
          setProduct(res.product);
        }
      } catch (err) {
        setError(err.message || 'Product not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading stationery product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>Product Not Found</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error || 'This item could not be located in the store catalog.'}</p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} /> Return to Stationery Catalog
        </Link>
      </div>
    );
  }

  const isOut = product.stockQuantity <= 0;
  const isWish = isInWishlist(product._id);

  const handleAddToCart = () => {
    try {
      setCartError('');
      addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      setCartError(err.message);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      {/* Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-muted)',
            fontWeight: '600',
            fontSize: '0.875rem',
          }}
        >
          <ArrowLeft size={16} /> Back to Catalog
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Left Column: Image */}
        <div>
          <div
            style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border)',
              height: '380px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <img
              src={product.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60'}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&auto=format&fit=crop&q=60';
              }}
            />

            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                color: '#ffffff',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                fontWeight: '700',
              }}
            >
              ITEM CODE: {product.itemCode}
            </div>
          </div>
        </div>

        {/* Right Column: Info & Action */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase' }}>
              {product.category}
            </span>
            <StockBadge
              status={product.status}
              quantity={product.stockQuantity}
              threshold={product.minStockThreshold}
            />
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
            {product.name}
          </h1>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Brand: <strong style={{ color: 'var(--text-main)' }}>{product.brand}</strong> • Packaging: <strong>{product.unit}</strong>
          </div>

          {/* Price box */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.5rem',
            }}
          >
            <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-dark)' }}>
              ₹{product.price}
            </span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              inclusive of all college store tariffs
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                Description & Usage
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {product.description}
              </p>
            </div>
          )}

          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                Product Specifications
              </h4>
              <div
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  fontSize: '0.8125rem',
                }}
              >
                {product.specifications.map((spec, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '140px 1fr',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: idx % 2 === 0 ? '#f8fafc' : '#ffffff',
                      borderBottom: idx < product.specifications.length - 1 ? '1px solid var(--border-light)' : 'none',
                    }}
                  >
                    <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>{spec.key}</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cartError && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                fontSize: '0.8rem',
                padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
              }}
            >
              {cartError}
            </div>
          )}

          {/* Actions */}
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {!isOut && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    height: '44px',
                  }}
                >
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={{ width: '38px', height: '100%', backgroundColor: '#f8fafc', fontWeight: 'bold' }}
                  >
                    -
                  </button>
                  <span style={{ width: '40px', textAlign: 'center', fontWeight: '700' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                    style={{ width: '38px', height: '100%', backgroundColor: '#f8fafc', fontWeight: 'bold' }}
                  >
                    +
                  </button>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={isOut}
                className={`btn btn-lg ${added ? 'btn-success' : 'btn-primary'}`}
                style={{ flex: 1 }}
              >
                {isOut ? (
                  'Currently Out of Stock'
                ) : added ? (
                  <>
                    <Check size={18} /> Added to Pre-Order Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} /> Add to Pre-Order Cart
                  </>
                )}
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className="btn btn-outline btn-lg"
                title={isWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
                style={{ color: isWish ? '#ef4444' : 'inherit' }}
              >
                <Heart size={20} fill={isWish ? '#ef4444' : 'none'} />
              </button>
            </div>

            {/* Counter pickup reminder */}
            <div
              style={{
                marginTop: '1.25rem',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                display: 'flex',
                gap: '0.5rem',
                fontSize: '0.8rem',
                color: '#1e40af',
              }}
            >
              <Building size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Campus Pickup Guarantee:</strong> After completing your pre-order, this item is reserved exclusively for you at the BIT stationery counter.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

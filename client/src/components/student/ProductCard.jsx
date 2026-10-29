import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { StockBadge } from '../common/Badges';
import { ShoppingBag, Heart, Eye, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProductCard = ({ product, onQuickView }) => {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isOut = product.stockQuantity <= 0;
  const isWish = isInWishlist(product._id);

  const handleAddToCart = () => {
    try {
      setErrorMsg('');
      addToCart(product, quantity);
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 1500);
    } catch (err) {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(''), 3500);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
      }}
      className="product-card"
    >
      {/* Top Image & Wishlist Button */}
      <div
        style={{
          position: 'relative',
          height: '180px',
          backgroundColor: '#f8fafc',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={product.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60'}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&auto=format&fit=crop&q=60';
          }}
        />

        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product)}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            color: isWish ? '#ef4444' : '#64748b',
          }}
          title={isWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={18} fill={isWish ? '#ef4444' : 'none'} />
        </button>

        {/* Item Code Pill */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            color: '#ffffff',
            fontSize: '0.68rem',
            fontWeight: '700',
            padding: '0.15rem 0.45rem',
            borderRadius: '4px',
            letterSpacing: '0.04em',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {product.itemCode}
        </div>
      </div>

      {/* Product Details */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase' }}>
            {product.category}
          </span>
          <StockBadge
            status={product.status}
            quantity={product.stockQuantity}
            threshold={product.minStockThreshold}
          />
        </div>

        <Link
          to={`/products/${product._id}`}
          style={{
            fontWeight: '700',
            fontSize: '0.975rem',
            color: 'var(--text-main)',
            lineHeight: 1.35,
            marginBottom: '0.35rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.name}
        </Link>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
          Brand: <strong>{product.brand}</strong> • {product.unit}
        </p>

        {/* Pricing */}
        <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary-dark)' }}>
              ₹{product.price}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              / {product.unit}
            </span>
          </div>

          {errorMsg && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                fontSize: '0.72rem',
                padding: '0.35rem 0.5rem',
                borderRadius: '4px',
                marginBottom: '0.5rem',
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {!isOut && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  height: '36px',
                }}
              >
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{ width: '28px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', fontWeight: 'bold' }}
                >
                  -
                </button>
                <span style={{ width: '28px', textAlign: 'center', fontSize: '0.8125rem', fontWeight: '700' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                  style={{ width: '28px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', fontWeight: 'bold' }}
                >
                  +
                </button>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={isOut}
              className={`btn ${addedAnimation ? 'btn-success' : 'btn-primary'}`}
              style={{ flex: 1, height: '36px', padding: '0 0.5rem' }}
            >
              {isOut ? (
                'Out of Stock'
              ) : addedAnimation ? (
                <>
                  <Check size={16} /> Added!
                </>
              ) : (
                <>
                  <ShoppingBag size={16} /> Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

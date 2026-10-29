import React from 'react';
import { useCart } from '../../context/CartContext';
import { StockBadge } from '../../components/common/Badges';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';

export const WishlistPage = () => {
  const { wishlist, toggleWishlist, addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="container" style={{ padding: '5rem 1.25rem', textAlign: 'center' }}>
        <div
          style={{
            maxWidth: '440px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '3rem 2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Heart size={48} color="#ef4444" style={{ opacity: 0.35, margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            Your Wishlist is Empty
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Save stationery products you need for later semester lab tests or coursework.
          </p>
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={16} /> Explore Stationery Items
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-dark)' }}>
          My Stationery Wishlist ({wishlist.length})
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Quickly pre-order items saved for your lab classes and assignments
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {wishlist.map((product) => {
          const isOut = product.stockQuantity <= 0;
          return (
            <div
              key={product._id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ height: '160px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem', backgroundColor: '#f8fafc' }}>
                <img
                  src={product.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60'}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {product.itemCode}
                </span>
                <StockBadge status={product.status} quantity={product.stockQuantity} threshold={product.minStockThreshold} />
              </div>

              <Link
                to={`/products/${product._id}`}
                style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}
              >
                {product.name}
              </Link>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {product.brand} • {product.unit}
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary-dark)' }}>
                  ₹{product.price}
                </span>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="btn btn-outline btn-sm"
                    title="Remove from wishlist"
                    style={{ color: 'var(--danger)' }}
                  >
                    <Trash2 size={15} />
                  </button>

                  <button
                    onClick={() => {
                      addToCart(product, 1);
                      toggleWishlist(product);
                    }}
                    disabled={isOut}
                    className="btn btn-primary btn-sm"
                  >
                    <ShoppingBag size={15} /> Move to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

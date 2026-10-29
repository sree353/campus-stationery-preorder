import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { PreOrderModal } from '../../components/student/PreOrderModal';
import { OrderSlipModal } from '../../components/student/OrderSlipModal';
import { StockBadge } from '../../components/common/Badges';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  ArrowLeft,
  CalendarCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';

export const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [preOrderModalOpen, setPreOrderModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [orderSlipOpen, setOrderSlipOpen] = useState(false);

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/student/cart');
      return;
    }
    setPreOrderModalOpen(true);
  };

  const handlePreOrderSuccess = (order) => {
    setPreOrderModalOpen(false);
    setCompletedOrder(order);
    setOrderSlipOpen(true);
  };

  if (cartItems.length === 0 && !completedOrder) {
    return (
      <div className="container" style={{ padding: '5rem 1.25rem', textAlign: 'center' }}>
        <div
          style={{
            maxWidth: '460px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '3rem 2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <ShoppingBag size={52} color="var(--primary)" style={{ opacity: 0.35, margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            Your Pre-Order Cart is Empty
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Browse our college stationery catalog to pre-order official lab records, drawing sheets, calculators, and exam kits.
          </p>
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={16} /> Browse Stationery Items
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-dark)' }}>
            Pre-Order Basket ({cartItems.length} items)
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Review your selected stationery supplies before scheduling pickup
          </p>
        </div>

        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            style={{
              fontSize: '0.8125rem',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: '600',
            }}
          >
            <Trash2 size={16} /> Clear All
          </button>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          alignItems: 'flex-start',
        }}
      >
        {/* Left: Cart Items Table */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', backgroundColor: '#f8fafc', fontWeight: '700', fontSize: '0.875rem' }}>
            Item Details & Quantities
          </div>

          <div style={{ divideY: '1px solid var(--border-light)' }}>
            {cartItems.map((item) => {
              const exceedsStock = item.quantity > item.product.stockQuantity;
              return (
                <div
                  key={item.product._id}
                  style={{
                    padding: '1.25rem',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                    backgroundColor: exceedsStock ? '#fff1f2' : 'transparent',
                  }}
                >
                  <img
                    src={item.product.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60'}
                    alt={item.product.name}
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: 'var(--radius-md)',
                      objectFit: 'cover',
                      border: '1px solid var(--border)',
                      flexShrink: 0,
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {item.product.itemCode}
                      </span>
                      <StockBadge
                        status={item.product.status}
                        quantity={item.product.stockQuantity}
                        threshold={item.product.minStockThreshold}
                      />
                    </div>

                    <Link
                      to={`/products/${item.product._id}`}
                      style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)' }}
                    >
                      {item.product.name}
                    </Link>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      ₹{item.product.price} each • In Store: {item.product.stockQuantity} units
                    </div>

                    {exceedsStock && (
                      <div style={{ color: 'var(--danger)', fontSize: '0.75rem', fontWeight: '700', marginTop: '0.25rem' }}>
                        ⚠️ Exceeds store stock ({item.product.stockQuantity} available). Please adjust quantity.
                      </div>
                    )}
                  </div>

                  {/* Quantity adjustment */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        height: '32px',
                      }}
                    >
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        style={{ width: '28px', height: '100%', backgroundColor: '#f8fafc', fontWeight: 'bold' }}
                      >
                        -
                      </button>
                      <span style={{ width: '32px', textAlign: 'center', fontSize: '0.8125rem', fontWeight: '700' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          if (item.quantity < item.product.stockQuantity) {
                            updateQuantity(item.product._id, item.quantity + 1);
                          }
                        }}
                        style={{ width: '28px', height: '100%', backgroundColor: '#f8fafc', fontWeight: 'bold' }}
                      >
                        +
                      </button>
                    </div>

                    <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--primary-dark)' }}>
                      ₹{item.product.price * item.quantity}
                    </span>

                    <button
                      onClick={() => removeFromCart(item.product._id)}
                      style={{ color: 'var(--text-muted)', padding: '0.2rem' }}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Order Summary Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary-dark)', marginBottom: '1.25rem' }}>
            Pre-Order Summary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Total Stationery Items</span>
              <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)} units
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Counter Reservation Fee</span>
              <span style={{ fontWeight: '700', color: 'var(--success-text)' }}>FREE (Campus Service)</span>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>Total Payable at Desk:</span>
              <span style={{ fontWeight: '800', fontSize: '1.5rem', color: 'var(--primary-dark)' }}>
                ₹{cartTotal}
              </span>
            </div>
          </div>

          <div
            style={{
              margin: '1.25rem 0',
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            <Info size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              Pre-ordering guarantees item reservation. You'll choose your pickup slot next. Cash or UPI paid upon counter handover.
            </div>
          </div>

          <button
            onClick={handleCheckoutClick}
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
          >
            <CalendarCheck size={18} /> Schedule Counter Pickup
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link
              to="/"
              style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: '600' }}
            >
              ← Add more items to basket
            </Link>
          </div>
        </div>
      </div>

      {/* Pre-Order Confirmation Modal */}
      <PreOrderModal
        isOpen={preOrderModalOpen}
        onClose={() => setPreOrderModalOpen(false)}
        onSuccess={handlePreOrderSuccess}
      />

      {/* Slip Modal */}
      {completedOrder && (
        <OrderSlipModal
          isOpen={orderSlipOpen}
          order={completedOrder}
          onClose={() => {
            setOrderSlipOpen(false);
            navigate('/student/my-orders');
          }}
        />
      )}
    </div>
  );
};

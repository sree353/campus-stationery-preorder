import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import { RoleBadge } from './Badges';
import {
  ShoppingBag,
  Heart,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Package,
  Layers,
  BarChart3,
  Users,
  CheckCircle,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount, wishlist } = useCart();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)',
      }}
      className="no-print"
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '68px',
        }}
      >
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px rgba(30, 58, 138, 0.25)',
            }}
          >
            <Package size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontWeight: '800', fontSize: '1.15rem', color: 'var(--primary-dark)', letterSpacing: '-0.02em' }}>
                BIT STATIONERY
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  backgroundColor: 'var(--primary-50)',
                  color: 'var(--primary)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                  border: '1px solid var(--primary-100)',
                }}
              >
                CAMPUS PRE-ORDER
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Official Student Supplies & Inventory Hub
            </p>
          </div>
        </Link>

        {/* Navigation Links based on role */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
          }}
          className="desktop-nav"
        >
          {/* Student or Guest Links */}
          {(!user || user.role === 'student') && (
            <>
              <Link
                to="/"
                style={{
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  color: isActive('/') ? 'var(--primary)' : 'var(--text-main)',
                  borderBottom: isActive('/') ? '2px solid var(--primary)' : '2px solid transparent',
                  padding: '0.5rem 0',
                }}
              >
                Stationery Catalog
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to="/student/my-orders"
                    style={{
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      color: isActive('/student/my-orders') ? 'var(--primary)' : 'var(--text-main)',
                      borderBottom: isActive('/student/my-orders') ? '2px solid var(--primary)' : '2px solid transparent',
                      padding: '0.5rem 0',
                    }}
                  >
                    My Pre-Orders
                  </Link>

                  <Link
                    to="/student/wishlist"
                    style={{
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: isActive('/student/wishlist') ? 'var(--primary)' : 'var(--text-main)',
                      borderBottom: isActive('/student/wishlist') ? '2px solid var(--primary)' : '2px solid transparent',
                      padding: '0.5rem 0',
                    }}
                  >
                    <Heart size={16} />
                    Wishlist
                    {wishlist.length > 0 && (
                      <span
                        style={{
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '999px',
                          fontSize: '0.7rem',
                        }}
                      >
                        {wishlist.length}
                      </span>
                    )}
                  </Link>
                </>
              )}
            </>
          )}

          {/* Store Staff Links */}
          {user?.role === 'staff' && (
            <>
              <Link
                to="/staff/dashboard"
                style={{
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  color: isActive('/staff/dashboard') ? 'var(--primary)' : 'var(--text-main)',
                  borderBottom: isActive('/staff/dashboard') ? '2px solid var(--primary)' : '2px solid transparent',
                  padding: '0.5rem 0',
                }}
              >
                Staff Dashboard
              </Link>
              <Link
                to="/staff/orders"
                style={{
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  color: isActive('/staff/orders') ? 'var(--primary)' : 'var(--text-main)',
                  borderBottom: isActive('/staff/orders') ? '2px solid var(--primary)' : '2px solid transparent',
                  padding: '0.5rem 0',
                }}
              >
                Orders Queue
              </Link>
              <Link
                to="/staff/inventory"
                style={{
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  color: isActive('/staff/inventory') ? 'var(--primary)' : 'var(--text-main)',
                  borderBottom: isActive('/staff/inventory') ? '2px solid var(--primary)' : '2px solid transparent',
                  padding: '0.5rem 0',
                }}
              >
                Inventory & Stock
              </Link>
            </>
          )}

          {/* Campus Admin Links */}
          {user?.role === 'admin' && (
            <>
              <Link
                to="/admin/dashboard"
                style={{
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  color: isActive('/admin/dashboard') ? 'var(--primary)' : 'var(--text-main)',
                  borderBottom: isActive('/admin/dashboard') ? '2px solid var(--primary)' : '2px solid transparent',
                  padding: '0.5rem 0',
                }}
              >
                Admin Overview
              </Link>
              <Link
                to="/admin/products"
                style={{
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  color: isActive('/admin/products') ? 'var(--primary)' : 'var(--text-main)',
                  borderBottom: isActive('/admin/products') ? '2px solid var(--primary)' : '2px solid transparent',
                  padding: '0.5rem 0',
                }}
              >
                Products CRUD
              </Link>
              <Link
                to="/admin/inventory"
                style={{
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  color: isActive('/admin/inventory') ? 'var(--primary)' : 'var(--text-main)',
                  borderBottom: isActive('/admin/inventory') ? '2px solid var(--primary)' : '2px solid transparent',
                  padding: '0.5rem 0',
                }}
              >
                Inventory & Thresholds
              </Link>
              <Link
                to="/admin/orders"
                style={{
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  color: isActive('/admin/orders') ? 'var(--primary)' : 'var(--text-main)',
                  borderBottom: isActive('/admin/orders') ? '2px solid var(--primary)' : '2px solid transparent',
                  padding: '0.5rem 0',
                }}
              >
                All Orders
              </Link>
              <Link
                to="/admin/users"
                style={{
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  color: isActive('/admin/users') ? 'var(--primary)' : 'var(--text-main)',
                  borderBottom: isActive('/admin/users') ? '2px solid var(--primary)' : '2px solid transparent',
                  padding: '0.5rem 0',
                }}
              >
                Users
              </Link>
              <Link
                to="/admin/reports"
                style={{
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  color: isActive('/admin/reports') ? 'var(--primary)' : 'var(--text-main)',
                  borderBottom: isActive('/admin/reports') ? '2px solid var(--primary)' : '2px solid transparent',
                  padding: '0.5rem 0',
                }}
              >
                Reports
              </Link>
            </>
          )}
        </nav>

        {/* Right Action Icons: Notification, Cart, Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Notification dropdown */}
          {isAuthenticated && (
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                style={{
                  position: 'relative',
                  padding: '0.55rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: notifDropdownOpen ? 'var(--bg-muted)' : 'transparent',
                  color: 'var(--text-main)',
                }}
                title="Notifications & Stock Alerts"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      borderRadius: '9999px',
                      fontSize: '0.65rem',
                      fontWeight: '800',
                      minWidth: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 2px',
                      border: '2px solid #ffffff',
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              {notifDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '360px',
                    backgroundColor: '#ffffff',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-xl)',
                    zIndex: 100,
                    maxHeight: '440px',
                    overflowY: 'auto',
                  }}
                >
                  <div
                    style={{
                      padding: '0.875rem 1rem',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.875rem' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <span
                          style={{
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '9999px',
                          }}
                        >
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div style={{ padding: '0.25rem 0' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Bell size={24} style={{ opacity: 0.3, margin: '0 auto 0.5rem' }} />
                        <p style={{ fontSize: '0.8125rem' }}>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => markAsRead(n._id)}
                          style={{
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid var(--border-light)',
                            backgroundColor: n.isRead ? 'transparent' : '#f0f9ff',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                            {n.type === 'LOW_STOCK' || n.type === 'OUT_OF_STOCK' ? (
                              <AlertTriangle size={16} color="#d97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                            ) : (
                              <CheckCircle size={16} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} />
                            )}
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: '0.8125rem', fontWeight: n.isRead ? '600' : '700', color: 'var(--text-main)' }}>
                                {n.title}
                              </p>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {n.message}
                              </p>
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cart Icon (Student & Guest) */}
          {(!user || user.role === 'student') && (
            <Link
              to="/student/cart"
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.5rem 0.85rem',
                backgroundColor: 'var(--bg-muted)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontWeight: '600',
                fontSize: '0.8125rem',
              }}
              title="View Cart & Pre-Order Checkout"
            >
              <ShoppingBag size={18} color="var(--primary)" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    borderRadius: '9999px',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    padding: '0.1rem 0.45rem',
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* User Profile or Login */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }} ref={userRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.6rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: userDropdownOpen ? 'var(--bg-muted)' : 'transparent',
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-100)',
                    color: 'var(--primary-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                  }}
                >
                  {user.name.charAt(0)}
                </div>
                <div style={{ textAlign: 'left', display: 'none' }} className="user-text">
                  <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: 1.2 }}>
                    {user.name.split(' ')[0]}
                  </div>
                  <RoleBadge role={user.role} />
                </div>
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '240px',
                    backgroundColor: '#ffffff',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-xl)',
                    zIndex: 100,
                    padding: '0.5rem 0',
                  }}
                >
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
                    <p style={{ fontWeight: '700', fontSize: '0.875rem' }}>{user.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
                    <div style={{ marginTop: '0.35rem' }}>
                      <RoleBadge role={user.role} />
                    </div>
                    {user.rollNumber && (
                      <p style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: '600', marginTop: '0.25rem' }}>
                        Roll No: {user.rollNumber}
                      </p>
                    )}
                  </div>

                  <div style={{ padding: '0.25rem 0' }}>
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.6rem 1rem',
                        fontSize: '0.8125rem',
                        color: 'var(--text-main)',
                      }}
                    >
                      <User size={16} />
                      My Profile
                    </Link>

                    {user.role === 'student' && (
                      <Link
                        to="/student/my-orders"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.6rem 1rem',
                          fontSize: '0.8125rem',
                          color: 'var(--text-main)',
                        }}
                      >
                        <FileText size={16} />
                        My Pre-Orders
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.6rem 1rem',
                        fontSize: '0.8125rem',
                        color: 'var(--danger)',
                        borderTop: '1px solid var(--border-light)',
                        marginTop: '0.25rem',
                      }}
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

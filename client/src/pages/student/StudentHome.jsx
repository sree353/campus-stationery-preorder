import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ProductCard } from '../../components/student/ProductCard';
import {
  Search,
  Filter,
  Package,
  Layers,
  ArrowUpDown,
  BookOpen,
  Compass,
  PenTool,
  Cpu,
  Folder,
  FlaskConical,
  Scissors,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const StudentHome = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const categories = [
    { label: 'All Items', value: 'All', icon: Layers },
    { label: 'Notebooks & Registers', value: 'Notebooks & Registers', icon: BookOpen },
    { label: 'Drawing & Engineering', value: 'Drawing & Engineering', icon: Compass },
    { label: 'Pens & Writing', value: 'Pens & Writing', icon: PenTool },
    { label: 'Calculators & Tech', value: 'Calculators & Tech', icon: Cpu },
    { label: 'Files & Folders', value: 'Files & Folders', icon: Folder },
    { label: 'Lab & Exam Supplies', value: 'Lab & Examination Supplies', icon: FlaskConical },
    { label: 'Adhesives & Tools', value: 'Adhesives & Tools', icon: Scissors },
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.products.getProducts({
        search: search.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        sortBy,
      });
      if (res.success) {
        setProducts(res.products || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedStatus, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div>
      {/* Hero Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
          color: '#ffffff',
          padding: '3rem 0 2.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '720px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '700',
                marginBottom: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
            >
              <Sparkles size={14} color="#fde047" />
              <span>Campus Store Pre-Order Portal</span>
            </div>

            <h1
              style={{
                fontSize: '2.25rem',
                fontWeight: '800',
                lineHeight: 1.2,
                letterSpacing: '-0.025em',
                marginBottom: '0.85rem',
              }}
            >
              Smart BIT Campus Stationery Pre-Ordering & Inventory
            </h1>

            <p style={{ fontSize: '1rem', color: '#bfdbfe', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              Reserve official lab record notebooks, engineering drawing kits, semester exam supplies, and scientific calculators. Pick up easily during your class break at Store Desk #02 without waiting in queue!
            </p>

            {/* Quick Benefits Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: '#e0f2fe' }}>
                <CheckCircle2 size={16} color="#4ade80" />
                <span>Real-Time Live Stock Tracking</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: '#e0f2fe' }}>
                <Clock size={16} color="#4ade80" />
                <span>Flexible Break-Time Pickup Slots</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: '#e0f2fe' }}>
                <CheckCircle2 size={16} color="#4ade80" />
                <span>Pay Upon Counter Collection</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog View */}
      <section className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
        {/* Search & Filter Toolbar */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '1.25rem',
            marginBottom: '1.75rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} style={{ flex: '1 1 300px', display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search by stationery name, item code, brand..."
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">
                Search
              </button>
            </form>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600' }}>Stock:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">All Items</option>
                <option value="In Stock">In Stock Only</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            {/* Sort Options */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600' }}>Sort:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="stock_desc">Highest Stock First</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingTop: '1rem',
              marginTop: '1rem',
              borderTop: '1px solid var(--border-light)',
            }}
          >
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                    backgroundColor: isSelected ? 'var(--primary)' : '#f8fafc',
                    color: isSelected ? '#ffffff' : 'var(--text-main)',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={14} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter & Reset */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Showing <strong>{products.length}</strong> stationery products in catalogue
            {selectedCategory !== 'All' && <span> under <strong>{selectedCategory}</strong></span>}
            {selectedStatus !== 'All' && <span> ({selectedStatus})</span>}
          </div>

          {(search || selectedCategory !== 'All' || selectedStatus !== 'All' || sortBy !== 'newest') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setSelectedStatus('All');
                setSortBy('newest');
              }}
              style={{
                fontSize: '0.78rem',
                color: 'var(--primary)',
                fontWeight: '600',
                textDecoration: 'underline',
              }}
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                style={{
                  height: '340px',
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  animation: 'pulse 1.5s infinite',
                }}
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
            }}
          >
            <Package size={48} style={{ color: 'var(--text-light)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.5rem' }}>
              No stationery items found
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              We couldn't find any products matching your current search or filter query. Try clearing filters or searching another keyword.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setSelectedStatus('All');
              }}
              className="btn btn-secondary"
            >
              View Full Catalog
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

import React from 'react';
import { Package, Clock, MapPin, Phone, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        padding: '3rem 0 1.5rem',
        marginTop: 'auto',
        borderTop: '1px solid #1e293b',
      }}
      className="no-print"
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            paddingBottom: '2.5rem',
            borderBottom: '1px solid #1e293b',
          }}
        >
          {/* Col 1: Platform Overview */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Package size={18} />
              </div>
              <span style={{ color: '#ffffff', fontWeight: '800', fontSize: '1.05rem' }}>
                Smart BIT Stationery
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', lineHeight: '1.6', color: '#94a3b8' }}>
              Centralized campus stationery pre-ordering and automated real-time inventory management platform for college students, faculty, and store staff.
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', backgroundColor: '#1e293b', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#38bdf8' }}>
                React.js + Express.js + MongoDB
              </span>
            </div>
          </div>

          {/* Col 2: Campus Store Counter Details */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: '700', marginBottom: '1rem' }}>
              Store Counter & Pickups
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="#38bdf8" />
                <span>Amenities Complex, Ground Floor, Desk #02</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} color="#38bdf8" />
                <span>Mon - Fri: 8:00 AM - 6:00 PM | Sat: 8:30 AM - 1:30 PM</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} color="#38bdf8" />
                <span>Ext. 2488 (Campus Store Intercom)</span>
              </div>
            </div>
          </div>

          {/* Col 3: Pre-Ordering Rules */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: '700', marginBottom: '1rem' }}>
              Campus Store Policies
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <li>✓ Real-time inventory check prevents overselling</li>
              <li>✓ Pre-order reservations held for 48 hours</li>
              <li>✓ Verified student roll number required at pickup desk</li>
              <li>✓ Counter cash / student campus UPI payment</li>
            </ul>
          </div>
        </div>

        <div
          style={{
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.75rem',
            color: '#64748b',
          }}
        >
          <p>© {new Date().getFullYear()} BIT Campus Stores & Examination Supplies. Final Year Project.</p>
          <p>Designed with clean institutional ergonomics & responsive MERN architecture.</p>
        </div>
      </div>
    </footer>
  );
};

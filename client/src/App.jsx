import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SimpleNavbar } from './components/common/SimpleNavbar';
import { StudentSimplePage } from './pages/StudentSimplePage';
import { StaffSimplePage } from './pages/StaffSimplePage';
import { AdminSimplePage } from './pages/AdminSimplePage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

export const App = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <SimpleNavbar />

      <main style={{ flex: 1 }}>
        <Routes>
          {/* 3 Dedicated Separate Role Pages */}
          <Route path="/" element={<StudentSimplePage />} />
          <Route path="/student" element={<StudentSimplePage />} />
          <Route path="/staff" element={<StaffSimplePage />} />
          <Route path="/admin" element={<AdminSimplePage />} />

          {/* Authentication Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer
        style={{
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          padding: '1.25rem 1rem',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#64748b',
        }}
        className="no-print"
      >
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <strong>BIT Campus Stationery Store</strong> — Pre-Ordering & Inventory Management Platform
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Campus Amenities Block Desk #02 • Academic Year 2026-2027
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

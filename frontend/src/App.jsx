import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboard + Modules
import DashboardLayout from './pages/dashboard/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import Telemedicine from './pages/dashboard/modules/Telemedicine';
import DiseaseManagement from './pages/dashboard/modules/DiseaseManagement';
import MaternalHealth from './pages/dashboard/modules/MaternalHealth';
import HealthScreening from './pages/dashboard/modules/HealthScreening';
import SymptomChecker from './pages/dashboard/modules/SymptomChecker';
import EHRSystem from './pages/dashboard/modules/EHRSystem';
import Rehabilitation from './pages/dashboard/modules/Rehabilitation';
import WasteManagement from './pages/dashboard/modules/WasteManagement';
import HealthLiteracy from './pages/dashboard/modules/HealthLiteracy';
import Profile from './pages/dashboard/modules/Profile';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Overview />} />
            <Route path="telemedicine" element={<Telemedicine />} />
            <Route path="disease-management" element={<DiseaseManagement />} />
            <Route path="maternal-health" element={<MaternalHealth />} />
            <Route path="health-screening" element={<HealthScreening />} />
            <Route path="symptom-checker" element={<SymptomChecker />} />
            <Route path="ehr" element={<EHRSystem />} />
            <Route path="rehabilitation" element={<Rehabilitation />} />
            <Route path="waste-management" element={<WasteManagement />} />
            <Route path="health-literacy" element={<HealthLiteracy />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

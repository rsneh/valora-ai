import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PostProductPage from './pages/PostProductPage';
import ProductDetailPage from './pages/ProductDetailPage'; // Assuming you'll create this
import NotFoundPage from './pages/NotFoundPage';

// Protected Route Component
const ProtectedRoute: React.FC = () => {
  const { currentUser, loadingAuth } = useAuth();

  if (loadingAuth) {
    return <div>Loading authentication state...</div>; // Or a spinner component
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};

// Route for users who should NOT be authenticated (e.g., login, register)
const PublicOnlyRoute: React.FC = () => {
  const { currentUser, loadingAuth } = useAuth();
  if (loadingAuth) {
    return <div>Loading authentication state...</div>;
  }
  return !currentUser ? <Outlet /> : <Navigate to="/" replace />;
};


function App() {
  return (
    <MainLayout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:productId" element={<ProductDetailPage />} /> {/* Example detail page */}

        {/* Routes for non-authenticated users only */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/post-product" element={<PostProductPage />} />
          {/* Add other protected routes here, e.g., user profile page */}
        </Route>

        {/* Not Found Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MainLayout>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RateMeal from './pages/RateMeal';
import SuggestMenu from './pages/SuggestMenu';
import FeedbackHistory from './pages/FeedbackHistory';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-6 max-w-6xl">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/rate-meal" 
                element={
                  <ProtectedRoute>
                    <RateMeal />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/suggest-menu" 
                element={
                  <ProtectedRoute>
                    <SuggestMenu />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/feedback-history" 
                element={
                  <ProtectedRoute>
                    <FeedbackHistory />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'bg-white shadow-lg border',
              duration: 3000,
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
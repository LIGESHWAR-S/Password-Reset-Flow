import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Login from './views/Login'
import Register from './views/Register'
import ForgotPassword from './views/ForgotPassword'
import ResetPassword from './views/ResetPassword'
import Dashboard from './views/Dashboard'

function App() {
  return (
    <Router>
      <div className="w-100 min-vh-100 d-flex align-items-center justify-content-center p-3">
        <div className="w-100" style={{ maxWidth: '440px' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </div>

      <ToastContainer 
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </Router>
  )
}

export default App

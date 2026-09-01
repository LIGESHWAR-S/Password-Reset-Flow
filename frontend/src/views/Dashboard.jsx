import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const Dashboard = () => {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (!savedUser) {
      toast.warning('Please log in to access this page')
      navigate('/login')
    } else {
      setUser(JSON.parse(savedUser))
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('user')
    toast.success('Logged out successfully')
    navigate('/login')
  }

  if (!user) return null

  return (
    <div className="human-card fade-in text-center">
      <h2 className="mb-1" style={{ fontSize: '1.5rem' }}>Dashboard</h2>
      <p className="mb-4 text-secondary">You have successfully authenticated</p>

      <div className="p-3 mb-4 rounded-3 text-start border" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
        <div className="mb-2 text-uppercase text-muted" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
          Account Email
        </div>
        <div className="fw-semibold text-dark mb-3" style={{ fontSize: '1rem' }}>
          {user.email}
        </div>
        
        <div className="alert-success-box text-start">
          <div className="fw-semibold mb-1" style={{ fontSize: '0.85rem' }}>Status: Authenticated</div>
          <div style={{ fontSize: '0.8rem' }}>
            Password reset token cleared from database. Your updated credentials are now active.
          </div>
        </div>
      </div>

      <button onClick={handleLogout} className="btn btn-human-secondary w-100">
        Sign Out
      </button>
    </div>
  )
}

export default Dashboard

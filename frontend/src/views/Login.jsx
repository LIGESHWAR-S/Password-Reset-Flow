import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { getApiBaseUrl } from '../apiConfig'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      return toast.warning('Please enter all fields')
    }

    setLoading(true)
    try {
      const baseUrl = getApiBaseUrl()
      const response = await axios.post(`${baseUrl}/login`, {
        email,
        password
      })

      toast.success(response.data.message || 'Logged in successfully!')
      localStorage.setItem('user', JSON.stringify(response.data.user))
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data?.message || 'Login failed. Please check credentials.'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="human-card fade-in">
      <div className="text-center">
        <h2 className="mb-1" style={{ fontSize: '1.5rem' }}>Sign In</h2>
        <p className="mb-4 text-secondary">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={handleLogin} className="text-start">
        <div className="mb-3">
          <label htmlFor="email" className="form-label-human">Email Address</label>
          <input
            type="email"
            id="email"
            className="input-human"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <label htmlFor="password" className="form-label-human mb-0">Password</label>
            <Link to="/forgot-password" className="text-decoration-none" style={{ color: '#2563eb', fontSize: '0.825rem', fontWeight: 500 }}>
              Forgot password?
            </Link>
          </div>
          <div className="input-group-human">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="input-human"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-human-primary w-100 mb-3" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="text-center pt-3 border-top" style={{ borderColor: '#e2e8f0' }}>
        <p className="mb-0" style={{ fontSize: '0.875rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
            Create Account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login

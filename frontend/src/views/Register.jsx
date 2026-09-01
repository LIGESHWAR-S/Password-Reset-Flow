import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { getApiBaseUrl } from '../apiConfig'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!email || !password || !confirmPassword) {
      return toast.warning('Please enter all fields')
    }

    if (password !== confirmPassword) {
      return toast.error('Passwords do not match')
    }

    if (password.length < 6) {
      return toast.warning('Password must be at least 6 characters long')
    }

    setLoading(true)
    try {
      const baseUrl = getApiBaseUrl()
      const response = await axios.post(`${baseUrl}/register`, {
        email,
        password
      })

      toast.success(response.data.message || 'Account created successfully!')
      navigate('/login')
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data?.message || 'Registration failed. Try again.'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="human-card fade-in">
      <div className="text-center">
        <h2 className="mb-1" style={{ fontSize: '1.5rem' }}>Create Account</h2>
        <p className="mb-4 text-secondary">Sign up to get started</p>
      </div>

      <form onSubmit={handleRegister} className="text-start">
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

        <div className="mb-3">
          <label htmlFor="password" className="form-label-human">Password</label>
          <div className="input-group-human">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="input-human"
              placeholder="Minimum 6 characters"
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

        <div className="mb-4">
          <label htmlFor="confirmPassword" className="form-label-human">Confirm Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="confirmPassword"
            className="input-human"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-human-primary w-100 mb-3" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="text-center pt-3 border-top" style={{ borderColor: '#e2e8f0' }}>
        <p className="mb-0" style={{ fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register

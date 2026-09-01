import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { getApiBaseUrl } from '../apiConfig'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  
  const [verifying, setVerifying] = useState(true)
  const [isValidToken, setIsValidToken] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const baseUrl = getApiBaseUrl()
        const response = await axios.get(`${baseUrl}/verify-token/${token}`)
        setIsValidToken(true)
        setEmail(response.data.email || '')
      } catch (err) {
        console.error(err)
        setIsValidToken(false)
        toast.error(err.response?.data?.message || 'Invalid or expired reset token')
      } finally {
        setVerifying(false)
      }
    }
    verifyToken()
  }, [token])

  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      return toast.warning('Please fill in all fields')
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
      const response = await axios.post(`${baseUrl}/reset-password/${token}`, {
        password
      })

      toast.success(response.data.message || 'Password reset successfully!')
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // 1. Verifying State
  if (verifying) {
    return (
      <div className="human-card fade-in text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '2rem', height: '2rem' }}>
          <span className="visually-hidden">Verifying reset link...</span>
        </div>
        <h4 style={{ fontSize: '1.2rem' }}>Verifying Link</h4>
        <p className="mb-0 text-muted">Checking password reset token...</p>
      </div>
    )
  }

  // 2. Invalid or Expired Token State (Rejection Screen)
  if (!isValidToken) {
    return (
      <div className="human-card fade-in text-center">
        <h2 className="mb-2 text-danger" style={{ fontSize: '1.5rem' }}>Link Expired or Invalid</h2>
        <p className="mb-4 text-secondary">
          The password reset link is invalid, has already been used, or has expired after 15 minutes.
        </p>
        
        <div className="alert-error-box mb-4 text-start">
          <div className="fw-semibold mb-1" style={{ fontSize: '0.9rem' }}>Security Expiry Warning</div>
          <div style={{ fontSize: '0.85rem' }}>
            Password reset links expire automatically after 15 minutes to keep your account safe. Please request a new link.
          </div>
        </div>

        <Link to="/forgot-password" className="btn btn-human-primary w-100 mb-3 text-decoration-none">
          Request New Reset Link
        </Link>
        <Link to="/login" className="btn btn-human-secondary w-100 text-center text-decoration-none">
          Return to Sign In
        </Link>
      </div>
    )
  }

  // 3. Valid Token State (Show Password Reset Form)
  return (
    <div className="human-card fade-in">
      <div className="text-center">
        <h2 className="mb-1" style={{ fontSize: '1.5rem' }}>Reset Password</h2>
        <p className="mb-4 text-secondary">Create a new password for <strong>{email}</strong></p>
      </div>

      <form onSubmit={handleResetPassword} className="text-start">
        <div className="mb-3">
          <label htmlFor="password" className="form-label-human">New Password</label>
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
          <label htmlFor="confirmPassword" className="form-label-human">Confirm New Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="confirmPassword"
            className="input-human"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-human-primary w-100" disabled={loading}>
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </button>
      </form>
    </div>
  )
}

export default ResetPassword

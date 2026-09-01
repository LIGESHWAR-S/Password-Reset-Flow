import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { getApiBaseUrl } from '../apiConfig'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [resetLink, setResetLink] = useState('')

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!email) {
      return toast.warning('Please enter your email')
    }

    setLoading(true)
    try {
      const baseUrl = getApiBaseUrl()
      const response = await axios.post(`${baseUrl}/forgot-password`, { email })
      toast.success('Password reset link sent to your email!')
      setSubmitted(true)
      if (response.data.resetLink) {
        setResetLink(response.data.resetLink)
      }
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data?.message || 'Error occurred. Please try again.'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="human-card fade-in">
      {!submitted ? (
        <>
          <div className="text-center">
            <h2 className="mb-1" style={{ fontSize: '1.5rem' }}>Forgot Password</h2>
            <p className="mb-4 text-secondary">Enter your email address to receive a password reset link.</p>
          </div>

          <form onSubmit={handleForgotPassword} className="text-start">
            <div className="mb-4">
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

            <button type="submit" className="btn btn-human-primary w-100 mb-3" disabled={loading}>
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
            
            <Link to="/login" className="btn btn-human-secondary w-100 text-center text-decoration-none">
              Back to Sign In
            </Link>
          </form>
        </>
      ) : (
        <div className="text-center fade-in py-2">
          <h3 className="mb-2" style={{ fontSize: '1.4rem' }}>Check Your Email</h3>
          <p className="mb-4 text-secondary">
            We have sent a password reset link to <strong>{email}</strong>. The link is valid for 15 minutes.
          </p>

          {resetLink && (
            <div className="mb-4 text-center">
              <a 
                href={resetLink} 
                className="btn btn-human-primary w-100 text-decoration-none mb-2"
              >
                Open Reset Password Link
              </a>
            </div>
          )}

          <div className="d-flex gap-2">
            <button 
              onClick={() => { setSubmitted(false); setResetLink(''); }}
              className="btn btn-human-secondary flex-grow-1"
            >
              Try Again
            </button>
            <Link to="/login" className="btn btn-human-secondary flex-grow-1 text-decoration-none">
              Back to Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default ForgotPassword

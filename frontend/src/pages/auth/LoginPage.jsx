import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Auth.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authLeft}>
        <div className={styles.brandMark}>
          <span className={styles.brandIcon}>⚕</span>
          <span className={styles.brandName}>MediCare</span>
        </div>
        <div className={styles.heroContent}>
          <h1>Your Health,<br /><em>Our Priority</em></h1>
          <p>Comprehensive healthcare at your fingertips — from telemedicine to maternal care, all in one place.</p>
          <div className={styles.features}>
            {['🩺 Telemedicine Appointments', '📊 Health Records & EHR', '💊 Medication Management', '🤱 Maternal Health Tracking'].map(f => (
              <div key={f} className={styles.featureItem}>{f}</div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.authRight}>
        <div className={styles.authCard}>
          <h2>Welcome back</h2>
          <p className={styles.authSubtitle}>Sign in to your healthcare portal</p>

          {error && <div className={styles.errorAlert}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="doctor@medicare.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
            </div>
            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign In'}
            </button>
          </form>

          <div className={styles.authDemo}>
            <p>Demo credentials:</p>
            <code>admin@medicare.com / password123</code>
          </div>

          <p className={styles.authLink}>
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

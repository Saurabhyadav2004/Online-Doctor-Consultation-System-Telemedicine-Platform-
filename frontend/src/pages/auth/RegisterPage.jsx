import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Auth.module.css';

const ROLES = [
  { value: 'patient', label: 'Patient', icon: '🙋' },
  { value: 'doctor', label: 'Doctor', icon: '👨‍⚕️' },
  { value: 'admin', label: 'Admin', icon: '🔑' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient', specialization: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
          <h1>Join Our<br /><em>Health Network</em></h1>
          <p>Connect with qualified doctors, track your health journey, and access world-class healthcare resources.</p>
          <div className={styles.features}>
            {['🔒 Secure & Private Records', '📱 Telemedicine Ready', '🌍 Access Anywhere', '👨‍👩‍👧 Family Health Profiles'].map(f => (
              <div key={f} className={styles.featureItem}>{f}</div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.authRight}>
        <div className={styles.authCard}>
          <h2>Create account</h2>
          <p className={styles.authSubtitle}>Join MediCare today — it's free</p>

          {error && <div className={styles.errorAlert}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Dr. Jane Smith" required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="jane@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required />
            </div>
            <div className="form-group">
              <label className="form-label">I am a</label>
              <div className={styles.roleSelector}>
                {ROLES.map(r => (
                  <div
                    key={r.value}
                    className={`${styles.roleOption} ${form.role === r.value ? styles.selected : ''}`}
                    onClick={() => setForm(p => ({ ...p, role: r.value }))}
                  >
                    <span>{r.icon}</span>
                    {r.label}
                  </div>
                ))}
              </div>
            </div>
            {form.role === 'doctor' && (
              <div className="form-group">
                <label className="form-label">Specialization</label>
                <input name="specialization" value={form.specialization} onChange={handleChange} placeholder="e.g. Cardiologist" />
              </div>
            )}
            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <p className={styles.authLink}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

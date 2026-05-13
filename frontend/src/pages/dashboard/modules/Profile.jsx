import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { usersAPI } from '../../../lib/api';
import styles from './Module.module.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    address: user?.address || '',
    bloodGroup: user?.bloodGroup || '',
    emergencyContact: user?.emergencyContact || '',
    specialization: user?.specialization || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
  });

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async e => {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('');
    try {
      const res = await usersAPI.updateProfile(user._id, form);
      updateUser(res.data.data.user);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.message || 'Failed to update profile'); }
    setSaving(false);
  };

  const ROLE_COLORS = { admin: 'warning', doctor: 'primary', patient: 'success' };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your personal information and preferences</p>
        </div>
        <button className={`btn ${editing ? 'btn-ghost' : 'btn-primary'}`} onClick={() => { setEditing(p => !p); setError(''); setSuccess(''); }}>
          {editing ? '✕ Cancel' : '✏️ Edit Profile'}
        </button>
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}
      {success && <div className={styles.successAlert}>✅ {success}</div>}

      {/* Avatar & basic info */}
      <div className="card" style={{ padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 100, height: 100, background: 'var(--primary)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', color: 'white', fontWeight: 700
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className={`badge badge-${ROLE_COLORS[user?.role]}`} style={{ textTransform: 'capitalize', padding: '0.35rem 0.85rem' }}>
            {user?.role === 'doctor' ? '👨‍⚕️' : user?.role === 'admin' ? '🔑' : '🙋'} {user?.role}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{user?.name}</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{user?.email}</div>
          {user?.specialization && <div style={{ color: 'var(--primary)', fontSize: '0.88rem', fontWeight: 500 }}>🩺 {user.specialization}</div>}
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.5rem' }}>
            Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>

      {/* Profile details */}
      {!editing ? (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, marginBottom: '1.25rem' }}>Personal Information</h3>
          <div className={styles.detailGrid}>
            {[
              { label: 'Full Name', value: user?.name },
              { label: 'Email', value: user?.email },
              { label: 'Phone', value: user?.phone || '—' },
              { label: 'Gender', value: user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : '—' },
              { label: 'Date of Birth', value: user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
              { label: 'Blood Group', value: user?.bloodGroup || '—' },
              { label: 'Address', value: user?.address || '—' },
              { label: 'Emergency Contact', value: user?.emergencyContact || '—' },
              ...(user?.role === 'doctor' ? [{ label: 'Specialization', value: user?.specialization || '—' }] : []),
            ].map(item => (
              <div key={item.label} className={styles.detailItem}>
                <div className={styles.detailLabel}>{item.label}</div>
                <div className={styles.detailValue}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={`card ${styles.formCard}`}>
          <h3 className={styles.formTitle}>Edit Profile</h3>
          <form onSubmit={handleSave} className={styles.form}>
            <div className={styles.formGrid}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 234 567 8900" />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select…</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                  <option value="">Select…</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Emergency Contact</label>
                <input name="emergencyContact" value={form.emergencyContact} onChange={handleChange} placeholder="Name & phone number" />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Address</label>
                <input name="address" value={form.address} onChange={handleChange} placeholder="Street, City, Country" />
              </div>
              {user?.role === 'doctor' && (
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Specialization</label>
                  <input name="specialization" value={form.specialization} onChange={handleChange} placeholder="e.g. Cardiologist, Paediatrician" />
                </div>
              )}
            </div>
            <div className={styles.formActions}>
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Account info */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, marginBottom: '1rem' }}>Account Information</h3>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Account ID</div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{user?._id}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Account Status</div>
            <span className="badge badge-success">✅ Active</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Last Updated</div>
            <div style={{ fontSize: '0.85rem' }}>{user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

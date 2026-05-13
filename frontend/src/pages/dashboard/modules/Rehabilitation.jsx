import React, { useState, useEffect } from 'react';
import { workshopsAPI } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import styles from './Module.module.css';

const CATEGORIES = [
  { value: 'rehabilitation', label: '🧘 Rehabilitation' },
  { value: 'maternal', label: '🤱 Maternal' },
  { value: 'disease-management', label: '🫀 Disease Management' },
  { value: 'mental-health', label: '🧠 Mental Health' },
  { value: 'nutrition', label: '🥗 Nutrition' },
  { value: 'fitness', label: '💪 Fitness' },
  { value: 'general', label: '🏥 General' },
];

export default function Rehabilitation() {
  const { user } = useAuth();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    title: '', description: '', category: 'rehabilitation', date: '', time: '',
    duration: 60, location: '', isOnline: false, meetingLink: '', maxParticipants: 30
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await workshopsAPI.getAll();
      setWorkshops(res.data.data.workshops || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault(); setSubmitting(true); setError('');
    try {
      await workshopsAPI.create(form);
      setShowForm(false);
      setForm({ title: '', description: '', category: 'rehabilitation', date: '', time: '', duration: 60, location: '', isOnline: false, meetingLink: '', maxParticipants: 30 });
      load();
    } catch (err) { setError(err.response?.data?.message || 'Failed to create workshop'); }
    setSubmitting(false);
  };

  const handleRegister = async (id, isRegistered) => {
    setActionLoading(p => ({ ...p, [id]: true }));
    try {
      if (isRegistered) await workshopsAPI.unregister(id);
      else await workshopsAPI.register(id);
      load();
    } catch (err) { setError(err.response?.data?.message || 'Action failed'); }
    setActionLoading(p => ({ ...p, [id]: false }));
  };

  const filtered = filter === 'all' ? workshops : workshops.filter(w => w.category === filter);

  const REHAB_PROGRAMS = [
    { icon: '🦴', title: 'Orthopaedic Recovery', desc: 'Post-surgery joint & bone rehabilitation protocols', color: '#2980b9' },
    { icon: '🧠', title: 'Neurological Rehab', desc: 'Stroke recovery, cognitive & motor retraining', color: '#8e44ad' },
    { icon: '❤️', title: 'Cardiac Rehab', desc: 'Heart health recovery and lifestyle modification', color: '#e74c3c' },
    { icon: '🫁', title: 'Pulmonary Rehab', desc: 'Breathing exercises for COPD and respiratory conditions', color: '#16a085' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className="page-title">Rehabilitation</h1>
          <p className="page-subtitle">Recovery programs, therapy workshops and wellness sessions</p>
        </div>
        {(user.role === 'admin' || user.role === 'doctor') && (
          <button className="btn btn-primary" onClick={() => setShowForm(p => !p)}>
            {showForm ? '✕ Cancel' : '+ Create Workshop'}
          </button>
        )}
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}

      {/* Rehab Programs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.85rem' }}>
        {REHAB_PROGRAMS.map(p => (
          <div key={p.title} className="card" style={{ padding: '1.1rem', borderLeft: `3px solid ${p.color}` }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>{p.icon}</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{p.title}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.desc}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className={`card ${styles.formCard}`}>
          <h3 className={styles.formTitle}>Create Workshop / Session</h3>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Workshop Title</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Post-Knee Surgery Recovery Session" required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select name="category" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Max Participants</label>
                <input type="number" name="maxParticipants" value={form.maxParticipants} onChange={handleChange} min={1} />
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input type="time" name="time" value={form.time} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <input type="number" name="duration" value={form.duration} onChange={handleChange} min={15} step={15} />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '1.4rem' }}>
                  <input type="checkbox" name="isOnline" checked={form.isOnline} onChange={handleChange} style={{ width: 'auto' }} />
                  <span className="form-label" style={{ margin: 0 }}>Online Session</span>
                </label>
              </div>
              {form.isOnline ? (
                <div className="form-group">
                  <label className="form-label">Meeting Link</label>
                  <input name="meetingLink" value={form.meetingLink} onChange={handleChange} placeholder="https://meet.google.com/..." />
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input name="location" value={form.location} onChange={handleChange} placeholder="Room / Clinic / Centre" />
                </div>
              )}
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="What participants can expect…" required />
              </div>
            </div>
            <div className={styles.formActions}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? <span className="spinner" /> : 'Create Workshop'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.95rem' }}>Upcoming Workshops & Sessions</h3>
        <div className={styles.filters}>
          <button className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`} onClick={() => setFilter('all')}>All</button>
          {CATEGORIES.map(c => (
            <button key={c.value} className={`${styles.filterBtn} ${filter === c.value ? styles.active : ''}`} onClick={() => setFilter(c.value)}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingCenter}><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🧘</div><h3>No workshops scheduled</h3><p>Check back soon for upcoming sessions</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filtered.map(w => {
            const isRegistered = w.registeredParticipants?.some?.(p => (p._id || p) === user._id);
            const spotsLeft = w.maxParticipants - (w.registeredParticipants?.length || 0);
            return (
              <div key={w._id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="badge badge-primary">{CATEGORIES.find(c => c.value === w.category)?.label || w.category}</span>
                  <span className={`badge badge-${w.status === 'upcoming' ? 'success' : 'muted'}`}>{w.status}</span>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{w.title}</div>
                  {w.instructor && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Led by Dr. {w.instructor.name}</div>}
                </div>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{w.description}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>📅 {new Date(w.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>⏰ {w.time} · {w.duration} min</span>
                  <span>{w.isOnline ? '💻 Online' : `📍 ${w.location}`}</span>
                  <span>👥 {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left of {w.maxParticipants}</span>
                </div>
                {w.isOnline && w.meetingLink && isRegistered && (
                  <a href={w.meetingLink} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ textAlign: 'center' }}>💻 Join Online</a>
                )}
                <button
                  className={`btn ${isRegistered ? 'btn-outline' : 'btn-primary'}`}
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => handleRegister(w._id, isRegistered)}
                  disabled={actionLoading[w._id] || (!isRegistered && spotsLeft <= 0)}
                >
                  {actionLoading[w._id] ? <span className="spinner" /> : isRegistered ? '✓ Unregister' : spotsLeft <= 0 ? 'Full' : 'Register'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

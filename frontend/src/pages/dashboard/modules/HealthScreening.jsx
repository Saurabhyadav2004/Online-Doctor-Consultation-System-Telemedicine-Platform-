import React, { useState, useEffect } from 'react';
import { screeningsAPI } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import styles from './Module.module.css';

const TYPE_LABELS = {
  'blood-pressure': '🩺 Blood Pressure', 'diabetes': '🩸 Diabetes', 'cancer': '🔬 Cancer',
  'vision': '👁️ Vision', 'hearing': '👂 Hearing', 'dental': '🦷 Dental',
  'mental-health': '🧠 Mental Health', 'general': '🏥 General', 'maternal': '🤱 Maternal'
};

export default function HealthScreening() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    title: '', description: '', screeningType: 'general', date: '',
    startTime: '', endTime: '', location: '', maxParticipants: 100, isFree: true, requirements: ''
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await screeningsAPI.getAll();
      setEvents(res.data.data.events || []);
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
      await screeningsAPI.create(form);
      setShowForm(false);
      setForm({ title: '', description: '', screeningType: 'general', date: '', startTime: '', endTime: '', location: '', maxParticipants: 100, isFree: true, requirements: '' });
      load();
    } catch (err) { setError(err.response?.data?.message || 'Failed to create event'); }
    setSubmitting(false);
  };

  const handleRegister = async (id, isRegistered) => {
    setActionLoading(p => ({ ...p, [id]: true }));
    try {
      if (isRegistered) await screeningsAPI.unregister(id);
      else await screeningsAPI.register(id);
      load();
    } catch (err) { setError(err.response?.data?.message || 'Action failed'); }
    setActionLoading(p => ({ ...p, [id]: false }));
  };

  const filtered = filter === 'all' ? events : events.filter(e => e.screeningType === filter);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className="page-title">Health Screening</h1>
          <p className="page-subtitle">Community screening events and preventive health checks</p>
        </div>
        {(user.role === 'admin' || user.role === 'doctor') && (
          <button className="btn btn-primary" onClick={() => setShowForm(p => !p)}>
            {showForm ? '✕ Cancel' : '+ Create Event'}
          </button>
        )}
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}

      {showForm && (
        <div className={`card ${styles.formCard}`}>
          <h3 className={styles.formTitle}>Create Screening Event</h3>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Event Title</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Free Blood Pressure Check Drive" required />
              </div>
              <div className="form-group">
                <label className="form-label">Screening Type</label>
                <select name="screeningType" value={form.screeningType} onChange={handleChange}>
                  {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">End Time</label>
                <input type="time" name="endTime" value={form.endTime} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input name="location" value={form.location} onChange={handleChange} placeholder="Hospital, clinic or venue" required />
              </div>
              <div className="form-group">
                <label className="form-label">Max Participants</label>
                <input type="number" name="maxParticipants" value={form.maxParticipants} onChange={handleChange} min={1} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="What to expect at this event…" required />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Requirements / Preparation</label>
                <input name="requirements" value={form.requirements} onChange={handleChange} placeholder="e.g. Fast for 8 hours before the event" />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" name="isFree" checked={form.isFree} onChange={handleChange} style={{ width: 'auto' }} />
                  <span className="form-label" style={{ margin: 0 }}>Free Event</span>
                </label>
              </div>
            </div>
            <div className={styles.formActions}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? <span className="spinner" /> : 'Create Event'}</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.filters}>
        <button className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`} onClick={() => setFilter('all')}>All</button>
        {Object.entries(TYPE_LABELS).map(([v, l]) => (
          <button key={v} className={`${styles.filterBtn} ${filter === v ? styles.active : ''}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loadingCenter}><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🔬</div><h3>No screening events</h3><p>Check back soon or create a new event</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filtered.map(ev => {
            const isRegistered = ev.registeredParticipants?.includes?.(user._id) ||
              ev.registeredParticipants?.some?.(p => (p._id || p) === user._id);
            const spotsLeft = ev.maxParticipants - (ev.registeredParticipants?.length || 0);
            return (
              <div key={ev._id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.4rem' }}>{TYPE_LABELS[ev.screeningType]?.split(' ')[0] || '🔬'}</span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {ev.isFree && <span className="badge badge-success">Free</span>}
                    <span className={`badge badge-${ev.status === 'upcoming' ? 'primary' : 'muted'}`}>{ev.status}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{ev.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{TYPE_LABELS[ev.screeningType]}</div>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{ev.description}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>📅 {new Date(ev.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  <span>⏰ {ev.startTime} – {ev.endTime}</span>
                  <span>📍 {ev.location}</span>
                  {ev.requirements && <span>📋 {ev.requirements}</span>}
                  <span>👥 {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining</span>
                </div>
                <button
                  className={`btn ${isRegistered ? 'btn-outline' : 'btn-primary'}`}
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => handleRegister(ev._id, isRegistered)}
                  disabled={actionLoading[ev._id] || (!isRegistered && spotsLeft <= 0)}
                >
                  {actionLoading[ev._id] ? <span className="spinner" /> : isRegistered ? '✓ Unregister' : spotsLeft <= 0 ? 'Event Full' : 'Register'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

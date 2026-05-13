import React, { useState, useEffect } from 'react';
import { appointmentsAPI, usersAPI } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import styles from './Module.module.css';

const STATUS_COLORS = { pending: 'warning', confirmed: 'primary', completed: 'success', cancelled: 'danger' };

export default function Telemedicine() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ doctor: '', date: '', time: '', type: 'telemedicine', reason: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [apptRes, docRes] = await Promise.all([
        appointmentsAPI.getAll(),
        usersAPI.getDoctors()
      ]);
      setAppointments(apptRes.data.data.appointments || []);
      setDoctors(docRes.data.data.doctors || []);
    } catch (e) { setError('Failed to load data') }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await appointmentsAPI.create(form);
      setShowForm(false);
      setForm({ doctor: '', date: '', time: '', type: 'telemedicine', reason: '', notes: '' });
      load();
    } catch (e) { setError(e.response?.data?.message || 'Failed to book appointment') }
    setSubmitting(false);
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try { await appointmentsAPI.cancel(id); load(); } catch {}
  };

  const handleStatusUpdate = async (id, status) => {
    try { await appointmentsAPI.update(id, { status }); load(); } catch {}
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className="page-title">Telemedicine</h1>
          <p className="page-subtitle">Book and manage virtual & in-person appointments</p>
        </div>
        {user.role !== 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowForm(p => !p)}>
            {showForm ? '✕ Cancel' : '+ Book Appointment'}
          </button>
        )}
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}

      {showForm && (
        <div className={`card ${styles.formCard}`}>
          <h3 className={styles.formTitle}>New Appointment</h3>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className="form-group">
                <label className="form-label">Doctor</label>
                <select name="doctor" value={form.doctor} onChange={handleChange} required>
                  <option value="">Select doctor</option>
                  {doctors.map(d => (
                    <option key={d._id} value={d._id}>Dr. {d.name}{d.specialization ? ` — ${d.specialization}` : ''}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select name="type" value={form.type} onChange={handleChange}>
                  <option value="telemedicine">Telemedicine (Video)</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input type="time" name="time" value={form.time} onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Reason for Visit</label>
                <input name="reason" value={form.reason} onChange={handleChange} placeholder="Brief description of your concern" required />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Additional Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Any additional information..." />
              </div>
            </div>
            <div className={styles.formActions}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? <span className="spinner" /> : 'Book Appointment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className={styles.loadingCenter}><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
      ) : appointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h3>No appointments found</h3>
          <p>Book your first appointment above</p>
        </div>
      ) : (
        <div className={styles.cardList}>
          {appointments.map(a => (
            <div key={a._id} className={`card ${styles.apptCard}`}>
              <div className={styles.apptCardLeft}>
                <div className={styles.apptDateBlock}>
                  <span className={styles.apptDay}>{new Date(a.date).getDate()}</span>
                  <span className={styles.apptMonth}>{new Date(a.date).toLocaleString('default', { month: 'short', year: 'numeric' })}</span>
                </div>
                <div className={styles.apptDetails}>
                  <div className={styles.apptReason}>{a.reason}</div>
                  <div className={styles.apptMeta}>
                    🕐 {a.time} &nbsp;·&nbsp;
                    {a.type === 'telemedicine' ? '📹 Telemedicine' : '🏥 In-Person'} &nbsp;·&nbsp;
                    {a.doctor ? `Dr. ${a.doctor.name}` : ''} {a.patient ? `· Patient: ${a.patient.name}` : ''}
                  </div>
                  {a.notes && <div className={styles.apptNotes}>{a.notes}</div>}
                  {a.meetingLink && a.status === 'confirmed' && (
                    <a href={a.meetingLink} target="_blank" rel="noreferrer" className={`btn btn-outline ${styles.joinBtn}`}>📹 Join Meeting</a>
                  )}
                </div>
              </div>
              <div className={styles.apptCardRight}>
                <span className={`badge badge-${STATUS_COLORS[a.status]}`}>{a.status}</span>
                <div className={styles.apptActions}>
                  {user.role === 'doctor' && a.status === 'pending' && (
                    <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.7rem' }} onClick={() => handleStatusUpdate(a._id, 'confirmed')}>Confirm</button>
                  )}
                  {user.role === 'doctor' && a.status === 'confirmed' && (
                    <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.35rem 0.7rem' }} onClick={() => handleStatusUpdate(a._id, 'completed')}>Complete</button>
                  )}
                  {a.status !== 'cancelled' && a.status !== 'completed' && (
                    <button className="btn btn-ghost" style={{ fontSize: '0.8rem', color: 'var(--danger)', padding: '0.35rem 0.7rem' }} onClick={() => handleCancel(a._id)}>Cancel</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
